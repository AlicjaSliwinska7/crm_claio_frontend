// src/features/messages/hooks/useInboxLogic.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConfirm } from '../../../app/providers/ConfirmProvider'
import { dummyConversations, loggedInUserId, users } from './inbox.constants'
import { isConfirmOk, mkFileItem, norm, normName, uniq } from './inbox.utils'

export default function useInboxLogic() {
  const confirm = useConfirm()

  const [conversations, setConversations] = useState(() => dummyConversations)
  const [activeConversationId, setActiveConversationId] = useState(() => dummyConversations[0]?.id ?? null)

  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newConvError, setNewConvError] = useState('')

  const [pendingFiles, setPendingFiles] = useState([])
  const [replyTo, setReplyTo] = useState(null)

  const [messageSearch, setMessageSearch] = useState('')
  const [activeHitIdx, setActiveHitIdx] = useState(0)

  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const messageElsRef = useRef({})

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  )

  // =========================
  // ✅ EDIT CONVERSATION
  // =========================
  const [showEditModal, setShowEditModal] = useState(false)
  const [editConvId, setEditConvId] = useState(null)
  const [editConvError, setEditConvError] = useState('')

  const editingConversation = useMemo(() => {
    if (!editConvId) return null
    return conversations.find((c) => c.id === editConvId) || null
  }, [conversations, editConvId])

  const openEditConversation = useCallback((id) => {
    if (!id) return
    setEditConvId(id)
    setEditConvError('')
    setShowEditModal(true)
  }, [])

  const closeEditConversation = useCallback(() => {
    setShowEditModal(false)
    setEditConvId(null)
    setEditConvError('')
  }, [])

  const clearEditConvError = useCallback(() => setEditConvError(''), [])

  useEffect(() => {
    if (!showNewModal) return
    setNewConvError('')
  }, [showNewModal])

  // scroll to bottom on open / message add
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [activeConversationId, activeConversation?.messages.length])

  // mark messages as read in active conv
  useEffect(() => {
    if (!activeConversationId) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.sender !== loggedInUserId ? { ...m, read: true } : m
              ),
            }
          : c
      )
    )
  }, [activeConversationId])

  const filteredConversations = useMemo(() => {
    const q = norm(searchQuery)
    if (!q) return conversations
    return conversations.filter((conv) => norm(conv.name).includes(q))
  }, [conversations, searchQuery])

  // ---------- Files ----------
  const addFiles = useCallback((filesLike) => {
    if (!filesLike) return
    const arr = Array.from(filesLike).filter(Boolean)
    if (arr.length === 0) return
    setPendingFiles((prev) => [...prev, ...arr.map(mkFileItem)])
  }, [])

  const removePendingFile = useCallback((fileId) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  // ---------- Reply ----------
  const beginReplyTo = useCallback((message) => {
    if (!message?.id) return
    setReplyTo({
      id: message.id,
      sender: message.sender,
      text: message.text || '',
    })
    queueMicrotask(() => inputRef.current?.focus?.())
  }, [])

  const cancelReply = useCallback(() => setReplyTo(null), [])

  // ---------- Emoji ----------
  const handleEmojiClick = useCallback((emojiObjOrEvent, maybeData) => {
    const picked =
      (typeof emojiObjOrEvent === 'string' ? emojiObjOrEvent : '') ||
      emojiObjOrEvent?.emoji ||
      maybeData?.emoji ||
      emojiObjOrEvent?.native ||
      maybeData?.native ||
      ''

    if (!picked) return
    setNewMessage((prev) => `${String(prev || '')}${picked}`)
    queueMicrotask(() => inputRef.current?.focus?.())
  }, [])

  // ---------- Send ----------
  const handleSendMessage = useCallback(() => {
    if (!activeConversation) return

    const hasText = newMessage.trim().length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasText && !hasFiles) return

    const msg = {
      id: `m-${Date.now()}`,
      sender: loggedInUserId,
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      reactions: {},
      replyToId: replyTo?.id || null,
      attachments: pendingFiles.map((pf) => ({
        id: pf.id,
        name: pf.name,
        size: pf.size,
        type: pf.type,
      })),
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation.id ? { ...conv, messages: [...conv.messages, msg] } : conv
      )
    )

    setNewMessage('')
    setShowEmojiPicker(false)
    setPendingFiles([])
    setReplyTo(null)

    requestAnimationFrame(() => {
      const el = messagesContainerRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [activeConversation, newMessage, pendingFiles, replyTo])

  // ---------- Reactions ----------
  const handleReaction = useCallback(
    (msgIndex, emoji) => {
      if (!activeConversation) return
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeConversation.id) return conv
          const updated = [...conv.messages]
          const msg = { ...updated[msgIndex] }
          msg.reactions = { ...(msg.reactions || {}), [loggedInUserId]: emoji }
          updated[msgIndex] = msg
          return { ...conv, messages: updated }
        })
      )
    },
    [activeConversation]
  )

  // ---------- Delete conversation (FIX: bez stale-closure + isConfirmOk) ----------
  const handleDeleteConversation = useCallback(
    async (id) => {
      if (!id) return

      const res = await confirm({
        title: 'Usunąć rozmowę?',
        message:
          'Tej operacji nie można cofnąć. Wiadomości w tej konwersacji zostaną trwale usunięte.',
        confirmText: 'Usuń',
        cancelText: 'Anuluj',
      })

      if (!isConfirmOk(res)) return

      setConversations((prev) => {
        const next = (prev || []).filter((c) => c.id !== id)

        // aktywna rozmowa: jeśli usunęłaś aktywną → przełącz na pierwszą pozostałą
        setActiveConversationId((cur) => (cur === id ? next[0]?.id ?? null : cur))

        // jeśli edytujesz tę rozmowę, zamknij modal edycji
        if (id === editConvId) closeEditConversation()

        // opcjonalnie: jeśli usuwasz aktywną, wyczyść composer (bezpiecznie UX-owo)
        if (activeConversationId === id) {
          setNewMessage('')
          setPendingFiles([])
          setReplyTo(null)
          setShowEmojiPicker(false)
        }

        return next
      })
    },
    [confirm, editConvId, closeEditConversation, activeConversationId]
  )

  // ---------- Create conversation ----------
  const handleCreateConversation = useCallback((newConv) => {
    const proposedName = String(newConv?.name || '').trim()
    if (!proposedName) {
      setNewConvError('Podaj nazwę rozmowy.')
      return
    }

    const members = uniq([...(newConv?.members || []), loggedInUserId])
    if (!members.length) {
      setNewConvError('Wybierz uczestników.')
      return
    }

    setConversations((prev) => {
      const proposedNorm = normName(proposedName)
      const exists = prev.some((c) => normName(c?.name) === proposedNorm)
      if (exists) {
        setNewConvError('Taka konwersacja już istnieje.')
        return prev
      }

      const conv = {
        ...newConv,
        id: String(newConv?.id || Date.now().toString()),
        name: proposedName,
        members,
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: loggedInUserId,
            text: 'Nowa rozmowa!',
            timestamp: new Date().toISOString(),
            read: true,
            reactions: {},
            replyToId: null,
            attachments: [],
          },
        ],
      }

      queueMicrotask(() => {
        setActiveConversationId(conv.id)
        setShowNewModal(false)
        setNewConvError('')
      })

      return [...prev, conv]
    })
  }, [])

  // ---------- Update conversation ----------
  const handleUpdateConversation = useCallback(
    ({ id, name, members }) => {
      const convId = String(id || '').trim()
      if (!convId) return

      const proposedName = String(name || '').trim()
      if (!proposedName) {
        setEditConvError('Podaj nazwę rozmowy.')
        return
      }

      const nextMembers = uniq([...(members || []), loggedInUserId])
      if (!nextMembers.length) {
        setEditConvError('Wybierz uczestników.')
        return
      }
      if (!nextMembers.includes(loggedInUserId)) {
        setEditConvError('Nie możesz usunąć siebie z rozmowy.')
        return
      }

      setConversations((prev) => {
        const proposedNorm = normName(proposedName)
        const exists = prev.some((c) => c.id !== convId && normName(c?.name) === proposedNorm)
        if (exists) {
          setEditConvError('Taka konwersacja już istnieje.')
          return prev
        }

        const next = prev.map((c) => (c.id === convId ? { ...c, name: proposedName, members: nextMembers } : c))

        queueMicrotask(() => {
          setEditConvError('')
          closeEditConversation()
        })

        return next
      })
    },
    [closeEditConversation]
  )

  // ---------- Search in conversation ----------
  const messageHits = useMemo(() => {
    const q = norm(messageSearch).trim()
    if (!q || !activeConversation?.messages?.length) return []
    const hits = []
    for (const m of activeConversation.messages) {
      const text = norm(m.text)
      if (text.includes(q)) hits.push(m.id)
    }
    return hits
  }, [activeConversation?.messages, messageSearch])

  useEffect(() => {
    setActiveHitIdx(0)
  }, [messageSearch, activeConversationId])

  const scrollToMessageId = useCallback((id, behavior = 'smooth') => {
    if (!id) return
    const el = messageElsRef.current?.[id]
    if (!el) return
    el.scrollIntoView({ behavior, block: 'center' })
    el.classList.add('is-jump-target')
    window.setTimeout(() => el.classList.remove('is-jump-target'), 650)
  }, [])

  useEffect(() => {
    if (!messageHits.length) return
    const id = messageHits[Math.min(activeHitIdx, messageHits.length - 1)]
    if (id) scrollToMessageId(id, 'smooth')
  }, [activeHitIdx, messageHits, scrollToMessageId])

  const clearMessageSearch = useCallback(() => setMessageSearch(''), [])
  const goPrevHit = useCallback(() => {
    if (!messageHits.length) return
    setActiveHitIdx((i) => (i - 1 + messageHits.length) % messageHits.length)
  }, [messageHits.length])
  const goNextHit = useCallback(() => {
    if (!messageHits.length) return
    setActiveHitIdx((i) => (i + 1) % messageHits.length)
  }, [messageHits.length])

  const clearNewConvError = useCallback(() => setNewConvError(''), [])

  return {
    users,
    loggedInUserId,

    conversations,
    activeConversation,
    activeConversationId,

    searchQuery,
    newMessage,
    showEmojiPicker,
    showNewModal,

    newConvError,

    filteredConversations,

    inputRef,
    messagesContainerRef,
    messageElsRef,

    pendingFiles,
    replyTo,
    messageSearch,
    messageHits,
    activeHitIdx,

    setActiveConversationId,
    setSearchQuery,
    setNewMessage,
    setShowEmojiPicker,
    setShowNewModal,

    addFiles,
    removePendingFile,
    beginReplyTo,
    cancelReply,

    setMessageSearch,
    clearMessageSearch,
    goPrevHit,
    goNextHit,
    scrollToMessageId,

    handleCreateConversation,
    handleSendMessage,
    handleReaction,
    handleDeleteConversation,
    handleEmojiClick,

    clearNewConvError,

    // ✅ EDIT
    showEditModal,
    editingConversation,
    editConvError,
    openEditConversation,
    closeEditConversation,
    handleUpdateConversation,
    clearEditConvError,
  }
}
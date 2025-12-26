// src/features/messages/pages/MessagesInbox.jsx
import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import '../styles/message-inbox.css'
import NewConversationModal from '../components/NewConversationModal'
import { useConfirm } from '../../../app/providers/ConfirmProvider'

// Lazy emoji picker – nie blokuje renderu, gdy paczki brak
const LazyEmojiPicker = lazy(() => import('emoji-picker-react').catch(() => ({ default: () => null })))

const users = {
  u1: 'Alicja Śliwińska',
  u2: 'Jan Kowalski',
  u3: 'Anna Nowak',
  u4: 'Piotr Zieliński',
  u5: 'Maria Wiśniewska',
  u6: 'Tomasz Nowak',
  u7: 'Katarzyna Lewandowska',
  u8: 'Paweł Kaczmarek',
  u9: 'Ewa Wojciechowska',
}
const loggedInUserId = 'u1'

const dummyConversations = [
  {
    id: 'chat1',
    name: 'Rozmowa z Anną',
    members: ['u1', 'u3'],
    messages: [
      { id: 'm1', sender: 'u1', text: 'Cześć, jak idą badania?', timestamp: '2025-07-04T10:01:00.000Z', read: true, reactions: {} },
      { id: 'm2', sender: 'u3', text: 'Już prawie skończone!',   timestamp: '2025-07-04T10:02:00.000Z', read: true, reactions: {} },
    ],
  },
  {
    id: 'chat2',
    name: 'Zespół projektowy',
    members: ['u1', 'u2', 'u6'],
    messages: [
      { id: 'm3', sender: 'u6', text: 'Kto odpowiada za ofertę dla firmy X?', timestamp: '2025-07-03T12:15:00.000Z', read: false, reactions: {} },
    ],
  },
]

function formatDateHeader(iso) {
  const date = new Date(iso)
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}
function isSameDay(a, b) {
  if (!a || !b) return false
  const d1 = new Date(a)
  const d2 = new Date(b)
  return d1.toDateString() === d2.toDateString()
}

export default function MessagesInbox() {
  const [conversations, setConversations] = useState(() => dummyConversations)
  const [activeConversationId, setActiveConversationId] = useState(() => dummyConversations[0]?.id ?? null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)

  const confirm = useConfirm()

  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  )

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [activeConversationId, activeConversation?.messages.length])

  useEffect(() => {
    if (!activeConversationId) return
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: c.messages.map(m => (m.sender !== loggedInUserId ? { ...m, read: true } : m)) }
          : c
      )
    )
  }, [activeConversationId])

  const handleCreateConversation = newConv => {
    const conv = {
      ...newConv,
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: loggedInUserId,
          text: 'Nowa rozmowa!',
          timestamp: new Date().toISOString(),
          read: true,
          reactions: {},
        },
      ],
    }
    setConversations(prev => [...prev, conv])
    setActiveConversationId(conv.id)
    setShowNewModal(false)
  }

  const handleEmojiClick = (emojiObjOrEvent, maybeData) => {
    const picked = emojiObjOrEvent?.emoji || maybeData?.emoji || ''
    if (!picked) return
    setNewMessage(prev => prev + picked)
    inputRef.current?.focus()
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: loggedInUserId,
                  text: newMessage,
                  timestamp: new Date().toISOString(),
                  read: false,
                  reactions: {},
                },
              ],
            }
          : conv
      )
    )
    setNewMessage('')
    setShowEmojiPicker(false)
    requestAnimationFrame(() => {
      const el = messagesContainerRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }

  const handleReaction = (msgIndex, emoji) => {
    if (!activeConversation) return
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== activeConversation.id) return conv
        const updatedMessages = [...conv.messages]
        const msg = { ...updatedMessages[msgIndex] }
        msg.reactions = { ...(msg.reactions || {}), [loggedInUserId]: emoji }
        updatedMessages[msgIndex] = msg
        return { ...conv, messages: updatedMessages }
      })
    )
  }

  const handleDeleteConversation = async id => {
    const ok = await confirm({
      title: 'Usunąć rozmowę?',
      message: 'Tej operacji nie można cofnąć. Wiadomości w tej konwersacji zostaną usunięte z widoku.',
      confirmText: 'Usuń',
      cancelText: 'Anuluj',
      danger: true,
    })
    if (!ok) return
    setConversations(prev => prev.filter(c => c.id !== id))
    if (id === activeConversationId) setActiveConversationId(null)
  }

  const filteredConversations = useMemo(
    () => conversations.filter(conv => conv.name.toLowerCase().includes((searchQuery || '').toLowerCase())),
    [conversations, searchQuery]
  )

  return (
    <div className="message-inbox">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>
          Rozmowy
          <button className="new-chat-btn" onClick={() => setShowNewModal(true)} title="Nowa rozmowa" aria-label="Nowa rozmowa">
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </h3>

        <input
          className="conversation-search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Szukaj..."
          aria-label="Szukaj rozmów"
        />

        <ul>
          {filteredConversations.map(conv => {
            const unread = conv.messages.filter(m => !m.read && m.sender !== loggedInUserId).length
            const isActive = conv.id === activeConversationId
            return (
              <li
                key={conv.id}
                className={isActive ? 'active' : ''}
                onClick={() => setActiveConversationId(conv.id)}
                role="button"
                aria-current={isActive ? 'true' : 'false'}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveConversationId(conv.id) }}
              >
                <span className="conversation-name">
                  {conv.name}
                  {unread > 0 && <span className="chat-unread-count">{unread}</span>}
                </span>
                <button
                  className="delete-chat-btn"
                  onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id) }}
                  title="Usuń rozmowę"
                  aria-label="Usuń rozmowę"
                >
                  <i className="fas fa-trash" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* OKNO CZATU */}
      <div className="chat-window">
        {!activeConversation ? (
          <div className="empty-chat">
            <div className="empty-card">
              <div className="empty-icon" aria-hidden="true">💬</div>
              <div className="empty-title">Brak wybranej rozmowy</div>
              <p className="empty-desc">Wybierz rozmowę z listy po lewej albo rozpocznij nową.</p>
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>Nowa rozmowa</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div>
                <b>{activeConversation.name}</b>
                <div className="chat-members">{activeConversation.members.map(id => users[id]).join(', ')}</div>
              </div>
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
              {activeConversation.messages.map((msg, idx, arr) => {
                const showDate = idx === 0 || !isSameDay(msg.timestamp, arr[idx - 1]?.timestamp)
                const showAuthor = idx === 0 || msg.sender !== arr[idx - 1].sender
                const isOwn = msg.sender === loggedInUserId
                const reactionCounts = Object.values(msg.reactions || {}).reduce((acc, emoji) => {
                  acc[emoji] = (acc[emoji] || 0) + 1
                  return acc
                }, {})

                return (
                  <React.Fragment key={msg.id || `${msg.timestamp}-${idx}`}>
                    {showDate && <div className="date-separator">{formatDateHeader(msg.timestamp)}</div>}

                    <div className={`message-block ${isOwn ? 'own' : ''}`}>
                      {showAuthor && <div className="message-author">{users[msg.sender]}</div>}

                      <div className={`message ${isOwn ? 'own' : ''}`}>
                        {msg.text}
                        <div className="reaction-bar fade-in" onMouseDown={e => e.preventDefault()}>
                          {['👍', '❤️', '😂', '😮'].map((emoji, i) => (
                            <span key={i} className="reaction-btn" onClick={() => handleReaction(idx, emoji)} role="button" aria-label={`Dodaj reakcję ${emoji}`}>
                              {emoji}
                            </span>
                          ))}
                        </div>
                        {Object.keys(reactionCounts).length > 0 && (
                          <div className="message-reactions">
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                              <span key={emoji}>{emoji} {count}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isOwn && msg.read ? '✓✓' : ''}
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            <div className="chat-input">
              <button className="emoji-toggle-btn" onClick={() => setShowEmojiPicker(p => !p)} title="Emoji" aria-label="Wstaw emoji">
                😊
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-wrapper" onMouseDown={e => e.preventDefault()}>
                  <Suspense fallback={null}>
                    <LazyEmojiPicker onEmojiClick={handleEmojiClick} />
                  </Suspense>
                </div>
              )}

              <label className="file-attach" title="Dodaj załącznik" aria-label="Dodaj załącznik">
                📎
                <input type="file" style={{ display: 'none' }} />
              </label>

              <input
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                placeholder="Napisz wiadomość..."
                aria-label="Napisz wiadomość"
              />

              <button onClick={handleSendMessage} aria-label="Wyślij wiadomość">Wyślij</button>
            </div>
          </>
        )}
      </div>

      {showNewModal && (
        <NewConversationModal onCreate={handleCreateConversation} onClose={() => setShowNewModal(false)} />
      )}
    </div>
  )
}

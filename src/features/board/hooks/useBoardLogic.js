// src/components/pages/contents/BoardLogic.js
import { useCallback, useState } from 'react'

export function useBoardLogic(initialPosts, loggedInUser, initialTags = []) {
  const [posts, setPosts] = useState(Array.isArray(initialPosts) ? initialPosts : [])

  const [newPost, setNewPost] = useState({
    title: '',
    author: loggedInUser,
    targetDate: '',
    type: 'post',
    content: '',
    mentions: [],
    priority: 'normalny',
    tags: [],
  })

  const [availableTags, setAvailableTags] = useState(Array.isArray(initialTags) ? initialTags : [])
  const [customTag, setCustomTag] = useState('')
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [filterType, setFilterType] = useState('all')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterMentioned, setFilterMentioned] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [gotoDate, setGotoDate] = useState('')

  // helpery: bezpieczne tablice
  const normMentions = useCallback((m) => (Array.isArray(m) ? m : []), [])
  const normTags = useCallback((t) => (Array.isArray(t) ? t : []), [])

  // ✅ stabilne ID (string)
  const makeId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return String(Date.now())
  }, [])

  // ✅ reset filtrów jako wspólna akcja
  const resetFilters = useCallback(() => {
    setFilterType('all')
    setFilterAuthor('')
    setFilterMentioned('')
    setFilterPriority('')
    setFilterTag('')
    setGotoDate('')
  }, [])

  // ✅ selector (funkcja) — stabilny i defensywny
  const filteredEntries = useCallback(
    (entries) => {
      const arr = Array.isArray(entries) ? entries : []
      return arr.filter((entry) => {
        if (filterType !== 'all' && entry?.type !== filterType) return false
        if (filterAuthor && entry?.author !== filterAuthor) return false
        if (filterMentioned && !normMentions(entry?.mentions).includes(filterMentioned)) return false
        if (filterPriority && entry?.priority !== filterPriority) return false
        if (filterTag && !normTags(entry?.tags).includes(filterTag)) return false
        return true
      })
    },
    [filterType, filterAuthor, filterMentioned, filterPriority, filterTag, normMentions, normTags],
  )

  // ✅ ADD: przyjmuje model z modala (fallback: bierze newPost ze stanu)
  const handleAddPost = useCallback(
    (model) => {
      const payload = model && typeof model === 'object' ? model : newPost
      const now = new Date().toISOString()

      const created = {
        ...payload,
        id: payload.id ?? makeId(),
        date: payload.date || now,
        author: payload.author || loggedInUser,
        mentions: normMentions(payload.mentions),
        tags: normTags(payload.tags),
        priority: payload.type === 'task' ? (payload.priority || 'normalny') : payload.priority,
      }

      setPosts((prev) => [...(Array.isArray(prev) ? prev : []), created])

      // reset formularza
      setNewPost({
        title: '',
        author: loggedInUser,
        targetDate: '',
        type: 'post',
        content: '',
        mentions: [],
        priority: 'normalny',
        tags: [],
      })

      setShowModal(false)
    },
    [newPost, loggedInUser, makeId, normMentions, normTags],
  )

  // Trainings -> post
  const addTrainingPost = useCallback(
    (training) => {
      if (!training) return
      const created = {
        id: makeId(),
        author: loggedInUser,
        date: new Date().toISOString(),
        targetDate: training.date,
        title: `Szkolenie: ${training.title}`,
        type: 'post',
        content: `Temat: ${training.topic}\nUczestnicy: ${(training.participants || []).join(', ')}`,
        mentions: Array.isArray(training.participants) ? training.participants : [],
        tags: ['szkolenie'],
      }
      setPosts((prev) => [...(Array.isArray(prev) ? prev : []), created])
    },
    [loggedInUser, makeId],
  )

  /**
   * ✅ EDIT: jedna funkcja, wspiera oba wywołania:
   *  - handleEditSave()          -> edytuje selectedPost
   *  - handleEditSave(model)     -> edytuje przekazany model (np. z modala)
   */
  const handleEditSave = useCallback(
    (model) => {
      const base = model && typeof model === 'object' ? model : selectedPost
      if (!base || !base.id) return

      const updatedPost = {
        ...base,
        lastEdited: new Date().toISOString(),
        mentions: normMentions(base.mentions),
        tags: normTags(base.tags),
      }

      setPosts((prev) =>
        (Array.isArray(prev) ? prev : []).map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      )
      setEditMode(false)
      setSelectedPost(null)
    },
    [selectedPost, normMentions, normTags],
  )

  const handleDelete = useCallback(
    (post) => {
      const p = post && typeof post === 'object' ? post : selectedPost
      if (!p || !p.id) {
        console.warn('[BŁĄD] Próba usunięcia pustego posta:', p)
        return
      }
      setPosts((prev) => (Array.isArray(prev) ? prev : []).filter((x) => x.id !== p.id))
      setSelectedPost(null)
      setEditMode(false)
    },
    [selectedPost],
  )

  return {
    posts,
    setPosts,
    newPost,
    setNewPost,
    availableTags,
    setAvailableTags,
    customTag,
    setCustomTag,
    expandedPostId,
    setExpandedPostId,
    selectedPost,
    setSelectedPost,
    editMode,
    setEditMode,
    showModal,
    setShowModal,
    filterType,
    setFilterType,
    filterAuthor,
    setFilterAuthor,
    filterMentioned,
    setFilterMentioned,
    filterPriority,
    setFilterPriority,
    filterTag,
    setFilterTag,
    gotoDate,
    setGotoDate,
    filteredEntries,

    resetFilters,

    handleAddPost,

    // ✅ teraz przyjmuje model opcjonalnie
    handleEditSave,

    // ✅ kompatybilny alias pod Twoje nowe użycie w modalach
    handleEditSaveModel: handleEditSave,

    handleDelete,
    addTrainingPost,
  }
}
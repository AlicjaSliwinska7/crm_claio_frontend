// src/features/messages/state/MessagesContext.jsx
import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react'
import PropTypes from 'prop-types'

const MessagesContext = createContext(null)

// ── helpers
const nowIso = () => new Date().toISOString()
const rid = (p = 'm') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now()}`
const iso = s => (s ? new Date(s).toISOString() : nowIso())

// ── przykładowe dane startowe (utwardzone: id wiadomości + pełne ISO)
const seedConversations = [
  {
    id: 'chat1',
    name: 'Rozmowa z Anną',
    members: ['u1', 'u3'],
    messages: [
      { id: rid(), sender: 'u1', text: 'Cześć!', timestamp: iso('2025-07-04T10:01:00'), read: true, reactions:{} },
      { id: rid(), sender: 'u3', text: 'Hej!',   timestamp: iso('2025-07-04T10:02:00'), read: false, reactions:{} },
    ],
  },
  {
    id: 'chat2',
    name: 'Zespół projektowy',
    members: ['u1', 'u2'],
    messages: [
      { id: rid(), sender: 'u2', text: 'Kto odpowiada za ofertę?', timestamp: iso('2025-07-03T12:15:00'), read: false, reactions:{} },
    ],
  },
]

// ── reducer
const A = {
  ADD_CONV: 'ADD_CONV',
  DEL_CONV: 'DEL_CONV',
  ADD_MSG: 'ADD_MSG',
  MARK_MSG_READ: 'MARK_MSG_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  SET_STATE: 'SET_STATE',
}

function reducer(state, action) {
  switch (action.type) {
    case A.ADD_CONV: {
      return { ...state, conversations: [...state.conversations, action.payload] }
    }
    case A.DEL_CONV: {
      const { chatId } = action.payload
      return { ...state, conversations: state.conversations.filter(c => c.id !== chatId) }
    }
    case A.ADD_MSG: {
      const { chatId, message } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
        ),
      }
    }
    case A.MARK_MSG_READ: {
      const { chatId, messageId } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id !== chatId
            ? c
            : { ...c, messages: c.messages.map(m => (m.id === messageId ? { ...m, read: true } : m)) }
        ),
      }
    }
    case A.MARK_ALL_READ: {
      const { chatId, excludeSender } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id !== chatId
            ? c
            : { ...c, messages: c.messages.map(m => (m.sender !== excludeSender ? { ...m, read: true } : m)) }
        ),
      }
    }
    case A.SET_STATE: {
      return { ...state, conversations: action.payload }
    }
    default:
      return state
  }
}

// ── provider
export function MessagesProvider({
  children,
  loggedInUserId = 'u1',
  initialConversations = seedConversations,
}) {
  const [state, dispatch] = useReducer(reducer, { conversations: initialConversations })

  // selektory
  const unreadCount = useMemo(
    () =>
      state.conversations.reduce(
        (acc, conv) => acc + conv.messages.filter(m => !m.read && m.sender !== loggedInUserId).length,
        0
      ),
    [state.conversations, loggedInUserId]
  )

  const unreadByConversation = useMemo(() => {
    const map = {}
    for (const c of state.conversations) {
      map[c.id] = c.messages.filter(m => !m.read && m.sender !== loggedInUserId).length
    }
    return map
  }, [state.conversations, loggedInUserId])

  // akcje
  const addConversation = useCallback(({ id, name, members, messages }) => {
    const conv = {
      id: id || `chat-${Date.now()}`,
      name: name || 'Nowa rozmowa',
      members: members && members.length ? members : [loggedInUserId],
      messages:
        messages && messages.length
          ? messages
          : [{ id: rid(), sender: loggedInUserId, text: 'Nowa rozmowa!', timestamp: nowIso(), read: true, reactions:{} }],
    }
    dispatch({ type: A.ADD_CONV, payload: conv })
    return conv
  }, [loggedInUserId])

  const deleteConversation = useCallback((chatId) => {
    dispatch({ type: A.DEL_CONV, payload: { chatId } })
  }, [])

  const addMessage = useCallback((chatId, { text, sender = loggedInUserId }) => {
    const msg = { id: rid(), sender, text, timestamp: nowIso(), read: sender === loggedInUserId, reactions:{} }
    dispatch({ type: A.ADD_MSG, payload: { chatId, message: msg } })
    return msg
  }, [loggedInUserId])

  const markMessageRead = useCallback((chatId, messageId) => {
    dispatch({ type: A.MARK_MSG_READ, payload: { chatId, messageId } })
  }, [])

  const markAllReadInConversation = useCallback((chatId) => {
    dispatch({ type: A.MARK_ALL_READ, payload: { chatId, excludeSender: loggedInUserId } })
  }, [loggedInUserId])

  const setConversations = useCallback((next) => {
    dispatch({ type: A.SET_STATE, payload: next })
  }, [])

  const value = useMemo(() => ({
    conversations: state.conversations,
    // selektory
    unreadCount,
    unreadByConversation,
    loggedInUserId,
    // akcje
    setConversations,
    addConversation,
    deleteConversation,
    addMessage,
    markMessageRead,
    markAllReadInConversation,
  }), [
    state.conversations,
    unreadCount,
    unreadByConversation,
    loggedInUserId,
    setConversations,
    addConversation,
    deleteConversation,
    addMessage,
    markMessageRead,
    markAllReadInConversation,
  ])

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages must be used within <MessagesProvider>')
  return ctx
}

MessagesProvider.propTypes = {
  children: PropTypes.node,
  loggedInUserId: PropTypes.string,
  initialConversations: PropTypes.array,
}

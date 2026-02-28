// src/features/messages/state/MessagesContext.jsx
import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react'
import PropTypes from 'prop-types'

// ───────────────────────────────── helpers
const nowIso = () => new Date().toISOString()
const withId = (prefix='m') => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now()}`

// przykładowe dane startowe (z id i pełnym ISO)
const initialConversations = [
  {
    id: 'chat1',
    name: 'Rozmowa z Anną',
    members: ['u1', 'u3'],
    messages: [
      { id: withId(), sender: 'u1', text: 'Cześć!', timestamp: '2025-07-04T10:01:00.000Z', read: true, reactions:{} },
      { id: withId(), sender: 'u3', text: 'Hej!',   timestamp: '2025-07-04T10:02:00.000Z', read: false, reactions:{} },
    ],
  },
  {
    id: 'chat2',
    name: 'Zespół projektowy',
    members: ['u1', 'u2'],
    messages: [
      { id: withId(), sender: 'u2', text: 'Kto odpowiada za ofertę?', timestamp: '2025-07-03T12:15:00.000Z', read: false, reactions:{} },
    ],
  },
]

// ───────────────────────────────── reducer
const ACTIONS = {
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ',
  MARK_ALL_READ_IN_CONV: 'MARK_ALL_READ_IN_CONV',
  REPLACE_STATE: 'REPLACE_STATE', // np. gdy podłączysz backend
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_CONVERSATION: {
      const conv = action.payload
      return { ...state, conversations: [...state.conversations, conv] }
    }
    case ACTIONS.DELETE_CONVERSATION: {
      const { chatId } = action.payload
      return { ...state, conversations: state.conversations.filter(c => c.id !== chatId) }
    }
    case ACTIONS.ADD_MESSAGE: {
      const { chatId, message } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
        ),
      }
    }
    case ACTIONS.MARK_MESSAGE_READ: {
      const { chatId, messageId } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c => {
          if (c.id !== chatId) return c
          return {
            ...c,
            messages: c.messages.map(m => (m.id === messageId ? { ...m, read: true } : m)),
          }
        }),
      }
    }
    case ACTIONS.MARK_ALL_READ_IN_CONV: {
      const { chatId, excludeSender } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c => {
          if (c.id !== chatId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.sender !== excludeSender ? { ...m, read: true } : m
            ),
          }
        }),
      }
    }
    case ACTIONS.REPLACE_STATE: {
      return { ...state, conversations: action.payload.conversations ?? state.conversations }
    }
    default:
      return state
  }
}

// ───────────────────────────────── context
const MessagesContext = createContext(null)

export function MessagesProvider({ children, loggedInUserId = 'u1', seed = initialConversations }) {
  const [state, dispatch] = useReducer(reducer, { conversations: seed })

  // selektory
  const unreadCount = useMemo(() => {
    return state.conversations.reduce(
      (acc, conv) => acc + conv.messages.filter(m => !m.read && m.sender !== loggedInUserId).length,
      0
    )
  }, [state.conversations, loggedInUserId])

  const unreadByConversation = useMemo(() => {
    const dict = {}
    for (const conv of state.conversations) {
      dict[conv.id] = conv.messages.filter(m => !m.read && m.sender !== loggedInUserId).length
    }
    return dict
  }, [state.conversations, loggedInUserId])

  // akcje (stabilne)
  const addConversation = useCallback((partial) => {
    const conv = {
      id: partial.id || withId('chat'),
      name: partial.name || 'Nowa rozmowa',
      members: partial.members || [loggedInUserId],
      messages: partial.messages || [{
        id: withId(),
        sender: loggedInUserId,
        text: 'Nowa rozmowa!',
        timestamp: nowIso(),
        read: true,
        reactions: {},
      }],
    }
    dispatch({ type: ACTIONS.ADD_CONVERSATION, payload: conv })
    return conv
  }, [loggedInUserId])

  const deleteConversation = useCallback((chatId) => {
    dispatch({ type: ACTIONS.DELETE_CONVERSATION, payload: { chatId } })
  }, [])

  const addMessage = useCallback((chatId, { text, sender = loggedInUserId }) => {
    const message = { id: withId(), sender, text, timestamp: nowIso(), read: sender === loggedInUserId, reactions:{} }
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } })
    return message
  }, [loggedInUserId])

  const markMessageRead = useCallback((chatId, messageId) => {
    dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: { chatId, messageId } })
  }, [])

  const markAllReadInConversation = useCallback((chatId) => {
    dispatch({ type: ACTIONS.MARK_ALL_READ_IN_CONV, payload: { chatId, excludeSender: loggedInUserId } })
  }, [loggedInUserId])

  const replaceState = useCallback((conversations) => {
    dispatch({ type: ACTIONS.REPLACE_STATE, payload: { conversations } })
  }, [])

  const value = useMemo(() => ({
    conversations: state.conversations,
    unreadCount,
    unreadByConversation,

    addConversation,
    deleteConversation,
    addMessage,
    markMessageRead,
    markAllReadInConversation,
    replaceState,

    loggedInUserId, // udostępnij dla komponentów (np. wyróżnienie własnych wiadomości)
  }), [
    state.conversations,
    unreadCount,
    unreadByConversation,
    addConversation,
    deleteConversation,
    addMessage,
    markMessageRead,
    markAllReadInConversation,
    replaceState,
    loggedInUserId,
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
  seed: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.string).isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      sender: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      read: PropTypes.bool,
      reactions: PropTypes.object,
    })),
  })),
}

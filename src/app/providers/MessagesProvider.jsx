// Preferowana, docelowa implementacja:
export { MessagesProvider, useMessages } from '../../features/messages/contexts/MessagesContext'

// Jeśli tego pliku nie masz, tymczasowy fallback (odkomentuj i zakomentuj linię powyżej):
/*
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
const Ctx = createContext(null)
export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([])
  const add = useCallback((m) => setMessages((xs) => [...xs, m]), [])
  const value = useMemo(() => ({ messages, add }), [messages, add])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useMessages() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMessages must be used within <MessagesProvider>')
  return ctx
}
*/

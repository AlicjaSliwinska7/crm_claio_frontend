// src/app/providers/NotificationsProvider.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

// przeniesione z Twojego pliku – nic nie zmieniamy w polach:
const initialNotifications = [
  { id: 'n1', type: 'task',    title: 'Nowe zadanie',        message: 'Zadanie: Przygotować ofertę dla Meditech', actor: 'Alicja Śliwińska', date: '2025-07-10T09:15:00Z', link: '/zadania',                    read: false },
  { id: 'n2', type: 'post',    title: 'Wzmianka na tablicy', message: 'Jan Kowalski wspomniał o Tobie w poście „Testy wytrzymałościowe”', actor: 'Jan Kowalski', date: '2025-07-10T08:42:00Z', link: '/tablica', read: false },
  { id: 'n3', type: 'training',title: 'Nowe szkolenie',      message: '„BHP w laboratorium” – dodano Cię jako uczestnika', actor: 'System', date: '2025-07-09T14:05:00Z', link: '/administracja/szkolenia', read: true  },
  { id: 'n4', type: 'meeting', title: 'Spotkanie',           message: 'Kickoff projektu X – przypisano Cię jako uczestnika', actor: 'System', date: '2025-07-09T10:30:00Z', link: '/administracja/spotkania', read: false },
]

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState(initialNotifications)

  const markUnread = useCallback(id => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)))
  }, [])

  const unreadCount = useMemo(() => items.filter(n => !n.read).length, [items])

  const markRead = useCallback(id => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback(notif => {
    const id = notif.id ?? `n-${Date.now()}`
    setItems(prev => [{ id, read: false, ...notif }, ...prev])
  }, [])

  const value = useMemo(
    () => ({ items, setItems, unreadCount, markRead, markUnread, markAllRead, addNotification }),
    [items, unreadCount, markRead, markUnread, markAllRead, addNotification]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>')
  return ctx
}

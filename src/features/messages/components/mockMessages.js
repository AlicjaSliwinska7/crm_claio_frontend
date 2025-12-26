// src/features/messages/data/messagesData.js

// Stabilne ID użytkowników (prościej liczyć unread i łączyć z backendem)
export const users = {
  u1: 'Alicja Śliwińska',
  u2: 'Jan Kowalski',
  u3: 'Anna Nowak',
  u4: 'Tomasz Wójcik',
  u5: 'Ewa Dąbrowska',
  u6: 'Piotr Kowalski',
  u7: 'Maria Zielińska',
  u8: 'Karolina Mazur',
  u9: 'Paweł Lewandowski',
}

export const loggedInUserId = 'u1'

// Helpery
const withId = (p='m') => `${p}-${Math.random().toString(36).slice(2,8)}${Date.now()}`
const iso = s => new Date(s).toISOString() // gwarantuje pełne ISO z "Z"

// Rozmowy (używamy ID użytkowników w members/sender)
export const chats = [
  {
    id: 'chat1',
    name: 'Rozmowa z Anną',
    members: ['u1', 'u3'],
    messages: [
      { id: withId(), sender: 'u1', text: 'Cześć, jak idą badania?', timestamp: iso('2025-07-04T10:01:00'), read: true,  reactions: {} },
      { id: withId(), sender: 'u3', text: 'Już prawie skończone!',    timestamp: iso('2025-07-04T10:02:00'), read: true,  reactions: {} },
      { id: withId(), sender: 'u3', text: 'Wyślę raport po lunchu.',  timestamp: iso('2025-07-04T12:20:00'), read: false, reactions: {} },
    ],
  },
  {
    id: 'chat2',
    name: 'Zespół projektowy',
    members: ['u1', 'u4', 'u2'],
    messages: [
      { id: withId(), sender: 'u4', text: 'Kto odpowiada za ofertę dla firmy X?', timestamp: iso('2025-07-03T12:15:00'), read: false, reactions: {} },
      { id: withId(), sender: 'u2', text: 'Ja mogę się tym zająć.',              timestamp: iso('2025-07-03T12:17:00'), read: false, reactions: {} },
      { id: withId(), sender: 'u1', text: 'Super, to proszę o draft do końca dnia.', timestamp: iso('2025-07-03T12:30:00'), read: true, reactions: {} },
    ],
  },
]

// Drobne utilsy, gdy potrzebujesz nazwy z ID:
export const userName = id => users[id] || id

// (opcjonalnie) wersja listy użytkowników, jeśli gdzieś potrzebujesz tablicy:
export const usersList = Object.entries(users).map(([id, name]) => ({ id, name }))

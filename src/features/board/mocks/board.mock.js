// src/features/board/mocks/board.mock.js

export const BOARD_USERS = ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']

export const BOARD_LOGGED_IN_USER = 'Alicja Śliwińska'

/**
 * Domyślne tagi tablicy (możesz rozszerzać w przyszłości).
 * Jeśli chcesz SSOT dla całej appki — później przeniesiemy to do shared/config.
 */
export const BOARD_DEFAULT_TAGS = ['grafik', 'audyt', 'BHP', 'analiza', 'próbka', 'serwer']

/**
 * Demo wpisy dla trybu preview / bez backendu.
 * Ważne: id jako string dla spójności (crypto/randomUUID lub Date.now zwraca string w useBoardLogic).
 */
export const BOARD_INITIAL_POSTS = [
  {
    id: 'p1',
    author: 'Alicja Śliwińska',
    date: '2025-06-30T10:52',
    targetDate: '2025-06-30',
    title: 'Nowy grafik',
    type: 'post',
    content: 'Dostępny jest nowy grafik pracy na lipiec.',
    mentions: ['Jan Kowalski'],
    tags: ['grafik'],
  },
  {
    id: 'p2',
    author: 'Jan Kowalski',
    date: '2025-07-01T10:52',
    targetDate: '2025-07-01',
    title: 'Zadanie: przygotowanie sali',
    type: 'task',
    content: 'Proszę przygotować salę do audytu.',
    mentions: ['Anna Nowak'],
    priority: 'wysoki',
    tags: ['audyt'],
  },
  {
    id: 'p3',
    author: 'Anna Nowak',
    date: '2025-07-02T10:52',
    targetDate: '2025-07-02',
    title: 'Wiadomość dot. BHP',
    type: 'post',
    content: 'Przypominam o uzupełnieniu szkoleń BHP do końca tygodnia.',
    mentions: ['Alicja Śliwińska', 'Jan Kowalski'],
    tags: ['BHP'],
  },
]
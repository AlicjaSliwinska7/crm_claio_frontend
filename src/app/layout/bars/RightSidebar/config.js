// src/app/layout/bars/RightSideBar/config.js
export const STORAGE_KEY = 'rightSidebar.open'

export const MENU = [
  {
    id: 'terminy',
    base: '/terminy',
    iconClass: 'fas fa-calendar-alt',
    label: 'Terminy',
    items: [
      { to: '/terminy/moje', label: 'Mój grafik' },
      { to: '/terminy/zaplanuj-grafik', label: 'Zaplanuj grafik' },
      { to: '/terminy/zestawienie', label: 'Zestawienie' },
    ],
  },
  {
    id: 'narzedzia',
    base: '/narzedzia',
    iconClass: 'fas fa-wrench',
    label: 'Narzędzia',
    items: [
      { to: '/narzedzia/wykresy', label: 'Wykresy' },
      { to: '/narzedzia/obliczenia', label: 'Obliczenia' },
    ],
  },
  {
    id: 'zadania',
    base: '/zadania',
    iconClass: 'fas fa-tasks',
    label: 'Zadania',
    items: [
      { to: '/zadania/nowe', label: 'Nowe zadanie' },
      { to: '/zadania/moje', label: 'Moje zadania' },
      { to: '/zadania/monitoring', label: 'Monitoruj' },
      { to: '/zadania/nieprzydzielone', label: 'Nieprzydzielone' },
      { to: '/zadania/harmonogram-zadan', label: 'Harmonogram zadań' },
      { to: '/zadania/zestawienie', label: 'Zestawienie' },
    ],
  },
  {
    id: 'qa',
    base: '/qa',
    iconClass: 'fa-solid fa-shield-halved',
    label: 'QA',
    items: [
      { to: '/qa/problemy-app', label: 'Problemy z aplikacją' },
      { to: '/qa/problemy', label: 'Problemy ogólne' },
    ],
  },
]

// PL święta – 'yyyy-MM-dd'
export const STATIC_PL_HOLIDAYS = new Set([
  '2025-01-01', '2025-01-06', '2025-04-20', '2025-04-21',
  '2025-05-01', '2025-05-03', '2025-06-08', '2025-06-19',
  '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25', '2025-12-26',
])

export const WEEKDAYS_SHORT = ['Ndz', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb']
export const formatShortWeekdayPL = (_locale, date) => WEEKDAYS_SHORT[date.getDay()]

export const MIN_QUERY_LEN = 2
export const TOP_N_PER_GROUP = 8
export const DEBOUNCE_MS = 400

// Jeden punkt do zmiany tras/etykiet
export const GROUPS = [
  {
    key: 'clients',
    label: 'Klienci',
    icon: 'fas fa-users',
    viewAllTo: '/sprzedaz/klienci',
    buildTo: (item) => `/sprzedaz/klienci/${encodeURIComponent(item.slug || item.id || item.name)}`,
    primary: (item) => item.name,
    secondary: (item) => item.email || item.city,
  },
  {
    key: 'orders',
    label: 'Zlecenia',
    icon: 'fas fa-file-signature',
    viewAllTo: '/sprzedaz/rejestr-zlecen',
    buildTo: (item) => `/sprzedaz/rejestr-zlecen/${encodeURIComponent(item.id)}`,
    primary: (item) => `Zlecenie #${item.number || item.id}`,
    secondary: (item) => item.clientName,
  },
  {
    key: 'samples',
    label: 'Próbki',
    icon: 'fas fa-flask',
    viewAllTo: '/probki/rejestr-probek',
    buildTo: (item) => `/probki/rejestr-probek/${encodeURIComponent(item.id)}`,
    primary: (item) => item.code || item.name || item.id,
    secondary: (item) => item.material || item.batch,
  },
  {
    key: 'tasks',
    label: 'Zadania',
    icon: 'fas fa-tasks',
    viewAllTo: '/zadania',
    buildTo: (item) => `/zadania/${encodeURIComponent(item.id)}`,
    primary: (item) => item.title,
    secondary: (item) => item.assignee || item.status,
  },
  {
    key: 'documents',
    label: 'Dokumenty',
    icon: 'fas fa-folder-open',
    viewAllTo: '/administracja/dokumenty',
    buildTo: (item) => `/administracja/dokumenty/${encodeURIComponent(item.id)}`,
    primary: (item) => item.title || item.name,
    secondary: (item) => item.category,
  },
  {
    key: 'trainings',
    label: 'Szkolenia',
    icon: 'fas fa-chalkboard-teacher',
    viewAllTo: '/administracja/szkolenia',
    buildTo: (item) => `/administracja/szkolenia/${encodeURIComponent(item.id)}`,
    primary: (item) => item.title || item.name,
    secondary: (item) => item.date,
  },
  {
    key: 'posts',
    label: 'Tablica',
    icon: 'fas fa-clipboard-list',
    viewAllTo: '/tablica',
    buildTo: (item) => `/tablica/post/${encodeURIComponent(item.id)}`,
    primary: (item) => item.title,
    secondary: (item) => item.author,
  },
  {
    key: 'equipment',
    label: 'Wyposażenie',
    icon: 'fas fa-tools',
    viewAllTo: '/wyposazenie/rejestr-wyposazenia',
    buildTo: (item) => `/wyposazenie/rejestr-wyposazenia/${encodeURIComponent(item.id)}`,
    primary: (item) => item.name,
    secondary: (item) => item.inventoryNo || item.location,
  },
]

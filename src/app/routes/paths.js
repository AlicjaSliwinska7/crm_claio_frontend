// src/app/routes/paths.js

/** Prosty helper do doklejania query paramów. Pomija puste wartości. */
export function withQuery(path, params = {}) {
  const qp = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim() !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qp ? `${path}?${qp}` : path;
}

/** Helper do bezpiecznego osadzania segmentów ścieżki. */
export const seg = (value) => encodeURIComponent(String(value));

/** Mapa “stałych” ścieżek + budowniczowie URL-i z parametrami. */
export const PATHS = {
  HOME: '/',
  LOGIN: '/login',

  // SEARCH
  SEARCH: '/szukaj',
  searchUrl: (q) => withQuery('/szukaj', { q }),

  // TABLICA
  BOARD: {
    ROOT: '/tablica',
    PREVIEW: '/tablica/podglad',
  },

  // TERMINY
  SCHEDULE: {
    ROOT: '/terminy',
    MINE: '/terminy/moje',
    PLAN: '/terminy/zaplanuj-grafik',
    SUMMARY: '/terminy/zestawienie',
    DEMO: '/terminy/demo',
  },

  // WYPOSAŻENIE
  EQUIPMENT: {
    ROOT: '/wyposazenie',
    REGISTRY: '/wyposazenie/rejestr-wyposazenia',
    CAL_LABS: '/wyposazenie/laboratoria-wzorcowania',
    CAL_SCHEDULE: '/wyposazenie/harmonogram-wzorcowania',
    SUMMARY: '/wyposazenie/zestawienie',
  },

  // METODY BADAWCZE
  METHODS: {
    ROOT: '/metody-badawcze',
    LIST: '/metody-badawcze/spis',
    DETAILS: (methodNo) => `/metody-badawcze/spis/${seg(methodNo)}`,
  },

  // PROFIL / USTAWIENIA
  PROFILE: '/profil',
  SETTINGS: {
    ROOT: '/ustawienia',
    PROFILE: '/ustawienia/profil',
    SHORTCUTS: '/ustawienia/skroty',
  },

  // WIADOMOŚCI / POWIADOMIENIA
  MESSAGES: {
    ROOT: '/wiadomosci',
    NEW: '/wiadomosci/nowa',
    NOTIFICATIONS: '/powiadomienia',
  },

  // ADMINISTRACJA
  ADMIN: {
    ROOT: '/administracja',
    CONTACTS: '/administracja/kontakty',
    SCHEDULE: '/administracja/harmonogram',
    OVERTIME: '/administracja/nadgodziny',
    DOCUMENTS: '/administracja/dokumenty',
    TRAININGS: '/administracja/szkolenia',
    TRAINING: (id) => `/administracja/szkolenia/${seg(id)}`,
    MEETINGS: '/administracja/spotkania',
    MEETING: (id) => `/administracja/spotkania/${seg(id)}`,
    SHOPPING: '/administracja/zamowienia',
  },

  // PROSTE DOKI
  DOCS: {
    INSTRUCTIONS: '/instrukcje',
    REPORTS: '/raporty',
  },

  // BADANIA
  RESEARCH: {
    ROOT: '/badania',
    SUMMARY: '/badania/zestawienie',
    SCHEDULE: '/badania/harmonogram',
    REGISTRY: '/badania/rejestr-badan',
    PB: (orderNo) => `/badania/rejestr-badan/PB/${seg(orderNo)}`,
    KB: (orderNo, id) => `/badania/rejestr-badan/PB/${seg(orderNo)}/${seg(id)}/KB`,
  },

  // SPRZEDAŻ
  SALES: {
    ROOT: '/sprzedaz',
    CLIENTS: '/sprzedaz/klienci',
    CLIENT: (id) => `/sprzedaz/klienci/${seg(id)}`,
    OFFERS: '/sprzedaz/oferty',
    OFFER: (id) => `/sprzedaz/oferty/${seg(id)}`,
    OFFER_FORM: (id) => `/sprzedaz/oferty/${seg(id)}/formularz`,
    ORDERS_REGISTER: '/sprzedaz/rejestr-zlecen',
    ORDER_DETAILS: (id) => `/sprzedaz/zlecenia/${seg(id)}`,
    SUMMARY: '/sprzedaz/zestawienia',
    PRICING: '/sprzedaz/cennik',
  },

  // PRÓBKI
  SAMPLES: {
    ROOT: '/probki',
    REGISTER: '/probki/rejestr-probek',
    SAMPLE: (id) => `/probki/rejestr-probek/${seg(id)}`,
    DELIVERY_PICKUP: '/probki/dostawa-i-odbior',
    DISPOSAL: '/probki/utylizacja',
    SUMMARY: '/probki/zestawienie',
  },

  // ZADANIA
  TASKS: {
    ROOT: '/zadania',
    NEW: '/zadania/nowe',
    MONITORING: '/zadania/monitoring',
    MINE: '/zadania/moje',
    MINE_ID: (id) => `/zadania/moje/${seg(id)}`,
    UNASSIGNED: '/zadania/nieprzydzielone',
    SCHEDULE: '/zadania/harmonogram-zadan',
    SUMMARY: '/zadania/zestawienie',
  },

  // NARZĘDZIA / QA
  TOOLS: {
    CHARTS: '/narzedzia/wykresy',
    APP_ISSUES: '/qa/problemy-app',
    GENERAL_ISSUES: '/qa/problemy',
  },

  // OPERACJE
  OPS: {
    ROOT: '/operacje',
    TO_REGISTER: '/operacje/zlecenia-do-zarejestrowania',
    AWAITING_DELIVERY: '/operacje/oczekiwanie-na-dostawe',
    SAMPLES_TO_INTAKE: '/operacje/probki-do-przyjecia',
    PB_TO_PREPARE: '/operacje/pb-do-przygotowania',
    TESTS_TO_RUN: '/operacje/badania-do-wykonania',
    LOGS_TO_PREPARE: '/operacje/logi-do-przygotowania',
    KB_TO_PREPARE: '/operacje/kb-do-przygotowania',
    REPORTS_TO_PREPARE: '/operacje/sprawozdania-do-przygotowania',
    DOCS_TO_ARCHIVE: '/operacje/dokumentacja-do-archiwizacji',
  },

  // DOKUMENTACJA
  DOCUMENTATION: {
    ROOT: '/dokumentacja',
    ORDERS: '/dokumentacja/zlecenia',
    ORDER_DETAILS: (id) => `/dokumentacja/zlecenia/${seg(id)}`,
    PPP_LIST: '/dokumentacja/ppp',
    PPP: (id) => `/dokumentacja/ppp/${seg(id)}`,
    PPP_INTAKE: (orderId) => `/dokumentacja/zlecenia/${seg(orderId)}/przyjecie-probek`,
    PB_LIST: '/dokumentacja/pb',
    PB: (id) => `/dokumentacja/pb/${seg(id)}`,
    OFFERS: '/dokumentacja/oferty', // lista
    OFFER: (id) => `/dokumentacja/oferty/${seg(id)}`,
    KB_LIST: '/dokumentacja/karty-badan',
    KB_NEW: '/dokumentacja/karty-badan/nowa',
    KB: (id) => `/dokumentacja/karty-badan/${seg(id)}`,
    CALC_CARDS: '/dokumentacja/karty-kalkulacyjne',
    CALC_CARD: (id) => `/dokumentacja/karty-kalkulacyjne/${seg(id)}`,
    LOGS: '/dokumentacja/logi',
    LOG: (id) => `/dokumentacja/logi/${seg(id)}`,
    OTHER_INFO: '/dokumentacja/inne-informacje',
    OTHER_INFO_ITEM: (id) => `/dokumentacja/inne-informacje/${seg(id)}`,
    REPORTS: '/dokumentacja/sprawozdania',
    REPORT: (id) => `/dokumentacja/sprawozdania/${seg(id)}`,
    ARCHIVE: '/dokumentacja/archiwizacja',
    ARCHIVE_ITEM: (id) => `/dokumentacja/archiwizacja/${seg(id)}`,
  },

  // BAZA WIEDZY
  KNOWLEDGE: '/baza-wiedzy',

  // DEV
  DEV: { PPP: '/dev/ppp' },
};

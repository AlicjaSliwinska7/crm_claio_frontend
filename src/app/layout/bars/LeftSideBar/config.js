// src/app/layout/bars/LeftSideBar/config.js

// Klucz do zapamiętywania ostatnio otwartej sekcji (sessionStorage)
export const STORAGE_KEY = 'leftSidebar.open'

// Główna konfiguracja menu
export const MENU = [
  {
    id: 'administracja',
    iconClass: 'fas fa-building',
    label: 'Administracja',
    base: '/administracja',
    items: [
      { to: '/administracja/harmonogram',   label: 'Harmonogram laboratorium' },
      { to: '/administracja/kontakty',      label: 'Lista kontaktowa' },
      { to: '/administracja/dokumenty',     label: 'Dokumenty' },
      { to: '/administracja/szkolenia',     label: 'Szkolenia' },
      { to: '/administracja/spotkania',     label: 'Spotkania' },
      { to: '/administracja/zamowienia',    label: 'Zamówienia' },
    ],
  },
  {
    id: 'sprzedaz',
    iconClass: 'fas fa-chart-line',
    label: 'Sprzedaż',
    base: '/sprzedaz',
    items: [
      { to: '/sprzedaz/klienci',        label: 'Klienci' },
      { to: '/sprzedaz/oferty',         label: 'Oferty' },
      { to: '/sprzedaz/rejestr-zlecen', label: 'Rejestr zleceń' },
      { to: '/sprzedaz/cennik',         label: 'Cennik' },
      { to: '/sprzedaz/zestawienia',    label: 'Zestawienia' },
    ],
  },
  {
    id: 'probki',
    iconClass: 'fas fa-vial',
    label: 'Próbki',
    base: '/probki',
    items: [
      { to: '/probki/rejestr-probek',   label: 'Rejestr próbek' },
      { to: '/probki/dostawa-i-odbior', label: 'Dostawa i odbiór' },
      { to: '/probki/utylizacja',       label: 'Utylizacja' },
      { to: '/probki/zestawienie',      label: 'Zestawienie' },
    ],
  },
  {
    id: 'badania',
    iconClass: 'fas fa-flask',
    label: 'Badania',
    base: '/badania',
    items: [
      { to: '/badania/rejestr-badan', label: 'Rejestr badań' },
      { to: '/badania/harmonogram',   label: 'Harmonogram badań' },
      { to: '/badania/zestawienie',   label: 'Zestawienie' },
    ],
  },
  {
    id: 'wyposazenie',
    iconClass: 'fas fa-tools',
    label: 'Wyposażenie',
    base: '/wyposazenie',
    items: [
      { to: '/wyposazenie/rejestr-wyposazenia',    label: 'Rejestr wyposażenia badawczego' },
      { to: '/wyposazenie/laboratoria-wzorcowania',label: 'Laboratoria wzorcowania' },
      { to: '/wyposazenie/harmonogram-wzorcowania',label: 'Harmonogram wzorcowania' },
      { to: '/wyposazenie/zestawienie',            label: 'Zestawienie' },
    ],
  },
  {
    id: 'dokumentacja',
    iconClass: 'fas fa-folder-open',
    label: 'Dokumentacja',
    base: '/dokumentacja',
    items: [
      { to: '/dokumentacja/oferty',             label: 'Oferty' },
      { to: '/dokumentacja/zlecenia',           label: 'Zlecenia' },
      { to: '/dokumentacja/karty-kalkulacyjne', label: 'Karty kalkulacyjne' },
      { to: '/dokumentacja/ppp',                label: 'Protokoły Przyjęcia Próbki' },
      { to: '/dokumentacja/pb',                 label: 'Programy Badań' },
      { to: '/dokumentacja/karty-badan',        label: 'Karty Badań' },
      { to: '/dokumentacja/logi',               label: 'Logi' },
      { to: '/dokumentacja/inne-informacje',    label: 'Inne informacje' },
      { to: '/dokumentacja/sprawozdania',       label: 'Sprawozdania z badań' },
      { to: '/dokumentacja/archiwizacja',       label: 'Archiwizacja' },
    ],
  },
  {
    id: 'metody-badawcze',
    iconClass: 'fas fa-book',
    label: 'Metody badawcze',
    base: '/metody-badawcze',
    items: [
      { to: '/metody-badawcze/spis', label: 'Spis metod' },
    ],
  },
  {
    id: 'operacje',
    iconClass: 'fa-solid fa-diagram-project',
    label: 'Operacje',
    base: '/operacje',
    items: [
      { to: '/operacje/zlecenia-do-zarejestrowania', label: 'Zlecenia do zarejestrowania' },
      { to: '/operacje/oczekiwanie-na-dostawe',      label: 'Oczekiwanie na dostawę' },
      { to: '/operacje/probki-do-przyjecia',         label: 'Próbki do przyjęcia' },
      { to: '/operacje/pb-do-przygotowania',         label: 'PB do przygotowania' },
      { to: '/operacje/badania-do-wykonania',        label: 'Badania do wykonania' },
      { to: '/operacje/logi-do-przygotowania',       label: 'Logi do przygotowania' },
      { to: '/operacje/kb-do-przygotowania',         label: 'KB do przygotowania' },
      { to: '/operacje/sprawozdania-do-przygotowania', label: 'Sprawozdania do przygotowania' },
      { to: '/operacje/dokumentacja-do-archiwizacji',  label: 'Dokumentacja do archiwizacji' },
    ],
  },
  {
    id: 'baza-wiedzy',
    iconClass: 'fa-solid fa-graduation-cap',
    label: 'Baza wiedzy',
    base: '/baza-wiedzy',
    items: [],
  },
]

// Przydatna mapa: baza → id sekcji (np. do szybkiego wykrywania aktywnego rodzica)
export const BASE_TO_ID = Object.fromEntries(MENU.map(s => [s.base, s.id]))

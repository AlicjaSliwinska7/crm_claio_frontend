// Konfiguracja elementów: proste linki i dropdowny.
// Badge'y (liczniki) podpinamy po id w warstwie kontenera.
export const MENU = [
  // proste linki
  { type: 'link', id: 'home',     to: '/',         iconClass: 'fas fa-home',            label: 'Strona główna' },
  { type: 'link', id: 'tablica',  to: '/tablica',  iconClass: 'fas fa-clipboard-list',  label: 'Tablica' },

  // dropdown: Wiadomości
  {
    type: 'dropdown',
    id: 'wiadomosci',
    iconClass: 'fas fa-envelope',
    label: 'Wiadomości',
    badgeKey: 'messages', // powiązanie z licznikiem
    items: [
      { kind: 'link',   to: '/wiadomosci', label: 'Skrzynka' },
      { kind: 'action', action: 'composeMessage', label: 'Nowa wiadomość' },
    ],
  },

  // dropdown: Powiadomienia
  {
    type: 'dropdown',
    id: 'powiadomienia',
    iconClass: 'fas fa-bell',
    label: 'Powiadomienia',
    badgeKey: 'notifications',
    items: [
      { kind: 'link', to: '/powiadomienia/wszystkie',   label: 'Lista powiadomień' },
      { kind: 'link', to: '/powiadomienia/nieprzeczytane', label: 'Nieprzeczytane' },
    ],
  },

  // dropdown: Ustawienia
  {
    type: 'dropdown',
    id: 'ustawienia',
    iconClass: 'fas fa-cog',
    label: 'Ustawienia',
    items: [
      { kind: 'link',   to: '/ustawienia/profil',  label: 'Profil' },
      { kind: 'link',   to: '/ustawienia/skroty',  label: 'Zarządzaj skrótami' },
      { kind: 'action', action: 'changePassword',  label: 'Zmień hasło' },
    ],
  },
]

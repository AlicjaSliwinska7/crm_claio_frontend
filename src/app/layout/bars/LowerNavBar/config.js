// Konfiguracja elementów: proste linki i dropdowny.
// Badge'y (liczniki) podpinamy po badgeKey w warstwie kontenera.

export const MENU = [
	/* ========================
	   Proste linki
	   ======================== */
	{
		type: 'link',
		id: 'home',
		to: '/',
		iconClass: 'fas fa-home',
		label: 'Strona główna',
	},
	{
		type: 'link',
		id: 'tablica',
		to: '/tablica',
		iconClass: 'fas fa-clipboard-list',
		label: 'Tablica',
	},

	/* ========================
	   Wiadomości — BEZ dropdownu
	   Klik w ikonę ma otwierać modal (MessagesModal).
	   ======================== */
	{
		type: 'link',
		id: 'messages',              // ✅ ważne: stabilny identyfikator
		to: '/wiadomosci',           // (opcjonalny fallback do pełnego widoku)
		iconClass: 'fas fa-envelope',
		label: 'Wiadomości',
		badgeKey: 'messages',        // ✅ licznik nieprzeczytanych
		// Możesz też dodać action dla czytelności, jeśli chcesz:
		// action: 'openInbox',
	},


	/* ========================
	   Dropdown: Powiadomienia
	   ======================== */
	{
		type: 'dropdown',
		id: 'powiadomienia',
		iconClass: 'fas fa-bell',
		label: 'Powiadomienia',
		badgeKey: 'notifications',
		items: [
			{
				kind: 'link',
				to: '/powiadomienia/wszystkie',
				label: 'Lista powiadomień',
				iconClass: 'fas fa-list',
			},
			{
				kind: 'link',
				to: '/powiadomienia/nieprzeczytane',
				label: 'Nieprzeczytane',
				iconClass: 'fas fa-envelope-open',
			},
		],
	},

	/* ========================
	   Dropdown: Ustawienia
	   ======================== */
	{
		type: 'dropdown',
		id: 'ustawienia',
		iconClass: 'fas fa-cog',
		label: 'Ustawienia',
		items: [
			{
				kind: 'link',
				to: '/ustawienia/profil',
				label: 'Profil',
				iconClass: 'fas fa-user',
			},
			{
				kind: 'link',
				to: '/ustawienia/skroty',
				label: 'Zarządzaj skrótami',
				iconClass: 'fas fa-keyboard',
			},
			{
				kind: 'action',
				action: 'changePassword',
				label: 'Zmień hasło',
				iconClass: 'fas fa-lock',
			},
		],
	},
]

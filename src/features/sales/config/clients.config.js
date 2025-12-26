// src/features/sales/config/clients.config.js
// ✅ Konfiguracja listy klientów (kolumny, CSV, dane startowe)

import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

export const HEADER_COLS = [
	{
		key: 'name',
		label: 'Nazwa firmy',
		sortable: true,
		...renderers.textRenderer('name'),
	},
	{
		key: 'address',
		label: 'Adres',
		sortable: false,
		...renderers.textRenderer('address'),
	},
	{
		key: 'NIP',
		label: 'NIP',
		sortable: true,
		align: 'center',
		...renderers.textRenderer('NIP'),
	},
	{
		key: 'contactPerson',
		label: 'Osoba kontaktowa',
		sortable: true,
		...renderers.textRenderer('contactPerson'),
	},
	{
		key: 'contactPhone',
		label: 'Telefon',
		sortable: true,
		align: 'center',
		...renderers.textRenderer('contactPhone'),
	},
	{
		key: 'contactEmail',
		label: 'E-mail',
		sortable: true,
		...renderers.emailRenderer('contactEmail'),
	},
]

export const CSV_COLUMNS = [
	{ key: 'name', label: 'Nazwa firmy' },
	{ key: 'address', label: 'Adres' },
	{ key: 'NIP', label: 'NIP' },
	{ key: 'contactPerson', label: 'Osoba kontaktowa' },
	{ key: 'contactPhone', label: 'Telefon' },
	{ key: 'contactEmail', label: 'E-mail' },
]

export const initialClients = [
	{
		id: 'c1',
		name: 'GreenEnergy SA',
		address: 'ul. Zielona 12, 00-100 Warszawa',
		NIP: '123-456-78-90',
		contactPerson: 'Anna Nowak',
		contactPhone: '+48 501 234 567',
		contactEmail: 'anna.nowak@greenenergy.pl',
	},
	{
		id: 'c2',
		name: 'AutoMax Sp. z o.o.',
		address: 'ul. Przemysłowa 5, 02-222 Katowice',
		NIP: '222-333-44-55',
		contactPerson: 'Piotr Kowalski',
		contactPhone: '+48 502 765 432',
		contactEmail: 'piotr.kowalski@automax.pl',
	},
]

// ────────────────────────────────────────────────
// Normalizery i pomocnicze utilsy
// ────────────────────────────────────────────────

export const normalizeOnLoad = arr => (Array.isArray(arr) ? arr.map(c => ({ ...c })) : [])

export const normalizeOnSave = draft => ({
	...draft,
	name: safeString(draft.name),
	address: safeString(draft.address),
	NIP: safeString(draft.NIP),
	contactPerson: safeString(draft.contactPerson),
	contactPhone: safeString(draft.contactPhone),
	contactEmail: safeString(draft.contactEmail),
})

export const labelForDelete = row => (row?.name ? `klienta ${row.name}` : 'klienta')

// ────────────────────────────────────────────────
// Pola wyszukiwania (dla useListQuery)
// ────────────────────────────────────────────────
export const getSearchFields = makeSearchFields(
	'name',
	'NIP',
	'address',
	'contactPerson',
	'contactPhone',
	'contactEmail'
)

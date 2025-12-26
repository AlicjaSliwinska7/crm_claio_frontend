// src/features/sales/config/offers.config.js
import { renderers } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

// ───────────────────────────────────────────────────────────
// Statusy
// ───────────────────────────────────────────────────────────
export const STATUS_DEFS = [
	{ key: 'wprzygotowaniu', label: 'W przygotowaniu' },
	{ key: 'wyslana', label: 'Wysłana' },
	{ key: 'przyjeta', label: 'Przyjęta' },
	{ key: 'odrzucona', label: 'Odrzucona' },
]

export const statusLabel = k => STATUS_DEFS.find(s => s.key === k)?.label || k

// defensywny wybór statusu z dozwolonej puli
const ALLOWED_STATUS = new Set(STATUS_DEFS.map(s => s.key))
const pickStatus = v => (ALLOWED_STATUS.has(v) ? v : 'wprzygotowaniu')

// ───────────────────────────────────────────────────────────
// Kolumny tabeli
// ───────────────────────────────────────────────────────────
export const HEADER_COLS = [
	{
		key: 'number',
		label: 'Nr oferty',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('number'),
	},
	{
		key: 'companyName',
		label: 'Firma',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('companyName'),
	},
	{
		key: 'contact',
		label: 'Osoba kontaktowa',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('contact'),
	},
	{
		key: 'validUntil',
		label: 'Ważność do',
		sortable: true,
		type: 'date',
		align: 'center',
		...renderers.textRenderer('validUntil'),
		titleAccessor: row => row?.validUntil ?? '',
	},
	{
		key: 'status',
		label: 'Status',
		sortable: true,
		type: 'string',
		...renderers.labelRenderer('status', statusLabel),
	},
	{
		key: 'amount',
		label: 'Kwota',
		sortable: true,
		type: 'number',
		align: 'right',
		...renderers.numberRenderer('amount'),
		titleAccessor: row => String(row?.amount ?? ''),
	},
	{
		key: 'subject',
		label: 'Przedmiot badań',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('subject'),
	},
	{
		key: 'sampleSize',
		label: 'Liczebność próbki',
		sortable: true,
		type: 'number',
		align: 'right',
		...renderers.numberRenderer('sampleSize'),
	},
	{
		key: 'testsBy',
		label: 'Badania wg',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('testsBy'),
	},
]

// ───────────────────────────────────────────────────────────
// CSV
// ───────────────────────────────────────────────────────────
export const CSV_COLUMNS = [
	{ key: 'number', label: 'Nr oferty' },
	{ key: 'companyName', label: 'Firma' },
	{ key: 'contact', label: 'Osoba kontaktowa' },
	{ key: 'validUntil', label: 'Ważność do' },
	{ key: 'status', label: 'Status' },
	{ key: 'amount', label: 'Kwota' },
	{ key: 'subject', label: 'Przedmiot badań' },
	{ key: 'sampleSize', label: 'Liczebność próbki' },
	{ key: 'testsBy', label: 'Badania wg' },
]

// ───────────────────────────────────────────────────────────
// Normalizacje
// ───────────────────────────────────────────────────────────
const s = v => safeString(v)

export const normalizeOnLoad = (arr = []) =>
	(Array.isArray(arr) ? arr : []).map(r => ({
		id: s(r.id || r.number || ''),
		number: s(r.number),
		companyName: s(r.companyName || r.company || ''),
		contact: s(r.contact || r.contactPerson || ''),
		validUntil: s(r.validUntil || r.valid_to || ''),
		status: pickStatus(s(r.status || 'wprzygotowaniu')),
		amount: Number.isFinite(+r.amount) ? +r.amount : '',
		subject: s(r.subject || r.item || ''),
		sampleSize: Number.isFinite(+r.sampleSize) ? +r.sampleSize : '',
		testsBy: s(r.testsBy || r.method || r.standard || ''),
	}))

export const normalizeOnSave = (obj = {}) => ({
	...obj,
	id: s(obj.id || obj.number || ''),
	number: s(obj.number),
	companyName: s(obj.companyName),
	contact: s(obj.contact),
	validUntil: s(obj.validUntil),
	status: pickStatus(s(obj.status || 'wprzygotowaniu')),
	amount: Number.isFinite(+obj.amount) ? +obj.amount : '',
	subject: s(obj.subject),
	sampleSize: Number.isFinite(+obj.sampleSize) ? +obj.sampleSize : '',
	testsBy: s(obj.testsBy),
})

export const labelForDelete = row => (row?.number ? `${row.number} — ${row.companyName || ''}`.trim() : row?.id || '')

// ───────────────────────────────────────────────────────────
// Demo
// ───────────────────────────────────────────────────────────
export const initialOffers = normalizeOnLoad([
	{
		id: 'OF-001',
		number: 'OF-001/2025',
		companyName: 'AutoMax SA',
		contact: 'Jan Kowalski',
		validUntil: '2025-12-31',
		status: 'wprzygotowaniu',
		amount: 12500,
		subject: 'Elementy stalowe – badania mechaniczne',
		sampleSize: 12,
		testsBy: 'PN-EN 10002-1',
	},
	{
		id: 'OF-002',
		number: 'OF-002/2025',
		companyName: 'GreenEnergy SA',
		contact: 'Anna Nowak',
		validUntil: '2025-11-30',
		status: 'wyslana',
		amount: 8600,
		subject: 'Tworzywa – palność',
		sampleSize: 8,
		testsBy: 'PN-EN ISO 11925-2',
	},
])

// ───────────────────────────────────────────────────────────
// Wyszukiwanie – zgodne z useListQuery(getSearchFields)
// ───────────────────────────────────────────────────────────
export const makeOfferSearchFields = (clients = []) => {
	const byId = new Map((Array.isArray(clients) ? clients : []).map(c => [s(c.id ?? c.name ?? ''), s(c.name ?? '')]))

	return row => {
		const companyFromId = row?.companyId ? byId.get(s(row.companyId)) : ''

		return [
			s(row?.number),
			s(row?.companyName || companyFromId),
			s(row?.contact),
			s(row?.validUntil),
			statusLabel(row?.status),
			s(row?.subject),
			s(row?.testsBy),
			s(row?.amount),
			s(row?.sampleSize),
		]
	}
}

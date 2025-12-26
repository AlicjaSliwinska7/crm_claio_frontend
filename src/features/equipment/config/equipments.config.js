// src/features/equipment/config/equipments.config.js
// SSOT: kolumny, statusy, CSV, normalizery, search dla rejestru sprzętu

import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

/* =========================================================
   Statusy sprzętu
   (klucze → klasy CSS: label-pill--status-<key>)
   ========================================================= */
export const STATUS_DEFS = [
	{ key: 'sprawny', label: 'Sprawny' },
	{ key: 'w_kalibracji', label: 'W kalibracji' },
	{ key: 'w_naprawie', label: 'W naprawie' },
	{ key: 'wycofany', label: 'Wycofany' },
]

export const statusLabel = k => STATUS_DEFS.find(s => s.key === k)?.label ?? k

export const STATUS_KEYS = STATUS_DEFS.map(s => s.key)

/* =========================================================
   Kolumny tabeli
   ========================================================= */
export const HEADER_COLS = [
	{
		key: 'name',
		label: 'Nazwa',
		sortable: true,
		type: 'string',
		minWidth: 160,
		...renderers.textRenderer('name'),
	},
	{
		key: 'code',
		label: 'Kod',
		sortable: true,
		type: 'string',
		width: 120,
		...renderers.textRenderer('code'),
	},
	{
		key: 'status',
		label: 'Status',
		sortable: true,
		type: 'string',
		width: 140,
		// generuje: label-pill label-pill--status label-pill--status-<key>
		...renderers.labelRenderer('status', statusLabel),
	},
	{
		key: 'location',
		label: 'Lokalizacja',
		sortable: true,
		type: 'string',
		width: 140,
		...renderers.textRenderer('location'),
	},
	{
		key: 'group',
		label: 'Grupa',
		sortable: true,
		type: 'string',
		width: 140,
		...renderers.textRenderer('group'),
	},
	{
		key: 'model',
		label: 'Model',
		sortable: true,
		type: 'string',
		minWidth: 140,
		...renderers.textRenderer('model'),
	},
	{
		key: 'producer',
		label: 'Producent',
		sortable: true,
		type: 'string',
		width: 140,
		...renderers.textRenderer('producer'),
	},
	{
		key: 'purchaseDate',
		label: 'Zakup',
		sortable: true,
		type: 'date',
		width: 120,
		align: 'center',
		...renderers.textRenderer('purchaseDate'),
	},
	{
		key: 'purchaseCost',
		label: 'Koszt',
		sortable: true,
		type: 'number',
		width: 120,
		align: 'right',
		...renderers.numberRenderer('purchaseCost'),
	},
]

/* =========================================================
   CSV
   ========================================================= */
export const CSV_COLUMNS = [
	{ key: 'name', label: 'Nazwa' },
	{ key: 'code', label: 'Kod' },
	{ key: 'status', label: 'Status' },
	{ key: 'location', label: 'Lokalizacja' },
	{ key: 'group', label: 'Grupa' },
	{ key: 'model', label: 'Model' },
	{ key: 'producer', label: 'Producent' },
	{ key: 'purchaseDate', label: 'Zakup' },
	{ key: 'purchaseCost', label: 'Koszt' },
]

/* =========================================================
   Search
   ========================================================= */
export const getSearchFields = makeSearchFields('name', 'code', 'status', 'location', 'group', 'model', 'producer')

/* =========================================================
   Normalizacja
   ========================================================= */
const s = v => safeString(v)

export const normalizeOnLoad = (arr = []) =>
	(Array.isArray(arr) ? arr : []).map(r => ({
		id: s(r.id || r.code || r.name),
		name: s(r.name),
		code: s(r.code),
		status: STATUS_KEYS.includes(r.status) ? r.status : 'sprawny',
		location: s(r.location),
		group: s(r.group),
		model: s(r.model),
		producer: s(r.producer),
		purchaseDate: s(r.purchaseDate),
		purchaseCost: Number.isFinite(+r.purchaseCost) ? +r.purchaseCost : '',
	}))

export const normalizeOnSave = (obj = {}) => ({
	...obj,
	id: s(obj.id || obj.code || obj.name),
	status: STATUS_KEYS.includes(obj.status) ? obj.status : 'sprawny',
})

export const labelForDelete = row => row?.name || row?.code || row?.id || ''

/* =========================================================
   Dane startowe
   ========================================================= */
export const initialEquipment = normalizeOnLoad([
	{
		id: 'EQ-001',
		name: 'Waga analityczna',
		code: 'WG-10',
		status: 'sprawny',
		location: 'Lab 1',
		group: 'Pomiary',
		model: 'Radwag XA 10',
		producer: 'Radwag',
		purchaseDate: '2024-10-04',
		purchaseCost: 16900,
	},
	{
		id: 'EQ-002',
		name: 'Termometr A',
		code: 'TH-A',
		status: 'w_kalibracji',
		location: 'Lab 2',
		group: 'Pomiary',
		model: 'Fluke 1524',
		producer: 'Fluke',
		purchaseDate: '2024-01-20',
		purchaseCost: 8100,
	},
])

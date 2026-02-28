// src/features/equipment/config/equipments.config.js
// SSOT: kolumny, statusy, CSV, normalizery, search dla rejestru sprzętu

import React from 'react'
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

export const STATUS_KEYS = STATUS_DEFS.map(s => s.key)
export const statusLabel = k => STATUS_DEFS.find(s => s.key === k)?.label ?? String(k ?? '')

/* =========================================================
   Lokalny helper do klas pill (zgodne z statuses.css)
   ========================================================= */
const pillKey = v =>
	String(v ?? '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '_')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')

const statusPillRenderer = (fieldKey = 'status') => ({
	render: (value, row) => {
		const raw = row?.[fieldKey] ?? value
		const key = pillKey(raw)
		const label = statusLabel(raw)
		return <span className={`label-pill label-pill--status label-pill--status-${key}`}>{label}</span>
	},
	titleAccessor: row => statusLabel(row?.[fieldKey]),
	// accessor do sortowania: trzymaj klucz statusu
	accessor: row => String(row?.[fieldKey] ?? ''),
})

/* =========================================================
   Kolumny tabeli
   ========================================================= */
export const HEADER_COLS = [
	{
		key: 'name',
		label: 'Nazwa',
		sortable: true,
		type: 'string',
		minWidth: 180,
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
		width: 160,
		...statusPillRenderer('status'),
	},
	{
		key: 'location',
		label: 'Lokalizacja',
		sortable: true,
		type: 'string',
		width: 160,
		...renderers.textRenderer('location'),
	},
	{
		key: 'group',
		label: 'Grupa',
		sortable: true,
		type: 'string',
		width: 160,
		...renderers.textRenderer('group'),
	},
	{
		key: 'model',
		label: 'Model',
		sortable: true,
		type: 'string',
		minWidth: 160,
		...renderers.textRenderer('model'),
	},
	{
		key: 'producer',
		label: 'Producent',
		sortable: true,
		type: 'string',
		width: 160,
		...renderers.textRenderer('producer'),
	},

	// ✅ DataCell sformatuje ISO (YYYY-MM-DD) dla type: 'date'
	{
		key: 'purchaseDate',
		label: 'Zakup',
		sortable: true,
		type: 'date',
		width: 120,
		align: 'center',
		titleAccessor: row => String(row?.purchaseDate ?? ''),
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
	(Array.isArray(arr) ? arr : []).map(r => {
		const rawStatus = s(r.status)
		return {
			id: s(r.id || r.code || r.name),
			name: s(r.name),
			code: s(r.code),
			status: STATUS_KEYS.includes(rawStatus) ? rawStatus : 'sprawny',
			location: s(r.location),
			group: s(r.group),
			model: s(r.model),
			producer: s(r.producer),
			purchaseDate: s(r.purchaseDate),
			purchaseCost: Number.isFinite(+r.purchaseCost) ? +r.purchaseCost : '',
		}
	})

export const normalizeOnSave = (obj = {}) => {
	const rawStatus = s(obj.status)
	const cost = obj.purchaseCost
	return {
		...obj,
		id: s(obj.id || obj.code || obj.name),
		name: s(obj.name),
		code: s(obj.code),
		status: STATUS_KEYS.includes(rawStatus) ? rawStatus : 'sprawny',
		location: s(obj.location),
		group: s(obj.group),
		model: s(obj.model),
		producer: s(obj.producer),
		purchaseDate: s(obj.purchaseDate),
		purchaseCost: Number.isFinite(+cost) ? +cost : cost === '' ? '' : Number.isFinite(+String(cost).replace(',', '.')) ? +String(cost).replace(',', '.') : '',
	}
}

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

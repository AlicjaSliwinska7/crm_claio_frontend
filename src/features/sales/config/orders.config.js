// src/features/sales/config/orders.config.js
// SSOT dla Rejestru Zleceń: kolumny, CSV, etapy, dane startowe, normalizacje

import React from 'react'
import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

const s = v => safeString(v)

/* ───────────────────────────────────────────────────────────
 * Normalizacja kluczy na klasy CSS (zgodna z statuses.css)
 * - małe litery
 * - usunięte ogonki
 * - spacje → '-'
 * - usunięte inne znaki
 * ─────────────────────────────────────────────────────────── */

const normalizeKeyForClass = value =>
	String(value ?? '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // usuń ogonki
		.replace(/\s+/g, '-') // spacje → '-'
		.replace(/[^a-z0-9-]/g, '') // wywal resztę

/* ───────────────────────────────────────────────────────────
 * Lokalne renderery pilli dla stage / status
 * ─────────────────────────────────────────────────────────── */

const pillRenderer = (kind, labelFn) => ({
	render: (_cell, row) => {
		const raw = row?.[kind]
		const norm = normalizeKeyForClass(raw)
		const type = kind === 'stage' ? 'stage' : 'status'

		const classes = ['label-pill', `label-pill--${type}`]
		if (norm) classes.push(`label-pill--${type}-${norm}`)

		const text = labelFn ? labelFn(raw) : raw

		return <span className={classes.join(' ')}>{text}</span>
	},
})

/* ───────────────────────────────────────────────────────────
 * Etapy procesu (zgodnie z workflow)
 * Oferta → Zlecenie → Badania → Raport → Wysyłka → Rozliczenie
 * ─────────────────────────────────────────────────────────── */

export const STAGE_DEFS = [
	{ key: 'Rejestracja', label: 'Rejestracja' },
	{ key: 'Przyjęcie próbki', label: 'Przyjęcie próbki' },
	{ key: 'W trakcie badań', label: 'W trakcie badań' },
	{ key: 'Raport', label: 'Raport' },
	{ key: 'Wysyłka', label: 'Wysyłka' },
	{ key: 'Rozliczenie', label: 'Rozliczenie' },
]

// to pole jest używane w OrdersRegister do selecta filtra
export const STAGES = STAGE_DEFS.map(s => s.label)

export const stageLabel = k => STAGE_DEFS.find(s => s.key === k || s.label === k)?.label || k

/* ───────────────────────────────────────────────────────────
 * Statusy zleceń (prosta słownikowa mapa)
 * ─────────────────────────────────────────────────────────── */

export const STATUS_DEFS = [
	{ key: 'zarejestrowane', label: 'Zarejestrowane' },
	{ key: 'w toku', label: 'W toku' },
	{ key: 'sprawozdanie', label: 'Sprawozdanie' },
]

export const statusLabel = k => STATUS_DEFS.find(s => s.key === k || s.label === k)?.label || k

/* ───────────────────────────────────────────────────────────
 * Kolumny tabeli (spójne z innymi listami)
 * ─────────────────────────────────────────────────────────── */

export const HEADER_COLS = [
	{
		key: 'number',
		label: 'Nr zlecenia',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('number'),
	},
	{
		key: 'client',
		label: 'Klient',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('client'),
	},
	{
		key: 'date',
		label: 'Data',
		sortable: true,
		type: 'date',
		align: 'center',
		...renderers.textRenderer('date'),
		titleAccessor: row => row?.date ?? '',
	},

	// ⬇ tu wjeżdża badge dla etapu – nasz własny pillRenderer
	{
		key: 'stage',
		label: 'Etap',
		sortable: true,
		type: 'string',
		...pillRenderer('stage', stageLabel),
	},

	// ⬇ tu badge dla statusu – też pillRenderer
	{
		key: 'status',
		label: 'Status',
		sortable: true,
		type: 'string',
		...pillRenderer('status', statusLabel),
	},

	{
		key: 'subject',
		label: 'Przedmiot',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('subject'),
	},
]

/* ───────────────────────────────────────────────────────────
 * CSV
 * ─────────────────────────────────────────────────────────── */

export const CSV_COLUMNS = [
	{ key: 'number', header: 'Nr zlecenia' },
	{ key: 'client', header: 'Klient' },
	{ key: 'date', header: 'Data' },
	{ key: 'stage', header: 'Etap' },
	{ key: 'status', header: 'Status' },
	{ key: 'subject', header: 'Przedmiot' },
]

/* ───────────────────────────────────────────────────────────
 * Normalizacje
 * ─────────────────────────────────────────────────────────── */

export const normalizeOnLoad = (arr = []) =>
	(Array.isArray(arr) ? arr : []).map(r => ({
		id: s(r.id || r.number || ''),
		number: s(r.number),
		client: s(r.client || r.clientName || ''),
		date: s(r.date),
		stage: s(r.stage),
		status: s(r.status),
		subject: s(r.subject || r.item || ''),
	}))

export const normalizeOnSave = (obj = {}) => ({
	...obj,
	id: s(obj.id || obj.number || ''),
	number: s(obj.number),
	client: s(obj.client),
	date: s(obj.date),
	stage: s(obj.stage),
	status: s(obj.status),
	subject: s(obj.subject),
})

/* ───────────────────────────────────────────────────────────
 * Demo / dane startowe
 * ─────────────────────────────────────────────────────────── */

export const initialOrders = normalizeOnLoad([
	{
		id: 'Z-2025-001',
		number: 'Z-2025-001',
		client: 'AutoMax SA',
		date: '2025-10-02',
		stage: 'Przyjęcie próbki',
		status: 'zarejestrowane',
		subject: 'Elementy stalowe – badania mechaniczne',
	},
	{
		id: 'Z-2025-002',
		number: 'Z-2025-002',
		client: 'GreenEnergy SA',
		date: '2025-10-05',
		stage: 'W trakcie badań',
		status: 'w toku',
		subject: 'Tworzywa – palność',
	},
	{
		id: 'Z-2025-003',
		number: 'Z-2025-003',
		client: 'TechPlast Sp. z o.o.',
		date: '2025-10-12',
		stage: 'Raport',
		status: 'sprawozdanie',
		subject: 'Kompozyty – wytrzymałość na zginanie',
	},
])

/* ───────────────────────────────────────────────────────────
 * Pola wyszukiwania (dla useListQuery)
 * ─────────────────────────────────────────────────────────── */

export const getSearchFields = makeSearchFields('number', 'client', 'date', 'stage', 'status', 'subject')

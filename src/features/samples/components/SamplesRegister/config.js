// Stałe, kolumny tabeli i mapy typów do sortowania (SSOT)
import React from 'react'
import { Link } from 'react-router-dom'

export const PAGE_SIZE = 50

export const SAMPLE_STATUSES = ['w trakcie badań', 'po badaniach', 'po badaniach/czekają na zwrot']

export const statusBadgeClass = s =>
	`status-badge status-${String(s || '')
		.toLowerCase()
		.replaceAll(' ', '-')
		.replaceAll('/', '-')}`

export const HEADER_COLS = [
	{ key: 'receivedDate', label: 'Data przyjęcia próbki', sortable: true, type: 'date' },
	{
		key: 'orderNo',
		label: 'Nr zlecenia / umowy',
		sortable: true,
		type: 'string',
		render: r =>
			r.orderNo ? <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}>{r.orderNo}</Link> : '—',
	},
	{
		key: 'code',
		label: 'KOD',
		sortable: true,
		type: 'string',
		render: r =>
			r.code ? <Link to={`/probki/rejestr-probek?code=${encodeURIComponent(r.code)}`}>{r.code}</Link> : '—',
	},
	{
		key: 'sampleNo',
		label: 'Nr próbki',
		sortable: true,
		type: 'string',
		render: r =>
			r.id ? (
				<Link to={`/probki/rejestr-probek/${encodeURIComponent(r.id)}`}>{r.sampleNo || r.id}</Link>
			) : (
				r.sampleNo || '—'
			),
	},
	{
		key: 'item',
		label: 'Przedmiot badań/wyrób',
		sortable: true,
		type: 'string',
		render: r => <span title={r.item}>{r.item || '—'}</span>,
	},
	{ key: 'qty', label: 'Ilość sztuk', sortable: true, type: 'number' },
	{
		key: 'client',
		label: 'Zleceniodawca',
		sortable: true,
		type: 'string',
		render: r => (r.client ? <Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`}>{r.client}</Link> : '—'),
	},
	{
		key: 'scope',
		label: 'Zakres badań',
		sortable: true,
		type: 'string',
		render: r =>
			r.scope ? (
				<Link to={`/metody-badawcze/spis?q=${encodeURIComponent(r.scope)}`} title={r.scope}>
					{r.scope}
				</Link>
			) : (
				'—'
			),
	},
	{ key: 'afterTest', label: 'Po badaniu (zwrot/likwidacja)', sortable: true, type: 'string' },
	{
		key: 'notes',
		label: 'Uwagi',
		sortable: false,
		type: 'string',
		render: r => <span title={r.notes}>{r.notes || '—'}</span>,
	},
	{
		key: 'status',
		label: 'Status',
		sortable: true,
		type: 'string',
		render: r => <span className={statusBadgeClass(r.status || '')}>{r.status || '—'}</span>,
	},
	{ key: 'returnDate', label: 'Data zwrotu próbek do Zleceniodawcy', sortable: true, type: 'date' },
	{
		key: 'comment',
		label: 'Komentarz',
		sortable: false,
		type: 'string',
		render: r => <span title={r.comment}>{r.comment || '—'}</span>,
	},
]

// Map typów pod sortowanie — wyliczone raz
export const TYPE_MAP = HEADER_COLS.reduce((acc, c) => {
	if (c.sortable) acc[c.key] = { type: c.type || 'string' }
	return acc
}, {})

// Kolumny eksportu CSV
export const CSV_COLUMNS = [
	{ key: 'id', label: 'ID' },
	{ key: 'receivedDate', label: 'Data przyjęcia próbki' },
	{ key: 'orderNo', label: 'Nr zlecenia/umowy' },
	{ key: 'code', label: 'KOD' },
	{ key: 'sampleNo', label: 'Nr próbki' },
	{ key: 'item', label: 'Przedmiot badań/wyrób' },
	{ key: 'qty', label: 'Ilość sztuk' },
	{ key: 'client', label: 'Zleceniodawca' },
	{ key: 'scope', label: 'Zakres badań' },
	{ key: 'afterTest', label: 'Po badaniu (zwrot/likwidacja)' },
	{ key: 'notes', label: 'Uwagi' },
	{ key: 'status', label: 'Status' },
	{ key: 'returnDate', label: 'Data zwrotu próbek' },
	{ key: 'comment', label: 'Komentarz' },
]

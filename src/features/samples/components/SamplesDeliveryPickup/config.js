import React from 'react'
import { Link } from 'react-router-dom'

export const VIEW_PRE = 'przed-dostawa'
export const VIEW_PICKUP = 'do-odbioru'
export const VIEW_ARCH_DELIVERED = 'arch-dostarczone'
export const VIEW_ARCH_PICKEDUP = 'arch-odebrane'

export const COLS_PRE = [
	{
		key: 'orderNo',
		label: 'Nr zlecenia',
		sortable: true,
		type: 'string',
		render: r =>
			r.orderNo ? <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}>{r.orderNo}</Link> : '—',
	},
	{
		key: 'client',
		label: 'Klient',
		sortable: true,
		type: 'string',
		render: r => (r.client ? <Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`}>{r.client}</Link> : '—'),
	},
	{
		key: 'contact',
		label: 'Osoba kontaktowa',
		sortable: false,
		render: r => (
			<div style={{ display: 'grid' }}>
				<span>{r.contactName}</span>
				<span>{r.contactPhone}</span>
				<a href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
			</div>
		),
	},
	{
		key: 'item',
		label: 'Przedmiot badań',
		sortable: true,
		type: 'string',
		render: r => <span title={r.item}>{r.item || '—'}</span>,
	},
	{ key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
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
	{ key: 'etaDelivery', label: 'Przewidywana data dostawy', sortable: true, type: 'date' },
	// delivered – checkbox renderowany w Table via renderControl
	{ key: 'comment', label: 'Uwagi', sortable: false, render: r => <span title={r.comment}>{r.comment || '—'}</span> },
]

export const COLS_PICKUP = [
	{
		key: 'sampleNo',
		label: 'Nr próbki',
		sortable: true,
		type: 'string',
		render: r =>
			r.sampleNo ? (
				<Link to={`/probki/rejestr-probek?sample=${encodeURIComponent(r.sampleNo)}`}>{r.sampleNo}</Link>
			) : (
				'—'
			),
	},
	{
		key: 'orderNo',
		label: 'Nr zlecenia',
		sortable: true,
		type: 'string',
		render: r =>
			r.orderNo ? <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}>{r.orderNo}</Link> : '—',
	},
	{
		key: 'client',
		label: 'Klient',
		sortable: true,
		type: 'string',
		render: r => (r.client ? <Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`}>{r.client}</Link> : '—'),
	},
	{
		key: 'contact',
		label: 'Osoba kontaktowa',
		sortable: false,
		render: r => (
			<div style={{ display: 'grid' }}>
				<span>{r.contactName}</span>
				<span>{r.contactPhone}</span>
				<a href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
			</div>
		),
	},
	{
		key: 'item',
		label: 'Przedmiot badań',
		sortable: true,
		type: 'string',
		render: r => <span title={r.item}>{r.item || '—'}</span>,
	},
	{ key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
	{
		key: 'deliveryParams',
		label: 'Parametry dostawy',
		sortable: false,
		render: r => <span title={r.deliveryParams}>{r.deliveryParams || '—'}</span>,
	},
	{ key: 'etaPickup', label: 'Przewidywana data odbioru', sortable: true, type: 'date' },
	// pickedUp – checkbox renderowany w Table via renderControl
]

export const COLS_ARCH_DELIVERED = [
	{
		key: 'orderNo',
		label: 'Nr zlecenia',
		sortable: true,
		type: 'string',
		render: r =>
			r.orderNo ? <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}>{r.orderNo}</Link> : '—',
	},
	{
		key: 'client',
		label: 'Klient',
		sortable: true,
		type: 'string',
		render: r => (r.client ? <Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`}>{r.client}</Link> : '—'),
	},
	{
		key: 'contact',
		label: 'Osoba kontaktowa',
		sortable: false,
		render: r => (
			<div style={{ display: 'grid' }}>
				<span>{r.contactName}</span>
				<span>{r.contactPhone}</span>
				<a href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
			</div>
		),
	},
	{
		key: 'item',
		label: 'Przedmiot badań',
		sortable: true,
		type: 'string',
		render: r => <span title={r.item}>{r.item || '—'}</span>,
	},
	{ key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
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
	// deliveredAt – edytor daty renderowany w Table via renderEditor
	// delivered (checkbox restore) renderowany w Table via renderControl
	{ key: 'comment', label: 'Uwagi', sortable: false, render: r => <span title={r.comment}>{r.comment || '—'}</span> },
]

export const COLS_ARCH_PICKEDUP = [
	{
		key: 'sampleNo',
		label: 'Nr próbki',
		sortable: true,
		type: 'string',
		render: r =>
			r.sampleNo ? (
				<Link to={`/probki/rejestr-probek?sample=${encodeURIComponent(r.sampleNo)}`}>{r.sampleNo}</Link>
			) : (
				'—'
			),
	},
	{
		key: 'orderNo',
		label: 'Nr zlecenia',
		sortable: true,
		type: 'string',
		render: r =>
			r.orderNo ? <Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}>{r.orderNo}</Link> : '—',
	},
	{
		key: 'client',
		label: 'Klient',
		sortable: true,
		type: 'string',
		render: r => (r.client ? <Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`}>{r.client}</Link> : '—'),
	},
	{
		key: 'contact',
		label: 'Osoba kontaktowa',
		sortable: false,
		render: r => (
			<div style={{ display: 'grid' }}>
				<span>{r.contactName}</span>
				<span>{r.contactPhone}</span>
				<a href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
			</div>
		),
	},
	{
		key: 'item',
		label: 'Przedmiot badań',
		sortable: true,
		type: 'string',
		render: r => <span title={r.item}>{r.item || '—'}</span>,
	},
	{ key: 'qty', label: 'Ilość próbek', sortable: true, type: 'number' },
	{
		key: 'deliveryParams',
		label: 'Parametry dostawy',
		sortable: false,
		render: r => <span title={r.deliveryParams}>{r.deliveryParams || '—'}</span>,
	},
	// pickedUpAt – edytor daty renderowany w Table via renderEditor
	// pickedUp (checkbox restore) renderowany w Table via renderControl
]

export const colsForView = view => {
	switch (view) {
		case 'przed-dostawa':
			return COLS_PRE
		case 'do-odbioru':
			return COLS_PICKUP
		case 'arch-dostarczone':
			return COLS_ARCH_DELIVERED
		case 'arch-odebrane':
			return COLS_ARCH_PICKEDUP
		default:
			return []
	}
}

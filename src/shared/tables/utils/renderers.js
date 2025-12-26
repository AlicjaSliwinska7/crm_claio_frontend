// src/shared/tables/utils/renderers.js
// 💎 Spójny zestaw wielokrotnego użytku rendererów kolumn tabel

import React from 'react'

/** ————————————————————————————————
 *  Pomocnicze utilsy
 *  ———————————————————————————————— */
const safe = v => (v == null ? '' : String(v))

const ensureHttp = url => {
	const s = String(url || '').trim()
	if (!s) return ''
	return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

/** Pobiera wartość z wiersza — dopuszcza klucz ('name') lub funkcję (row => row.name). */
const valueOf = (row, keyOrFn, passedVal) =>
	typeof keyOrFn === 'function' ? keyOrFn(row) : passedVal ?? row?.[keyOrFn]

/** ————————————————————————————————
 *  Renderery podstawowe
 *  ———————————————————————————————— */

/** Tekst (bezpieczny fallback: '—') */
export const textRenderer = keyOrFn => ({
	render: (val, row) => {
		const v = valueOf(row, keyOrFn, val)
		return v != null && v !== '' ? String(v) : '—'
	},
	titleAccessor: row => {
		const v = valueOf(row, keyOrFn)
		return v != null ? String(v) : ''
	},
})

/** Liczba (bezpieczny fallback) */
export const numberRenderer = keyOrFn => ({
	render: (val, row) => {
		const v = valueOf(row, keyOrFn, val)
		const n = Number.isFinite(+v) ? +v : null
		return n == null ? '—' : n
	},
	titleAccessor: row => {
		const v = valueOf(row, keyOrFn)
		return Number.isFinite(+v) ? String(+v) : ''
	},
	accessor: row => {
		const v = valueOf(row, keyOrFn)
		return Number.isFinite(+v) ? +v : -Infinity
	},
})

/** Mapowanie wartości na etykietę (np. status, kategoria) */
export const labelRenderer = (keyOrFn, toLabel) => ({
	render: (val, row) => {
		const v = valueOf(row, keyOrFn, val)
		const label = toLabel ? toLabel(v, row) : v
		return label != null && label !== '' ? String(label) : '—'
	},
	titleAccessor: row => {
		const v = valueOf(row, keyOrFn)
		const label = toLabel ? toLabel(v, row) : v
		return label != null ? String(label) : ''
	},
})

/** Link — akceptuje klucz lub funkcję, bez kolizji z window.link */
export const linkRenderer = (keyOrFn, { labelAccessor, blank = true } = {}) => ({
	render: (val, row) => {
		const hrefRaw = valueOf(row, keyOrFn, val)
		if (!hrefRaw) return '—'
		const safeHref = ensureHttp(hrefRaw)
		const label = labelAccessor ? labelAccessor(safeHref, row) : safeHref
		return (
			<a
				href={safeHref}
				target={blank ? '_blank' : undefined}
				rel={blank ? 'noopener noreferrer' : undefined}
				title={safeHref}>
				{label}
			</a>
		)
	},
	titleAccessor: row => {
		const href = valueOf(row, keyOrFn)
		return href || ''
	},
})

/** E-mail jako mailto link */
export const emailRenderer = (keyOrFn = 'email') => ({
	render: (val, row) => {
		const email = valueOf(row, keyOrFn, val)?.trim?.()
		return email ? <a href={`mailto:${email}`}>{email}</a> : '—'
	},
	titleAccessor: row => {
		const email = valueOf(row, keyOrFn)
		return email || ''
	},
})

/** „Budynek / Pokój” */
export const buildingRoomRenderer = ({ buildingKey = 'building', roomKey = 'room', separator = ' / ' } = {}) => ({
	render: (_val, row) => `${safe(row?.[buildingKey])}${separator}${safe(row?.[roomKey])}`,
	titleAccessor: row => `${safe(row?.[buildingKey])}${separator}${safe(row?.[roomKey])}`,
	accessor: row => `${safe(row?.[buildingKey])}|${safe(row?.[roomKey])}`,
})

/** Łączenie tablic (np. uczestników) */
export const arrayJoinRenderer = (keyOrFn, sep = '; ') => ({
	render: (val, row) => {
		const v = valueOf(row, keyOrFn, val)
		return Array.isArray(v) ? v.join(sep) : safe(v)
	},
	titleAccessor: row => {
		const v = valueOf(row, keyOrFn)
		return Array.isArray(v) ? v.join(sep) : safe(v)
	},
})

/** ————————————————————————————————
 *  Dodatkowe, pod logistyki / formularze
 *  ———————————————————————————————— */

/** Tekst z title (do długich pól) */
export const textWithTitleRenderer = keyOrFn => ({
	render: (val, row) => {
		const v = valueOf(row, keyOrFn, val)
		const s = v != null && v !== '' ? String(v) : '—'
		return <span title={s}>{s}</span>
	},
	titleAccessor: row => {
		const v = valueOf(row, keyOrFn)
		return v != null ? String(v) : ''
	},
})

/** Mała siatka kontaktowa: imię/nazwisko + tel + mail */
export const contactGridRenderer =
	({ nameKey = 'contactName', phoneKey = 'contactPhone', emailKey = 'contactEmail' } = {}) =>
	(_val, row) =>
		(
			<div style={{ display: 'grid' }}>
				<span>{row?.[nameKey] || '—'}</span>
				<span>{row?.[phoneKey] || '—'}</span>
				{row?.[emailKey] ? <a href={`mailto:${row[emailKey]}`}>{row[emailKey]}</a> : <span>—</span>}
			</div>
		)

/** Edytowalny input date w tabeli */
export const dateInputRenderer =
	({ valueKey, title = 'Data', onChange } = {}) =>
	(_val, row) =>
		<input type='date' value={row?.[valueKey] || ''} onChange={e => onChange?.(row, e.target.value)} title={title} />

/** ————————————————————————————————
 *  Eksport zbiorczy
 *  ———————————————————————————————— */
const renderers = {
	textRenderer,
	numberRenderer,
	labelRenderer,
	linkRenderer,
	emailRenderer,
	buildingRoomRenderer,
	arrayJoinRenderer,
	// nowe:
	textWithTitleRenderer,
	contactGridRenderer,
	dateInputRenderer,
}

export default renderers
export { renderers }

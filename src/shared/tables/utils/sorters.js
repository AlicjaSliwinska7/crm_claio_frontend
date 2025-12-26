// src/shared/tables/utils/sorters.js

// Kierunek: 'asc' | 'desc'
export const nextDirection = d => (d === 'asc' ? 'desc' : 'asc')

// ==================== Collator cache (PL, natural) ====================
const collatorCache = new Map()
function getCollator(locale = 'pl', opts = { sensitivity: 'base', numeric: true }) {
	// bardziej ogólny klucz – jeśli kiedyś dołożysz inne opcje
	const key = `${locale}|${JSON.stringify(opts)}`
	if (!collatorCache.has(key)) collatorCache.set(key, new Intl.Collator(locale, opts))
	return collatorCache.get(key)
}

// ==================== Heurystyki typów + konwersje ====================
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/

const isNumericLike = v =>
	typeof v === 'number' || (typeof v === 'string' && /^[+-]?\s*\d+(?:[.,]\d+)?$/.test(v.trim()))

const toNumber = v => {
	if (typeof v === 'number') return v
	if (typeof v !== 'string') return NaN
	const s = v.trim().replace(/\s+/g, '').replace(',', '.')
	const n = Number(s)
	return Number.isFinite(n) ? n : NaN
}

const isDateLike = v => {
	if (v instanceof Date) return !isNaN(v.valueOf())
	if (typeof v === 'string') {
		if (ISO_DATE_RE.test(v)) return true
		const t = Date.parse(v)
		return Number.isFinite(t)
	}
	return false
}

const toTime = v => {
	if (v instanceof Date) return v.valueOf()
	if (typeof v === 'string') {
		const t = Date.parse(v)
		return Number.isFinite(t) ? t : NaN
	}
	return NaN
}

// Nulls first/last handling
const nullRank = (v, mode = 'last') => {
	const isNullish = v == null || v === ''
	if (!isNullish) return 1
	return mode === 'first' ? -1 : 2
}

// ==================== Główne porównanie jednej wartości ====================
function compareValues(a, b, { type = 'auto', locale = 'pl', nulls = 'last', collatorOptions } = {}) {
	const ra = nullRank(a, nulls)
	const rb = nullRank(b, nulls)
	if (ra !== rb) return ra - rb

	// liczby
	if (type === 'number' || (type === 'auto' && isNumericLike(a) && isNumericLike(b))) {
		const na = toNumber(a)
		const nb = toNumber(b)
		const aBad = Number.isNaN(na)
		const bBad = Number.isNaN(nb)
		if (aBad && bBad) return 0
		if (aBad) return 1
		if (bBad) return -1
		return na - nb
	}

	// daty
	if (type === 'date' || (type === 'auto' && isDateLike(a) && isDateLike(b))) {
		// optymalizacja: czyste ISO można porównać leksykograficznie
		if (typeof a === 'string' && typeof b === 'string' && ISO_DATE_RE.test(a) && ISO_DATE_RE.test(b)) {
			return a.localeCompare(b)
		}
		const ta = toTime(a)
		const tb = toTime(b)
		const aBad = Number.isNaN(ta)
		const bBad = Number.isNaN(tb)
		if (aBad && bBad) return 0
		if (aBad) return 1
		if (bBad) return -1
		return ta - tb
	}

	// fallback: tekst (PL, natural)
	const collator = getCollator(locale, collatorOptions ?? { sensitivity: 'base', numeric: true })
	return collator.compare(String(a ?? ''), String(b ?? ''))
}

/**
 * Sortowanie stabilne po kluczu lub accessorze.
 */
export function sortRows(rows, sortConfig, optionsPerKey = {}, globalOptions = {}) {
	if (!Array.isArray(rows)) return rows || []
	const { key, direction = 'asc' } = sortConfig || {}
	if (!key) return rows

	const opts = {
		type: 'auto',
		locale: 'pl',
		nulls: 'last',
		...globalOptions,
		...(optionsPerKey[key] || {}),
	}
	const dir = direction === 'desc' ? -1 : 1
	const acc = opts.accessor || (r => r?.[key])

	// Schwartzian transform dla stabilności
	const mapped = rows.map((row, idx) => ({ row, idx, val: acc(row) }))
	mapped.sort((a, b) => {
		const base = compareValues(a.val, b.val, opts)
		if (base !== 0) return dir * base
		const aTie = a.row?.id ?? a.idx
		const bTie = b.row?.id ?? b.idx
		return compareValues(aTie, bTie, { type: 'auto', locale: opts.locale, nulls: 'last' })
	})
	return mapped.map(m => m.row)
}

// Prosty wskaźnik strzałki w nagłówku tabeli
export function sortIndicator(sortConfig, key, opts = {}) {
	const { asc = '▲', desc = '▼', idle = '' } = opts
	if (!sortConfig || sortConfig.key !== key) return idle
	return sortConfig.direction === 'asc' ? asc : desc
}

// Wartość aria-sort dla dostępności
export function sortAria(sortConfig, key) {
	if (!sortConfig || sortConfig.key !== key) return 'none'
	return sortConfig.direction === 'asc' ? 'ascending' : 'descending'
}

// ==================== Helper: accessor do daty+godziny ====================
export function buildDateTimeAccessor(dateKey = 'date', timeKey = 'time') {
	return row => {
		const d = row?.[dateKey] ?? ''
		const t = row?.[timeKey] ?? ''
		if (!d) return ''
		return t ? `${String(d)}T${String(t)}` : String(d)
	}
}

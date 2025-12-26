// src/shared/utils/date.js

/** Przekształca wejście na instancję Date lub zwraca `null`. */
export const toDate = d => {
	if (!d && d !== 0) return null
	if (d instanceof Date) return isNaN(d.getTime()) ? null : d
	const date = new Date(d)
	return isNaN(date.getTime()) ? null : date
}

/** Zwraca datę w formacie dd.mm.rrrr (locale pl-PL) lub "—". */
export const fmtDate = d => {
	const dt = toDate(d)
	return dt ? dt.toLocaleDateString('pl-PL') : '—'
}

/** Zwraca datę+czas (24h) w locale pl-PL lub "—". */
export const fmtDateTime = d => {
	const dt = toDate(d)
	return dt ? dt.toLocaleString('pl-PL', { hour12: false }) : '—'
}

/** Format daty z opcjami (domyślnie 2-cyfrowy dzień/miesiąc). */
export const formatDate = (d, opts = { year: 'numeric', month: '2-digit', day: '2-digit' }, locale = 'pl-PL') => {
	const dt = toDate(d)
	return dt ? new Intl.DateTimeFormat(locale, opts).format(dt) : '—'
}

/** Próbuje sparsować datę; zwraca Date lub null. */
export const parseMaybeDate = v => toDate(v)

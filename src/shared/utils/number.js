// src/shared/utils/number.js

/**
 * Zamienia tekst na liczbę (obsługuje przecinek jako separator dziesiętny).
 * Zwraca `null` dla pustych wartości lub gdy nie da się sparsować.
 */
export const toNumber = v => {
	if (v === '' || v == null) return null
	const t = String(v).replace(/\s| /g, '').replace(',', '.') // usuń spacje + nbsp
	const n = Number(t)
	return Number.isFinite(n) ? n : null
}

/** Jak `toNumber`, ale zwraca `undefined` zamiast `null` (wygodne przy patch-ach). */
export const toNumberMaybe = v => {
	const n = toNumber(v)
	return n == null ? undefined : n
}

/** Format kwoty w walucie (domyślnie PLN, locale pl-PL). */
export const formatMoney = (v, currency = 'PLN', { minimumFractionDigits, maximumFractionDigits } = {}) => {
	if (v == null || !Number.isFinite(Number(v))) return '—'
	const opts = {
		style: 'currency',
		currency,
		...(minimumFractionDigits != null ? { minimumFractionDigits } : {}),
		...(maximumFractionDigits != null ? { maximumFractionDigits } : {}),
	}
	return new Intl.NumberFormat('pl-PL', opts).format(Number(v))
}

/** Format procentu (0.1 → 10%) z kontrolą liczby miejsc po przecinku. */
export const formatPercent = (v, { digits = 0 } = {}) =>
	v == null || !Number.isFinite(Number(v))
		? '—'
		: new Intl.NumberFormat('pl-PL', {
				style: 'percent',
				minimumFractionDigits: digits,
				maximumFractionDigits: digits,
		  }).format(Number(v))

/**
 * Parsuje procent z tekstu: "12,5%" → 0.125, "12.5" → 0.125, "0.125" → 0.125.
 * Jeśli występuje znak %, dzielimy przez 100. Zwraca `null` przy błędzie.
 */
export const parsePercent = txt => {
	const raw = String(txt ?? '').trim()
	if (!raw) return null
	const hasPct = /%/.test(raw)
	const clean = raw.replace('%', '').replace(/\s/g, '').replace(',', '.')
	const n = Number(clean)
	if (!Number.isFinite(n)) return null
	return hasPct ? n / 100 : n
}

import { useMemo } from 'react'

/** Czysta funkcja – można używać poza Reactem (np. w helperach/testach) */
export function makeChartTheme(seed = [], { mode = 'light', gridOpacity = 0.35 } = {}) {
	const base = seed.length
		? seed
		: ['#4f46e5', '#16a34a', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#0ea5e9', '#14b8a6', '#eab308', '#f97316']

	// Lekki „tweak” pod dark
	const grid =
		mode === 'dark'
			? { strokeDasharray: '3 3', strokeOpacity: Math.min(0.55, gridOpacity + 0.15) }
			: { strokeDasharray: '3 3', strokeOpacity: gridOpacity }

	return {
		mode,
		palette: base,
		grid,
	}
}

/** Hook – wygodne memoizowanie + parametryzacja */
export function useChartTheme({ seed = [], mode = 'light', gridOpacity = 0.35 } = {}) {
	// Uwaga: jeśli seed jest tworzone inline (np. [..] w JSX), uzależnijcie od seedKey
	const seedKey = Array.isArray(seed) ? seed.join('|') : 'none'
	return useMemo(() => makeChartTheme(seed, { mode, gridOpacity }), [seedKey, mode, gridOpacity])
}

/* ===== Formatery i drobne utilsy ===== */
export const intPL = new Intl.NumberFormat('pl-PL')
export const plnPL = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	maximumFractionDigits: 0,
})
export const fmtInt = n => intPL.format(Number(n || 0))
export const fmtDateYMD = t => {
	const d = new Date(t)
	if (!Number.isFinite(d.getTime())) return ''
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const dd = String(d.getDate()).padStart(2, '0')
	return `${d.getFullYear()}-${mm}-${dd}`
}

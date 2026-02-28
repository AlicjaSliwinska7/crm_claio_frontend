import { useMemo } from 'react'
// ───────────────────────────── Liczby / formatery bazowe ─────────────────────────────
const INT = new Intl.NumberFormat('pl-PL')
export const fmtInt = n => INT.format(Number(n || 0))

// ───────────────────────────── Wymiary / marginesy ─────────────────────────────
export const CHART = {
  height: 300,
  margin: { top: 8, right: 20, bottom: 68, left: 80 },
  bar: { categoryGap: 18, gap: 8 },
}

// ───────────────────────────── Grid / legenda ─────────────────────────────
export const gridProps = { strokeDasharray: '3 3', vertical: false, strokeOpacity: 0.4 }
export const legendProps = { verticalAlign: 'bottom', align: 'center' }
export const centeredLegend = { left: 0, right: 0, width: '100%', margin: '0 auto', textAlign: 'center' }

// ───────────────────────────── Tytuły osi ─────────────────────────────
export const AXIS_TITLE_SIZE = 14
export const AXIS_TITLE_WEIGHT = 600 // <— pogrubienie tytułów
const TITLE_COLOR = 'var(--es-slate, #334155)' // fallback na wypadek braku CSS variable

// X — wyśrodkowany, z regulowanym odsunięciem w dół
export function AxisTitleX({ viewBox = {}, value, dy = 50, color = TITLE_COLOR }) {
  const { x = 0, y = 0, width = 0 } = viewBox
  const cx = x + width / 2
  const cy = y + dy
  return (
    <text
      x={cx}
      y={cy}
      textAnchor='middle'
      fill={color}
      fontSize={AXIS_TITLE_SIZE}
      fontWeight={AXIS_TITLE_WEIGHT}
      pointerEvents='none'
    >
      {value}
    </text>
  )
}


// Y (left) — wyśrodkowany na osi, po lewej
export function AxisTitleYLeft({ viewBox = {}, value, dx = -18, color = TITLE_COLOR }) {
  const { x = 0, y = 0, height = 0 } = viewBox
  const cx = x + dx
  const cy = y + height / 2
  return (
    <text
      x={cx}
      y={cy}
      textAnchor='middle'
      fill={color}
      fontSize={AXIS_TITLE_SIZE}
      fontWeight={AXIS_TITLE_WEIGHT}
      transform={`rotate(-90, ${cx}, ${cy})`}
      pointerEvents='none'
    >
      {value}
    </text>
  )
}

// Y (right) — wyśrodkowany na osi, po prawej (obrót w „dobrą” stronę)
export function AxisTitleYRight({ viewBox = {}, value, dx = 18, color = TITLE_COLOR }) {
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox
  const cx = x + width + dx
  const cy = y + height / 2
  return (
    <text
      x={cx}
      y={cy}
      textAnchor='middle'
      fill={color}
      fontSize={AXIS_TITLE_SIZE}
      fontWeight={AXIS_TITLE_WEIGHT}
      transform={`rotate(90, ${cx}, ${cy})`}
      pointerEvents='none'
    >
      {value}
    </text>
  )
}

// Zachowujemy kompatybilny alias (lewa oś Y)
export const AxisTitleY = AxisTitleYLeft

// ───────────────────────────── Tick formatery ─────────────────────────────
export const yTickNumber = v => fmtInt(v)
export const yTickPercent = v => `${fmtInt(v)}%`

// ───────────────────────────── Miesiące PL / pomocnicze ─────────────────────────────
const MONTHS_PL = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
]

// Ładna etykieta miesiąca z różnych typów wejścia
export const monthLabelFromAny = value => {
  if (typeof value === 'string' && /^\d{4}-\d{1,2}$/.test(value)) {
    const [y, m] = value.split('-').map(Number)
    return `${MONTHS_PL[(m - 1 + 12) % 12]} ${y}`
  }
  const d = new Date(value)
  return Number.isFinite(d.getTime()) ? `${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}` : String(value ?? '')
}

// Klucz miesiąca 'YYYY-MM' (przydatny do agregacji)
export const monthKey = input => {
  const d = input instanceof Date ? input : new Date(input)
  if (!Number.isFinite(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ───────────────────────────── Formatter daty YYYY-MM-DD ─────────────────────────────
// Wariant „offsetowy” (np. dla Gantta: v = offset, domainMin = epoch startu)
export const dateTickYmd =
  (domainMin = 0) =>
  v => {
    const d = new Date(domainMin + Number(v))
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }


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

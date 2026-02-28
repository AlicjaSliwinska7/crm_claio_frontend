import { startOfDay, format } from 'date-fns'
import { pl } from 'date-fns/locale'

export const today = () => startOfDay(new Date())
export const iso = (d) => format(d, 'yyyy-MM-dd')

export const toMid = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export const dFromStr = (s) => {
  if (!s) return null
  const [y, m, dd] = String(s).split('-').map(Number)
  if (!y) return null
  return new Date(y, (m || 1) - 1, (dd || 1), 0, 0, 0, 0)
}

/**
 * fmt(d, pattern?)
 * - kompatybilne z date-fns/format
 * - domyślnie yyyy-MM-dd
 * - locale: pl
 */
export const fmt = (d, pattern = 'yyyy-MM-dd') => {
  if (!d) return ''
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  try {
    return format(x, pattern, { locale: pl })
  } catch {
    // fallback
    return format(x, 'yyyy-MM-dd')
  }
}

export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const diffDays = (a, b) => Math.round((toMid(b) - toMid(a)) / 86400000)
export const isWeekend = (d) => [0, 6].includes(new Date(d).getDay())

export const startOfWeekMon = (d) => {
  const x = toMid(d)
  const delta = (x.getDay() + 6) % 7
  return addDays(x, -delta)
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)))
export const monthName = (d) => d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
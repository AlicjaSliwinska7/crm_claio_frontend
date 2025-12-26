// src/features/reporting/hooks/useCompareConfig.js
import { useCallback } from 'react'
import {
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  parseISO, format, setMonth,
} from 'date-fns'
import { pl } from 'date-fns/locale'

/** ---------- CORE (czyste funkcje) ---------- */
function rangeFromConfigCore(type, y, q, mISO, cFrom, cTo) {
  if (type === 'year') {
    const f = startOfYear(parseISO(`${y}-01-01`))
    const t = endOfYear(f)
    return { from: f, to: t, label: `${y}` }
  }
  if (type === 'quarter') {
    const base = parseISO(`${y}-01-01`)
    const qStart = setMonth(base, (q - 1) * 3)
    const f = startOfQuarter(qStart)
    const t = endOfQuarter(qStart)
    return { from: f, to: t, label: `Q${q} ${y}` }
  }
  if (type === 'month') {
    const m = parseISO(`${mISO}-01`)
    return { from: startOfMonth(m), to: endOfMonth(m), label: format(m, 'LLLL yyyy', { locale: pl }) }
  }
  // custom
  const f = startOfMonth(cFrom)
  const t = endOfMonth(cTo)
  return { from: f, to: t, label: `${format(cFrom, 'dd.MM.yyyy')}–${format(cTo, 'dd.MM.yyyy')}` }
}

function prevRangeCore(from, to) {
  // zakres o tej samej długości tuż przed (liczony w pełnych miesiącach, inkluzywnie)
  const f0 = startOfMonth(from)
  const t0 = endOfMonth(to)

  let mCount = 0
  const it = new Date(f0)
  while (it <= t0) { mCount += 1; it.setMonth(it.getMonth() + 1) }

  const fPrev = startOfMonth(new Date(f0.getFullYear(), f0.getMonth() - mCount, 1))
  const tPrev = endOfMonth(new Date(t0.getFullYear(), t0.getMonth() - mCount, 1))
  return { from: fPrev, to: tPrev, label: 'Poprzedni okres' }
}

/** ---------- Named exports (kompatybilne z Twoją wersją) ---------- */
export function rangeFromConfig(type, year, quarter, monthISO, customFrom, customTo) {
  return rangeFromConfigCore(type, year, quarter, monthISO, customFrom, customTo)
}
export function prevRange(from, to) {
  return prevRangeCore(from, to)
}

/** ---------- Domyślny hook ---------- */
export default function useCompareConfig() {
  const rangeFromConfig = useCallback(
    (type, y, q, mISO, cFrom, cTo) => rangeFromConfigCore(type, y, q, mISO, cFrom, cTo),
    []
  )
  const prevRange = useCallback(
    (from, to) => prevRangeCore(from, to),
    []
  )
  return { rangeFromConfig, prevRange }
}

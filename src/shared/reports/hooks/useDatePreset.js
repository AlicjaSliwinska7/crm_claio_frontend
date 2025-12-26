import { useMemo } from 'react'

const toLocalISO = d =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

export function useDatePreset(preset, from, to) {
  return useMemo(() => {
    if (preset === 'custom') return { from: from || '', to: to || '' }
    if (preset === 'all')    return { from: '', to: '' }
    const today = new Date()
    const toISO = toLocalISO(today)
    const start = new Date(today)
    if (preset === 'week')  start.setDate(today.getDate() - 6)
    if (preset === 'month') start.setDate(today.getDate() - 30)
    if (preset === 'year')  start.setDate(today.getDate() - 365)
    return { from: toLocalISO(start), to: toISO }
  }, [preset, from, to])
}

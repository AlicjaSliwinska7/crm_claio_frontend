// src/features/board/components/Board/boardLayout.utils.js
import { format, parseISO, isSameDay } from 'date-fns'

export function parseDayLocal(dayStr) {
  if (!dayStr) return null
  const d = new Date(`${dayStr}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function safeFormatDateTime(iso, pattern = 'dd.MM.yyyy HH:mm') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return format(d, pattern)
}

export function isInDateList(day, list = []) {
  if (!Array.isArray(list) || !list.length) return false

  return list.some((item) => {
    if (!item) return false
    if (item instanceof Date) return isSameDay(item, day)

    const s = String(item)

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = parseDayLocal(s)
      return d ? isSameDay(d, day) : false
    }

    try {
      const d = parseISO(s)
      return isSameDay(d, day)
    } catch {
      return false
    }
  })
}
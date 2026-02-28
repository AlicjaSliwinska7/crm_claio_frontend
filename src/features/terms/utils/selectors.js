import { useMemo } from 'react'
import { startOfDay } from 'date-fns'
import { SLOT_META } from './constants'
import { iso, today } from './dates'

export function useTasksByDaySlot(days, listTasks) {
  return useMemo(() => {
    const map = new Map()
    for (const d of days) {
      const dk = iso(d)
      for (const s of SLOT_META) map.set(`${dk}:${s.key}`, [])
    }
    for (const t of listTasks) {
      if (t.dateISO && t.slot) {
        const key = `${t.dateISO}:${t.slot}`
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(t)
      }
    }
    return map
  }, [days, listTasks])
}

export function useDayDeadlineFlags(days, tasksByDaySlot) {
  return useMemo(() => {
    const map = new Map()
    for (const d of days) {
      const dk = iso(d)
      const all = SLOT_META.flatMap((s) => tasksByDaySlot.get(`${dk}:${s.key}`) || [])
      const hasTodayDeadline = all.some((t) => t.deadline && iso(new Date(t.deadline)) === dk)
      const hasOverdue = all.some((t) => t.deadline && startOfDay(new Date(t.deadline)) < today())
      map.set(dk, { hasTodayDeadline, hasOverdue })
    }
    return map
  }, [days, tasksByDaySlot])
}
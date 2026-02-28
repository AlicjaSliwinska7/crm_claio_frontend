import { useState, useCallback } from 'react'
import { addDays } from 'date-fns'
import { iso, today } from './dateUtils'

const normalizeTask = (t) => ({
  ...t,
  dateISO: t.dateISO ?? null,
  slot: t.slot ?? null,
  type: t.type ?? 'other',
  status: t.status ?? 'assigned',
  difficulty: t.difficulty ?? 'medium',
  deadline: t.deadline ?? iso(addDays(today(), 7)),
  priority: t.priority ?? 'normal',
  _createdAt: t._createdAt ?? Date.now(),
})

export function useTasksState(initialTasks) {
  const [listTasks, setListTasks] = useState(() => (initialTasks || []).map(normalizeTask))

  const setTaskDateAndSlot = useCallback((id, dateISOValue, slotValue) => {
    setListTasks((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? { ...t, dateISO: dateISOValue, slot: slotValue } : t))
    )
  }, [])

  const removeTaskPlacement = useCallback((id) => setTaskDateAndSlot(id, null, null), [setTaskDateAndSlot])

  return { listTasks, setListTasks, setTaskDateAndSlot, removeTaskPlacement }
}
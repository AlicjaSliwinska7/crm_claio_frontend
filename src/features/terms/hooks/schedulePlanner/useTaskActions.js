import { useCallback } from 'react'
import { startOfDay, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { fmt } from '../../utils/dates'

export function useTaskActions({ listTasks, setTaskDateAndSlot, setListTasks, modalApi }) {
  const assignWithDeadlineCheck = useCallback(
    async (id, dateISOValue, slotValue) => {
      const t = listTasks.find((x) => String(x.id) === String(id))
      if (!t) return

      if (dateISOValue && t.deadline) {
        const tgt = startOfDay(parseISO(dateISOValue))
        const dl = startOfDay(parseISO(t.deadline))
        if (tgt > dl) {
          const ok = await modalApi?.confirm?.({
            tone: 'warn',
            title: 'Plan po deadlinie',
            message:
              `Zadanie „${t.title}” ma deadline ${fmt(dl, 'dd LLL', pl)}.\n` +
              `Zaplanować na później (${fmt(tgt, 'dd LLL', pl)})?`,
            confirmText: 'Zaplanuj',
            cancelText: 'Anuluj',
          })
          if (!ok) return
        }
      }
      setTaskDateAndSlot(id, dateISOValue, slotValue)
    },
    [listTasks, modalApi, setTaskDateAndSlot]
  )

  const moveGroupTo = useCallback(
    async (src, dest) => {
      const toMove = listTasks.filter(
        (t) => t.dateISO === src.dayISO && t.slot === src.slotKey && (t.type || 'other') === src.type
      )

      const tgt = dest.dateISO ? startOfDay(parseISO(dest.dateISO)) : null
      let after = 0
      if (tgt) after = toMove.filter((t) => t.deadline && tgt > startOfDay(parseISO(t.deadline))).length

      if (after > 0) {
        const ok = await modalApi?.confirm?.({
          tone: 'warn',
          title: 'Uwaga na deadline',
          message: `Przeniesienie grupy „${src.type}” spowoduje zaplanowanie ${after} zadań PO ich deadlinie. Kontynuować?`,
          confirmText: 'Przenieś',
          cancelText: 'Anuluj',
        })
        if (!ok) return
      }

      setListTasks((prev) =>
        prev.map((t) => {
          const match = t.dateISO === src.dayISO && t.slot === src.slotKey && (t.type || 'other') === src.type
          return match ? { ...t, dateISO: dest.dateISO, slot: dest.slotKey } : t
        })
      )
    },
    [listTasks, modalApi, setListTasks]
  )

  return { assignWithDeadlineCheck, moveGroupTo }
}
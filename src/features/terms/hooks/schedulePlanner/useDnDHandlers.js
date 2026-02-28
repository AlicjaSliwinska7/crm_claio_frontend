import { useCallback, useState } from 'react'
import { startOfDay } from 'date-fns'
import { getDataId, getGroupDrag } from '../../utils/dndEncoding'
import { iso, today } from '../../utils/dates'

export function useDnDHandlers({ setTaskDateAndSlot, assignWithDeadlineCheck, moveGroupTo }) {
  const [dragKey, setDragKey] = useState(null)

  const allow = useCallback((e, key) => {
    e.preventDefault()
    e.stopPropagation()
    if (key) setDragKey(key)
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  }, [])

  const dropTo = useCallback(
    (handler) => (e) => {
      e.preventDefault()
      e.stopPropagation()
      handler(e)
      setDragKey(null)
    },
    []
  )

  const isPastDay = useCallback((d) => startOfDay(d) < today(), [])

  const onDropBacklog = useCallback(
    (e) => {
      const group = getGroupDrag(e)
      if (group) {
        moveGroupTo(group, { dateISO: null, slotKey: null })
        return
      }
      const id = getDataId(e, null)
      if (id) setTaskDateAndSlot(id, null, null)
    },
    [moveGroupTo, setTaskDateAndSlot]
  )

  const onDropSlot = useCallback(
    (e, day, slotKey) => {
      if (isPastDay(day)) return
      const group = getGroupDrag(e)
      if (group) {
        moveGroupTo(group, { dateISO: iso(day), slotKey })
        return
      }
      const id = getDataId(e, null)
      if (id) assignWithDeadlineCheck(id, iso(day), slotKey)
    },
    [assignWithDeadlineCheck, isPastDay, moveGroupTo]
  )

  return { dragKey, setDragKey, allow, dropTo, isPastDay, onDropBacklog, onDropSlot }
}
import { useMemo, useRef, useState, useCallback } from 'react'
import { addDays, startOfDay, startOfWeek, parseISO } from 'date-fns'
import { today } from '../../utils/dates'

export function usePlannerRange(initialDate) {
  const baseDay = useMemo(() => startOfDay(initialDate || new Date()), [initialDate])

  const [start, setStart] = useState(() => startOfWeek(baseDay, { weekStartsOn: 1 }))
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start])

  const [selectedDay, setSelectedDay] = useState(() => baseDay)
  const selectDay = useCallback((d) => setSelectedDay(startOfDay(d)), [])

  const goPrevDay = useCallback(() => setStart((s) => addDays(s, -1)), [])
  const goNextDay = useCallback(() => setStart((s) => addDays(s, +1)), [])
  const goPrevWeek = useCallback(() => setStart((s) => addDays(s, -7)), [])
  const goNextWeek = useCallback(() => setStart((s) => addDays(s, +7)), [])
  const goToday = useCallback(() => setStart(startOfWeek(today(), { weekStartsOn: 1 })), [])

  const hiddenDateInput = useRef(null)
  const jumpToDate = () => hiddenDateInput.current?.showPicker?.()
  const onPickDate = (e) => {
    try {
      const d = startOfWeek(startOfDay(parseISO(e.target.value)), { weekStartsOn: 1 })
      setStart(d)
    } catch {}
  }

  return {
    baseDay,
    start,
    setStart,
    days,

    selectedDay,
    setSelectedDay,
    selectDay,

    hiddenDateInput,
    jumpToDate,
    onPickDate,

    goPrevDay,
    goNextDay,
    goPrevWeek,
    goNextWeek,
    goToday,
  }
}
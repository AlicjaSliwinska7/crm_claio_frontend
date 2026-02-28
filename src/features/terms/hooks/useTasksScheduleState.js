import { useEffect, useMemo, useState, useCallback } from 'react'
import { fmt, startOfWeekMon, addDays, dFromStr, clamp } from '../utils/dates'
import { STATUS_ORDER } from '../utils/constants'
import { uniq } from '../utils/dates'

export function useTasksScheduleState({ today, base, employees }) {
  // toolbar
  const [q, setQ] = useState('')
  const [empF, setEmpF] = useState('wszyscy')

  const [rangeMode, setRangeMode] = useState('ten_tydzien')
  const [gotoDate, setGotoDate] = useState(fmt(today))

  const [from, setFrom] = useState(fmt(startOfWeekMon(today)))
  const [visibleDays, setVisibleDays] = useState(7)

  // legenda (quick filters)
  const [typeQuick, setTypeQuick] = useState('wszystkie')
  const [statusQuick, setStatusQuick] = useState(new Set(STATUS_ORDER))
  const [diffSet, setDiffSet] = useState(new Set([1, 2, 3]))
  const [prioSet, setPrioSet] = useState(new Set([1, 2, 3]))

  const kindsInBase = useMemo(() => uniq(base.map((t) => t.kind || 'zadanie')), [base])
  const [kindSet, setKindSet] = useState(new Set(kindsInBase))

  // synchronizacja rangeMode
  useEffect(() => {
    if (rangeMode === 'custom') return

    if (rangeMode === 'ten_tydzien') {
      setFrom(fmt(startOfWeekMon(today)))
      setVisibleDays(7)
    } else if (rangeMode === 'nastepny_tydzien') {
      setFrom(fmt(addDays(startOfWeekMon(today), 7)))
      setVisibleDays(7)
    } else if (rangeMode === 'goto') {
      const b = dFromStr(gotoDate) || today
      setFrom(fmt(startOfWeekMon(b)))
      setVisibleDays(7)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeMode, gotoDate])

  const shiftWindowBy = useCallback((deltaDays) => {
    setFrom((prev) => {
      const baseD = dFromStr(prev) || today
      return fmt(addDays(baseD, deltaDays))
    })
    setRangeMode('custom')
  }, [today])

  const zoomBy = useCallback((delta) => {
    setVisibleDays((v) => clamp(v + delta, 3, 30))
    setRangeMode('custom')
  }, [])

  const gotoTodayWeek = useCallback(() => setRangeMode('ten_tydzien'), [])

  const clearAllFilters = useCallback((kindsFallback = kindsInBase) => {
    setQ('')
    setEmpF('wszyscy')
    setTypeQuick('wszystkie')
    setStatusQuick(new Set(STATUS_ORDER))
    setDiffSet(new Set([1, 2, 3]))
    setPrioSet(new Set([1, 2, 3]))
    setKindSet(new Set(kindsFallback))
  }, [kindsInBase])

  return {
    q, setQ,
    empF, setEmpF,

    rangeMode, setRangeMode,
    gotoDate, setGotoDate,

    from, setFrom,
    visibleDays, setVisibleDays,

    typeQuick, setTypeQuick,
    statusQuick, setStatusQuick,
    diffSet, setDiffSet,
    prioSet, setPrioSet,
    kindSet, setKindSet,

    shiftWindowBy,
    zoomBy,
    gotoTodayWeek,
    clearAllFilters,
  }
}
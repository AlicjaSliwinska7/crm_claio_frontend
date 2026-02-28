// src/shared/schedules/hooks/useMonthScheduleCore.js
import { useMemo, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isWeekend,
  isSameDay,
  parseISO,
} from 'date-fns'

/**
 * Domyślne PL święta (statyczne) – tu masz wersję jak u Ciebie (2025).
 * Jeśli chcesz, można to później podmienić na generator “ruchomych” świąt.
 */
const DEFAULT_PL_HOLIDAYS_ISO = [
  '2025-01-01','2025-01-06','2025-04-20','2025-04-21','2025-05-01','2025-05-03',
  '2025-06-08','2025-06-19','2025-08-15','2025-11-01','2025-11-11','2025-12-25','2025-12-26',
]

const DEFAULT_PL_HOLIDAYS = DEFAULT_PL_HOLIDAYS_ISO.map((d) => parseISO(d))

/**
 * Core dla “miesięcznego grafiku” (LabSchedule/CleaningSchedule):
 * - miesiąc + dni
 * - święta weekend+statyczne+custom
 * - schedule: { [name]: { [dateKey]: value } }
 * - walidowany handleChange
 * - summary per employee (tylko dla dni z bieżącego miesiąca)
 */
export default function useMonthScheduleCore({
  employees = [],
  allowedValues = [''], // np. ['', '1','2','3','u','l'] albo ['', 'a','b','c','d']
  summaryKeys = [],     // np. ['1','2','3','u','l'] albo ['a','b','c','d']
  normalizeValue = (v) => v, // np. stripDiacritics dla cleaning
  staticHolidays = DEFAULT_PL_HOLIDAYS, // tablica Date
} = {}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedule, setSchedule] = useState({})
  const [customHolidays, setCustomHolidays] = useState([]) // ['yyyy-MM-dd', ...]

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      }),
    [currentDate]
  )

  const allowedSet = useMemo(() => {
    const set = new Set()
    for (const v of allowedValues) set.add(String(v))
    return set
  }, [allowedValues])

  const summaryKeySet = useMemo(() => {
    const set = new Set()
    for (const k of summaryKeys) set.add(String(k))
    return set
  }, [summaryKeys])

  const monthDateKeySet = useMemo(() => {
    const set = new Set()
    for (const d of daysInMonth) set.add(format(d, 'yyyy-MM-dd'))
    return set
  }, [daysInMonth])

  const isHoliday = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return (
      isWeekend(day) ||
      staticHolidays.some((d) => isSameDay(d, day)) ||
      customHolidays.includes(dateStr)
    )
  }

  const toggleCustomHoliday = (dateStr) => {
    setCustomHolidays((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    )
  }

  const handleChange = (name, dateKey, value) => {
    const raw = (value ?? '').toString()
    const norm = normalizeValue(raw).toString().trim().toLowerCase()

    // zawsze akceptujemy '' oraz allowedValues (po normalizacji)
    if (!(norm === '' || allowedSet.has(norm))) return

    setSchedule((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [dateKey]: norm,
      },
    }))
  }

  const getSummaryForEmployee = (name) => {
    const base = {}
    for (const k of summaryKeys) base[k] = 0

    const entries = Object.entries(schedule[name] || {})
    for (const [dateKey, vRaw] of entries) {
      if (!monthDateKeySet.has(dateKey)) continue
      const v = (vRaw ?? '').toString().trim().toLowerCase()
      if (summaryKeySet.has(v)) base[v] = (base[v] || 0) + 1
    }
    return base
  }

  const goPrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const goNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))

  return {
    state: {
      currentDate,
      schedule,
      customHolidays,
    },
    setSchedule,
    setCustomHolidays,
    daysInMonth,
    employees,
    isHoliday,
    toggleCustomHoliday,
    handleChange,
    getSummaryForEmployee,
    goPrevMonth,
    goNextMonth,
  }
}
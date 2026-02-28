// src/features/administration/hooks/useCleaningScheduleLogic.js
import { useState } from 'react'
import useMonthScheduleCore from '../../../shared/schedules/hooks/useMonthScheduleCore'
import useGridSelection from '../../../shared/schedules/hooks/useGridSelection'

const EMPLOYEES = [
  'Anna Nowak',
  'Piotr Kowalski',
  'Maria Zielińska',
  'Tomasz Wójcik',
  'Ewa Dąbrowska',
  'Paweł Lewandowski',
  'Karolina Mazur',
  'Jan Kaczmarek',
  'Aleksandra Szymańska',
]

// "ą" -> "a" + ogólnie strip diakrytyków
const stripDiacritics = (s) =>
  (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function useCleaningScheduleLogic() {
  const core = useMonthScheduleCore({
    employees: EMPLOYEES,
    allowedValues: ['', 'a', 'b', 'c', 'd'],
    summaryKeys: ['a', 'b', 'c', 'd'],
    normalizeValue: stripDiacritics,
  })

  const {
    state: { currentDate, schedule, customHolidays },
    daysInMonth,
    isHoliday,
    toggleCustomHoliday,
    handleChange,
    getSummaryForEmployee,
    goPrevMonth,
    goNextMonth,
  } = core

  const [showFullScreen, setShowFullScreen] = useState(false)

  // WSPÓLNA selekcja
  const selection = useGridSelection({ employees: EMPLOYEES, daysInMonth })

  const {
    state: { selectedRange, activeCell, selectedSummaryEmployee },
    handleCellClick,
    isInSelectionRange,
    setSelectedSummaryEmployee,
  } = selection

  return {
    state: {
      currentDate,
      schedule,
      customHolidays,
      showFullScreen,

      // selection
      selectedRange,
      activeCell,
      selectedSummaryEmployee,
    },
    daysInMonth,
    employees: EMPLOYEES,
    isHoliday,
    setShowFullScreen,
    goPrevMonth,
    goNextMonth,
    toggleCustomHoliday,
    handleChange,
    handleCellClick,
    getSummaryForEmployee,
    isInSelectionRange,
    setSelectedSummaryEmployee,
  }
}
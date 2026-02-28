// src/features/administration/hooks/useLabScheduleLogic.js
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

export default function useLabScheduleLogic() {
  const core = useMonthScheduleCore({
    employees: EMPLOYEES,
    allowedValues: ['', '1', '2', '3', 'u', 'l'],
    summaryKeys: ['1', '2', '3', 'u', 'l'],
    normalizeValue: (v) => v,
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

  // UI state (pełny ekran)
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
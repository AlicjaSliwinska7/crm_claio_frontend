// src/shared/schedules/hooks/useGridSelection.js
import { useCallback, useState } from 'react'
import { format } from 'date-fns'

/**
 * Wspólna logika selekcji (klik / shift+klik) dla siatki:
 * - selectedRange: prostokąt (start/end wiersz + start/end kolumna)
 * - activeCell: aktywna komórka
 * - selectedSummaryEmployee: pracownik do podsumowania
 *
 * daysInMonth: Date[] (miesiąc z date-fns)
 * employees: string[]
 */
export default function useGridSelection({ employees = [], daysInMonth = [] } = {}) {
  const [selectedRange, setSelectedRange] = useState(null)
  const [activeCell, setActiveCell] = useState({ name: null, dateKey: null })
  const [selectedSummaryEmployee, setSelectedSummaryEmployee] = useState(null)

  const handleCellClick = useCallback(
    (name, dateKey, e) => {
      if (!name || !dateKey) return

      if (e?.shiftKey && selectedRange) {
        const startRow = employees.indexOf(selectedRange.startName)
        const endRow = employees.indexOf(name)

        const startCol = daysInMonth.findIndex(
          (d) => format(d, 'yyyy-MM-dd') === selectedRange.startDateKey
        )
        const endCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === dateKey)

        // jeżeli nie możemy policzyć indeksów, robimy fallback na pojedynczą komórkę
        if (startRow < 0 || endRow < 0 || startCol < 0 || endCol < 0) {
          setSelectedRange({ startName: name, endName: name, startDateKey: dateKey, endDateKey: dateKey })
          setActiveCell({ name, dateKey })
          setSelectedSummaryEmployee(name)
          return
        }

        setSelectedRange({
          startName: employees[Math.min(startRow, endRow)],
          endName: employees[Math.max(startRow, endRow)],
          startDateKey: format(daysInMonth[Math.min(startCol, endCol)], 'yyyy-MM-dd'),
          endDateKey: format(daysInMonth[Math.max(startCol, endCol)], 'yyyy-MM-dd'),
        })
      } else {
        setSelectedRange({ startName: name, endName: name, startDateKey: dateKey, endDateKey: dateKey })
        setActiveCell({ name, dateKey })
        setSelectedSummaryEmployee(name)
      }
    },
    [selectedRange, employees, daysInMonth]
  )

  const isInSelectionRange = useCallback(
    (name, dateKey) => {
      if (!selectedRange) return false

      const rowIndex = employees.indexOf(name)
      const colIndex = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === dateKey)

      const startRow = employees.indexOf(selectedRange.startName)
      const endRow = employees.indexOf(selectedRange.endName)
      const startCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.startDateKey)
      const endCol = daysInMonth.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedRange.endDateKey)

      if (rowIndex < 0 || colIndex < 0 || startRow < 0 || endRow < 0 || startCol < 0 || endCol < 0) return false

      return (
        rowIndex >= Math.min(startRow, endRow) &&
        rowIndex <= Math.max(startRow, endRow) &&
        colIndex >= Math.min(startCol, endCol) &&
        colIndex <= Math.max(startCol, endCol)
      )
    },
    [selectedRange, employees, daysInMonth]
  )

  return {
    state: {
      selectedRange,
      activeCell,
      selectedSummaryEmployee,
    },
    setSelectedRange,
    setActiveCell,
    setSelectedSummaryEmployee,
    handleCellClick,
    isInSelectionRange,
  }
}
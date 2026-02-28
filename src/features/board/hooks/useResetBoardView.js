// src/features/board/hooks/useResetBoardView.js
import { useCallback } from 'react'
import { safeFn } from '../utils/boardGuards'

/**
 * SSOT: reset widoku tablicy = reset filtrów + powrót do "dzisiaj".
 */
export function useResetBoardView({ resetFilters, setCurrentDay, onAfterReset } = {}) {
  const safeResetFilters = safeFn(resetFilters)
  const safeSetCurrentDay = safeFn(setCurrentDay)
  const safeAfter = safeFn(onAfterReset)

  return useCallback(() => {
    safeResetFilters()
    safeSetCurrentDay(new Date())
    safeAfter()
  }, [safeResetFilters, safeSetCurrentDay, safeAfter])
}

export default useResetBoardView
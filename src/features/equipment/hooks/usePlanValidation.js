import { useCallback } from 'react'
import { format } from 'date-fns'

export default function usePlanValidation({ holidaySet, openInfo, MSG }) {
  const fmt = d => format(d, 'yyyy-MM-dd')
  const isPast = useCallback(d => {
    const t = new Date()
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const tt = new Date(t.getFullYear(), t.getMonth(), t.getDate())
    return dd < tt
  }, [])
  const isWeekend = d => [0, 6].includes(d.getDay())
  const isHolidayDate = d => holidaySet.has(fmt(d))
  const isInvalidPlanDay = useCallback(d => isPast(d) || isWeekend(d) || isHolidayDate(d), [holidaySet, isPast])
  const guardOrInfo = useCallback((cond, msgKey) => {
    if (cond) { openInfo(MSG[msgKey]); return true }
    return false
  }, [openInfo, MSG])
  return { isInvalidPlanDay, isPast, isWeekend, isHolidayDate, guardOrInfo }
}

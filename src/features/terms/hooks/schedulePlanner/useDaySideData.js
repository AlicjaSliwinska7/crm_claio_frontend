import { useMemo } from 'react'
import { iso } from '../../utils/dates'

export function useDaySideData(initialMeetings, initialAlerts, initialOther) {
  const dayMeetings = useMemo(
    () => (d) => (initialMeetings || []).filter((m) => m.dateISO === iso(d)),
    [initialMeetings]
  )
  const dayAlerts = useMemo(
    () => (d) => (initialAlerts || []).filter((n) => n.dateISO === iso(d)),
    [initialAlerts]
  )
  const dayOther = useMemo(
    () => (d) => (initialOther || []).filter((o) => o.dateISO === iso(d)),
    [initialOther]
  )
  return { dayMeetings, dayAlerts, dayOther }
}
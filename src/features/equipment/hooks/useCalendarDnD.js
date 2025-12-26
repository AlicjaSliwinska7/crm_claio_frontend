import { useCallback } from 'react'
import { format, parseISO } from 'date-fns'

const toDate = d => (d instanceof Date ? d : d ? parseISO(d) : null)
const fmt = d => format(d, 'yyyy-MM-dd')

export default function useCalendarDnD({ data, setData, guardOrInfo, isInvalidPlanDay, MSG }) {
  const allowDrop = useCallback((e) => {
    const types = Array.from(e.dataTransfer?.types || [])
    if (types.includes('text/x-calitem') || types.includes('text/plain')) e.preventDefault()
  }, [])

  const handleDropOnDay = useCallback((e, day) => {
    e.preventDefault()
    const targetIso = fmt(day)

    const typed = e.dataTransfer.getData('text/x-calitem')
    if (typed) {
      try {
        const payload = JSON.parse(typed)
        if (payload.kind === 'entry' && payload.id) {
          if (guardOrInfo(isInvalidPlanDay(day), 'NEXT_PAST_WEEKEND_HOLIDAY')) return
          setData(prev => prev.map(it => (it.id === payload.id ? { ...it, nextCalibration: targetIso } : it)))
          return
        }
        if (payload.kind === 'send' && payload.id) {
          if (guardOrInfo(isInvalidPlanDay(day), 'SEND_PAST_WEEKEND_HOLIDAY')) return
          setData(prev => prev.map(it => (it.id === payload.id ? { ...it, plannedSend: targetIso } : it)))
          return
        }
        if (payload.kind === 'return' && payload.id) {
          if (guardOrInfo(isInvalidPlanDay(day), 'RETURN_PAST_WEEKEND_HOLIDAY')) return
          setData(prev => prev.map(it => {
            if (it.id !== payload.id) return it
            const sendD = toDate(it.plannedSend)
            const retD = toDate(targetIso)
            if (sendD && retD && retD < sendD) return (guardOrInfo(true, 'RETURN_BEFORE_SEND'), it)
            return { ...it, plannedReturn: targetIso }
          }))
          return
        }
      } catch {}
    }

    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      if (guardOrInfo(isInvalidPlanDay(day), 'SEND_PAST_WEEKEND_HOLIDAY')) return
      const item = data.find(d => d.id === id)
      if (!item) return
      if (!item.shippingPlace) {
        return { fallbackFromLeftListId: id, targetIso }
      } else {
        setData(prev => prev.map(it => (it.id === id ? { ...it, plannedSend: targetIso } : it)))
      }
    }
    return null
  }, [data, setData, guardOrInfo, isInvalidPlanDay])

  const handleDropToLeftList = useCallback((payload) => {
    const { id } = payload || {}
    if (!id) return
    setData(prev => prev.map(it => (it.id === id ? { ...it, plannedSend: '', plannedReturn: '' } : it)))
  }, [setData])

  return { handleDropOnDay, handleDropToLeftList, allowDrop }
}

import { useState } from 'react'
import { todayISO } from '../utils/formatters'

export function useConfirmToggleDate(defaultDate = todayISO()) {
  const [state, setState] = useState({ open:false, type:null, id:null, date: defaultDate })
  const ask = (type, row, presetDate) =>
    setState({ open:true, type, id: row?.id ?? null, date: presetDate || defaultDate })
  const setDate = (date) => setState(s => ({ ...s, date }))
  const close = () => setState({ open:false, type:null, id:null, date: defaultDate })
  return { state, ask, setDate, close }
}

import { useMemo, useState } from 'react'

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Prosty, reużywalny stan zakresu dat z presetami.
 * Presety: 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
 */
export function useDateRange({ initialPreset = 'month', initialFrom = '', initialTo = '' } = {}) {
  const [preset, setPreset] = useState(initialPreset)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)

  const resolved = useMemo(() => {
    if (preset === 'custom') return { from, to }
    if (preset === 'all') return { from: '', to: '' }

    const today = new Date()
    const endISO = toISO(today)
    const start = new Date(today)

    if (preset === 'week') start.setDate(today.getDate() - 6)
    if (preset === 'month') start.setDate(today.getDate() - 30)
    if (preset === 'quarter') start.setMonth(today.getMonth() - 3)
    if (preset === 'year') start.setFullYear(today.getFullYear() - 1)

    return { from: toISO(start), to: endISO }
  }, [preset, from, to])

  const reset = () => { setPreset('month'); setFrom(''); setTo('') }

  return {
    preset, setPreset,
    from, setFrom,
    to, setTo,
    resolved,
    reset,
  }
}

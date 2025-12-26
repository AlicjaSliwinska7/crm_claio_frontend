import { useMemo } from 'react'

export default function useKnownPlaces(data) {
  return useMemo(() => {
    const set = new Set((data || []).map(d => d.shippingPlace).filter(Boolean))
    try {
      const raw = localStorage.getItem('calibrationLabs')
      if (raw) JSON.parse(raw).forEach(l => l?.name && set.add(l.name))
    } catch {}
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [data])
}

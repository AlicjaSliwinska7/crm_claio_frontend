// src/features/charts/hooks/useGuides.js
import { useState } from 'react'
import { num } from '../../../shared/diagrams/utils/lab'

export default function useGuides({ xLog, yLLog, yRLog }) {
  const [guides, setGuides] = useState([])
  const [newGuide, setNewGuide] = useState({ type: 'x', value: '', label: '', color: '#6b7280', dash: 'dashed' })

  const addGuide = () => {
    const v = num(newGuide.value)
    if (!Number.isFinite(v)) return
    if ((newGuide.type === 'x' && xLog && v <= 0) || (newGuide.type === 'y' && (yLLog || yRLog) && v <= 0)) return
    setGuides((g) => [...g, { id: `g-${Date.now()}`, ...newGuide }])
    setNewGuide((prev) => ({ ...prev, value: '', label: '' }))
  }

  const removeGuide = (id) => setGuides((gs) => gs.filter((g) => g.id !== id))

  return { guides, newGuide, setNewGuide, addGuide, removeGuide }
}
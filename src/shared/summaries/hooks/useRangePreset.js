// src/shared/summaries/hooks/useRangePreset.js
import { useMemo, useState } from 'react'
import { computePresetRangeISO } from '../utils/time' // ✅ właściwa ścieżka

/**
 * Prost y hook do wyboru presetu zakresu i ewentualnych dat custom.
 * Zwraca: { preset, setPreset, from, setFrom, to, setTo, period }
 */
export default function useRangePreset(defaultPreset = 'year') {
	const [preset, setPreset] = useState(defaultPreset) // 'year' | 'quarter' | 'month' | 'custom'
	const [from, setFrom] = useState('')
	const [to, setTo] = useState('')

	const period = useMemo(() => computePresetRangeISO(preset, from, to), [preset, from, to])

	return { preset, setPreset, from, setFrom, to, setTo, period }
}

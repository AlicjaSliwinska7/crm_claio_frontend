// src/shared/summaries/time.js

// Zwraca 'YYYY-MM-DD' niezależnie od strefy (dla wejść: Date | string)
export const dayISO = d => {
	if (!d) return ''
	const dt = d instanceof Date ? d : new Date(d)
	if (isNaN(dt.getTime())) return ''
	const y = dt.getFullYear()
	const m = String(dt.getMonth() + 1).padStart(2, '0')
	const day = String(dt.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

// 'YYYY-MM'
export const monthKeyISO = d => dayISO(d).slice(0, 7)

// Presety zakresów (Rok/Kwartał/Miesiąc) → { from, to } ISO (bez czasu)
export const computePresetRangeISO = (preset = 'year') => {
	const today = new Date()
	const to = dayISO(today)
	if (preset === 'year') {
		const d = new Date(today)
		d.setFullYear(d.getFullYear() - 1)
		return { from: dayISO(d), to }
	}
	if (preset === 'quarter') {
		const d = new Date(today)
		d.setDate(d.getDate() - 90)
		return { from: dayISO(d), to }
	}
	if (preset === 'month') {
		const d = new Date(today)
		d.setDate(d.getDate() - 30)
		return { from: dayISO(d), to }
	}
	// fallback
	const d = new Date(today)
	d.setFullYear(d.getFullYear() - 1)
	return { from: dayISO(d), to }
}

// Grupowanie po: 'day' | 'week' | 'month'
export const bucketKeyByGranularity = (dateStr, granularity = 'month') => {
	const dISO = dayISO(dateStr)
	if (!dISO) return ''
	const d = new Date(dISO)
	const y = d.getFullYear(),
		m = String(d.getMonth() + 1).padStart(2, '0'),
		day = String(d.getDate()).padStart(2, '0')
	if (granularity === 'day') return `${y}-${m}-${day}`
	if (granularity === 'week') {
		const oneJan = new Date(y, 0, 1)
		const diff = Math.floor((d - oneJan) / 86400000)
		const w = String(Math.floor(diff / 7) + 1).padStart(2, '0')
		return `${y}-W${w}`
	}
	return `${y}-${m}`
}

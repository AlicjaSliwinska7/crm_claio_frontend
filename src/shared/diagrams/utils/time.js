// src/shared/diagrams/utils/time.js

// Zwraca 'YYYY-MM-DD' niezależnie od strefy (dla wejść: Date | string)
export const dayISO = (d) => {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 'YYYY-MM'
export const monthKeyISO = (d) => dayISO(d).slice(0, 7)

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

  const d = new Date(today)
  d.setFullYear(d.getFullYear() - 1)
  return { from: dayISO(d), to }
}

/**
 * ✅ Public API expected by configs:
 * computePresetRange(preset, { today, customFrom, customTo })
 */
export const computePresetRange = (preset = 'year', opts = {}) => {
  const today = opts?.today instanceof Date ? opts.today : new Date()
  const toDefault = dayISO(today)

  // custom ma pierwszeństwo
  if (preset === 'custom') {
    const from = String(opts?.customFrom || '').slice(0, 10)
    const to = String(opts?.customTo || '').slice(0, 10)
    return { from, to }
  }

  // dla kompatybilności: preset = 'year'|'quarter'|'month'
  const { from, to } = computePresetRangeISO(preset)
  // ale jeśli ktoś poda customTo, to honorujemy
  const to2 = String(opts?.customTo || '').slice(0, 10) || to || toDefault
  const from2 = String(opts?.customFrom || '').slice(0, 10) || from
  return { from: from2, to: to2 }
}

/**
 * ✅ mainDateISO(row|date)
 * - jeśli dostaniesz obiekt, próbuje znanych kluczy daty (bez backendu / różne moduły)
 */
export const mainDateISO = (input) => {
  if (!input) return ''
  if (typeof input === 'string' || input instanceof Date) return dayISO(input)

  // object
  const candidates = [
    input.date,
    input.mainDate,
    input.receivedDate,
    input.completedDate,
    input.createdAt,
    input.updatedAt,
  ]
  for (const c of candidates) {
    const d = dayISO(c)
    if (d) return d
  }
  return ''
}

// ✅ monthKeyFromISO('YYYY-MM-DD' | Date | obj) -> 'YYYY-MM'
export const monthKeyFromISO = (d) => {
  const iso = typeof d === 'string' ? d : mainDateISO(d)
  if (!iso) return ''
  return String(iso).slice(0, 7)
}

// Grupowanie po: 'day' | 'week' | 'month'
export const bucketKeyByGranularity = (dateStr, granularity = 'month') => {
  const dISO = dayISO(dateStr)
  if (!dISO) return ''
  const d = new Date(dISO)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  if (granularity === 'day') return `${y}-${m}-${day}`

  if (granularity === 'week') {
    const oneJan = new Date(y, 0, 1)
    const diff = Math.floor((d - oneJan) / 86400000)
    const w = String(Math.floor(diff / 7) + 1).padStart(2, '0')
    return `${y}-W${w}`
  }

  return `${y}-${m}`
}
// src/shared/utils/time.js

/**
 * monthKeyISO('2025-09-12') -> '2025-09'
 * monthKeyISO(Date) -> 'YYYY-MM'
 */
export function monthKeyISO(input) {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
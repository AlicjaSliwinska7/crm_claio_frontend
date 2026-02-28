// src/shared/diagrams/utils/lab/numbers.js

export const num = (v) => Number(String(v ?? '').replace(',', '.'))

export const toNumOrNull = (s) => {
  if (s === undefined || s === null) return null
  const t = String(s).trim()
  if (t === '') return null
  const n = Number(t.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export const toIntOrNull = (s) => {
  if (s === undefined || s === null) return null
  const t = String(s).trim()
  if (t === '') return null
  const n = Number.parseInt(t, 10)
  return Number.isInteger(n) && n >= 0 ? n : null
}

export const fmtNum = (v, dec) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return ''
  return dec != null ? n.toFixed(Math.min(dec, 12)) : String(n)
}
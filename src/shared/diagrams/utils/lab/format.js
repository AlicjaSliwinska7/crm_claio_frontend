// src/shared/diagrams/utils/lab/format.js

/* =========================================================
   ChartLab helpers — format & parsing primitives
   (wyciągnięte z ChartsLab, żeby nie duplikować kodu)
   ========================================================= */

export const num = (v) => Number(String(v ?? '').replace(',', '.'))

export const safeFile = (s) => (s || 'wykres').replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 60)

export const dashToArray = (s) => (s === 'dashed' ? '6 6' : s === 'dotted' ? '2 6' : undefined)

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

export function parseYList(text) {
  if (!text?.trim()) return []
  return text
    .split(/[\r\n\t;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => Number(String(t).replace(',', '.')))
    .filter(Number.isFinite)
}
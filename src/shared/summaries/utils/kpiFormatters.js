// src/shared/summaries/utils/kpiFormatters.js

export const n0 = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const fmtIntPL = (v) => new Intl.NumberFormat('pl-PL').format(Math.round(n0(v)))
export const fmt1 = (v) => n0(v).toFixed(1)

export const fmtPLN0 = (v) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n0(v))

export const fmtDatePL = (v) => {
  if (!v) return '—'
  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
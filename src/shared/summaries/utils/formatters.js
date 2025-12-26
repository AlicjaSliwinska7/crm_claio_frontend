// src/shared/summaries/formatters.js
const PLN_FMT = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	maximumFractionDigits: 0,
})
export const fmtPLN = n => PLN_FMT.format(Number(n || 0))
// --- dopisz na końcu pliku ---
export const safeNum = v => (Number.isFinite(Number(v)) ? Number(v) : 0)

export const fmtDatePL = d => (d ? new Date(d).toLocaleDateString('pl-PL') : '—')

export const isoDate = d => (d ? new Date(d).toISOString().slice(0, 10) : '')

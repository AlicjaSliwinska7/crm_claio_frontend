// src/shared/summaries/utils/csvFormatters.js
import { fmtPLN, fmtDatePL } from './formatters.js'

export const fmtBoolTakNie = v => (Boolean(v) ? 'Tak' : 'Nie')

export const fmtNumber1 = v => {
	if (v == null) return ''
	const n = Number(v)
	return Number.isFinite(n) ? n.toFixed(1) : ''
}

export const fmtInt = v => {
	if (v == null) return ''
	const n = Number(v)
	return Number.isFinite(n) ? String(Math.trunc(n)) : ''
}

export const fmtMoneyPLN = v => {
	if (v == null) return ''
	const n = Number(v)
	return Number.isFinite(n) ? fmtPLN(n) : ''
}

export const fmtDatePLorEmpty = v => (v ? fmtDatePL(v) : '')

// src/shared/tables/utils/formatters/dateTime.js

const pad2 = (n) => String(n).padStart(2, '0')

/**
 * toDateObj
 * - Obsługuje: Date, number (timestamp ms), ISO string, "YYYY-MM-DD HH:mm(:ss)",
 *   oraz "DD.MM.YYYY" / "DD-MM-YYYY" (+ opcjonalnie HH:mm(:ss))
 */
export function toDateObj(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  // timestamp ms jako number
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const s = String(value).trim()
  if (!s) return null

  // ISO / "YYYY-MM-DD" / "YYYY-MM-DD HH:mm" / "YYYY-MM-DD HH:mm:ss"
  // UWAGA: "YYYY-MM-DD HH:mm" nie zawsze jest parsowane przez Date w każdej przeglądarce,
  // więc robimy własny parser zanim spróbujemy new Date(...)
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (ymd) {
    const [, yyyy, mm, dd, hh = '00', mi = '00', ss = '00'] = ymd
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss))
    return Number.isNaN(d.getTime()) ? null : d
  }

  // PL "DD.MM.YYYY" / "DD-MM-YYYY" (+ opcjonalnie HH:mm(:ss))
  const pl = s.match(/^(\d{2})[.\-](\d{2})[.\-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (pl) {
    const [, dd, mm, yyyy, hh = '00', mi = '00', ss = '00'] = pl
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss))
    return Number.isNaN(d.getTime()) ? null : d
  }

  // Na końcu spróbuj natywnego parsera (ISO z Z / offsetem)
  // To zachowa poprawne przesunięcie strefowe.
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d

  return null
}

/**
 * Format: dd-mm-yyyy
 */
export function fmtDateDMY(value, { utc = false } = {}) {
  const d = toDateObj(value)
  if (!d) return ''

  const day = utc ? d.getUTCDate() : d.getDate()
  const month = utc ? d.getUTCMonth() + 1 : d.getMonth() + 1
  const year = utc ? d.getUTCFullYear() : d.getFullYear()

  return `${pad2(day)}-${pad2(month)}-${year}`
}

/**
 * Format: dd-mm-yyyy⍽hh:mm
 * Używamy twardej spacji (\u00A0), żeby wyglądało dobrze w nowrap.
 */
export function fmtDateTimeDMYHM(value, { utc = false } = {}) {
  const d = toDateObj(value)
  if (!d) return ''

  const day = utc ? d.getUTCDate() : d.getDate()
  const month = utc ? d.getUTCMonth() + 1 : d.getMonth() + 1
  const year = utc ? d.getUTCFullYear() : d.getFullYear()
  const h = utc ? d.getUTCHours() : d.getHours()
  const m = utc ? d.getUTCMinutes() : d.getMinutes()

  return `${pad2(day)}-${pad2(month)}-${year}\u00A0${pad2(h)}:${pad2(m)}`
}

/**
 * Format: dd-mm-yyyy⍽hh:mm:ss
 * (nowy format z sekundami)
 */
export function fmtDateTimeDMYHMS(value, { utc = false } = {}) {
  const d = toDateObj(value)
  if (!d) return ''

  const day = utc ? d.getUTCDate() : d.getDate()
  const month = utc ? d.getUTCMonth() + 1 : d.getMonth() + 1
  const year = utc ? d.getUTCFullYear() : d.getFullYear()
  const h = utc ? d.getUTCHours() : d.getHours()
  const m = utc ? d.getUTCMinutes() : d.getMinutes()
  const s = utc ? d.getUTCSeconds() : d.getSeconds()

  return `${pad2(day)}-${pad2(month)}-${year}\u00A0${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

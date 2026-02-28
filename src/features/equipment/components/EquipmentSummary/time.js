export const DAY = 24 * 60 * 60 * 1000;
// Odstępy tytułów osi (spójne)
export const AXIS = { xDy: 28, yLeftDy: 56, yRightDy: 56 };

// Wycentrowana legenda pod wykresami
export const centeredLegend = {
  left: 0,
  right: 0,
  width: "100%",
  margin: "0 auto",
  textAlign: "center",
};
// src/shared/diagrams/utils/time.js

export const toTs = v => {
  if (v == null || v === '') return null
  const d = v instanceof Date ? v : new Date(v)
  const t = d.getTime()
  return Number.isFinite(t) ? t : null
}

export const fmtDate = (t, withTime = false) => {
  const d = new Date(t)
  if (!Number.isFinite(d.getTime())) return '—'
  const pad = n => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  if (!withTime) return `${yyyy}-${mm}-${dd}`
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

export const startOfDay = dateLike => {
  const t = toTs(dateLike)
  if (t == null) return null
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d
}

export const endOfDay = dateLike => {
  const t = toTs(dateLike)
  if (t == null) return null
  const d = new Date(t)
  d.setHours(23, 59, 59, 999)
  return d
}

export const addDays = (dateLike, days) => {
  const t = toTs(dateLike)
  if (t == null) return null
  return new Date(t + days * DAY)
}

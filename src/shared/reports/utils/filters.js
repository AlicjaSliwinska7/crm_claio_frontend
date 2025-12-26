export const parseISO = (s) => {
  if (!s) return null
  const [y, m, d] = String(s).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const inRange = (date, fromISO, toISO) => {
  if (!date) return true
  const d = date instanceof Date ? date : parseISO(date)
  const from = fromISO ? parseISO(fromISO) : null
  const to = toISO ? parseISO(toISO) : null
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

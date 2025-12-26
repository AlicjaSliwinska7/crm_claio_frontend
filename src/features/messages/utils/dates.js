export function formatDateHeader(iso) {
  const date = new Date(iso)
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  const d1 = new Date(a)
  const d2 = new Date(b)
  return d1.toDateString() === d2.toDateString()
}

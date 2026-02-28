// src/shared/diagrams/utils/range.js
import { addDays, startOfDay, endOfDay, fmtDate } from './time'

export function computePresetRange(preset, { today = new Date(), customFrom = null, customTo = null } = {}) {
  const y = today.getFullYear()
  const m = today.getMonth()

  const iso = d => fmtDate(d, false)
  let from = null
  let to = null
  let labelHTML = 'Zakres: —'

  if (preset === 'this-month') {
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (bieżący miesiąc)`
  } else if (preset === 'last-month') {
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (poprzedni miesiąc)`
  } else if (preset === 'last-30d') {
    const end = startOfDay(today)
    const start = addDays(end, -29)
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (ostatnie 30 dni)`
  } else {
    const f = customFrom ? startOfDay(customFrom) : null
    const t = customTo ? endOfDay(customTo) : null
    from = f ? iso(f) : null
    to = t ? iso(t) : null
    labelHTML = from && to ? `Zakres: <b>${from}</b> – <b>${to}</b>` : 'Zakres: —'
  }

  return { from, to, labelHTML }
}

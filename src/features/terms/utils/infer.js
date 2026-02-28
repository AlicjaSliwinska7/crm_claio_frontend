import { clamp } from './dates'

function hueFromId(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % 360
}

export function typeColors(id = '') {
  const h = hueFromId(id)
  return {
    dot: `hsl(${h} 72% 44%)`,
    chipBg: `hsl(${h} 90% 92%)`,
    chipBgOn: `hsl(${h} 88% 86%)`,
    chipBr: `hsl(${h} 55% 60%)`,
  }
}

export function inferTests(title = '') {
  const t = title.toLowerCase()
  const o = []
  if (t.includes('iso')) o.push('ISO')
  if (t.includes('pn-en')) o.push('PN-EN')
  if (t.includes('kalibr')) o.push('Kalibracja')
  if (t.includes('raport')) o.push('Raport')
  return o.length ? o : ['Ogólne']
}

export function inferType(title = '') {
  const s = title.toLowerCase()
  if (s.includes('ppp')) return 'PPP: do przygotowania'
  if (s.includes('pb')) return 'PB: do przygotowania'
  if (s.includes('badani')) return 'Badania: do wykonania'
  if (s.includes('raport')) return 'Raport: do przygotowania'
  return 'Inne'
}

export function inferKind(t) {
  if (t.kind) return t.kind
  if (t.category) return t.category
  const s = `${t.type || ''} ${t.title || ''}`.toLowerCase()
  if (s.includes('szkolen')) return 'szkolenie'
  if (s.includes('spotkan')) return 'spotkanie'
  return 'zadanie'
}

export function inferPriority(t) {
  const raw = t.priority ?? t.prio ?? t.importance ?? t.istotnosc ?? 2
  if (typeof raw === 'string') {
    const r = raw.toLowerCase()
    if (['low', 'niska', '1'].includes(r)) return 1
    if (['high', 'wysoka', '3'].includes(r)) return 3
    return 2
  }
  return clamp(Number(raw) || 2, 1, 3)
}
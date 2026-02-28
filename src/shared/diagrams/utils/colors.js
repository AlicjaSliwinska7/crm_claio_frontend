// src/shared/diagrams/summary/utils/colors.js

export const NEUTRAL = '#94a3b8'
export const ACCENT = '#3a628a'

// fallback paleta (spójna z Twoim klimatem)
export const palette = [
  '#3a628a',
  '#6e9cc5',
  '#9fbad3',
  '#cfd9e6',
  '#2C8E7C',
  '#D24A4A',
  '#675485',
]

const clamp01 = (n) => Math.max(0, Math.min(1, Number(n)))

export function withAlpha(color, alpha = 1) {
  const a = clamp01(alpha)

  // rgba(...) passthrough
  if (/^rgba?\(/i.test(String(color || '').trim())) {
    const inner = String(color).trim().replace(/^rgba?\(/i, '').replace(/\)\s*$/, '')
    const parts = inner.split(',').map((x) => x.trim())
    if (parts.length >= 3) {
      const [r, g, b] = parts
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }

  // hex
  let h = String(color || '').trim()
  if (!h) return `rgba(0,0,0,${a})`
  if (h[0] !== '#') h = `#${h}`

  // #RGB -> #RRGGBB
  if (/^#([0-9a-f]{3})$/i.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }

  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h)
  if (!m) return `rgba(0,0,0,${a})`

  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * Stabilny kolor serii:
 * - jeśli key pasuje do mapy “specjalnej” -> użyj mapy
 * - inaczej z palety po indeksie
 */
export function colorFor(key, idx = 0, specialMap = null) {
  if (specialMap && typeof specialMap === 'object' && typeof specialMap[key] === 'string') return specialMap[key]
  return palette[idx % palette.length]
}
// src/shared/diagrams/utils/colors.js

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
  let h = String(color || '').trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return `rgba(0,0,0,${a})`

  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * ✅ Public API expected by configs:
 * getSeriesColors(keys) -> array of colors aligned with keys
 */
export function getSeriesColors(keys = [], pal = palette) {
  const safeKeys = Array.isArray(keys) ? keys : []
  const out = []
  for (let i = 0; i < safeKeys.length; i++) out.push(pal[i % pal.length])
  return out
}
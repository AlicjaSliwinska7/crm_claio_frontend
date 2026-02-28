// src/shared/diagrams/utils/lab/colors.js

/* ===== Paleta (taka sama jak w ChartsLab) ===== */
export const palette = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]

const hslToHex = (h, s, l) => {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

/* ===== Kolory: wybór kolejnego nieużytego ===== */
export function nextDistinctColor(usedSet, offset = 0) {
  for (let i = 0; i < palette.length; i++) {
    const c = palette[(i + offset) % palette.length]
    if (!usedSet.has(c)) {
      usedSet.add(c)
      return c
    }
  }
  let i = usedSet.size
  for (let guard = 0; guard < 360; guard++) {
    const c = hslToHex((i * 47) % 360, 70, 48)
    if (!usedSet.has(c)) {
      usedSet.add(c)
      return c
    }
    i++
  }
  return '#888888'
}
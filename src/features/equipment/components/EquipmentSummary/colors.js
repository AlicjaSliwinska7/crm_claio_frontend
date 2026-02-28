// src/shared/diagrams/palette.js
// Pastelowa paleta inspirowana: #1F2041, #4B3F72, #FFC857, #119DA4, #19647E
// Delikatnie „wyblakłe”, aby były spokojne na białym tle, ale wciąż wyraźnie różne.

export const basePalette = {
  // Główne kategorie
  AO: '#3A3C70', // pastel navy (wybielony #1F2041)
  AZ: '#6CC9CD', // pastel teal  (wybielony #119DA4)
  BP: '#FFDF95', // pastel mango (wybielony #FFC857)
  BW: '#4F8DA5', // pastel petrol (wybielony #19647E)

  // UI wykresów
  GRID: '#E8EDF2', // siatka
  AXIS: '#8DA0B3', // podpisy osi
  TEXT: '#1F2937', // główny tekst
}

// Dodatkowe, miękkie kolory serii (fallback).
export const dynamicColors = [
  '#6B5FA0', '#505287', '#90D6DA', '#FFE7AE',
  '#71BFC6', '#6BA9C2', '#FFD985', '#5A5F8C',
  '#A8ACD6', '#CFEAEC', '#7CA8BC', '#C9BEE9',
]
export const dynamicColorsSolid = dynamicColors

// Kontrastowa paleta dla pierwszych serii (czytelna na białym tle)
export const contrastColors = [
  '#3a628adc', // navy (spójny z motywem)
  '#4a8ac2cf', // amber
  '#2C8E7C', // teal
  '#D24A4A', // rose
  '#3c3a41d0', // indigo
  '#2C9AC6', // cyan
  '#3aa492bd', // olive/green
  '#675485d2', // purple
]

// „Inne/pozostałe”
export const OTHER_COLOR = '#9CA3AF'

// ───────────────────────────── Helpers ─────────────────────────────

export function hexToRgba(hex, alpha = 1) {
  if (!hex) return hex
  let h = String(hex).trim()
  if (h[0] !== '#') h = `#${h}`
  const short = /^#([a-fA-F0-9]{3})$/.exec(h)
  if (short) {
    const [, rgb] = short
    h = `#${rgb[0]}${rgb[0]}${rgb[1]}${rgb[1]}${rgb[2]}${rgb[2]}`
  }
  const m = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(h)
  if (!m) return hex
  const clamp = v => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 1))
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha)})`
}

// Stabilna lista kolorów dla podanych kluczy (pastel).
export function getSeriesColors(keys = [], seed = 0) {
  const base = { AO: basePalette.AO, AZ: basePalette.AZ, BP: basePalette.BP, BW: basePalette.BW }
  const out = []
  let dyn = Math.abs(seed) % dynamicColors.length
  for (const k of keys) out.push(base[k] || dynamicColors[dyn++ % dynamicColors.length])
  return out
}

// Mapa { key: color } (pastel).
export function getSeriesColorMap(keys = [], seed = 0) {
  const arr = getSeriesColors(keys, seed)
  const map = {}
  keys.forEach((k, i) => { map[k] = arr[i] })
  return map
}

// Kontrastowa mapa dla kluczy (pierwsze serie mocno różne).
export function getContrastColorMap(keys = [], seed = 0) {
  const map = {}
  let i = Math.abs(seed) % contrastColors.length
  keys.forEach(k => { map[k] = contrastColors[i++ % contrastColors.length] })
  return map
}

export function getStrokeColors(keys = [], seed = 0) {
  return getSeriesColors(keys, seed)
}
export function getFillColors(keys = [], alpha = 0.82, seed = 0) {
  return getSeriesColors(keys, seed).map(c => hexToRgba(c, alpha))
}

// Zestaw pod wykres: { strokeMap, fillMap } (pastel).
export function getChartColorSet(keys = [], { alpha = 0.82, seed = 0 } = {}) {
  const stroke = getSeriesColorMap(keys, seed)
  const fill = {}
  for (const k of keys) fill[k] = hexToRgba(stroke[k], alpha)
  return { strokeMap: stroke, fillMap: fill }
}

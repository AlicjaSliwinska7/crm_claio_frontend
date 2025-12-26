// src/shared/utils/array.js
// Proste, wielokrotnego użytku utilsy tablicowe i mapujące

/** Unikalne wartości (shallow, porównanie po ===) */
export const unique = (arr) => [...new Set(arr || [])]

/** Unikalne elementy wg klucza/funkcji (ostatni wygrywa) */
export const uniqueBy = (arr, fn) => {
  const getKey = typeof fn === 'function' ? fn : (x) => x?.[fn]
  return [...new Map((arr || []).map((x) => [getKey(x), x])).values()]
}

/** Liczba unikalnych wartości (shallow) */
export const uniqueCount = (arr) => new Set(arr || []).size

/** Liczba unikalnych wg klucza/funkcji */
export const uniqueCountBy = (arr, fn) => {
  const getKey = typeof fn === 'function' ? fn : (x) => x?.[fn]
  return new Set((arr || []).map(getKey)).size
}

/** Unikalne + posortowane localeCompare */
export const uniqueSorted = (
  arr,
  { locale = 'pl', sensitivity = 'base' } = {}
) =>
  unique(arr || []).sort((a, b) =>
    String(a).localeCompare(String(b), locale, { sensitivity })
  )

/** Bezpieczne pobranie pola z fallbackiem */
export const pick = (obj, key, fallback = '') => (obj && obj[key]) ?? fallback

/** Gwarantuje tablicę (null/undefined → [], scalar → [scalar]) */
export const ensureArray = (v) =>
  Array.isArray(v) ? v : v == null ? [] : [v]

/** Zlicza elementy wg klucza lub funkcji; zwraca Map(key -> count) */
export const countBy = (arr, keyOrFn) => {
  const getKey =
    typeof keyOrFn === 'function' ? keyOrFn : (x) => x?.[keyOrFn]
  const map = new Map()
  for (const item of arr || []) {
    const k = getKey(item)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return map
}

/** Grupuje elementy wg klucza/funkcji; zwraca Map(key -> Array) */
export const groupBy = (arr, keyOrFn) => {
  const getKey =
    typeof keyOrFn === 'function' ? keyOrFn : (x) => x?.[keyOrFn]
  const map = new Map()
  for (const item of arr || []) {
    const k = getKey(item)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(item)
  }
  return map
}

/** Buduje Map(key -> item) wg klucza/funkcji (ostatnie wystąpienie wygrywa) */
export const toMap = (arr, keyOrFn) => {
  const getKey =
    typeof keyOrFn === 'function' ? keyOrFn : (x) => x?.[keyOrFn]
  const map = new Map()
  for (const item of arr || []) map.set(getKey(item), item)
  return map
}

/** Suma po funkcji lub nazwie pola (nie-liczbowe traktowane jako 0) */
export const sumBy = (arr, fnOrKey) => {
  const getVal =
    typeof fnOrKey === 'function' ? fnOrKey : (x) => +x?.[fnOrKey] || 0
  let s = 0
  for (const it of arr || []) s += getVal(it)
  return s
}

/** Map(key->count) -> Map(label->count) przez funkcję etykiety */
export const mapCountsToLabels = (countsMap, labelFn) => {
  const out = new Map()
  for (const [key, n] of countsMap || []) {
    const label = labelFn ? labelFn(key) : String(key ?? '')
    out.set(label, (out.get(label) || 0) + (Number(n) || 0))
  }
  return out
}

/** Zamienia Map na zwykły obiekt `{ [key]: count }` */
export const countsToObject = (counts) => {
  const obj = {}
  if (!counts) return obj
  for (const [k, v] of counts.entries())
    obj[String(k ?? '')] = Number(v) || 0
  return obj
}

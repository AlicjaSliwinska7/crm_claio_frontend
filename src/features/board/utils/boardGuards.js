// src/features/board/utils/boardGuards.js

/**
 * Bezpieczna tablica.
 */
export function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback
}

/**
 * Bezpieczna funkcja.
 */
export function safeFn(fn, fallback = () => {}) {
  return typeof fn === 'function' ? fn : fallback
}

/**
 * Normalizuje "filteredEntries" do funkcji:
 * - jeśli to funkcja -> zwracamy ją
 * - jeśli to tablica -> zwracamy funkcję, która zawsze zwróci tę tablicę
 * - inaczej -> identity dla tablic (defensywnie)
 */
export function resolveFilteredSelector(filteredEntries) {
  if (typeof filteredEntries === 'function') return filteredEntries
  if (Array.isArray(filteredEntries)) {
    const captured = filteredEntries
    return () => captured
  }
  return (arr) => (Array.isArray(arr) ? arr : [])
}

/**
 * Mały helper: bezpieczny Date.
 */
export function safeDate(value) {
  return value instanceof Date && !Number.isNaN(value.valueOf()) ? value : new Date()
}
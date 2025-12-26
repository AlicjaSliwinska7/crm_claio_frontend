// src/shared/tables/utils/paginate.js

const toInt = (v, fallback) => {
	const n = Number.parseInt(v, 10)
	return Number.isFinite(n) ? n : fallback
}

/**
 * Zwraca wycinek tablicy dla danej strony (1-based).
 * Bezpiecznie normalizuje page i pageSize oraz dopina je do zakresu.
 */
export const paginate = (arr, page = 1, pageSize = 50) => {
	const list = Array.isArray(arr) ? arr : Array.from(arr || [])
	const size = Math.max(1, toInt(pageSize, 50))
	const total = list.length
	const pages = Math.max(1, Math.ceil(total / size))
	const p = Math.min(Math.max(1, toInt(page, 1)), pages)

	const start = (p - 1) * size
	return list.slice(start, start + size)
}

/**
 * Liczba stron dla danej tablicy i rozmiaru strony.
 */
export const pageCountOf = (arr, pageSize = 50) => {
	const list = Array.isArray(arr) ? arr : Array.from(arr || [])
	const size = Math.max(1, toInt(pageSize, 50))
	return Math.max(1, Math.ceil(list.length / size))
}

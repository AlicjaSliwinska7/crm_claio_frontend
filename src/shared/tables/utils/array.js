// src/shared/tables/utils/array.js

/**
 * countBy
 * Zlicza elementy według klucza lub funkcji.
 *
 * @param {Array} items
 * @param {string|function} keyOrFn  - np. 'status' albo (x) => x.status
 * @returns {Map<any, number>}
 */
export function countBy(items, keyOrFn) {
	const getter = typeof keyOrFn === 'function' ? keyOrFn : row => (row ? row[keyOrFn] : undefined)

	const map = new Map()
	for (const it of items || []) {
		const k = getter(it)
		// Pomijamy brak klucza (undefined) – zwykle to niechciane „śmieci”
		if (typeof k === 'undefined') continue
		map.set(k, (map.get(k) || 0) + 1)
	}
	return map
}

/**
 * mapCountsToLabels
 * Przepisuje klucze Mapy na etykiety (np. status → „Zamówione”),
 * pozostawiając wartości (liczby) bez zmian.
 *
 * @param {Map<any, number>} counts
 * @param {(key:any)=>string} labelFn
 * @returns {Map<string, number>}
 */
export function mapCountsToLabels(counts, labelFn) {
	const out = new Map()
	if (!counts) return out
	for (const [key, value] of counts.entries()) {
		const label = labelFn ? labelFn(key) : String(key)
		// Bezpiecznik na wypadek null/undefined z labelFn
		out.set(typeof label === 'undefined' || label === null ? '' : String(label), value)
	}
	return out
}

/**
 * mapToObject
 * Utility: konwertuje Mapę do zwykłego obiektu (przydatne do renderu/JSON).
 *
 * @param {Map<string|number, any>} map
 * @returns {Record<string, any>}
 */
export function mapToObject(map) {
	const obj = {}
	if (!map) return obj
	for (const [k, v] of map.entries()) {
		obj[String(k)] = v
	}
	return obj
}

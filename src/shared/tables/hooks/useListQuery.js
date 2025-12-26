// src/shared/tables/hooks/useListQuery.js
// Wspólne: wyszukiwanie + sortowanie dla list

import { useDeferredValue, useMemo, useState } from 'react'
import { sortRows, buildDateTimeAccessor } from '../utils' // spójny import z beczki

// Bezpieczne usuwanie diakrytyków (fallback dla starszych przeglądarek)
export const stripDiacritics = input => {
	const s = String(input ?? '')
	try {
		// Nowoczesne przeglądarki
		return s
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase()
	} catch {
		// Fallback (bez \p{Diacritic})
		return s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
	}
}

export function buildTypeMapFromColumns(columns = []) {
	if (!Array.isArray(columns) || columns.length === 0) return {}
	return columns.reduce((acc, c) => {
		if (!c || !c.key || c.sortable === false) return acc
		const entry = { type: c.type || 'string' }

		// Pozwól kolumnie podać accessor sortowania (np. złączone date+time)
		if (typeof c.getSortValue === 'function') {
			entry.accessor = c.getSortValue
		} else if (c.timeKey && (c.type === 'date' || c.key)) {
			// Jeśli kolumna ma powiązany klucz czasu → sortujemy po momencie
			entry.accessor = buildDateTimeAccessor(c.key, c.timeKey) // ⬅️ użyj faktycznego klucza kolumny
			entry.type = 'date'
		}

		acc[c.key] = entry
		return acc
	}, {})
}

/**
 * @param items        Array<any>
 * @param columns      Array<{ key, label?, sortable?, type?, searchable?, getSortValue?, timeKey? }>
 * @param options
 *   - initialSort       { key, direction } | null
 *   - getSearchFields   (row)=>string[]          // nadpisuje domyślne
 *   - toString          (v)=>string              // jak rzutować wartości na string
 *   - optionsPerKey     { [key]: { type, accessor, locale, nulls } } // nadpisuje buildTypeMapFromColumns
 *   - searchMode        'tokens' | 'substring'   // tokens = każde słowo musi wystąpić (domyślnie)
 *   - deferSearch       boolean                  // użyj useDeferredValue dla query (domyślnie true)
 */
export function useListQuery(
	items,
	columns,
	{
		initialSort = null,
		getSearchFields,
		toString = v => String(v ?? ''),
		optionsPerKey = {},
		searchMode = 'tokens',
		deferSearch = true,
	} = {}
) {
	const list = Array.isArray(items) ? items : []
	const cols = Array.isArray(columns) ? columns : []

	const [searchQuery, setSearchQuery] = useState('')
	const [sortConfig, setSortConfig] = useState(initialSort)

	// ⬇️ Hook zawsze wywołany – wybór wartości później, bez warunku na hooku
	const deferredQueryValue = useDeferredValue(searchQuery)
	const effectiveQuery = deferSearch ? deferredQueryValue : searchQuery

	// Mapa ustawień sortowania wynikająca z kolumn
	const typeMapFromCols = useMemo(() => buildTypeMapFromColumns(cols), [cols])

	// Finalne opcje sortowania per klucz (kolumny + jawne optionsPerKey)
	const typeMap = useMemo(() => ({ ...typeMapFromCols, ...optionsPerKey }), [typeMapFromCols, optionsPerKey])

	// Domyślne pola do wyszukiwania: tylko kolumny, które nie mają searchable === false
	const defaultGetSearchFields = useMemo(() => {
		const searchableCols = cols.filter(c => c?.key && c.searchable !== false)
		return row => searchableCols.map(c => row?.[c.key])
	}, [cols])

	// Pre-budujemy „siano” dla każdego wiersza (przyspiesza filtrowanie)
	const searchableIndex = useMemo(() => {
		const fieldsFor = getSearchFields || defaultGetSearchFields
		return list.map(r => {
			const pieces = (fieldsFor(r) || []).filter(v => v != null && v !== '').map(v => stripDiacritics(toString(v)))
			return { row: r, haystack: pieces.join(' ') }
		})
	}, [list, getSearchFields, defaultGetSearchFields, toString])

	// Filtrowanie
	const filtered = useMemo(() => {
		const q = stripDiacritics((effectiveQuery || '').trim())
		if (!q) return list

		if (searchMode === 'tokens') {
			const tokens = q.split(/\s+/).filter(Boolean)
			if (!tokens.length) return list
			return searchableIndex.filter(({ haystack }) => tokens.every(t => haystack.includes(t))).map(({ row }) => row)
		}

		// 'substring'
		return searchableIndex.filter(({ haystack }) => haystack.includes(q)).map(({ row }) => row)
	}, [list, effectiveQuery, searchMode, searchableIndex])

	// Sortowanie (stabilne, null-last – delegowane do sortRows)
	const filteredSorted = useMemo(() => {
		if (!sortConfig?.key) return filtered
		return sortRows(filtered, sortConfig, typeMap)
	}, [filtered, sortConfig, typeMap])

	return {
		searchQuery,
		setSearchQuery,
		sortConfig,
		setSortConfig,
		filteredSorted,
		total: filtered.length, // liczba po samym filtrze (niezależnie od sortu)
	}
}

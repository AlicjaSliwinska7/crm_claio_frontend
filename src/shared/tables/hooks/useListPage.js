// src/shared/tables/hooks/useListPage.js
import { useMemo, useCallback } from 'react'
import { useUrlPagination } from './usePagination'
import { useListCrud } from './useListCrud'
import { useListQuery } from './useListQuery'
import { useCsvExport } from './useCsvExport'
import { rowNavigateProps as makeRowNavigateProps } from '../utils' // korzystamy z utils

/**
 * Szkielet logiki strony listy (CRUD + query + paginacja + CSV)
 *
 * @param {Object} cfg
 * @param {Array}  cfg.initialItems
 * @param {string} [cfg.idKey='id']
 * @param {Function} [cfg.makeId]
 * @param {Function} [cfg.validate]
 * @param {Function} [cfg.normalizeOnSave]
 * @param {Function} [cfg.labelForDelete]
 * @param {Array}    cfg.columns                 // definicje kolumn tabeli
 * @param {Function} cfg.getSearchFields         // (row) => string[] do wyszukiwarki
 * @param {Object}   [cfg.initialSort={ key:'date', direction:'desc' }]
 * @param {Object}   cfg.pagination              // { pageSize, searchParams, setSearchParams, param, scrollSelector, canonicalize }
 * @param {Object}   cfg.csv                     // { columns, filename, delimiter, includeHeader, addBOM, mapRow }
 */
export function useListPage({
	initialItems,
	idKey = 'id',
	makeId,
	validate,
	normalizeOnSave,
	labelForDelete,
	columns,
	getSearchFields,
	initialSort = { key: 'date', direction: 'desc' },
	pagination,
	csv,
}) {
	// ────────────────── CRUD
	const crud = useListCrud({
		initialItems,
		idKey,
		makeId,
		validate,
		normalizeOnSave,
		labelForDelete,
	})

	// ────────────────── QUERY (search + sort)
	const queryOpts = useMemo(() => ({ initialSort, getSearchFields }), [initialSort, getSearchFields])
	const query = useListQuery(crud.list, columns, queryOpts)

	// ────────────────── PAGINATION
	const paginationOpts = useMemo(() => pagination, [pagination])
	const page = useUrlPagination(query.filteredSorted, paginationOpts)

	// ────────────────── CSV (lazy columns/rows, mapRow opcjonalny)
	const csvRows = useMemo(
		() => (csv?.mapRow ? query.filteredSorted.map(csv.mapRow) : query.filteredSorted),
		[query.filteredSorted, csv]
	)

	const exportCSV = csv
		? useCsvExport({
				columns: () => csv.columns || [], // lazy → zawsze aktualne
				rows: () => csvRows, // lazy → zawsze aktualne
				filename: csv.filename,
				delimiter: csv.delimiter ?? ';',
				includeHeader: csv.includeHeader ?? true,
				addBOM: csv.addBOM ?? true,
		  })
		: useCallback(() => {}, [])

	// ────────────────── Row navigate props (z utils)
	// maker: (row) => rowNavigateProps(row.id, onNavigate)
	const makeRowNav = useCallback(
		maker => row => {
			if (!maker) return {}
			return maker(row)
		},
		[]
	)

	// Ułatwienie: gotowa fabryka używająca utils rowNavigateProps
	// Przykład użycia:
	//   const rowNav = rowNavigateFactory((row) => onNavigate(row.id))
	//   <tr {...rowNav(row)} />
	const rowNavigateFactory = useCallback(
		(onNavigateForRow, opts) => row => {
			if (!onNavigateForRow) return {}
			const handler = onNavigateForRow(row)
			// jeśli handler jest funkcją (np. (id) => navigate(`/x/${id}`))
			if (typeof handler === 'function') {
				const id = row?.[idKey]
				return makeRowNavigateProps(id, handler, opts)
			}
			// jeśli onNavigateForRow zwróci bezpośrednio propsy, po prostu je oddaj
			return handler || {}
		},
		[idKey]
	)

	return {
		crud, // list, form, modalOpen, openAdd, openEdit, closeModal, isEditing, askDelete, confirmDelete, cancelDelete, deleteLabel, save
		query, // searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted, total
		page, // pageCount, currentPage, visible, onPageChange, resetToFirstPage
		exportCSV,
		// prosty passthrough (zachowuję Twój oryginalny zwrot)
		rowNavigateProps: makeRowNav,
		// oraz wygodna fabryka propsów wykorzystująca utils rowNavigateProps:
		rowNavigateFactory,
	}
}

export default useListPage

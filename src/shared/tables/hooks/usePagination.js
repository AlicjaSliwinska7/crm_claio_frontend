// src/shared/tables/hooks/usePagination.js
import { useMemo, useCallback, useEffect } from 'react'
import { paginate, pageCountOf } from '../utils' // spójnie z beczką utils

/**
 * Paginacja zsynchronizowana z URL (?page=)
 *
 * @param {Array} items - pełna lista po filtrach/sorcie
 * @param {Object} options
 * @param {number} options.pageSize - rozmiar strony (domyślnie 50)
 * @param {URLSearchParams} options.searchParams - z useSearchParams()[0]
 * @param {Function} options.setSearchParams - z useSearchParams()[1]
 * @param {string} options.param - nazwa parametru w URL (domyślnie "page")
 * @param {string} options.scrollSelector - selektor do scrollowania na zmianę strony
 * @param {boolean} options.canonicalize - czy poprawiać URL gdy wyjdzie poza zakres
 */
export function useUrlPagination(
	items,
	{
		pageSize = 50,
		searchParams,
		setSearchParams,
		param = 'page',
		scrollSelector = '.table-container, .contact-list',
		canonicalize = true,
	} = {}
) {
	// defensywnie: zawsze pracuj na tablicy
	const list = Array.isArray(items) ? items : []

	const pageCount = useMemo(() => pageCountOf(list, pageSize), [list, pageSize])

	const rawFromUrl = searchParams?.get ? Number(searchParams.get(param) || 1) : 1
	const rawPage = Number.isFinite(rawFromUrl) ? rawFromUrl : 1
	const currentPage = Math.min(Math.max(1, rawPage), pageCount)

	// Widoczne elementy
	const visible = useMemo(() => paginate(list, currentPage, pageSize), [list, currentPage, pageSize])

	const onPageChange = useCallback(
		p => {
			if (!searchParams || !setSearchParams) return
			const next = new URLSearchParams(searchParams)
			if (p === 1) next.delete(param)
			else next.set(param, String(p))
			setSearchParams(next, { replace: false })

			const top =
				document.querySelector(scrollSelector) ||
				document.querySelector('.table-container') ||
				document.querySelector('.contact-list')

			if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' })
			else window.scrollTo({ top: 0, behavior: 'smooth' })
		},
		[searchParams, setSearchParams, param, scrollSelector]
	)

	const resetToFirstPage = useCallback(
		(replace = true) => {
			if (!searchParams || !setSearchParams) return
			const next = new URLSearchParams(searchParams)
			next.delete(param)
			setSearchParams(next, { replace })
		},
		[searchParams, setSearchParams, param]
	)

	// Opcjonalnie „kanonizuj” URL gdy jest poza zakresem (np. po skasowaniu rekordów)
	useEffect(() => {
		if (!canonicalize || !searchParams || !setSearchParams) return
		if (rawPage !== currentPage) {
			const next = new URLSearchParams(searchParams)
			if (currentPage === 1) next.delete(param)
			else next.set(param, String(currentPage))
			setSearchParams(next, { replace: true })
		}
	}, [canonicalize, rawPage, currentPage, searchParams, setSearchParams, param])

	return { pageCount, currentPage, visible, onPageChange, resetToFirstPage }
}

export default useUrlPagination

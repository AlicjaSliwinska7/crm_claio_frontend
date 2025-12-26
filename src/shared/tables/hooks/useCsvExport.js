// src/shared/tables/hooks/useCsvExport.js
import { useCallback } from 'react'
import { downloadCsv, csvFilename } from '../utils/csv' // lub: from '../utils'

/**
 * Hook do eksportu CSV.
 * columns / rows mogą być tablicą lub funkcją zwracającą tablicę (lazy).
 */
export function useCsvExport({ columns, rows, filename, delimiter = ';', includeHeader = true, addBOM = true }) {
	return useCallback(() => {
		const cols = typeof columns === 'function' ? columns() : columns || []
		const data = typeof rows === 'function' ? rows() : rows || []
		const name = filename || csvFilename('export')

		downloadCsv({
			filename: name,
			columns: cols,
			rows: data,
			delimiter,
			includeHeader,
			addBOM,
		})
	}, [columns, rows, filename, delimiter, includeHeader, addBOM])
}

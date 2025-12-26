// src/shared/tables/utils/csv.js

// Uwaga: robimy plik samowystarczalny, żeby uniknąć rozjazdów ścieżek.
// (Nie importujemy z ../../../utils/csv)

// Pomocnik do daty w nazwie pliku
import { formatDateISO } from '../../utils/formatters'

/**
 * Ucieczka znaków do CSV (separator domyślnie ';' – przyjazny dla Excela PL)
 */
export const escapeCsvCell = (v, delimiter = ';') => {
	const s = (v ?? '').toString()
	const mustQuote = s.includes(delimiter) || s.includes('\n') || s.includes('\r') || s.includes('"')
	if (!mustQuote) return s
	return `"${s.replace(/"/g, '""')}"`
}

/**
 * Bezpieczne pobranie wartości komórki:
 * - wspiera accessor (funkcja) lub key (string)
 */
const getCellValue = (row, col) => {
	if (!row || !col) return ''
	if (typeof col.accessor === 'function') {
		try {
			return col.accessor(row)
		} catch {
			return ''
		}
	}
	return row?.[col.key]
}

/**
 * Buduje treść CSV z danych.
 * @param {Object} cfg
 * @param {{key:string,label:string,accessor?:(row)=>any}[]} cfg.columns
 * @param {Array<Object>} cfg.rows
 * @param {string} [cfg.delimiter=';']
 * @param {boolean} [cfg.includeHeader=true]
 * @returns {string}
 */
export const toCsvString = ({ columns = [], rows = [], delimiter = ';', includeHeader = true }) => {
	const EOL = '\r\n' // lepsza kompatybilność z Excelem
	const head = includeHeader ? columns.map(c => escapeCsvCell(c.label ?? '', delimiter)).join(delimiter) : null

	const lines = rows.map(row => columns.map(c => escapeCsvCell(getCellValue(row, c), delimiter)).join(delimiter))

	return [head, ...lines].filter(Boolean).join(EOL)
}

/**
 * Generuje i pobiera CSV jako plik.
 * @param {Object} cfg
 * @param {string} cfg.filename
 * @param {{key:string,label:string,accessor?:(row)=>any}[]} cfg.columns
 * @param {Array<Object>} cfg.rows
 * @param {string} [cfg.delimiter=';']
 * @param {boolean} [cfg.includeHeader=true]
 * @param {boolean} [cfg.addBOM=true] - dodaj BOM dla Excela (UTF-8)
 */
export const downloadCsv = ({
	filename,
	columns = [],
	rows = [],
	delimiter = ';',
	includeHeader = true,
	addBOM = true,
}) => {
	const content = toCsvString({ columns, rows, delimiter, includeHeader })
	const prefix = addBOM ? '\uFEFF' : ''
	const blob = new Blob([prefix + content], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)

	const a = document.createElement('a')
	a.href = url
	a.download = filename || 'export.csv'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

/**
 * Standardowa nazwa pliku CSV dla widoków list/rejestrów.
 * Przykład: csvFilename('spotkania') -> "spotkania-YYYY-MM-DD.csv"
 */
export const csvFilename = (stem, { withDate = true } = {}) => {
	const dt = formatDateISO(new Date())
	return withDate ? `${stem}-${dt}.csv` : `${stem}.csv`
}

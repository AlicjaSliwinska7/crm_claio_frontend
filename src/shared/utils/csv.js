// src/shared/utils/csv.js

/**
 * Parsuje CSV do tablicy wierszy (tablicy stringów).
 * Obsługuje cudzysłowy i escapowanie podwójnym cudzysłowem.
 * `delimiter` wykrywa się automatycznie (',' albo ';'), można wymusić parametrem.
 */
export const parseCSV = (text, { delimiter } = {}) => {
	const src = String(text ?? '')
	const delim = delimiter || (src.indexOf(';') > -1 && src.indexOf(',') === -1 ? ';' : ',')
	const rows = []
	let row = []
	let val = ''
	let inQuotes = false

	for (let i = 0; i < src.length; i++) {
		const ch = src[i]
		const next = src[i + 1]

		if (inQuotes) {
			if (ch === '"' && next === '"') {
				val += '"' // escaped quote
				i++
			} else if (ch === '"') {
				inQuotes = false
			} else {
				val += ch
			}
			continue
		}

		if (ch === '"') {
			inQuotes = true
			continue
		}
		if (ch === delim) {
			row.push(val)
			val = ''
			continue
		}
		if (ch === '\n') {
			row.push(val)
			rows.push(row)
			row = []
			val = ''
			continue
		}
		if (ch === '\r') {
			continue
		} // CR (dla CRLF)

		val += ch
	}

	row.push(val)
	rows.push(row)
	return rows
}

// src/shared/tables/utils/search.js
import { joinArray } from '../../utils/formatters'

// Bezpieczna konwersja do stringa (dla liczb, dat, null/undefined)
const toSafeString = v => {
	if (v == null) return ''
	// Date → ISO (albo własny format, jeśli wolisz)
	if (v instanceof Date && !isNaN(v)) return v.toISOString()
	return String(v)
}

/**
 * Szybkie budowanie listy pól do przeszukiwania.
 * Użycie:
 *   const makeFields = makeSearchFields('name', 'email', 'tags[]', row => row.company?.name)
 *   const fields = makeFields(row) // => ['Ala', 'ala@x.pl', 'tag1; tag2', 'ACME']
 *
 * Konwencja:
 *   - 'key'       → row[key]
 *   - 'key[]'     → joinArray(row[key])  (np. tablica tagów do jednego stringa)
 *   - funkcja     → fn(row)
 */
export const makeSearchFields =
	(...fields) =>
	row =>
		fields.map(fnOrKey => {
			if (typeof fnOrKey === 'function') {
				return toSafeString(fnOrKey(row))
			}
			if (typeof fnOrKey === 'string') {
				if (fnOrKey.endsWith('[]')) {
					const key = fnOrKey.slice(0, -2)
					// joinArray powinien już zwrócić string; na wszelki wypadek obwijamy
					return toSafeString(joinArray(row?.[key]))
				}
				return toSafeString(row?.[fnOrKey])
			}
			// nieznany typ wpisu — zwróć pusty string, żeby nie psuć wyszukiwania
			return ''
		})

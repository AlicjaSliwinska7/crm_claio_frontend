// src/shared/tables/utils/records.js

/**
 * makeEmptyRecord
 * Fabryka „pustych” rekordów. Przyjmuje obiekt domyślny albo funkcję
 * (ctx) => defaults. Zwraca funkcję create(ctx), która zwraca świeżą kopię.
 *
 * API:
 *   const makeEmpty = makeEmptyRecord({ name:'', tags:[] })
 *   const draft = makeEmpty()
 *
 *   // lub z funkcją i kontekstem
 *   const makeEmpty = makeEmptyRecord(ctx => ({ addedBy: ctx.user, tags: [] }))
 *   const draft = makeEmpty({ user: 'Ala' })
 *
 * Opcje:
 *   { deep?: boolean } – gdy true, klonuje głębiej (structuredClone, jeśli dostępny).
 */
export function makeEmptyRecord(defaults, { deep = false } = {}) {
	const resolve = ctx => (typeof defaults === 'function' ? defaults(ctx) : defaults || {})

	// Płytki klon bez zaskoczeń (kopiuje tablice i obiekty 1-poziomowo, Date → nowy Date)
	const cloneShallow = v => {
		if (Array.isArray(v)) return v.slice()
		if (v instanceof Date) return new Date(v.getTime())
		if (v && typeof v === 'object') return { ...v }
		return v
	}

	// Głębszy klon – preferuj structuredClone, fallback rekurencyjny dla typów prostych
	const cloneDeep = v => {
		if (typeof structuredClone === 'function') {
			try {
				return structuredClone(v)
			} catch {
				/* fallback */
			}
		}
		if (Array.isArray(v)) return v.map(cloneDeep)
		if (v instanceof Date) return new Date(v.getTime())
		if (v && typeof v === 'object') {
			const o = {}
			for (const k of Object.keys(v)) o[k] = cloneDeep(v[k])
			return o
		}
		return v
	}

	const clone = deep ? cloneDeep : cloneShallow

	return function create(context = undefined) {
		const base = resolve(context) || {}
		const out = {}
		for (const k of Object.keys(base)) out[k] = clone(base[k])
		return out
	}
}

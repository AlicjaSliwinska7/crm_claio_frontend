// src/shared/utils/text.js

/** Zwraca string (bez null/undefined) i przycina białe znaki. */
export const trim = v => (v == null ? '' : String(v).trim())

/** Uppercase z bezpiecznym trimem. */
export const uppercase = v => trim(v).toUpperCase()

/** Slug: małe litery, bez diakrytyków, znaki nie-alfanum → '-' */
export const slugify = v =>
	trim(v)
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '') // usuń diakrytyki
		.replace(/[^a-z0-9]+/g, '-') // wszystko poza a-z0-9 → '-'
		.replace(/(^-|-$)/g, '') // bez wiodących/końcowych '-'

// src/shared/tables/utils/columns.js

const toPx = v => (typeof v === 'number' ? `${v}px` : v)

/**
 * Buduje obiekt style dla kolumny tabeli.
 * Obsługuje: width, minWidth, maxWidth, textAlign.
 */
export const getColStyle = (c = {}) => {
	const style = {}

	if (Object.prototype.hasOwnProperty.call(c, 'width') && c.width !== '' && c.width != null) {
		style.width = toPx(c.width)
	}
	if (Object.prototype.hasOwnProperty.call(c, 'minWidth') && c.minWidth !== '' && c.minWidth != null) {
		style.minWidth = toPx(c.minWidth)
	}
	if (Object.prototype.hasOwnProperty.call(c, 'maxWidth') && c.maxWidth !== '' && c.maxWidth != null) {
		style.maxWidth = toPx(c.maxWidth)
	}
	if (Object.prototype.hasOwnProperty.call(c, 'textAlign') && c.textAlign) {
		style.textAlign = c.textAlign
	}

	return style
}

/**
 * Syntactic sugar do definicji kolumn.
 * Domyślnie kolumna jest sortowalna — można nadpisać w opts.
 */
export const col = (key, label, opts = {}) => ({
	key,
	label,
	sortable: true,
	...opts,
})

/**
 * Buduje mapę typów do sortowania na podstawie tablicy kolumn.
 * Przydatne np. w SamplesDeliveryPickup.
 */
export const buildTypeMap = (columns = []) =>
	columns.reduce((acc, c) => {
		if (c && c.sortable) {
			acc[c.key] = { type: c.type || 'string' }
		}
		return acc
	}, {})

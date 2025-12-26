export const toStr = v => (v ?? '').toString()
export const todayISO = () => new Date().toISOString().slice(0, 10)

export const buildTypeMap = cols =>
	cols.reduce((acc, c) => {
		if (c.sortable) acc[c.key] = { type: c.type || 'string' }
		return acc
	}, {})

export const matchesQuery = (row, q) =>
	Object.values(row).some(v =>
		toStr(typeof v === 'object' ? JSON.stringify(v) : v)
			.toLowerCase()
			.includes(q)
	)

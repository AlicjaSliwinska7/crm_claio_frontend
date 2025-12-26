export const toStr = v => (v ?? '').toString()
export const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

export function buildStatusSummary(rows, knownStatuses, total) {
	const counts = new Map()
	const labels = new Map()

	for (const r of rows) {
		const raw = String(r.status ?? '').trim()
		const k = norm(raw)
		if (!k) continue
		labels.set(k, raw)
		counts.set(k, (counts.get(k) || 0) + 1)
	}

	const items = [['Wszystkie', total]]

	// najpierw znane statusy
	for (const s of knownStatuses) {
		const k = norm(s)
		const n = counts.get(k)
		if (n) {
			items.push([s, n])
			counts.delete(k)
		}
	}

	// reszta
	for (const [k, n] of counts) {
		if (n) items.push([labels.get(k) || k, n])
	}

	return items
}

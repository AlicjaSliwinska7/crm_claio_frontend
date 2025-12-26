// src/shared/summaries/utils/data.js
export const ensureArray = v => (Array.isArray(v) ? v : v ? [v] : [])

export const groupBy = (arr, keyFn) =>
	arr.reduce((m, x) => {
		const k = keyFn(x)
		// eslint-disable-next-line no-unused-expressions
		;(m[k] ||= []).push(x)
		return m
	}, {})

export const sumBy = (arr, vFn) =>
	arr.reduce((s, x) => {
		const n = Number(vFn(x))
		return s + (Number.isFinite(n) ? n : 0)
	}, 0)

export const topN = (entries, n, by = ([, v]) => v) =>
	[...entries]
		.sort((a, b) => {
			const av = Number(by(a))
			const bv = Number(by(b))
			return (Number.isFinite(bv) ? bv : 0) - (Number.isFinite(av) ? av : 0)
		})
		.slice(0, n)

export function toPercentShares(obj) {
	const vals = Object.values(obj).map(v => {
		const n = Number(v)
		return Number.isFinite(n) ? n : 0
	})
	const total = vals.reduce((a, b) => a + b, 0) || 1
	const out = {}
	let i = 0
	for (const k in obj) {
		const n = Number(vals[i++])
		out[k] = n / total
	}
	return out
}

export function mergeOthersBucket(row, keys, bucketLabel = 'Inne', topKeys = []) {
	let rest = 0
	for (const k of keys)
		if (!topKeys.includes(k)) {
			const n = Number(row[k])
			rest += Number.isFinite(n) ? n : 0
		}
	if (rest > 0) row[bucketLabel] = rest
	return row
	// alternatywa niemutująca:
	// return rest > 0 ? { ...row, [bucketLabel]: rest } : row
}

// Agregacja do szeregów czasowych po bucketach (day|week|month)
export function aggregateTimeSeries(
	series,
	{ dateKey = 'date', valueKey = 'value', granularity = 'month', bucketKeyByGranularity }
) {
	if (!series?.length || !bucketKeyByGranularity) return []
	const map = new Map()
	for (const e of series) {
		const key = bucketKeyByGranularity(e[dateKey], granularity)
		const vRaw = e?.[valueKey]
		const v = Number.isFinite(Number(vRaw)) ? Number(vRaw) : 0
		map.set(key, (map.get(key) || 0) + v)
	}
	return [...map.entries()]
		.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
		.map(([bucket, value]) => ({ bucket, value }))
}

// TOP-N po kluczu grupującym
export function topNByKey(series, { keyFn, valueKey = 'value', n = 15 }) {
	if (!series?.length || !keyFn) return []
	const m = new Map()
	for (const e of series) {
		const k = keyFn(e)
		const vRaw = e?.[valueKey]
		const v = Number.isFinite(Number(vRaw)) ? Number(vRaw) : 0
		m.set(k, (m.get(k) || 0) + v)
	}
	return [...m.entries()]
		.map(([key, value]) => ({ key, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, n)
}

export function buildClientsByMethods(
	series = [],
	{ metric = 'testsCount', methodKey = id => id, topClients = 50, topMethods = 5, otherLabel = 'Inne' } = {}
) {
	const byClient = new Map() // client -> Map(methodKey -> sum)
	for (const e of series) {
		const client = e?.client || '—'
		const mk = String(methodKey(e?.methodId ?? '') || '').trim()
		if (!mk) continue
		const vRaw = e?.[metric]
		const v = Number.isFinite(Number(vRaw)) ? Number(vRaw) : 0
		const mObj = byClient.get(client) || new Map()
		mObj.set(mk, (mObj.get(mk) || 0) + v)
		byClient.set(client, mObj)
	}

	const totals = [...byClient.entries()].map(([client, mObj]) => ({
		client,
		total: [...mObj.values()].reduce((a, b) => a + b, 0),
		mObj,
	}))

	const topClientsArr = totals.sort((a, b) => b.total - a.total).slice(0, topClients)

	const methodTotals = new Map()
	for (const t of topClientsArr) {
		for (const [m, v] of t.mObj.entries()) {
			methodTotals.set(m, (methodTotals.get(m) || 0) + v)
		}
	}
	const topMethodsArr = [...methodTotals.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, topMethods)
		.map(([m]) => m)

	const rows = topClientsArr.map(t => {
		const row = { client: t.client, total: t.total }
		let rest = 0
		for (const [m, v] of t.mObj.entries()) {
			if (topMethodsArr.includes(m)) row[m] = v
			else rest += v
		}
		if (rest > 0) row[otherLabel] = rest
		return row
	})

	return { rows, topMethods: topMethodsArr, otherLabel }
}

export function csvColumnsForClientsByMethods(topMethods = [], otherLabel = 'Inne') {
	return [
		{ key: 'client', label: 'Klient' },
		{ key: 'total', label: 'Łącznie' },
		...topMethods.map(m => ({ key: m, label: `Metoda ${m}` })),
		{ key: otherLabel, label: otherLabel },
	]
}

export function topMethodsForClient(seriesClient, { methodKey, metric = 'testsCount', n = 15 }) {
	if (!Array.isArray(seriesClient) || seriesClient.length === 0) return []
	const prepared = seriesClient.map(e => ({
		key: methodKey(e.methodId),
		value: Number(e?.[metric] || 0),
	}))
	return topNByKey(prepared, { keyFn: x => x.key, valueKey: 'value', n }).map(({ key, value }) => ({
		method: key,
		value,
	}))
}

export function normalizeKpiTotals(t = {}, { safeNum, fmtPLN }) {
	return {
		methods: safeNum(t.methods),
		tests: safeNum(t.tests),
		samples: safeNum(t.samples),
		revenue: fmtPLN ? fmtPLN(safeNum(t.revenue)) : safeNum(t.revenue),
		labor: fmtPLN ? fmtPLN(safeNum(t.labor)) : safeNum(t.labor),
		margin: fmtPLN ? fmtPLN(safeNum(t.margin)) : safeNum(t.margin),
		accCnt: safeNum(t.accCnt),
		tatWeighted: safeNum(t.tatWeighted),
		lastFrom: t.lastFrom ?? null,
		lastTo: t.lastTo ?? null,
	}
}

// src/shared/diagrams/summary/utils/data.js
export const ensureArray = (v) => (Array.isArray(v) ? v : v ? [v] : [])

export const groupBy = (arr, keyFn) =>
  arr.reduce((m, x) => {
    const k = keyFn(x)
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
  const vals = Object.values(obj).map((v) => {
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
}

export function aggregateTimeSeries(series, { dateKey = 'date', valueKey = 'value', granularity = 'month', bucketKeyByGranularity }) {
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

export function topNByKey(series, { key, valueKey = 'value', n = 8 }) {
  const map = new Map()
  for (const e of series || []) {
    const k = e?.[key]
    if (!k) continue
    const v = Number(e?.[valueKey]) || 0
    map.set(k, (map.get(k) || 0) + v)
  }
  return [...map.entries()].sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, n)
}
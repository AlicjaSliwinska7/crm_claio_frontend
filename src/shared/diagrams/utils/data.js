// src/shared/diagrams/utils/data.js
import { mainDateISO, monthKeyFromISO } from './time'

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

/**
 * ✅ withinRange(value, min, max)
 * - min/max mogą być ''/null/undefined → brak ograniczenia
 */
export function withinRange(value, min, max) {
  const v = Number(value)
  if (!Number.isFinite(v)) return false

  const hasMin = min !== '' && min != null
  const hasMax = max !== '' && max != null

  const mn = hasMin ? Number(min) : null
  const mx = hasMax ? Number(max) : null

  if (hasMin && Number.isFinite(mn) && v < mn) return false
  if (hasMax && Number.isFinite(mx) && v > mx) return false
  return true
}

/**
 * ✅ groupByKey(arr, keyFn) -> Map(key => rows), posortowane po key (PL)
 */
export function groupByKey(arr, keyFn) {
  const safe = Array.isArray(arr) ? arr : []
  const map = new Map()
  for (const x of safe) {
    const k = keyFn ? keyFn(x) : x?.key
    const kk = String(k ?? '—')
    if (!map.has(kk)) map.set(kk, [])
    map.get(kk).push(x)
  }
  return new Map([...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'pl')))
}

/**
 * ✅ buildChartData(rows, groupBy, seriesLimit)
 * - zwraca format dla wykresów stacked: { data: [{month, ...series}], keys: ['A','B',...], months: [...] }
 * - groupBy: 'byCode' | 'bySubject' | 'byClient'
 */
export function buildChartData(rows, groupBy = 'byCode', seriesLimit = 6) {
  const safe = Array.isArray(rows) ? rows : []

  const keyFn =
    typeof groupBy === 'function'
      ? groupBy
      : groupBy === 'byClient'
        ? (r) => r?.client || '—'
        : groupBy === 'bySubject'
          ? (r) => r?.subject || '—'
          : (r) => r?.code || '—'

  // month -> Map(series -> count)
  const monthMap = new Map()
  const totals = new Map()

  for (const r of safe) {
    const d = mainDateISO(r)
    const mk = monthKeyFromISO(d)
    if (!mk) continue

    const seriesKey = String(keyFn(r) ?? '—')
    if (!monthMap.has(mk)) monthMap.set(mk, new Map())
    const sm = monthMap.get(mk)
    sm.set(seriesKey, (sm.get(seriesKey) || 0) + 1)

    totals.set(seriesKey, (totals.get(seriesKey) || 0) + 1)
  }

  const months = [...monthMap.keys()].sort((a, b) => String(a).localeCompare(String(b)))
  if (!months.length) return { data: [], keys: [], months: [] }

  const sortedSeries = [...totals.entries()].sort((a, b) => (b[1] || 0) - (a[1] || 0))
  const topKeys = sortedSeries.slice(0, Math.max(1, Number(seriesLimit) || 6)).map(([k]) => k)

  const hasOthers = sortedSeries.length > topKeys.length
  const OTHER = 'Inne'
  const keys = hasOthers ? [...topKeys, OTHER] : [...topKeys]

  const data = months.map((m) => {
    const sm = monthMap.get(m) || new Map()
    const row = { month: m }

    let others = 0
    for (const [k, v] of sm.entries()) {
      if (topKeys.includes(k)) row[k] = v
      else others += v
    }
    for (const k of topKeys) if (row[k] == null) row[k] = 0
    if (hasOthers) row[OTHER] = others

    return row
  })

  return { data, keys, months }
}
// src/features/charts/hooks/useChartData.js
import { useMemo, useState } from 'react'
import { detectDelimiter, num, parseYList } from '../../../shared/diagrams/utils/lab'

export default function useChartData({ rows, colRoles, leftSeries, rightSeries }) {
  const [extendTail, setExtendTail] = useState(false)

  const xColSelected = useMemo(() => {
    return Object.keys(colRoles || {}).find((k) => colRoles[k] === 'x') || ''
  }, [colRoles])

  const dataFromTable = useMemo(() => {
    if (!xColSelected) return []
    const out = []
    for (const r of rows || []) {
      const x = num(r?.[xColSelected])
      if (!Number.isFinite(x)) continue
      out.push({ __x: x, __row: r })
    }
    out.sort((a, b) => a.__x - b.__x)
    return out
  }, [rows, xColSelected])

  const xSet = useMemo(() => dataFromTable.map((d) => d.__x), [dataFromTable])

  const rowByX = useMemo(() => {
    const m = new Map()
    dataFromTable.forEach((d) => m.set(d.__x, d.__row))
    return m
  }, [dataFromTable])

  const seriesAll = useMemo(() => {
    const fix = (s) => (s.mode === 'manual' ? { ...s, mode: 'manualPairs' } : s)
    return [...(leftSeries || []).map(fix), ...(rightSeries || []).map(fix)]
  }, [leftSeries, rightSeries])

  const manualPairsMaps = useMemo(() => {
    const detectPairs = (text) => {
      if (!text?.trim()) return []
      const delim = detectDelimiter(text)
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const pts = []
      for (const line of lines) {
        const [xs, ys] = line.split(delim)
        const xv = num(xs)
        const yv = num(ys)
        if (Number.isFinite(xv) && Number.isFinite(yv)) pts.push({ x: xv, y: yv })
      }
      pts.sort((a, b) => a.x - b.x)
      return pts
    }

    const m = new Map()
    seriesAll.forEach((s) => {
      if (s.mode === 'manualPairs') {
        const arr = detectPairs(s.valuesText || '')
        const mm = new Map()
        arr.forEach((p) => mm.set(p.x, p.y))
        m.set(s.id, mm)
      }
    })
    return m
  }, [seriesAll])

  const manualYArrays = useMemo(() => {
    const m = new Map()
    seriesAll.forEach((s) => {
      if (s.mode === 'manualY') m.set(s.id, parseYList(s.valuesYText || ''))
    })
    return m
  }, [seriesAll])

  const chartKeys = useMemo(() => {
    const keys = []
    for (const s of seriesAll) keys.push(s.mode === 'column' ? s.col : s.id)
    return keys
  }, [seriesAll])

  const chartData = useMemo(() => {
    if (!xSet.length) return []
    return xSet.map((x, idx) => {
      const obj = { __x: x }
      for (const s of seriesAll) {
        if (s.mode === 'column' && s.col) {
          const row = rowByX.get(x)
          const v = row ? row[s.col] : null
          const n = typeof v === 'number' ? v : num(v)
          obj[s.col] = Number.isFinite(n) ? n : null
        } else if (s.mode === 'manualPairs') {
          const map = manualPairsMaps.get(s.id)
          obj[s.id] = map?.get(x) ?? null
        } else if (s.mode === 'manualY') {
          const arr = manualYArrays.get(s.id) || []
          const y = arr[idx]
          obj[s.id] = Number.isFinite(y) ? y : null
        }
      }
      return obj
    })
  }, [xSet, seriesAll, rowByX, manualPairsMaps, manualYArrays])

  const renderData = useMemo(() => {
    if (!extendTail || chartData.length === 0) return chartData
    const keys = seriesAll.map((s) => (s.mode === 'column' ? s.col : s.id))
    const out = chartData.map((r) => ({ ...r }))
    const n = out.length
    keys.forEach((key) => {
      let lastIdx = -1
      let lastVal = null
      for (let i = 0; i < n; i++) {
        const v = out[i][key]
        if (Number.isFinite(v)) {
          lastIdx = i
          lastVal = v
        }
      }
      if (lastIdx >= 0 && lastIdx < n - 1) for (let i = lastIdx + 1; i < n; i++) out[i][key] = lastVal
    })
    return out
  }, [extendTail, chartData, seriesAll])

  return {
    xColSelected,
    chartData,
    renderData,
    chartKeys,
    xSet,
    seriesAll,
    manualPairsMaps,
    manualYArrays,
    extendTail,
    setExtendTail,
  }
}
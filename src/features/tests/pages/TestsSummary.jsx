// src/features/tests/pages/TestsSummary.jsx
import React, { useMemo, useState, useCallback } from 'react'

import '../styles/tests-summary.css'

import { SummaryPage } from '../../../shared/summaries'
import { buildTestsSummaryConfig } from '../config/testsSummary.config'

// DEMO
import { DEMO_METHODS, DEMO_EXECUTIONS } from '../mocks/testsSummary.mock'

const iso10 = (v) => (v ? String(v).slice(0, 10) : '')
const isISO10 = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))

const fmtPLN = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n)
}

function presetToRange(preset) {
  const today = new Date()
  const to = iso10(today)

  if (preset === 'all') return { from: '', to: '' }
  if (preset === 'custom') return { from: '', to: '' } // custom trzymamy w stanie

  const d = new Date(today)
  if (preset === 'year') d.setFullYear(d.getFullYear() - 1)
  else if (preset === 'quarter') d.setDate(d.getDate() - 90)
  else d.setDate(d.getDate() - 30)

  return { from: iso10(d), to }
}

export default function TestsSummary({ methods = DEMO_METHODS, executions = DEMO_EXECUTIONS }) {
  // ===== filtry “główne”
  const [filter, setFilter] = useState('')
  const [accrFilter, setAccrFilter] = useState('wszystkie') // wszystkie | akredytowane | nieakredytowane

  const [rangePreset, setRangePreset] = useState('year') // all | year | quarter | month | custom
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // ===== tabela
  const [sortField, setSortField] = useState('testsCount')
  const [sortAsc, setSortAsc] = useState(false)
  const [mPage, setMPage] = useState(1)
  const [mPageSize, setMPageSize] = useState(10)

  const safeMethods = useMemo(() => (Array.isArray(methods) ? methods : []), [methods])
  const safeExecutions = useMemo(() => (Array.isArray(executions) ? executions : []), [executions])

  // zakres dat efektywny
  const effectiveRange = useMemo(() => {
    if (rangePreset === 'custom') {
      return { from: isISO10(from) ? from : '', to: isISO10(to) ? to : '' }
    }
    return presetToRange(rangePreset)
  }, [rangePreset, from, to])

  // series po filtrze dat
  const series = useMemo(() => {
    const { from: f, to: t } = effectiveRange
    if (!f && !t) return safeExecutions

    return safeExecutions.filter((e) => {
      const d = iso10(e?.date)
      if (!d) return false
      if (f && d < f) return false
      if (t && d > t) return false
      return true
    })
  }, [safeExecutions, effectiveRange])

  const methodById = useMemo(() => {
    const m = new Map()
    for (const x of safeMethods) if (x?.id) m.set(x.id, x)
    return m
  }, [safeMethods])

  const idByMethodNo = useMemo(() => {
    const m = new Map()
    for (const x of safeMethods) if (x?.methodNo) m.set(String(x.methodNo), x.id)
    return m
  }, [safeMethods])

  const methodKey = useCallback(
    (methodId) => {
      const m = methodById.get(methodId)
      return m?.methodNo ? `${m.methodNo}` : m?.methodName || methodId || '—'
    },
    [methodById]
  )

  // agregacja executions → per methodId
  const rows = useMemo(() => {
    const agg = new Map()
    for (const e of series) {
      const id = e?.methodId
      if (!id) continue

      const prev = agg.get(id) || {
        testsCount: 0,
        samplesCount: 0,
        revenue: 0,
        laborCost: 0,
        lastPerformedDate: '',
      }

      prev.testsCount += Number(e?.testsCount) || 0
      prev.samplesCount += Number(e?.samplesCount) || 0
      prev.revenue += Number(e?.revenue) || 0
      prev.laborCost += Number(e?.laborCost) || 0

      const d = iso10(e?.date)
      if (d && (!prev.lastPerformedDate || d > prev.lastPerformedDate)) prev.lastPerformedDate = d

      agg.set(id, prev)
    }

    return safeMethods.map((m) => {
      const a = agg.get(m.id) || {}
      return {
        id: m.id,
        standard: m.standard || '—',
        methodNo: m.methodNo || '—',
        methodName: m.methodName || '—',
        accredited: !!m.accredited,

        testsCount: a.testsCount ?? 0,
        samplesCount: a.samplesCount ?? 0,
        lastPerformedDate: a.lastPerformedDate || '—',

        avgTATDays: m?.avgTATDays ?? null,

        revenue: a.revenue ?? 0,
        laborCost: a.laborCost ?? 0,
      }
    })
  }, [safeMethods, series])

  // filtrowanie tabeli (tekst + akredytacja)
  const filteredMethods = useMemo(() => {
    const q = String(filter || '').trim().toLowerCase()
    return rows.filter((r) => {
      if (q) {
        const hay = `${r.standard} ${r.methodNo} ${r.methodName}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (accrFilter === 'akredytowane' && !r.accredited) return false
      if (accrFilter === 'nieakredytowane' && r.accredited) return false
      return true
    })
  }, [rows, filter, accrFilter])

  // KPI w formacie, którego oczekuje KPIs.jsx
  const totals = useMemo(() => {
    const methodsCnt = rows.length
    const accCnt = rows.filter((r) => r.accredited).length
    const nonAcc = methodsCnt - accCnt

    const tests = rows.reduce((s, r) => s + (Number(r.testsCount) || 0), 0)
    const samples = rows.reduce((s, r) => s + (Number(r.samplesCount) || 0), 0)

    const revenue = rows.reduce((s, r) => s + (Number(r.revenue) || 0), 0)
    const labor = rows.reduce((s, r) => s + (Number(r.laborCost) || 0), 0)
    const margin = revenue - labor

    // lastFrom/lastTo z executions w aktualnym zakresie
    const dates = series.map((e) => iso10(e?.date)).filter(Boolean).sort()
    const lastFrom = dates[0] || ''
    const lastTo = dates[dates.length - 1] || ''

    // tatWeighted – jeśli nie masz w executions, robimy proxy z metod avgTATDays ważone liczbą badań
    let tatWeighted = null
    const wSum = rows.reduce((s, r) => s + (Number(r.testsCount) || 0), 0)
    if (wSum > 0) {
      const t = rows.reduce((s, r) => {
        const tat = Number(r.avgTATDays)
        const w = Number(r.testsCount) || 0
        if (!Number.isFinite(tat) || w <= 0) return s
        return s + tat * w
      }, 0)
      tatWeighted = t / wSum
    }

    // months – przybliżenie z zakresu dat
    const months = lastFrom && lastTo ? Math.max(1, (Number(lastTo.slice(5, 7)) - Number(lastFrom.slice(5, 7)) + 1)) : 0

    return {
      methods: methodsCnt,
      accCnt,
      nonAcc,
      tests,
      samples,
      revenue,
      labor,
      margin,
      lastFrom,
      lastTo,
      tatWeighted,
      months,
    }
  }, [rows, series])

  const onResetFilters = useCallback(() => {
    setFilter('')
    setAccrFilter('wszystkie')
    setRangePreset('year')
    setFrom('')
    setTo('')
    setMPage(1)
  }, [])

  const ctx = useMemo(
    () => ({
      // totals & format
      totals,
      fmtPLN,

      // data
      rows,
      filteredMethods,
      series,

      // filters
      filter,
      setFilter,
      accrFilter,
      setAccrFilter,
      rangePreset,
      setRangePreset,
      from,
      setFrom,
      to,
      setTo,
      onResetFilters,

      // table controls
      sortField,
      setSortField,
      sortAsc,
      setSortAsc,
      mPage,
      setMPage,
      mPageSize,
      setMPageSize,

      // helpers
      methodKey,
      methodById,
      idByMethodNo,
    }),
    [
      totals,
      rows,
      filteredMethods,
      series,
      filter,
      accrFilter,
      rangePreset,
      from,
      to,
      sortField,
      sortAsc,
      mPage,
      mPageSize,
      methodKey,
      methodById,
      idByMethodNo,
      onResetFilters,
    ]
  )

  const config = useMemo(() => buildTestsSummaryConfig(ctx), [ctx])

  return <SummaryPage config={config} />
}
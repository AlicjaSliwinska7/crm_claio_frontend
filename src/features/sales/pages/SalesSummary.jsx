// src/components/pages/contents/SalesSummary.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
  isAfter,
  isBefore,
  format,
  getYear,
  differenceInCalendarDays,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts'
import { Download, Printer, RefreshCcw, AlertTriangle } from 'lucide-react'
import Pager from '../../../shared/reports/components/Pager'
import SummaryInline from '../../../shared/reports/components/SummaryInline'
import useCompareConfig from '../../../shared/reports/hooks/useCompareConfig'
import { useSalesCsvExport } from '../../../shared/reports/hooks/useCsvExport'
import '../styles/sales-summary.css'

// ── paleta kolorów
const COLORS = {
  revenue: '#2563eb',
  pipeline: '#0ea5e9',
  won: '#16a34a',
  cmpA: '#7c3aed',
  cmpB: '#f59e0b',
  prev: '#6b7280',
  stages: {
    'Czeka na przyjęcie': '#64748b',
    'W trakcie realizacji': '#3b82f6',
    'Tworzenie raportu': '#8b5cf6',
    'Oczekuje na zapłatę': '#f59e0b',
    Zakończono: '#16a34a',
    Rezygnacja: '#ef4444',
    Inne: '#94a3b8',
  },
}

// ── helpers
const moneyToNumber = val => {
  if (val == null) return 0
  const cleaned = String(val).replace(/[^\d,.-]/g, '').replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}
const dateSafe = d => {
  if (!d) return null
  if (d instanceof Date) return d
  try { return parseISO(d) } catch { return null }
}
const monthKey = d => format(d, 'yyyy-MM')
const monthLabel = k => {
  const [y, m] = k.split('-').map(Number)
  const d = parseISO(`${y}-${String(m).padStart(2, '0')}-01`)
  return format(d, 'MMM yyyy', { locale: pl })
}
const unique = arr => Array.from(new Set(arr))
const currency = n => (n || 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })

function normalizeStage(raw) {
  const s = String(raw || '').toLowerCase()
  if (s.includes('przyję') || s.includes('przyjec') || s.includes('czeka na przy')) return 'Czeka na przyjęcie'
  if (s.includes('w trakcie realiz')) return 'W trakcie realizacji'
  if (s.includes('raport')) return 'Tworzenie raportu'
  if (s.includes('zapłat') || s.includes('zapl')) return 'Oczekuje na zapłatę'
  if (s.includes('zakoń') || s.includes('zakon')) return 'Zakończono'
  if (s.includes('rezygn')) return 'Rezygnacja'
  return 'Inne'
}
const STAGE_BUCKETS = [
  'Czeka na przyjęcie',
  'W trakcie realizacji',
  'Tworzenie raportu',
  'Oczekuje na zapłatę',
  'Zakończono',
  'Rezygnacja',
  'Inne',
]

export default function SalesSummary({ ordersRegister = [], offers = [] }) {
  const today = new Date()
  const { rangeFromConfig, prevRange } = useCompareConfig()

  // główny zakres
  const [mode, setMode] = useState('YTD')
  const [from, setFrom] = useState(startOfYear(today))
  const [to, setTo] = useState(endOfYear(today))

  // opcje (toolbar)
  const [onlyFinishedOrders, setOnlyFinishedOrders] = useState(false)
  const [showBarLabels, setShowBarLabels] = useState(false)

  // wykres etapów
  const [stageMetric] = useState('count') // zostawiamy jako 'count' (UI do przełączania wycięty)

  // legenda mini
  const [legendCurrentMonthOnly] = useState(false)

  // porównania A/B
  const [cmpAEnabled, setCmpAEnabled] = useState(true)
  const [cmpAType, setCmpAType] = useState('year') // 'year' | 'quarter' | 'month' | 'custom'
  const [cmpAYear, setCmpAYear] = useState(getYear(today) - 1)
  const [cmpAQuarter, setCmpAQuarter] = useState(1)
  const [cmpAMonthISO, setCmpAMonthISO] = useState(format(today, 'yyyy-MM'))
  const [cmpAFrom, setCmpAFrom] = useState(startOfYear(today))
  const [cmpATo, setCmpATo] = useState(endOfYear(today))

  const [cmpBEnabled, setCmpBEnabled] = useState(false)
  const [cmpBType, setCmpBType] = useState('quarter')
  const [cmpBYear, setCmpBYear] = useState(getYear(today))
  const [cmpBQuarter, setCmpBQuarter] = useState(1)
  const [cmpBMonthISO, setCmpBMonthISO] = useState(format(today, 'yyyy-MM'))
  const [cmpBFrom, setCmpBFrom] = useState(startOfMonth(today))
  const [cmpBTo, setCmpBTo] = useState(endOfMonth(today))

  // porównanie C
  const [cmpPrevEnabled, setCmpPrevEnabled] = useState(false)

  // mini-filtry tabeli porównawczej
  const [showSalesCols, setShowSalesCols] = useState(true)
  const [showOfferCols, setShowOfferCols] = useState(true)

  // PAGINACJA tabeli
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const pageSizeOptions = [6, 12, 24, 36]

  const setPreset = p => {
    setMode(p)
    const now = new Date()
    if (p === 'MTD') {
      setFrom(startOfMonth(now)); setTo(endOfMonth(now))
    } else if (p === 'QTD') {
      setFrom(startOfQuarter(now)); setTo(endOfQuarter(now))
    } else if (p === 'YTD') {
      setFrom(startOfYear(now)); setTo(endOfYear(now))
    } else if (p === 'FULL') {
      const dates = [
        ...ordersRegister.map(o => dateSafe(o.receivedDate)).filter(Boolean),
        ...offers.map(o => dateSafe(o.createDate)).filter(Boolean),
      ].sort((a, b) => a - b)
      setFrom(dates[0] ?? startOfYear(now))
      setTo(dates[dates.length - 1] ?? endOfYear(now))
    }
  }

  const inRange = (d, lo = from, hi = to) => {
    const dt = dateSafe(d)
    if (!dt) return false
    return !isBefore(dt, lo) && !isAfter(dt, hi)
  }

  const yearOptions = useMemo(() => {
    const all = [
      ...ordersRegister.map(o => getYear(dateSafe(o.receivedDate) || today)),
      ...offers.map(o => getYear(dateSafe(o.createDate) || today)),
    ].filter(Boolean)
    return unique(all).sort((a, b) => a - b)
  }, [ordersRegister, offers])

  // ── agregacje główne
  const aggregated = useMemo(() => {
    // Orders
    const ordersFiltered = ordersRegister
      .filter(o => inRange(o.receivedDate))
      .filter(o =>
        onlyFinishedOrders
          ? String(o.stage || '').toLowerCase().includes('zakoń')
          : true
      )

    const ordersByMonth = new Map()
    let revenueTotal = 0
    for (const o of ordersFiltered) {
      const d = dateSafe(o.receivedDate)
      if (!d) continue
      const k = monthKey(d)
      const v = moneyToNumber(o.price)
      revenueTotal += v
      ordersByMonth.set(k, (ordersByMonth.get(k) || 0) + v)
    }

    // Offers
    const offersFiltered = offers.filter(o => inRange(o.createDate))
    const pipelineStatuses = new Set(['w przygotowaniu', 'wysłana', 'wyslana'])
    const wonStatuses = new Set(['przyjęta', 'przyjeta', 'zaakceptowana'])

    let pipelineTotal = 0, wonTotal = 0
    const pipeByMonth = new Map(), wonByMonth = new Map()

    for (const ofr of offersFiltered) {
      const d = dateSafe(ofr.createDate)
      if (!d) continue
      const k = monthKey(d)
      const amt = moneyToNumber(ofr.amount)
      const st = String(ofr.status || '').toLowerCase()
      if (pipelineStatuses.has(st)) {
        pipelineTotal += amt
        pipeByMonth.set(k, (pipeByMonth.get(k) || 0) + amt)
      }
      if (wonStatuses.has(st)) {
        wonTotal += amt
        wonByMonth.set(k, (wonByMonth.get(k) || 0) + amt)
      }
    }

    const ordersCount = ordersFiltered.length
    const avgOrder = ordersCount ? revenueTotal / ordersCount : 0
    const sentOffers = offersFiltered.filter(o =>
      ['wysłana', 'wyslana', 'w przygotowaniu', 'przyjęta', 'przyjeta', 'zaakceptowana']
        .includes(String(o.status || '').toLowerCase())
    )
    const wonOffers = offersFiltered.filter(o =>
      ['przyjęta', 'przyjeta', 'zaakceptowana'].includes(String(o.status || '').toLowerCase())
    )
    const winRate = sentOffers.length ? wonOffers.length / sentOffers.length : 0

    const months = []
    const iter = new Date(startOfMonth(from))
    while (!isAfter(iter, to)) {
      months.push(monthKey(iter))
      iter.setMonth(iter.getMonth() + 1)
    }

    const salesSeries = months.map(k => ({
      month: monthLabel(k),
      revenue: +(ordersByMonth.get(k) || 0).toFixed(2),
    }))

    const offersSeries = months.map(k => ({
      month: monthLabel(k),
      pipeline: +(pipeByMonth.get(k) || 0).toFixed(2),
      won: +(wonByMonth.get(k) || 0).toFixed(2),
    }))

    const byClient = new Map()
    for (const o of ordersFiltered) {
      const v = moneyToNumber(o.price)
      const c = o.client || '—'
      byClient.set(c, (byClient.get(c) || 0) + v)
    }
    const topClients = [...byClient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([client, value]) => ({ client, value }))

    return {
      salesSeries, revenueTotal, ordersCount, avgOrder,
      offersSeries, pipelineTotal, wonTotal, winRate,
      months, ordersFiltered, topClients,
    }
  }, [ordersRegister, offers, from, to, onlyFinishedOrders])

  // ── Etapy zleceń (stacked)
  const stageStack = useMemo(() => {
    const monthBuckets = new Map()
    for (const k of aggregated.months) monthBuckets.set(k, Object.fromEntries(STAGE_BUCKETS.map(s => [s, 0])))

    for (const o of ordersRegister) {
      const d = dateSafe(o.receivedDate)
      if (!d) continue
      const k = monthKey(d)
      if (!monthBuckets.has(k)) continue
      const stage = normalizeStage(o.stage)
      const inc = stageMetric === 'count' ? 1 : moneyToNumber(o.price)
      monthBuckets.get(k)[stage] += inc
    }

    return aggregated.months.map(k => {
      const row = { month: monthLabel(k), ...monthBuckets.get(k) }
      row.__total = STAGE_BUCKETS.reduce((sum, s) => sum + (row[s] || 0), 0)
      return row
    })
  }, [ordersRegister, aggregated.months, stageMetric])

  // ── mini-legenda: udziały %
  const stageShares = useMemo(() => {
    const todayKey = monthKey(today)
    const useMonthKey = legendCurrentMonthOnly
      ? (aggregated.months.includes(todayKey) ? todayKey : aggregated.months[aggregated.months.length - 1] || null)
      : null

    const totals = Object.fromEntries(STAGE_BUCKETS.map(s => [s, 0]))
    for (const o of aggregated.ordersFiltered) {
      const d = dateSafe(o.receivedDate)
      if (!d) continue
      const k = monthKey(d)
      if (useMonthKey && k !== useMonthKey) continue
      const stage = normalizeStage(o.stage)
      const inc = stageMetric === 'count' ? 1 : moneyToNumber(o.price)
      totals[stage] += inc
    }
    const s = Object.values(totals).reduce((a, b) => a + b, 0) || 1
    return STAGE_BUCKETS.map(st => ({ stage: st, pct: (totals[st] / s) * 100 }))
  }, [aggregated.ordersFiltered, stageMetric, legendCurrentMonthOnly, aggregated.months, today])

  // ── porównania (A/B/prev)
  const buildSeries = (fromCmp, toCmp, type) => {
    const months = []
    const iter = new Date(startOfMonth(fromCmp))
    while (!isAfter(iter, toCmp)) {
      months.push(monthKey(iter)); iter.setMonth(iter.getMonth() + 1)
    }

    if (type === 'sales') {
      const mapRevenue = new Map()
      for (const o of ordersRegister) {
        if (!inRange(o.receivedDate, fromCmp, toCmp)) continue
        const d = dateSafe(o.receivedDate); if (!d) continue
        const k = monthKey(d)
        mapRevenue.set(k, (mapRevenue.get(k) || 0) + moneyToNumber(o.price))
      }
      return months.map(k => ({ month: monthLabel(k), revenue: +(mapRevenue.get(k) || 0).toFixed(2) }))
    }

    const pipeSet = new Set(['w przygotowaniu', 'wysłana', 'wyslana'])
    const wonSet = new Set(['przyjęta', 'przyjeta', 'zaakceptowana'])
    const mapPipe = new Map(), mapWon = new Map()
    for (const ofr of offers) {
      if (!inRange(ofr.createDate, fromCmp, toCmp)) continue
      const d = dateSafe(ofr.createDate); if (!d) continue
      const k = monthKey(d)
      const amt = moneyToNumber(ofr.amount)
      const st = String(ofr.status || '').toLowerCase()
      if (pipeSet.has(st)) mapPipe.set(k, (mapPipe.get(k) || 0) + amt)
      if (wonSet.has(st)) mapWon.set(k, (mapWon.get(k) || 0) + amt)
    }
    return months.map(k => ({
      month: monthLabel(k),
      pipeline: +(mapPipe.get(k) || 0).toFixed(2),
      won: +(mapWon.get(k) || 0).toFixed(2),
    }))
  }

  const compareSalesA = useMemo(() => {
    if (!cmpAEnabled) return null
    const cfg = rangeFromConfig(cmpAType, cmpAYear, cmpAQuarter, cmpAMonthISO, cmpAFrom, cmpATo)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'sales') }
  }, [cmpAEnabled, cmpAType, cmpAYear, cmpAQuarter, cmpAMonthISO, cmpAFrom, cmpATo, ordersRegister])

  const compareSalesB = useMemo(() => {
    if (!cmpBEnabled) return null
    const cfg = rangeFromConfig(cmpBType, cmpBYear, cmpBQuarter, cmpBMonthISO, cmpBFrom, cmpBTo)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'sales') }
  }, [cmpBEnabled, cmpBType, cmpBYear, cmpBQuarter, cmpBMonthISO, cmpBFrom, cmpBTo, ordersRegister])

  const compareSalesPrev = useMemo(() => {
    if (!cmpPrevEnabled) return null
    const cfg = prevRange(from, to)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'sales') }
  }, [cmpPrevEnabled, from, to, ordersRegister, prevRange])

  const compareOffersA = useMemo(() => {
    if (!cmpAEnabled) return null
    const cfg = rangeFromConfig(cmpAType, cmpAYear, cmpAQuarter, cmpAMonthISO, cmpAFrom, cmpATo)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'offers') }
  }, [cmpAEnabled, cmpAType, cmpAYear, cmpAQuarter, cmpAMonthISO, cmpAFrom, cmpATo, offers])

  const compareOffersB = useMemo(() => {
    if (!cmpBEnabled) return null
    const cfg = rangeFromConfig(cmpBType, cmpBYear, cmpBQuarter, cmpBMonthISO, cmpBFrom, cmpBTo)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'offers') }
  }, [cmpBEnabled, cmpBType, cmpBYear, cmpBQuarter, cmpBMonthISO, cmpBFrom, cmpBTo, offers])

  const compareOffersPrev = useMemo(() => {
    if (!cmpPrevEnabled) return null
    const cfg = prevRange(from, to)
    return { label: cfg.label, data: buildSeries(cfg.from, cfg.to, 'offers') }
  }, [cmpPrevEnabled, from, to, offers, prevRange])

  // ── alerty ofert
  const alerts = useMemo(() => {
    const now = new Date()
    const won = new Set(['przyjęta', 'przyjeta', 'zaakceptowana'])
    const rejected = new Set(['odrzucona', 'wygasła', 'wygasla', 'anulowana'])
    const inPipeline = st => {
      const s = String(st || '').toLowerCase()
      return !won.has(s) && !rejected.has(s)
    }

    const expiringSoon = [], overdue = []
    for (const ofr of offers) {
      const exp = dateSafe(ofr.expiryDate)
      if (!exp) continue
      const days = differenceInCalendarDays(exp, now)
      const status = String(ofr.status || '').toLowerCase()
      if (inPipeline(status) && days >= 0 && days <= 7) expiringSoon.push({ ...ofr, daysLeft: days })
      if (inPipeline(status) && days < 0) overdue.push({ ...ofr, daysLate: Math.abs(days) })
    }
    expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft)
    overdue.sort((a, b) => b.daysLate - a.daysLate)
    return { expiringSoon, overdue }
  }, [offers])

  // ── eksport CSV (hook specjalizowany)
  const exportCSV = useSalesCsvExport({ aggregated, from, to, monthLabel, filenamePrefix: 'zestawienia_sprzedaz' })

  // ── summary helpers
  const sum = arr => arr.reduce((a, b) => a + (b || 0), 0)
  const pct = n => `${(n * 100).toFixed(1)}%`
  const safeDeltaPct = (base, cmp) => {
    const b = Number(base) || 0
    const c = Number(cmp) || 0
    if (b === 0 && c === 0) return 0
    if (b === 0) return 100
    return ((c - b) / b) * 100
  }
  const pctStr = p => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`

  // values for summary
  const monthsCount = aggregated.months.length || 1
  const salesBaseTotal = useMemo(() => sum(aggregated.salesSeries.map(r => r.revenue)), [aggregated.salesSeries])
  const offersPipeBaseTotal = useMemo(() => sum(aggregated.offersSeries.map(r => r.pipeline)), [aggregated.offersSeries])
  const offersWonBaseTotal = useMemo(() => sum(aggregated.offersSeries.map(r => r.won)), [aggregated.offersSeries])

  const salesATotal  = useMemo(() => sum(compareSalesA?.data?.map(r => r.revenue) || []), [compareSalesA])
  const salesBTotal  = useMemo(() => sum(compareSalesB?.data?.map(r => r.revenue) || []), [compareSalesB])
  const salesCTotal  = useMemo(() => sum(compareSalesPrev?.data?.map(r => r.revenue) || []), [compareSalesPrev])

  const pipeATotal   = useMemo(() => sum(compareOffersA?.data?.map(r => r.pipeline) || []), [compareOffersA])
  const pipeBTotal   = useMemo(() => sum(compareOffersB?.data?.map(r => r.pipeline) || []), [compareOffersB])
  const pipeCTotal   = useMemo(() => sum(compareOffersPrev?.data?.map(r => r.pipeline) || []), [compareOffersPrev])

  const wonATotal    = useMemo(() => sum(compareOffersA?.data?.map(r => r.won) || []), [compareOffersA])
  const wonBTotal    = useMemo(() => sum(compareOffersB?.data?.map(r => r.won) || []), [compareOffersB])
  const wonCTotal    = useMemo(() => sum(compareOffersPrev?.data?.map(r => r.won) || []), [compareOffersPrev])

  const summaryStats = useMemo(() => {
    const months = aggregated.months.length || 0
    const orders = aggregated.ordersCount || 0
    const revenueFmt = currency(aggregated.revenueTotal || 0)
    const avgOrderFmt = currency(aggregated.avgOrder || 0)
    const pipelineFmt = currency(aggregated.pipelineTotal || 0)
    const wonFmt = currency(aggregated.wonTotal || 0)
    const winRateFmt = `${((aggregated.winRate || 0) * 100).toFixed(1)}%`
    return { months, orders, revenueFmt, avgOrderFmt, pipelineFmt, wonFmt, winRateFmt }
  }, [aggregated.months, aggregated.ordersCount, aggregated.revenueTotal, aggregated.avgOrder, aggregated.pipelineTotal, aggregated.wonTotal, aggregated.winRate])

  // --- Paginacja
  const totalRows = aggregated.months.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const startIdx = (page - 1) * pageSize
  const endIdx = Math.min(totalRows, startIdx + pageSize)
  const visibleMonths = aggregated.months.slice(startIdx, endIdx)

  const onPageSizeChange = e => {
    const v = Number(e.target.value) || pageSize
    setPageSize(v); setPage(1)
  }

  return (
    <div className='sales-summary'>
      {/* TOOLBAR (globalny) */}
      <header className='ss__head'>
        <div className='ss__toolbar'>
          <div className='ss-seg'>
            <button className={mode === 'MTD' ? 'is-active' : ''} onClick={() => setPreset('MTD')}>MTD</button>
            <button className={mode === 'QTD' ? 'is-active' : ''} onClick={() => setPreset('QTD')}>QTD</button>
            <button className={mode === 'YTD' ? 'is-active' : ''} onClick={() => setPreset('YTD')}>YTD</button>
            <button className={mode === 'FULL' ? 'is-active' : ''} onClick={() => setPreset('FULL')}>Pełny zakres</button>
            <button className={mode === 'CUSTOM' ? 'is-active' : ''} onClick={() => setMode('CUSTOM')}>Niestandardowy</button>
          </div>

          {mode === 'CUSTOM' && (
            <div className='ss-range'>
              <label>
                Od:
                <input
                  className='ss-input ss-input--date'
                  type='date'
                  value={format(from, 'yyyy-MM-dd')}
                  onChange={e => setFrom(startOfMonth(parseISO(e.target.value)))}
                />
              </label>
              <label>
                Do:
                <input
                  className='ss-input ss-input--date'
                  type='date'
                  value={format(to, 'yyyy-MM-dd')}
                  onChange={e => setTo(endOfMonth(parseISO(e.target.value)))}
                />
              </label>
            </div>
          )}

          <div className='ss-toggles'>
            <label className='ss-chk'>
              <input
                type='checkbox'
                checked={onlyFinishedOrders}
                onChange={e => setOnlyFinishedOrders(e.target.checked)}
              />
              <span>Tylko zlecenia zakończone</span>
            </label>
            <label className='ss-chk'>
              <input type='checkbox' checked={showBarLabels} onChange={e => setShowBarLabels(e.target.checked)} />
              <span>Wartości nad słupkami</span>
            </label>
          </div>

          <div className='ss-actions'>
            <button className='ss-btn ss-btn--ghost' onClick={exportCSV} title='Eksport CSV'>
              <Download size={16} />
            </button>
            <button className='ss-btn ss-btn--ghost' onClick={() => window.print()} title='Drukuj'>
              <Printer size={16} />
            </button>
            <button className='ss-btn ss-btn--ghost' onClick={() => setPreset(mode)} title='Odśwież'>
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* PODSUMOWANIE */}
      <SummaryInline stats={summaryStats} />

      {/* 1) SPRZEDAŻ */}
      <section className='ss__kpis'>
        <div className='kpi'>
          <div className='kpi__label'>Przychód (zlecenia)</div>
          <div className='kpi__value'>{currency(aggregated.revenueTotal)}</div>
        </div>
        <div className='kpi'>
          <div className='kpi__label'>Liczba zleceń</div>
          <div className='kpi__value'>{aggregated.ordersCount}</div>
        </div>
        <div className='kpi'>
          <div className='kpi__label'>Średnie zlecenie</div>
          <div className='kpi__value'>{currency(aggregated.avgOrder)}</div>
        </div>
      </section>

      <section className='ss__chartcard ss-card'>
        <div className='ss-card__head'>
          <h3>Sprzedaż — miesięcznie (przychód)</h3>
        </div>
        <div className='chart-wrap chart-wrap--tall'>
          <ResponsiveContainer width='100%' height={420}>
            <BarChart data={aggregated.salesSeries} margin={{ top: 8, right: 16, left: 8, bottom: 96 }} barCategoryGap='20%'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' interval={0} />
              <YAxis domain={[0, max => (max || 0) * 1.15]} />
              <Tooltip formatter={v => currency(+v)} />
              <Bar dataKey='revenue' name='Przychód (PLN)' fill={COLORS.revenue}>
                {showBarLabels && <LabelList dataKey='revenue' position='top' offset={6} formatter={v => currency(+v)} />}
              </Bar>
              <Legend verticalAlign='bottom' height={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className='ss__chartcard ss-card'>
        <div className='ss-card__head ss-card__head--between'>
          <div>
            <h3>Sprzedaż — etapy zleceń</h3>
            <span className='muted'>Miesięcznie wg etapu ({stageMetric === 'count' ? 'liczba' : 'przychód'})</span>
          </div>
        </div>

        <div className='legend-mini'>
          {stageShares.map(s => (
            <div key={s.stage} className='legend-mini__item' title={s.stage}>
              <span className='dot' style={{ background: COLORS.stages[s.stage] }} />
              <span className='name'>{s.stage}</span>
              <span className='pct'>{s.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>

        <div className='chart-wrap'>
          <ResponsiveContainer width='100%' height={360}>
            <BarChart data={stageStack} margin={{ top: 8, right: 16, left: 8, bottom: 64 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis allowDecimals={false} domain={[0, max => (max || 0) * 1.15]} />
              <Tooltip formatter={v => (stageMetric === 'value' ? currency(+v) : v)} />
              {STAGE_BUCKETS.map(k => (<Bar key={k} dataKey={k} stackId='stage' fill={COLORS.stages[k]} />))}
              <Bar dataKey='__total' hide>
                {showBarLabels && (
                  <LabelList dataKey='__total' position='top' offset={6} formatter={v => (stageMetric === 'value' ? currency(+v) : v)} />
                )}
              </Bar>
              <Legend verticalAlign='bottom' height={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2) OFERTY */}
      <section className='ss__kpis'>
        <div className='kpi'>
          <div className='kpi__label'>Pipeline (oferty w toku)</div>
          <div className='kpi__value'>{currency(aggregated.pipelineTotal)}</div>
        </div>
        <div className='kpi'>
          <div className='kpi__label'>Wygrane oferty</div>
          <div className='kpi__value'>{currency(aggregated.wonTotal)}</div>
        </div>
        <div className='kpi'>
          <div className='kpi__label'>Win rate</div>
          <div className='kpi__value'>{(aggregated.winRate * 100).toFixed(1)}%</div>
        </div>
      </section>

      <section className='ss__chartcard ss-card'>
        <div className='ss-card__head'>
          <h3>Oferty — miesięcznie (pipeline vs wygrane)</h3>
        </div>
        <div className='chart-wrap chart-wrap--tall'>
          <ResponsiveContainer width='100%' height={420}>
            <BarChart data={aggregated.offersSeries} margin={{ top: 8, right: 16, left: 8, bottom: 96 }} barCategoryGap='20%'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' interval={0} />
              <YAxis domain={[0, max => (max || 0) * 1.15]} />
              <Tooltip formatter={v => currency(+v)} />
              <Bar dataKey='pipeline' name='Pipeline (PLN)' fill={COLORS.pipeline}>
                {showBarLabels && <LabelList dataKey='pipeline' position='top' offset={6} formatter={v => currency(+v)} />}
              </Bar>
              <Line type='monotone' name='Wygrane (PLN)' dataKey='won' stroke={COLORS.won} strokeWidth={2} />
              <Legend verticalAlign='bottom' height={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ALERTY ofert */}
      <section className='ss__alerts'>
        <div className='ss-card'>
          <div className='ss-card__head'>
            <h3><AlertTriangle size={16} /> Oferty wygasające ≤ 7 dni</h3>
          </div>
          <ul className='alerts-list'>
            {alerts.expiringSoon.length === 0 && <li className='empty'>Brak</li>}
            {alerts.expiringSoon.map(o => (
              <li key={o.id} className='alert-row'>
                <span className='alert-title'>{o.id || o.company}</span>
                <span className='muted'>{o.company}</span>
                <span className='ss-pill ss-pill--warn'>pozostało {o.daysLeft} d</span>
                <span className='val'>{currency(moneyToNumber(o.amount))}</span>
                <span className='muted'>do {o.expiryDate}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className='ss-card'>
          <div className='ss-card__head'>
            <h3><AlertTriangle size={16} /> Oferty po terminie</h3>
          </div>
          <ul className='alerts-list'>
            {alerts.overdue.length === 0 && <li className='empty'>Brak</li>}
            {alerts.overdue.map(o => (
              <li key={o.id} className='alert-row'>
                <span className='alert-title'>{o.id || o.company}</span>
                <span className='muted'>{o.company}</span>
                <span className='ss-pill ss-pill--danger'>po terminie {o.daysLate} d</span>
                <span className='val'>{currency(moneyToNumber(o.amount))}</span>
                <span className='muted'>do {o.expiryDate}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3) PORÓWNYWARKA */}
      <section className='ss__compare ss-card'>
        <div className='ss-card__head'>
          <h3>Porównywarka okresów (A/B + poprzedni okres)</h3>
        </div>

        <div className='cmp-grid'>
          {/* OKRES A */}
          <div className='cmp-card'>
            <div className='cmp-row'>
              <label className='ss-chk'>
                <input type='checkbox' checked={cmpAEnabled} onChange={e => setCmpAEnabled(e.target.checked)} />
                <span>Włącz okres A</span>
              </label>
              <select className='ss-select' value={cmpAType} onChange={e => setCmpAType(e.target.value)}>
                <option value='year'>Rok</option>
                <option value='quarter'>Kwartał</option>
                <option value='month'>Miesiąc</option>
                <option value='custom'>Niestandardowy</option>
              </select>
            </div>

            {cmpAType === 'year' && (
              <div className='cmp-row'>
                <label>Rok:</label>
                <select className='ss-select' value={cmpAYear} onChange={e => setCmpAYear(+e.target.value)}>
                  {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            )}

            {cmpAType === 'quarter' && (
              <div className='cmp-row'>
                <label>Rok:</label>
                <select className='ss-select' value={cmpAYear} onChange={e => setCmpAYear(+e.target.value)}>
                  {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
                <label>Kwart:</label>
                <select className='ss-select' value={cmpAQuarter} onChange={e => setCmpAQuarter(+e.target.value)}>
                  <option value={1}>Q1</option><option value={2}>Q2</option><option value={3}>Q3</option><option value={4}>Q4</option>
                </select>
              </div>
            )}

            {cmpAType === 'month' && (
              <div className='cmp-row'>
                <label>Miesiąc:</label>
                <input className='ss-input' type='month' value={cmpAMonthISO} onChange={e => setCmpAMonthISO(e.target.value)} />
              </div>
            )}

            {cmpAType === 'custom' && (
              <div className='cmp-row'>
                <label>Od:</label>
                <input className='ss-input' type='date' value={format(cmpAFrom, 'yyyy-MM-dd')} onChange={e => setCmpAFrom(parseISO(e.target.value))} />
                <label>Do:</label>
                <input className='ss-input' type='date' value={format(cmpATo, 'yyyy-MM-dd')} onChange={e => setCmpATo(parseISO(e.target.value))} />
              </div>
            )}
          </div>

          {/* OKRES B */}
          <div className='cmp-card'>
            <div className='cmp-row'>
              <label className='ss-chk'>
                <input type='checkbox' checked={cmpBEnabled} onChange={e => setCmpBEnabled(e.target.checked)} />
                <span>Włącz okres B</span>
              </label>
              <select className='ss-select' value={cmpBType} onChange={e => setCmpBType(e.target.value)}>
                <option value='year'>Rok</option>
                <option value='quarter'>Kwartał</option>
                <option value='month'>Miesiąc</option>
                <option value='custom'>Niestandardowy</option>
              </select>
            </div>

            {cmpBType === 'year' && (
              <div className='cmp-row'>
                <label>Rok:</label>
                <select className='ss-select' value={cmpBYear} onChange={e => setCmpBYear(+e.target.value)}>
                  {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            )}

            {cmpBType === 'quarter' && (
              <div className='cmp-row'>
                <label>Rok:</label>
                <select className='ss-select' value={cmpBYear} onChange={e => setCmpBYear(+e.target.value)}>
                  {yearOptions.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
                <label>Kwart:</label>
                <select className='ss-select' value={cmpBQuarter} onChange={e => setCmpBQuarter(+e.target.value)}>
                  <option value={1}>Q1</option><option value={2}>Q2</option><option value={3}>Q3</option><option value={4}>Q4</option>
                </select>
              </div>
            )}

            {cmpBType === 'month' && (
              <div className='cmp-row'>
                <label>Miesiąc:</label>
                <input className='ss-input' type='month' value={cmpBMonthISO} onChange={e => setCmpBMonthISO(e.target.value)} />
              </div>
            )}

            {cmpBType === 'custom' && (
              <div className='cmp-row'>
                <label>Od:</label>
                <input className='ss-input' type='date' value={format(cmpBFrom, 'yyyy-MM-dd')} onChange={e => setCmpBFrom(parseISO(e.target.value))} />
                <label>Do:</label>
                <input className='ss-input' type='date' value={format(cmpBTo, 'yyyy-MM-dd')} onChange={e => setCmpBTo(parseISO(e.target.value))} />
              </div>
            )}
          </div>
        </div>

        <div className='cmp-prev'>
          <label className='ss-chk'>
            <input type='checkbox' checked={cmpPrevEnabled} onChange={e => setCmpPrevEnabled(e.target.checked)} />
            <span>Uwzględnij „Poprzedni okres (tej samej długości)”</span>
          </label>
        </div>

        <p className='muted'>
          Porównania działają dla <b>sprzedaży</b> i <b>ofert</b>. Serie są dopasowane długością do widocznego zakresu.
          „Poprzedni okres” to automatycznie okres tej samej długości tuż przed bieżącym.
        </p>
      </section>

      {/* SUMMARY BAR */}
      <section className='ss__summary ss-card'>
        <div className='ss-card__head'>
          <h3>Podsumowanie porównania</h3>
          <span className='muted'>Sumy i średnie miesięczne dla bieżącego zakresu vs A/B/C</span>
        </div>
        <div className='summary-grid'>
          {/* Przychód */}
          <div className='sumcard'>
            <div className='sumcard__label'>Przychód (sprzedaż)</div>
            <div className='sumcard__value'>
              {currency(salesBaseTotal)} <small className='muted'> / śr.mies.: {currency(salesBaseTotal / monthsCount)}</small>
            </div>
            <div className='sumcard__deltas'>
              {compareSalesA && (
                <span className={`delta ${safeDeltaPct(salesBaseTotal, salesATotal) >= 0 ? 'up' : 'down'}`}>
                  A: {currency(salesATotal)} <em>{pctStr(safeDeltaPct(salesBaseTotal, salesATotal))}</em>
                </span>
              )}
              {compareSalesB && (
                <span className={`delta ${safeDeltaPct(salesBaseTotal, salesBTotal) >= 0 ? 'up' : 'down'}`}>
                  B: {currency(salesBTotal)} <em>{pctStr(safeDeltaPct(salesBaseTotal, salesBTotal))}</em>
                </span>
              )}
              {compareSalesPrev && (
                <span className={`delta ${safeDeltaPct(salesBaseTotal, salesCTotal) >= 0 ? 'up' : 'down'}`}>
                  C: {currency(salesCTotal)} <em>{pctStr(safeDeltaPct(salesBaseTotal, salesCTotal))}</em>
                </span>
              )}
            </div>
          </div>

          {/* Pipeline */}
          <div className='sumcard'>
            <div className='sumcard__label'>Pipeline (oferty)</div>
            <div className='sumcard__value'>
              {currency(offersPipeBaseTotal)} <small className='muted'> / śr.mies.: {currency(offersPipeBaseTotal / monthsCount)}</small>
            </div>
            <div className='sumcard__deltas'>
              {compareOffersA && (
                <span className={`delta ${safeDeltaPct(offersPipeBaseTotal, pipeATotal) >= 0 ? 'up' : 'down'}`}>
                  A: {currency(pipeATotal)} <em>{pctStr(safeDeltaPct(offersPipeBaseTotal, pipeATotal))}</em>
                </span>
              )}
              {compareOffersB && (
                <span className={`delta ${safeDeltaPct(offersPipeBaseTotal, pipeBTotal) >= 0 ? 'up' : 'down'}`}>
                  B: {currency(pipeBTotal)} <em>{pctStr(safeDeltaPct(offersPipeBaseTotal, pipeBTotal))}</em>
                </span>
              )}
              {compareOffersPrev && (
                <span className={`delta ${safeDeltaPct(offersPipeBaseTotal, pipeCTotal) >= 0 ? 'up' : 'down'}`}>
                  C: {currency(pipeCTotal)} <em>{pctStr(safeDeltaPct(offersPipeBaseTotal, pipeCTotal))}</em>
                </span>
              )}
            </div>
          </div>

          {/* Wygrane */}
          <div className='sumcard'>
            <div className='sumcard__label'>Wygrane (oferty)</div>
            <div className='sumcard__value'>
              {currency(offersWonBaseTotal)} <small className='muted'> / śr.mies.: {currency(offersWonBaseTotal / monthsCount)}</small>
              <div className='muted small'>Udział wygranych w pipeline: <b>{offersPipeBaseTotal ? pct(offersWonBaseTotal / offersPipeBaseTotal) : '—'}</b></div>
            </div>
            <div className='sumcard__deltas'>
              {compareOffersA && (
                <span className={`delta ${safeDeltaPct(offersWonBaseTotal, wonATotal) >= 0 ? 'up' : 'down'}`}>
                  A: {currency(wonATotal)} <em>{pctStr(safeDeltaPct(offersWonBaseTotal, wonATotal))}</em>
                </span>
              )}
              {compareOffersB && (
                <span className={`delta ${safeDeltaPct(offersWonBaseTotal, wonBTotal) >= 0 ? 'up' : 'down'}`}>
                  B: {currency(wonBTotal)} <em>{pctStr(safeDeltaPct(offersWonBaseTotal, wonBTotal))}</em>
                </span>
              )}
              {compareOffersPrev && (
                <span className={`delta ${safeDeltaPct(offersWonBaseTotal, wonCTotal) >= 0 ? 'up' : 'down'}`}>
                  C: {currency(wonCTotal)} <em>{pctStr(safeDeltaPct(offersWonBaseTotal, wonCTotal))}</em>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Porównanie — wykresy */}
      <section className='ss__chartcard ss-card'>
        <div className='ss-card__head'><h3>Porównanie — sprzedaż</h3></div>
        <div className='chart-wrap chart-wrap--tall'>
          <ResponsiveContainer width='100%' height={420}>
            <BarChart
              data={aggregated.salesSeries.map((r, i) => ({
                month: r.month,
                'Przychód (PLN)': r.revenue,
                ...(compareSalesA?.data?.[i] ? { [`Przychód (A: ${compareSalesA.label})`]: compareSalesA.data[i].revenue } : {}),
                ...(compareSalesB?.data?.[i] ? { [`Przychód (B: ${compareSalesB.label})`]: compareSalesB.data[i].revenue } : {}),
                ...(compareSalesPrev?.data?.[i] ? { [`Przychód (C: ${compareSalesPrev.label})`]: compareSalesPrev.data[i].revenue } : {}),
              }))}
              margin={{ top: 8, right: 16, left: 8, bottom: 96 }}
              barCategoryGap='22%'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' interval={0} />
              <YAxis domain={[0, max => (max || 0) * 1.15]} />
              <Tooltip formatter={(v, n) => (n?.includes('PLN') ? currency(+v) : v)} />
              <Bar dataKey='Przychód (PLN)' fill={COLORS.revenue}>
                {showBarLabels && <LabelList dataKey='Przychód (PLN)' position='top' offset={6} formatter={v => currency(+v)} />}
              </Bar>
              {compareSalesA && <Line type='monotone' dataKey={`Przychód (A: ${compareSalesA.label})`} stroke={COLORS.cmpA} strokeDasharray='6 4' />}
              {compareSalesB && <Line type='monotone' dataKey={`Przychód (B: ${compareSalesB.label})`} stroke={COLORS.cmpB} strokeDasharray='2 3' />}
              {compareSalesPrev && <Line type='monotone' dataKey={`Przychód (C: ${compareSalesPrev.label})`} stroke={COLORS.prev} strokeDasharray='3 3' />}
              <Legend verticalAlign='bottom' height={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className='ss__chartcard ss-card'>
        <div className='ss-card__head'><h3>Porównanie — oferty</h3></div>
        <div className='chart-wrap chart-wrap--tall'>
          <ResponsiveContainer width='100%' height={420}>
            <BarChart
              data={aggregated.offersSeries.map((r, i) => ({
                month: r.month,
                'Pipeline (PLN)': r.pipeline,
                'Wygrane (PLN)': r.won,
                ...(compareOffersA?.data?.[i] ? {
                  [`Pipeline (A: ${compareOffersA.label})`]: compareOffersA.data[i].pipeline,
                  [`Wygrane (A: ${compareOffersA.label})`]: compareOffersA.data[i].won,
                } : {}),
                ...(compareOffersB?.data?.[i] ? {
                  [`Pipeline (B: ${compareOffersB.label})`]: compareOffersB.data[i].pipeline,
                  [`Wygrane (B: ${compareOffersB.label})`]: compareOffersB.data[i].won,
                } : {}),
                ...(compareOffersPrev?.data?.[i] ? {
                  [`Pipeline (C: ${compareOffersPrev.label})`]: compareOffersPrev.data[i].pipeline,
                  [`Wygrane (C: ${compareOffersPrev.label})`]: compareOffersPrev.data[i].won,
                } : {}),
              }))}
              margin={{ top: 8, right: 16, left: 8, bottom: 96 }}
              barCategoryGap='20%'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' interval={0} />
              <YAxis domain={[0, max => (max || 0) * 1.15]} />
              <Tooltip formatter={(v, n) => (n?.includes('PLN') ? currency(+v) : v)} />
              <Bar dataKey='Pipeline (PLN)' fill={COLORS.pipeline}>
                {showBarLabels && <LabelList dataKey='Pipeline (PLN)' position='top' offset={6} formatter={v => currency(+v)} />}
              </Bar>
              <Line type='monotone' dataKey='Wygrane (PLN)' stroke={COLORS.won} strokeWidth={2} />
              {compareOffersA && (
                <>
                  <Line type='monotone' dataKey={`Pipeline (A: ${compareOffersA.label})`} stroke={COLORS.cmpA} strokeDasharray='6 4' />
                  <Line type='monotone' dataKey={`Wygrane (A: ${compareOffersA.label})`}  stroke={COLORS.cmpA} strokeDasharray='6 4' />
                </>
              )}
              {compareOffersB && (
                <>
                  <Line type='monotone' dataKey={`Pipeline (B: ${compareOffersB.label})`} stroke={COLORS.cmpB} strokeDasharray='2 3' />
                  <Line type='monotone' dataKey={`Wygrane (B: ${compareOffersB.label})`}  stroke={COLORS.cmpB} strokeDasharray='2 3' />
                </>
              )}
              {compareOffersPrev && (
                <>
                  <Line type='monotone' dataKey={`Pipeline (C: ${compareOffersPrev.label})`} stroke={COLORS.prev} strokeDasharray='3 3' />
                  <Line type='monotone' dataKey={`Wygrane (C: ${compareOffersPrev.label})`}  stroke={COLORS.prev} strokeDasharray='3 3' />
                </>
              )}
              <Legend verticalAlign='bottom' height={72} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tabela porównawcza + paginacja */}
      <section className='ss-card'>
        <div className='ss-card__head ss-card__head--between'>
          <h3>Tabela porównawcza (sprzedaż + oferty)</h3>
        </div>

        <div className='ss-tablewrap'>
          <table className='ss-table'>
            <thead>
              <tr>
                <th>Miesiąc</th>
                {showSalesCols && <th>Przychód</th>}
                {showOfferCols && (<><th>Pipeline</th><th>Wygrane</th></>)}
                {showSalesCols && compareSalesA && <th>Przychód (A: {compareSalesA.label})</th>}
                {showSalesCols && compareSalesB && <th>Przychód (B: {compareSalesB.label})</th>}
                {showSalesCols && compareSalesPrev && <th>Przychód (C: {compareSalesPrev.label})</th>}
                {showOfferCols && compareOffersA && (<><th>Pipeline (A: {compareOffersA.label})</th><th>Wygrane (A: {compareOffersA.label})</th></>)}
                {showOfferCols && compareOffersB && (<><th>Pipeline (B: {compareOffersB.label})</th><th>Wygrane (B: {compareOffersB.label})</th></>)}
                {showOfferCols && compareOffersPrev && (<><th>Pipeline (C: {compareOffersPrev.label})</th><th>Wygrane (C: {compareOffersPrev.label})</th></>)}
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((k, idx) => {
                const i = startIdx + idx
                const month = monthLabel(k)
                const sales = aggregated.salesSeries[i]?.revenue ?? 0
                const off = aggregated.offersSeries[i] || { pipeline: 0, won: 0 }
                return (
                  <tr key={k}>
                    <td>{month}</td>
                    {showSalesCols && <td>{currency(sales)}</td>}
                    {showOfferCols && (<><td>{currency(off.pipeline)}</td><td>{currency(off.won)}</td></>)}
                    {showSalesCols && compareSalesA && <td>{currency(compareSalesA.data[i]?.revenue ?? 0)}</td>}
                    {showSalesCols && compareSalesB && <td>{currency(compareSalesB.data[i]?.revenue ?? 0)}</td>}
                    {showSalesCols && compareSalesPrev && <td>{currency(compareSalesPrev.data[i]?.revenue ?? 0)}</td>}
                    {showOfferCols && compareOffersA && (<><td>{currency(compareOffersA.data[i]?.pipeline ?? 0)}</td><td>{currency(compareOffersA.data[i]?.won ?? 0)}</td></>)}
                    {showOfferCols && compareOffersB && (<><td>{currency(compareOffersB.data[i]?.pipeline ?? 0)}</td><td>{currency(compareOffersB.data[i]?.won ?? 0)}</td></>)}
                    {showOfferCols && compareOffersPrev && (<><td>{currency(compareOffersPrev.data[i]?.pipeline ?? 0)}</td><td>{currency(compareOffersPrev.data[i]?.won ?? 0)}</td></>)}
                  </tr>
                )
              })}
              {aggregated.months.length === 0 && (
                <tr>
                  <td colSpan={4} className='empty'>Brak danych</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACJA — wspólny komponent */}
        <Pager
          variant="ss"
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          setPage={setPage}
          totalRows={totalRows}
          pageSizeOptions={pageSizeOptions}
        />
      </section>

      {/* TOP klienci */}
      <section className='ss-card'>
        <div className='ss-card__head'>
          <h3>Top klienci (sprzedaż)</h3>
        </div>
        <ul className='ss-toplist'>
          {aggregated.topClients.length === 0 && <li className='empty'>Brak danych</li>}
          {aggregated.topClients.map((r, i) => (
            <li key={r.client} className='ss-row'>
              <span className='idx'>{i + 1}</span>
              <span className='client'>{r.client}</span>
              <span className='val'>{currency(r.value)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

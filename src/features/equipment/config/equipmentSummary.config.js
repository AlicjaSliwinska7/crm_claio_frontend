// src/features/equipment/config/equipmentSummary.config.js

import { toTs, DAY } from '../components/EquipmentSummary/time'

// ✅ PAGE BUILDER (w tym samym pliku – zgodnie z Twoją decyzją)
import { summaryPage, summarySections } from '../../../shared/summaries'
import EquipmentFilters from '../components/EquipmentSummary/EquipmentFilters'
import Kpis from '../components/EquipmentSummary/Kpis'
import SummaryChartBlock from '../components/EquipmentSummary/SummaryChartBlock'

const intPL = new Intl.NumberFormat('pl-PL')
const plnPL = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const makeFormatters = (injected) => ({
  int: injected?.int || ((v) => intPL.format(Number(v) || 0)),
  pln: injected?.pln || ((v) => plnPL.format(Number(v) || 0)),
  float1: injected?.float1 || ((v) => (Number(v) || 0).toFixed(1)),
})

const defaultColorByIndex = (idx) => {
  const palette = [
    'rgba(58, 98, 138, 0.85)',
    'rgba(46, 125, 80, 0.85)',
    'rgba(201, 135, 47, 0.85)',
    'rgba(164, 73, 73, 0.85)',
    'rgba(122, 77, 161, 0.85)',
    'rgba(43, 132, 153, 0.85)',
  ]
  return palette[idx % palette.length]
}

const uniqSorted = (arr, locale = 'pl') =>
  Array.from(new Set(arr.filter((v) => v != null && String(v).trim() !== ''))).sort((a, b) =>
    String(a).localeCompare(String(b), locale)
  )

const pad2 = (n) => String(n).padStart(2, '0')

const monthKeyFromTs = (ts) => {
  const d = new Date(ts)
  if (!Number.isFinite(d.getTime())) return null
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

const monthRangeKeys = (fromTs, toTsVal) => {
  if (!fromTs || !toTsVal) return []
  const start = new Date(fromTs)
  const end = new Date(toTsVal)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return []

  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  end.setDate(1)
  end.setHours(0, 0, 0, 0)

  const out = []
  const cur = new Date(start)
  while (cur.getTime() <= end.getTime()) {
    out.push(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}`)
    cur.setMonth(cur.getMonth() + 1)
  }
  return out
}

// model pod Gantt renderer
const buildGanttModelFromRanges = (rowsLike) => {
  const rowsClean = (Array.isArray(rowsLike) ? rowsLike : [])
    .map((r) => {
      const s = Number(r.startTs)
      const e = Number(r.endTs)
      if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null
      return { code: r.code || '—', startTs: s, endTs: e }
    })
    .filter(Boolean)

  if (!rowsClean.length) return { rows: [], domainMin: 0, span: 0, pad: 0 }

  const domainMin = Math.min(...rowsClean.map((r) => r.startTs))
  const domainMax = Math.max(...rowsClean.map((r) => r.endTs))
  const span = Math.max(1, domainMax - domainMin)
  const pad = Math.round(span * 0.05)

  const rows = rowsClean.map((r) => ({
    ...r,
    offset: r.startTs - domainMin,
    duration: r.endTs - r.startTs,
  }))

  return { rows, domainMin, span, pad }
}

export const equipmentSummaryConfig = {
  meta: {
    id: 'equipmentSummary',
    title: 'Podsumowanie wyposażenia',
    icon: 'fa-chart-line',
  },

  range: {
    presets: [
      { value: 'all', label: 'Wszystkie' },
      { value: 'this-month', label: 'Bieżący miesiąc' },
      { value: 'last-month', label: 'Poprzedni miesiąc' },
      { value: 'last-30d', label: 'Ostatnie 30 dni' },
      { value: 'custom', label: 'Niestandardowy' },
    ],
    defaultPreset: 'all',
  },

  filters: [
    {
      id: 'category',
      type: 'select',
      label: 'Kategoria',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Wszystkie' },
        { value: 'termometry', label: 'Termometry' },
        { value: 'wagi', label: 'Wagi' },
        { value: 'inne', label: 'Inne' },
      ],
    },
    {
      id: 'kind',
      type: 'select',
      label: 'Rodzaj',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Wszystkie' },
        { value: 'zewn', label: 'Wzorc. zewn.' },
        { value: 'wewn', label: 'Wzorc. wewn.' },
      ],
    },
    {
      id: 'labs',
      type: 'multiselect',
      label: 'Laboratoria',
      defaultValue: [],
      optionsFromData: {
        source: 'calibrations',
        field: 'lab',
        sortLocale: 'pl',
        emptyLabel: '—',
      },
    },
  ],

  kpis: [
    { id: 'calCount', label: 'Wzorcowania', valueKey: 'calCount' },
    { id: 'devices', label: 'Sprzęt', valueKey: 'devices' },
    { id: 'labs', label: 'Laboratoria', valueKey: 'labs' },
    { id: 'calCostFormatted', label: 'Koszt wzorcowań', valueKey: 'calCostFormatted' },
    { id: 'calAvgDaysFormatted', label: 'Śr. czas (dni)', valueKey: 'calAvgDaysFormatted' },
    { id: 'failCount', label: 'Awarie', valueKey: 'failCount' },
    { id: 'downSumFormatted', label: 'Przestoje', valueKey: 'downSumFormatted' },
    { id: 'downAvgFormatted', label: 'Śr. przestój', valueKey: 'downAvgFormatted' },
    { id: 'repairSumFormatted', label: 'Koszt napraw', valueKey: 'repairSumFormatted' },
  ],

  sections: [
    { id: 'filters', type: 'filters', title: 'Filtry & Zakres' },
    { id: 'kpis', type: 'kpis', title: 'Podsumowanie' },

    {
      id: 'gantt',
      type: 'chartBlock',
      title: 'Wzorcowania',
      icon: 'fa-sitemap',
      mode: {
        id: 'ganttMode',
        defaultValue: 'main',
        storageKey: 'equipmentSummary.gantt.mode',
        options: [{ value: 'main', label: 'Harmonogram' }],
      },
      views: {
        main: {
          chart: 'ganttCalibrations',
          dataKey: 'ganttCalibrations',
          props: {
            xTitle: 'Data',
            yTitle: 'Urządzenie',
            barLabel: 'Czas trwania',
          },
        },
      },
    },

    {
      id: 'costs',
      type: 'chartBlock',
      title: 'Koszty wzorcowań',
      icon: 'fa-circle-dollar-to-slot',
      mode: {
        id: 'costMode',
        defaultValue: 'time',
        storageKey: 'equipmentSummary.costs.mode',
        options: [
          { value: 'time', label: 'W czasie (miesiące, wg laboratorium)' },
          { value: 'labs', label: 'Ranking laboratoriów' },
        ],
      },
      views: {
        time: {
          chart: 'costsStackedByMonth',
          dataKey: 'costsStackedByMonth',
          props: {
            xTitle: 'Miesiąc',
            yTitle: 'Koszt [PLN]',
          },
        },
        labs: {
          chart: 'costsRankingVertical',
          dataKey: 'costsRankingVertical',
          props: {
            tooltipLabel: 'Koszt',
            xAxisLabel: 'Koszt [PLN]',
            categoryKey: 'lab',
            valueKey: 'cost',
            colorKey: 'color',
          },
        },
      },
    },

    {
      id: 'failures',
      type: 'chartBlock',
      title: 'Awaryjność',
      icon: 'fa-screwdriver-wrench',
      mode: {
        id: 'failuresMode',
        defaultValue: 'main',
        storageKey: 'equipmentSummary.failures.mode',
        options: [{ value: 'main', label: 'Miesięcznie' }],
      },
      views: {
        main: {
          chart: 'failuresComposedByMonth',
          dataKey: 'failuresMonthlyRows',
          props: {
            xKey: 'monthKey',
            barKey: 'downtimeMonthly',
            lineKey: 'repairMonthly',
            xTitle: 'Miesiąc',
            yLeftTitle: 'Czas przestoju [h] (mies.)',
            yRightTitle: 'Koszt naprawy [PLN] (mies.)',
            barLabel: 'Przestój (mies.)',
            lineLabel: 'Koszt naprawy (mies.)',
          },
        },
      },
    },
  ],

  data: {
    sources: {
      calibrations: { prop: 'calibrations', fallback: [] },
      failures: { prop: 'failures', fallback: [] },
    },
  },

  compute: {
    normalize: ({ sources }) => {
      const rawCal = Array.isArray(sources?.calibrations) ? sources.calibrations : []
      const rawFail = Array.isArray(sources?.failures) ? sources.failures : []

      const calibrations = rawCal
        .map((c) => {
          const startTs = toTs(c.start ?? c.startDate ?? c.from)
          const endTs = toTs(c.end ?? c.endDate ?? c.to)
          const costNum = Number(c.cost ?? c.costPLN ?? 0) || 0

          const lab = c.lab ?? c.labName ?? '—'
          const category = c.category ?? c.cat ?? 'inne'
          const kind = c.kind ?? c.type ?? 'wewn'
          const device = c.device ?? c.deviceName ?? c.equipment ?? '—'
          const code = c.code ?? c.symbol ?? c.eqCode ?? device ?? '—'

          if (!startTs || !endTs || endTs < startTs) return null
          return { ...c, startTs, endTs, costNum, lab, category, kind, device, code }
        })
        .filter(Boolean)

      const failures = rawFail
        .map((f) => {
          const dateTs = toTs(f.date ?? f.day ?? f.when)
          if (!dateTs) return null

          const downtimeNum = Number(f.downtimeHours ?? f.downtime ?? 0) || 0
          const repairNum = Number(f.repairCost ?? f.cost ?? 0) || 0

          const lab = f.lab ?? f.labName ?? null
          return { ...f, dateTs, downtimeNum, repairNum, lab }
        })
        .filter(Boolean)
        .sort((a, b) => a.dateTs - b.dateTs)

      return { calibrations, failures }
    },

    filter: ({ normalized, range, filters }) => {
      const cal = Array.isArray(normalized?.calibrations) ? normalized.calibrations : []
      const fail = Array.isArray(normalized?.failures) ? normalized.failures : []

      const fromTs = range?.fromTs ?? null
      const toTsVal = range?.toTs ?? null

      const inPointRange = (ts) => {
        if (!fromTs || !toTsVal) return true
        return ts >= fromTs && ts <= toTsVal
      }

      const overlapsRange = (startTs, endTs) => {
        if (!fromTs || !toTsVal) return true
        return endTs >= fromTs && startTs <= toTsVal
      }

      const category = filters?.category ?? 'all'
      const kind = filters?.kind ?? 'all'
      const labs = Array.isArray(filters?.labs) ? filters.labs : []
      const hasLabs = labs.length > 0

      const filteredCalibrations = cal.filter((c) => {
        if (!overlapsRange(c.startTs, c.endTs)) return false
        if (category !== 'all' && c.category !== category) return false
        if (kind !== 'all' && c.kind !== kind) return false
        if (hasLabs && !labs.includes(c.lab)) return false
        return true
      })

      const filteredFailures = fail.filter((f) => inPointRange(f.dateTs))
      return { calibrations: filteredCalibrations, failures: filteredFailures }
    },

    kpis: ({ filtered, formatters }) => {
      const fmt = makeFormatters(formatters)

      const calibrations = Array.isArray(filtered?.calibrations) ? filtered.calibrations : []
      const failures = Array.isArray(filtered?.failures) ? filtered.failures : []

      const calCount = calibrations.length
      const devices = new Set(calibrations.map((c) => c.device ?? '—')).size
      const labs = new Set(calibrations.map((c) => c.lab ?? '—')).size

      const calCost = calibrations.reduce((s, c) => s + (c.costNum || 0), 0)
      const calAvgDays = calCount
        ? calibrations.reduce((s, c) => s + (c.endTs - c.startTs) / DAY, 0) / calCount
        : 0

      const failCount = failures.length
      const downSum = failures.reduce((s, f) => s + (f.downtimeNum || 0), 0)
      const downAvg = failCount ? downSum / failCount : 0
      const repairSum = failures.reduce((s, f) => s + (f.repairNum || 0), 0)

      return {
        calCount,
        devices,
        labs,
        calCostFormatted: fmt.pln(calCost),
        calAvgDaysFormatted: fmt.float1(calAvgDays),
        failCount,
        downSumFormatted: `${fmt.int(downSum)}h`,
        downAvgFormatted: `${fmt.float1(downAvg)}h`,
        repairSumFormatted: fmt.pln(repairSum),
      }
    },

    sections: ({ filtered, utils, range }) => {
      const calibrations = Array.isArray(filtered?.calibrations) ? filtered.calibrations : []
      const failures = Array.isArray(filtered?.failures) ? filtered.failures : []

      const colorByIndex = utils?.colorByIndex || defaultColorByIndex

      // COSTS / labs (ranking)
      const byLab = new Map()
      for (const c of calibrations) {
        const lab = c.lab ?? '—'
        byLab.set(lab, (byLab.get(lab) || 0) + (c.costNum || 0))
      }
      const costsRankingVertical = Array.from(byLab.entries())
        .map(([lab, cost], idx) => ({ lab, cost, color: colorByIndex(idx) }))
        .sort((a, b) => b.cost - a.cost)

      // COSTS / time (stack by lab per month)
      const labsSorted = uniqSorted(calibrations.map((c) => c.lab ?? '—'), 'pl')
      const keys = labsSorted

      let months = monthRangeKeys(range?.fromTs, range?.toTs)
      if (!months.length) {
        months = uniqSorted(calibrations.map((c) => monthKeyFromTs(c.startTs)).filter(Boolean), 'pl')
      }

      const rowsMap = new Map()
      for (const mk of months) {
        const row = { label: mk }
        for (const k of keys) row[k] = 0
        rowsMap.set(mk, row)
      }

      for (const c of calibrations) {
        const mk = monthKeyFromTs(c.startTs)
        if (!mk) continue

        if (!rowsMap.has(mk)) {
          const row = { label: mk }
          for (const k of keys) row[k] = 0
          rowsMap.set(mk, row)
        }

        const lab = c.lab ?? '—'
        if (!keys.includes(lab)) continue
        rowsMap.get(mk)[lab] += Number(c.costNum || 0)
      }

      const rows = Array.from(rowsMap.values()).sort((a, b) =>
        String(a.label).localeCompare(String(b.label), 'pl')
      )
      const meta = keys.map((key, idx) => ({ key, label: key, color: colorByIndex(idx) }))

      const costsStackedByMonth = { rows, meta, keys }

      // GANTT
      const ganttLike = calibrations.map((c) => ({
        code: c.code ?? c.device ?? '—',
        startTs: c.startTs,
        endTs: c.endTs,
      }))
      const ganttCalibrations = buildGanttModelFromRanges(ganttLike)

      // FAILURES / monthly aggregation
      const failuresMonthlyMap = new Map()
      for (const f of failures) {
        const mk = monthKeyFromTs(f.dateTs)
        if (!mk) continue
        const prev = failuresMonthlyMap.get(mk) || { downtimeMonthly: 0, repairMonthly: 0 }
        failuresMonthlyMap.set(mk, {
          downtimeMonthly: prev.downtimeMonthly + (Number(f.downtimeNum) || 0),
          repairMonthly: prev.repairMonthly + (Number(f.repairNum) || 0),
        })
      }

      const failuresMonthlyRows = Array.from(failuresMonthlyMap.entries())
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([monthKey, v]) => ({ monthKey, ...v }))

      return {
        costsStackedByMonth,
        costsRankingVertical,
        ganttCalibrations,
        failuresMonthlyRows,
        calibrations,
        failures,
      }
    },
  },
}

// ─────────────────────────────────────────────────────────────
// ✅ Page config builder (w tym samym pliku)
// ─────────────────────────────────────────────────────────────

export function buildEquipmentSummaryPageConfig(ctx) {
  return summaryPage.summaryPage('equipment-summary es-root', [
    summarySections.filtersSection('filters', EquipmentFilters, {
      preset: ctx.preset,
      setPreset: ctx.setPreset,
      customFrom: ctx.customFrom,
      setCustomFrom: ctx.setCustomFrom,
      customTo: ctx.customTo,
      setCustomTo: ctx.setCustomTo,
      category: ctx.category,
      setCategory: ctx.setCategory,
      kind: ctx.kind,
      setKind: ctx.setKind,
      labsAll: ctx.labsAll,
      selectedLabs: ctx.selectedLabs,
      setSelectedLabs: ctx.setSelectedLabs,
      activeRangeText: ctx.activeRangeText,
    }),

    summarySections.kpiSection('kpis', Kpis, {
      kpis: ctx.kpis,
      fmtPLN: ctx.fmtPLN || null,
    }),

    summarySections.chartSection('gantt', SummaryChartBlock, {
      section: ctx.ganttSection,
      sectionData: ctx.sectionData,
    }),

    summarySections.chartSection('costs', SummaryChartBlock, {
      section: ctx.costsSection,
      sectionData: ctx.sectionData,
    }),

    summarySections.chartSection('failures', SummaryChartBlock, {
      section: ctx.failuresSection,
      sectionData: ctx.sectionData,
    }),
  ])
}
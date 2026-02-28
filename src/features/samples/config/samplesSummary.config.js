// src/features/samples/config/samplesSummary.config.js

import {
  buildChartData,
  getSeriesColors,
  computePresetRange,
  groupByKey,
  withinRange,
  mainDateISO,
  monthKeyFromISO,
} from '../../../shared/diagrams'

/* ===================== Helpers ===================== */

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const INT_FMT = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 })
const NUM_FMT = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 })
const fmtInt = (v) => INT_FMT.format(toNum(v))
const fmtNum = (v) => NUM_FMT.format(toNum(v))

/* ===================== UI dictionaries ===================== */

export const SAMPLES_GROUP_MODES = [
  { value: 'byCode', label: 'Wg kodu' },
  { value: 'bySubject', label: 'Wg przedmiotu' },
  { value: 'byClient', label: 'Wg klienta' },
]

export const SAMPLES_CODES = [
  { value: 'AO', label: 'AO' },
  { value: 'AZ', label: 'AZ' },
  { value: 'BP', label: 'BP' },
  { value: 'BW', label: 'BW' },
]

export const SAMPLES_PARAM_KEYS = [
  { value: 'none', label: 'Brak' },
  { value: 'energyWh', label: 'Energia [Wh]' },
  { value: 'capacityAh', label: 'Pojemność [Ah]' },
  { value: 'voltageV', label: 'Napięcie [V]' },
  { value: 'currentA', label: 'Prąd [A]' },
]

/* ===================== Columns ===================== */

export const buildColumnsByMode = (mode) => {
  if (mode === 'bySubject') {
    return [
      { key: 'group', label: 'Przedmiot badań' },
      { key: 'AO', label: 'AO', numeric: true, fmt: fmtInt },
      { key: 'AZ', label: 'AZ', numeric: true, fmt: fmtInt },
      { key: 'BP', label: 'BP', numeric: true, fmt: fmtInt },
      { key: 'BW', label: 'BW', numeric: true, fmt: fmtInt },
      { key: 'total', label: 'Razem', numeric: true, fmt: fmtInt },
      { key: 'clientsCount', label: 'Klienci', numeric: true, fmt: fmtInt },
    ]
  }

  if (mode === 'byClient') {
    return [
      { key: 'group', label: 'Klient' },
      { key: 'AO', label: 'AO', numeric: true, fmt: fmtInt },
      { key: 'AZ', label: 'AZ', numeric: true, fmt: fmtInt },
      { key: 'BP', label: 'BP', numeric: true, fmt: fmtInt },
      { key: 'BW', label: 'BW', numeric: true, fmt: fmtInt },
      { key: 'total', label: 'Razem', numeric: true, fmt: fmtInt },
      { key: 'subjectsCount', label: 'Przedmioty', numeric: true, fmt: fmtInt },
      { key: 'period', label: 'Okres' },
    ]
  }

  return [
    { key: 'group', label: 'Kod' },
    { key: 'count', label: 'Próbki', numeric: true, fmt: fmtInt },
    { key: 'clientsCount', label: 'Klienci', numeric: true, fmt: fmtInt },
    { key: 'subjectsCount', label: 'Przedmioty', numeric: true, fmt: fmtInt },
    { key: 'energySumWh', label: 'Σ Energia [Wh]', numeric: true, fmt: fmtInt },
    { key: 'capAvgAh', label: 'Śr. Ah', numeric: true, fmt: fmtNum },
    { key: 'voltAvgV', label: 'Śr. V', numeric: true, fmt: fmtNum },
    { key: 'currAvgA', label: 'Śr. A', numeric: true, fmt: fmtNum },
  ]
}

/* ===================== Config ===================== */

export const samplesSummaryConfig = {
  meta: {
    id: 'samplesSummary',
    title: 'Podsumowanie próbek',
    icon: 'fa-vial-circle-check',
  },

  defaults: {
    groupBy: 'byCode',
    sortField: 'group',
    sortAsc: true,
    pageSize: 10,
    preset: 'all',
  },

  sections: [
    { id: 'toolbar', type: 'toolbar' },
    { id: 'range', type: 'range' },
    { id: 'filters', type: 'filters' },
    { id: 'kpis', type: 'kpis' },
    { id: 'charts', type: 'charts' },
    { id: 'table', type: 'table' },
    { id: 'pagination', type: 'custom' },
  ],

  fmt: {
    int: fmtInt,
    num: fmtNum,
  },

  range: {
    presets: [
      { value: 'all', label: 'Wszystkie' },
      { value: 'week', label: 'Ostatnie 7 dni' },
      { value: 'month', label: 'Ostatnie 30 dni' },
      { value: 'year', label: 'Ostatnie 365 dni' },
      { value: 'custom', label: 'Zakres własny' },
    ],
    defaultPreset: 'all',
  },

  ui: {
    groupOptions: SAMPLES_GROUP_MODES,

    toolbarLabels: {
      groupLabel: 'Grupuj',
      resetTitle: 'Wyczyść filtry',
      exportTitle: 'Eksport',
    },

    rangeLabels: {
      presetLabel: 'Zakres',
      fromLabel: 'Od',
      toLabel: 'Do',
    },

    emptyTableLabel: 'Brak danych do wyświetlenia.',

    buildFrameworkFilters: ({ values, uniqueClients }) => {
      const clientsHint =
        Array.isArray(uniqueClients) && uniqueClients.length
          ? `np. ${uniqueClients.slice(0, 3).join(', ')}…`
          : 'np. Energo…'

      return [
        {
          key: 'code',
          label: 'Kod',
          type: 'select',
          options: [{ value: 'all', label: 'Wszystkie' }, ...SAMPLES_CODES],
          value: values.code,
        },
        {
          key: 'clientQuery',
          label: 'Klient (szukaj)',
          type: 'text',
          placeholder: clientsHint,
          value: values.clientQuery,
          datalist: uniqueClients,
          wide: true,
        },
        {
          key: 'paramKey',
          label: 'Parametr',
          type: 'select',
          options: SAMPLES_PARAM_KEYS,
          value: values.paramKey,
        },
        {
          key: 'param',
          label: 'Zakres',
          type: 'numberRange',
          minKey: 'paramMin',
          maxKey: 'paramMax',
          visible: values.paramKey !== 'none',
          minValue: values.paramMin,
          maxValue: values.paramMax,
          minPlaceholder: 'min',
          maxPlaceholder: 'max',
        },
      ]
    },

    buildKpiSegments: (kpis) => {
      const byCode = kpis?.countsByCode || {}
      const count = kpis?.count ?? 0

      const primary = [
        { key: 'count', strong: count, label: 'Próbek', value: '' },
        { key: 'ao', label: 'AO', value: byCode.AO ?? 0 },
        { key: 'az', label: 'AZ', value: byCode.AZ ?? 0 },
        { key: 'bp', label: 'BP', value: byCode.BP ?? 0 },
        { key: 'bw', label: 'BW', value: byCode.BW ?? 0 },
      ]

      const secondary = [
        { key: 'clients', label: 'Klienci', value: kpis?.clientsCount ?? 0, bold: true },
        { key: 'subjects', label: 'Przedmioty', value: kpis?.subjectsCount ?? 0, bold: true },
        { key: 'months', label: 'Miesiące', value: kpis?.monthsCount ?? 0, bold: true },
        { key: 'range', label: 'Okres', value: kpis?.rangeStr ?? '—' },
        { key: 'energy', label: 'Σ Wh', value: fmtInt(kpis?.energySum ?? 0), bold: true },
        { key: 'avgCap', label: 'Śr. Ah', value: fmtNum(kpis?.avgCap ?? 0) },
        { key: 'avgVolt', label: 'Śr. V', value: fmtNum(kpis?.avgVolt ?? 0) },
        { key: 'avgCurr', label: 'Śr. A', value: fmtNum(kpis?.avgCurr ?? 0) },
      ]

      return { primary, secondary }
    },
  },

  compute: {
    normalize: ({ rows }) => {
      const list = Array.isArray(rows) ? rows : []
      return list.map((s) => ({
        ...s,
        code: (s.code ?? '').toString(),
        client: (s.client ?? '').toString(),
        subject: (s.subject ?? '').toString(),

        energyWh: toNum(s.energyWh),
        capacityAh: toNum(s.capacityAh),
        voltageV: toNum(s.voltageV),
        currentA: toNum(s.currentA),

        receivedDate: (s.receivedDate ?? '').toString(),
        testedDate: (s.testedDate ?? '').toString(),
      }))
    },

    range: ({ preset, customFrom, customTo, today = new Date() }) => {
      return computePresetRange(preset, { today, customFrom, customTo })
    },

    filter: ({ normalized, state, range }) => {
      const rows = Array.isArray(normalized) ? normalized : []
      const clientQ = (state.clientQuery || '').trim().toLowerCase()
      const code = state.code || 'all'
      const paramKey = state.paramKey || 'none'
      const paramMin = state.paramMin ?? ''
      const paramMax = state.paramMax ?? ''

      const from = range?.from || ''
      const to = range?.to || ''

      return rows.filter((s) => {
        if (clientQ && !String(s.client || '').toLowerCase().includes(clientQ)) return false
        if (code !== 'all' && s.code !== code) return false

        const d = mainDateISO(s)
        if (from && (!d || d.slice(0, 10) < from)) return false
        if (to && (!d || d.slice(0, 10) > to)) return false

        if (paramKey !== 'none') {
          if (!withinRange(s[paramKey], paramMin, paramMax)) return false
        }
        return true
      })
    },

    kpis: ({ filtered }) => {
      const list = Array.isArray(filtered) ? filtered : []

      const countsByCode = { AO: 0, AZ: 0, BP: 0, BW: 0 }
      const clients = new Set()
      const subjects = new Set()
      const monthKeys = new Set()

      let energySum = 0
      let capSum = 0
      let voltSum = 0
      let currSum = 0

      for (const s of list) {
        if (s.code && countsByCode[s.code] != null) countsByCode[s.code] += 1
        if (s.client) clients.add(s.client)
        if (s.subject) subjects.add(s.subject)

        const d = mainDateISO(s)
        const mk = monthKeyFromISO(d)
        if (mk) monthKeys.add(mk)

        energySum += toNum(s.energyWh)
        capSum += toNum(s.capacityAh)
        voltSum += toNum(s.voltageV)
        currSum += toNum(s.currentA)
      }

      const count = list.length || 0

      const dates = list.map((x) => mainDateISO(x)).filter(Boolean).sort()
      const rangeStr = dates.length ? `${dates[0]} – ${dates[dates.length - 1]}` : '—'

      return {
        count,
        countsByCode,
        clientsCount: clients.size,
        subjectsCount: subjects.size,
        monthsCount: monthKeys.size,
        rangeStr,

        energySum,
        avgCap: count ? capSum / count : 0,
        avgVolt: count ? voltSum / count : 0,
        avgCurr: count ? currSum / count : 0,
      }
    },

    charts: ({ filtered, groupBy, seriesLimit = 6 }) => {
      const c = buildChartData(filtered, groupBy, seriesLimit)
      const colors = c?.keys?.length ? getSeriesColors(c.keys) : []
      return { ...c, colors }
    },

    table: ({ filtered, groupBy }) => {
      const mode = groupBy || 'byCode'

      const byCodeRows = () => {
        const m = groupByKey(filtered, (s) => s.code || '—')
        const arr = []

        for (const [k, list] of m) {
          const clients = new Set(list.map((x) => x.client).filter(Boolean))
          const subjects = new Set(list.map((x) => x.subject).filter(Boolean))
          const sumEnergy = list.reduce((a, x) => a + toNum(x.energyWh), 0)
          const avgCap = list.length ? list.reduce((a, x) => a + toNum(x.capacityAh), 0) / list.length : 0
          const avgVolt = list.length ? list.reduce((a, x) => a + toNum(x.voltageV), 0) / list.length : 0
          const avgCurr = list.length ? list.reduce((a, x) => a + toNum(x.currentA), 0) / list.length : 0

          arr.push({
            group: k,
            count: list.length,
            clientsCount: clients.size,
            subjectsCount: subjects.size,
            energySumWh: sumEnergy,
            capAvgAh: avgCap,
            voltAvgV: avgVolt,
            currAvgA: avgCurr,
          })
        }
        return arr
      }

      const bySubjectRows = () => {
        const m = groupByKey(filtered, (s) => s.subject || '—')
        const arr = []

        for (const [k, list] of m) {
          const clients = new Set(list.map((x) => x.client).filter(Boolean))
          const AO = list.filter((x) => x.code === 'AO').length
          const AZ = list.filter((x) => x.code === 'AZ').length
          const BP = list.filter((x) => x.code === 'BP').length
          const BW = list.filter((x) => x.code === 'BW').length
          arr.push({ group: k, AO, AZ, BP, BW, total: list.length, clientsCount: clients.size })
        }
        return arr
      }

      const byClientRows = () => {
        const m = groupByKey(filtered, (s) => s.client || '—')
        const arr = []

        for (const [k, list] of m) {
          const subjects = new Set(list.map((x) => x.subject).filter(Boolean))
          const AO = list.filter((x) => x.code === 'AO').length
          const AZ = list.filter((x) => x.code === 'AZ').length
          const BP = list.filter((x) => x.code === 'BP').length
          const BW = list.filter((x) => x.code === 'BW').length

          const dates = list.map((x) => mainDateISO(x)).filter(Boolean).sort()
          const period = dates.length ? `${dates[0]} – ${dates[dates.length - 1]}` : '—'

          arr.push({ group: k, AO, AZ, BP, BW, total: list.length, subjectsCount: subjects.size, period })
        }
        return arr
      }

      const rows = mode === 'byCode' ? byCodeRows() : mode === 'bySubject' ? bySubjectRows() : byClientRows()

      return {
        columns: buildColumnsByMode(mode),
        rows,
      }
    },
  },
}
import { basePalette, dynamicColors, OTHER_COLOR } from '../palette'

// --- helpers: miesiąc jako klucz i jako label ---
const toMonthKeyUTC = (input) => {
  if (!input) return ''
  // Jeśli już przyszło w formacie YYYY-MM, zostaw
  if (typeof input === 'string' && /^\d{4}-\d{2}$/.test(input)) return input

  const d = new Date(input)
  const t = d.getTime()
  if (!Number.isFinite(t)) return ''
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1 // 1..12
  return `${y}-${String(m).padStart(2, '0')}`
}

const MONTHS_PL = [
  'styczeń','luty','marzec','kwiecień','maj','czerwiec',
  'lipiec','sierpień','wrzesień','październik','listopad','grudzień',
]

const monthLabelPL = (key) => {
  if (!key) return ''
  const [yStr, mStr] = key.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  if (!Number.isFinite(y) || !Number.isFinite(m)) return key
  const name = MONTHS_PL[((m - 1 + 12) % 12)]
  return `${name} ${y}`
}

const mainDate = (s) => s?.testedDate || s?.receivedDate || s?.date || ''

/**
 * Buduje dane pod wykresy dla SamplesSummary (ogólne).
 * @param {Array} filtered - przefiltrowane rekordy
 * @param {'byCode'|'bySubject'|'byClient'} groupBy
 * @param {number} limit - ile serii pokazać (reszta w „Pozostałe”)
 */
export function buildChartData(filtered, groupBy, limit = 5) {
  const keyFn =
    groupBy === 'byCode'    ? (s => s?.code    || '—') :
    groupBy === 'bySubject' ? (s => s?.subject || '—') :
                              (s => s?.client  || '—')

  // zliczenia grup
  const countsMap = new Map()
  for (const s of filtered || []) {
    const k = keyFn(s)
    countsMap.set(k, (countsMap.get(k) || 0) + 1)
  }

  // TOP N
  const sorted = Array.from(countsMap.entries()).sort((a, b) => b[1] - a[1])
  const topKeys =
    groupBy === 'byCode'
      ? ['AO', 'AZ', 'BP', 'BW'].filter(k => countsMap.has(k))
      : sorted.slice(0, limit).map(([k]) => k)

  const othersCount = sorted
    .filter(([k]) => !topKeys.includes(k))
    .reduce((acc, [, v]) => acc + v, 0)

  // Klucze do wyświetlenia (Pozostałe tylko gdy potrzebne)
  const keys = othersCount > 0 ? [...topKeys, 'Pozostałe'] : [...topKeys]

  // kolory
  const colors = {}
  if (groupBy === 'byCode') {
    keys.forEach(k => { colors[k] = k === 'Pozostałe' ? OTHER_COLOR : (basePalette[k] || OTHER_COLOR) })
  } else {
    keys.forEach((k, i) => { colors[k] = k === 'Pozostałe' ? OTHER_COLOR : dynamicColors[i % dynamicColors.length] })
  }

  // sumy na grupę (łącznie)
  const counts = {}
  keys.forEach(k => (counts[k] = 0))
  for (const [k, v] of countsMap) {
    const bucket = keys.includes(k) ? k : 'Pozostałe'
    if (counts[bucket] == null) counts[bucket] = 0
    counts[bucket] += v
  }

  // serie miesięczne
  const monthKeys = Array.from(
    new Set((filtered || []).map(s => toMonthKeyUTC(mainDate(s))).filter(Boolean))
  ).sort() // YYYY-MM sortuje się leksykograficznie poprawnie chronologicznie

  const monthIndex = new Map(monthKeys.map((m, i) => [m, i]))
  const series = {}
  keys.forEach(k => { series[k] = new Array(monthKeys.length).fill(0) })

  for (const s of filtered || []) {
    const mk = toMonthKeyUTC(mainDate(s))
    const i = monthIndex.get(mk)
    if (i == null) continue
    const k = keyFn(s)
    const targetKey = keys.includes(k) ? k : 'Pozostałe'
    series[targetKey][i] += 1
  }

  return {
    keys,
    colors,
    counts,
    monthLabels: monthKeys.map(monthLabelPL), // << nazwy miesięcy po polsku
    monthSeries: series,
    labelNazwa:
      groupBy === 'byCode'    ? 'kodów próbek' :
      groupBy === 'bySubject' ? 'przedmiotów badawczych' :
                                'klientów',
  }
}

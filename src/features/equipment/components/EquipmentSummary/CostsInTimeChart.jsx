// src/features/equipment/components/EquipmentSummary/CostsInTimeChart.jsx
import React, { useMemo } from 'react'

// >>> importy ze współdzielonego modułu
// Jeśli masz aliasy: import { StackedBarsByMonth, getSeriesColorMap } from '@shared/diagrams'
import { StackedBarsByMonth } from 'src/shared/diagrams'
import { getSeriesColorMap } from 'src/shared/diagrams/palette'

// stałe z Twojego constants – zostawiamy
import { AXIS, centeredLegend, fmtInt } from './constants'

// polskie nazwy miesięcy
const MONTHS_PL = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
]

// "2025-02" -> "luty 2025" (obsługuje też inne daty parsowalne przez Date)
function monthLabelFromAny(v) {
  if (typeof v === 'string' && /^\d{4}-\d{1,2}$/.test(v)) {
    const [y, m] = v.split('-').map(Number)
    return `${MONTHS_PL[((m - 1 + 12) % 12)]} ${y}`
  }
  const d = new Date(v)
  if (!Number.isFinite(d.getTime())) return String(v ?? '')
  return `${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * props:
 *  - data: [{ label: '2025-02', LAB1: 1234, LAB3: 567, ... }]
 *  - labMeta: [{ key: 'LAB1', lab: 'LAB1', color?: '#hex' }, ...]
 */
export default function CostsInTimeChart({ data = [], labMeta = [] }) {
  // labels (miesiące) w formacie słownym
  const labels = useMemo(() => data.map(d => monthLabelFromAny(d.label)), [data])

  // klucze serii (laboratoria) w stabilnej kolejności z labMeta
  const keys = useMemo(() => labMeta.map(lm => lm.key), [labMeta])

  // series: { key -> number[] } – wartości w kolejności labels
  const series = useMemo(() => {
    const map = {}
    for (const k of keys) map[k] = []
    for (const row of data) {
      for (const k of keys) map[k].push(Number(row[k] || 0))
    }
    return map
  }, [data, keys])

  // kolory: z labMeta.color albo ze współdzielonej palety (ładne, pastelowe)
  const colorMap = useMemo(() => {
    const explicit = {}
    labMeta.forEach(lm => { if (lm.color) explicit[lm.key] = lm.color })
    return Object.keys(explicit).length ? explicit : getSeriesColorMap(keys)
  }, [labMeta, keys])

  // tytuł osi Y – z jednostką
  const yAxisTitle = 'Koszt [PLN]'

  return (
    <div className="es-chart es-chart--borderless" style={{ width: '100%' }}>
      {/* ChartCard/Legend masz też w shared/diagrams, ale zostawiam prosty header zewnętrzny z Twojego layoutu */}
      <StackedBarsByMonth
        labels={labels}        // ["luty 2025", "marzec 2025", ...]
        series={series}        // { LAB1:[...], LAB3:[...] }
        keys={keys}            // ["LAB1","LAB3"]
        colors={colorMap}      // { LAB1:"#...", LAB3:"#..." }
        height={260}           // mniejszy niż Recharts (było ~380/300)
        showGrid               // delikatna siatka
        yTitle={yAxisTitle}    // tytuł osi Y z jednostką
        yTicksFormatter={v => fmtInt(v)}   // >>> BEZ "PLN" przy tickach <<<
        xTitle="Miesiąc"
        axisPadding={{ left: 56, bottom: 36 }} // żeby tytuły osi nie nachodziły
        legend={{
          items: labMeta.map(lm => ({ key: lm.key, label: lm.lab })),
          ...centeredLegend,
        }}
      />
    </div>
  )
}

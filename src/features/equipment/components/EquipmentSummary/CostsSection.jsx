import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Cell,
} from 'recharts'

import { getSeriesColorMap, getContrastColorMap } from '../../../../shared/diagrams/palette'

// wspólny temat wykresów EquipmentSummary
import {
  CHART,                // { height, margin, bar: { categoryGap, gap } }
  gridProps,             // spójny wygląd siatki
  legendProps,           // spójna legenda (pozycja/align)
  AxisTitleX,            // wyśrodkowany tytuł osi X
  AxisTitleY,            // wyśrodkowany tytuł osi Y
  yTickNumber,           // format liczb (bez jednostek) dla osi Y
  monthLabelFromAny,     // "2025-02" -> "luty 2025"
  fmtInt,                // format liczb do tooltipów/etykiet
} from './chartTheme'

// promień narożników dla danego „piętrka” w stacku
const stackRadius = (idx, total) => (idx === total - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0])

export default function CostsSection({ filteredCal, labsList }) {
  const [costMode, setCostMode] = useState('time') // 'time' | 'labs'

  const labMeta = useMemo(
    () => labsList.map((lab, i) => ({ lab, key: `lab_${i}` })),
    [labsList]
  )
  const labKeyMap = useMemo(() => new Map(labMeta.map(m => [m.lab, m.key])), [labMeta])

  // kolory z palety współdzielonej: kontrastowe + pastelowy fallback
  const baseColorMap = useMemo(() => getSeriesColorMap(labMeta.map(m => m.key)), [labMeta])
  const contrastMap  = useMemo(() => getContrastColorMap(labMeta.map(m => m.key)), [labMeta])
  const colorMap     = useMemo(() => ({ ...baseColorMap, ...contrastMap }), [baseColorMap, contrastMap])

  const monthKey = ts => {
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  // ---- wykres „w czasie” (stack wg laboratorium) ----
  const costsInTime = useMemo(() => {
    if (!filteredCal.length) return { data: [], months: [], total: [] }
    const agg = new Map()
    for (const c of filteredCal) {
      const mk = monthKey(c.startTs)
      if (!agg.has(mk)) {
        const base = { label: mk }
        for (const { key } of labMeta) base[key] = 0
        agg.set(mk, base)
      }
      const row = agg.get(mk)
      const key = labKeyMap.get(c.lab || '—')
      if (key) row[key] += c.costNum || 0
    }
    const months = Array.from(agg.keys()).sort()
    const data = months.map(m => agg.get(m))
    const total = data.map(d => labMeta.reduce((s, m) => s + (d[m.key] || 0), 0))
    return { data, months, total }
  }, [filteredCal, labMeta, labKeyMap])

  // ---- ranking laboratoriów ----
  const costsByLab = useMemo(() => {
    const sums = new Map(labMeta.map(m => [m.lab, 0]))
    for (const c of filteredCal) {
      const lab = c.lab || '—'
      sums.set(lab, (sums.get(lab) || 0) + (c.costNum || 0))
    }
    return labMeta
      .map(m => ({
        lab: m.lab,
        cost: sums.get(m.lab) || 0,
        color: colorMap[m.key],
      }))
      .sort((a, b) => b.cost - a.cost)
  }, [filteredCal, labMeta, colorMap])

  return (
    <div className='es-card es-section'>
      <div className='es-card__sectionHead'>
        <i className='fa-solid fa-circle-dollar-to-slot' aria-hidden='true' />
        <h3 className='es-card__sectionTitle'>Koszty wzorcowań</h3>
      </div>

      <div className='es-panel-head'>
        <div className='es-mode'>
          <span className='es-mode-label'>Tryb:</span>
          <select value={costMode} onChange={e => setCostMode(e.target.value)} className='es-select sm'>
            <option value='time'>W czasie (miesiące, wg laboratorium)</option>
            <option value='labs'>Ranking laboratoriów</option>
          </select>
        </div>
      </div>

      {costMode === 'time' ? (
        <div className='es-chart'>
          {costsInTime.data.length === 0 ? (
            <div className='es-empty'>Brak danych o kosztach</div>
          ) : (
            <ResponsiveContainer width='100%' height={CHART.height}>
              <BarChart
                data={costsInTime.data}
                margin={CHART.margin}
                barCategoryGap={CHART.bar.categoryGap}
                barGap={CHART.bar.gap}
              >
                <CartesianGrid {...gridProps} />

                <XAxis
                  type='category'
                  dataKey='label'
                  tickFormatter={monthLabelFromAny}
                  tickMargin={12}
                  interval='preserveStartEnd'
                  minTickGap={22}
                  axisLine
                  tickLine={false}
                  height={36}
                  label={<Label content={<AxisTitleX value='Miesiąc' />} />}
                />

                <YAxis
                  type='number'
                  axisLine
                  tickLine={false}
                  tickFormatter={yTickNumber} // bez „PLN”
                  label={<Label content={<AxisTitleY value='Koszt [PLN]' />} />}
                />

                <Tooltip
                  formatter={(value, name) => [fmtInt(value), name]}
                  labelFormatter={lab => `Miesiąc: ${monthLabelFromAny(lab)}`}
                />
                <Legend {...legendProps} />

                {labMeta.map((lm, i) => (
                  <Bar
                    key={lm.key}
                    dataKey={lm.key}
                    name={lm.lab}
                    stackId='cost'
                    fill={colorMap[lm.key]}
                    // tylko górny segment ma rounded top → brak „szpary”
                    radius={stackRadius(i, labMeta.length)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className='es-chart'>
          {costsByLab.length === 0 ? (
            <div className='es-empty'>Brak danych o kosztach</div>
          ) : (
            <ResponsiveContainer width='100%' height={CHART.height}>
              <BarChart
                layout='vertical'
                data={costsByLab}
                margin={{ ...CHART.margin, left: Math.max(CHART.margin.left, 190), bottom: 44 }}
                barCategoryGap={CHART.bar.categoryGap}
                barGap={CHART.bar.gap}
              >
                <CartesianGrid {...gridProps} />

                <XAxis
                  type='number'
                  tickFormatter={yTickNumber}
                  axisLine
                  tickLine={false}
                  label={<Label content={<AxisTitleX value='Koszt [PLN]' />} />}
                />
                <YAxis type='category' dataKey='lab' width={210} tickLine={false} axisLine interval={0} />

                <Tooltip formatter={v => [fmtInt(v), 'Koszt']} />
                <Legend {...legendProps} />

                <Bar dataKey='cost' name='Koszt' radius={[8, 8, 8, 8]}>
                  {costsByLab.map((row, idx) => (
                    <Cell key={`cell-${idx}`} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

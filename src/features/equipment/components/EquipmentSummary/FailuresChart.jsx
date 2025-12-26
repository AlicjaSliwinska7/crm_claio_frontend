import React, { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceLine,
} from 'recharts'

// wspólny temat wykresów EquipmentSummary
import {
  CHART,
  gridProps,
  legendProps,
  AxisTitleX,
  AxisTitleYLeft,
  AxisTitleYRight,   // <-- użyjemy dla prawej osi
  yTickNumber,
  monthLabelFromAny,
  fmtInt,
} from './chartTheme'

// kolory z palety współdzielonej
import { basePalette } from '../../../../shared/diagrams/palette'

export default function FailuresChart({ failuresChart }) {
  // ── Agregacja obu metryk per miesiąc ───────────────────────────────
  const monthly = useMemo(() => {
    const map = new Map() // 'YYYY-MM' -> { downtimeMonthly, repairMonthly }
    for (const f of failuresChart.data || []) {
      const d = new Date(f.dateTs)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const prev = map.get(key) || { downtimeMonthly: 0, repairMonthly: 0 }
      map.set(key, {
        downtimeMonthly: prev.downtimeMonthly + (Number(f.downtimeNum) || 0),
        repairMonthly: prev.repairMonthly + (Number(f.repairNum) || 0),
      })
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([monthKey, v]) => ({
        monthKey,
        monthLabel: monthLabelFromAny(monthKey),
        ...v,
      }))
  }, [failuresChart.data])

  return (
    <div className='es-card es-section'>
      <div className='es-card__sectionHead'>
        <i className='fa-solid fa-screwdriver-wrench' aria-hidden='true' />
        <h3 className='es-card__sectionTitle'>Awaryjność — czas przestoju i koszt napraw (mies.)</h3>
      </div>

      <div className='es-chart'>
        {!monthly.length ? (
          <div className='es-empty'>Brak danych o awariach</div>
        ) : (
          <ResponsiveContainer width='100%' height={CHART.height}>
            <ComposedChart
              data={monthly}
              margin={{ ...CHART.margin, right: Math.max(CHART.margin.right, 80) }}
              barCategoryGap={CHART.bar.categoryGap}
              barGap={CHART.bar.gap}
            >
              <CartesianGrid {...gridProps} />

              <XAxis
                type='category'
                dataKey='monthKey'
                tickFormatter={v => monthLabelFromAny(v)}
                interval='preserveStartEnd'
                minTickGap={22}
                tickMargin={10}
                axisLine
                tickLine={false}
                height={36}
                label={<Label content={<AxisTitleX value='Miesiąc' />} />}
              />

              <YAxis
                yAxisId='L'
                orientation='left'
                axisLine
                tickLine={false}
                tickFormatter={yTickNumber}
                label={<Label content={<AxisTitleYLeft value='Czas przestoju [h] (mies.)' />} />}
              />

              {/* PRAWA OŚ: tytuł obrócony w „dobrej” stronę i poprawnie odsunięty */}
              <YAxis
                yAxisId='R'
                orientation='right'
                axisLine
                tickLine={false}
                tickFormatter={yTickNumber}
                label={<Label content={<AxisTitleYRight value='Koszt naprawy [PLN] (mies.)' />} />}
              />

              <Tooltip
                labelFormatter={v => monthLabelFromAny(v)}
                formatter={(val, name) => {
                  if (name === 'downtimeMonthly') return [fmtInt(val), 'Przestój (mies.)']
                  if (name === 'repairMonthly')   return [fmtInt(val), 'Koszt naprawy (mies.)']
                  return [val, name]
                }}
              />
              <Legend {...legendProps} />

              <ReferenceLine yAxisId='L' y={0} stroke={basePalette.AXIS} strokeDasharray='3 6' />

              <Bar
                yAxisId='L'
                dataKey='downtimeMonthly'
                name='Przestój (mies.)'
                fill={basePalette.AZ}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />

              <Line
                yAxisId='R'
                type='monotone'
                dataKey='repairMonthly'
                name='Koszt naprawy (mies.)'
                stroke={basePalette.BP}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

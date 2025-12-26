// src/features/equipment/components/EquipmentSummary/GanttCalibrations.jsx
import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'

// Wspólny temat wykresów (spójne marginesy/osi/legendy)
import {
  CHART,          // { height, margin, bar: { categoryGap, gap } }
  gridProps,      // siatka
  legendProps,    // legenda
  AxisTitleX,     // wyśrodkowany tytuł X
  AxisTitleY,     // wyśrodkowany tytuł Y (lewa)
  dateTickYmd,    // formatter ticków X: (domainMin) => (v) -> 'YYYY-MM-DD'
} from './chartTheme'

// Kolor z palety współdzielonej
import { basePalette } from '../../../../shared/diagrams/palette'

/**
 * props:
 *   gantt.rows = [{ code, offset, duration, startTs, endTs }]
 *   gantt.domainMin / gantt.span / gantt.pad
 */

const DAY = 24 * 60 * 60 * 1000

function buildModelFromRows(rawRows) {
  // rawRows: [{ code, startTs, endTs }]
  const rowsClean = (Array.isArray(rawRows) ? rawRows : [])
    .map(r => {
      const s = Number(r.startTs)
      const e = Number(r.endTs)
      if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null
      return { code: r.code || '—', startTs: s, endTs: e }
    })
    .filter(Boolean)

  if (!rowsClean.length) return { rows: [], domainMin: 0, span: 0, pad: 0 }

  const domainMin = Math.min(...rowsClean.map(r => r.startTs))
  const domainMax = Math.max(...rowsClean.map(r => r.endTs))
  const span = Math.max(1, domainMax - domainMin)
  const pad = Math.round(span * 0.05) // 5% luzu po bokach

  const rows = rowsClean.map(r => ({
    ...r,
    offset: r.startTs - domainMin,
    duration: r.endTs - r.startTs,
  }))

  return { rows, domainMin, span, pad }
}

const SAMPLE_ROWS = [
  { code: 'EQ-WG-10', startTs: Date.parse('2025-02-01'), endTs: Date.parse('2025-02-03') },
  { code: 'EQ-TH-A',  startTs: Date.parse('2025-02-15'), endTs: Date.parse('2025-02-16') },
  { code: 'M-001',    startTs: Date.parse('2025-03-10'), endTs: Date.parse('2025-03-12') },
]

export default function GanttCalibrations({ gantt }) {
  const model = useMemo(() => {
    const hasProvided =
      gantt &&
      Array.isArray(gantt.rows) &&
      gantt.rows.length > 0 &&
      Number.isFinite(gantt.domainMin) &&
      Number.isFinite(gantt.span)

    if (hasProvided) return gantt

    const looksLikeRaw =
      gantt &&
      Array.isArray(gantt.rows) &&
      gantt.rows.length > 0 &&
      'startTs' in (gantt.rows[0] || {}) &&
      'endTs' in (gantt.rows[0] || {})

    if (looksLikeRaw) return buildModelFromRows(gantt.rows)
    return buildModelFromRows(SAMPLE_ROWS)
  }, [gantt])

  return (
    <div className='es-card es-section'>
      <div className='es-card__sectionHead'>
        <i className='fa-solid fa-sitemap' aria-hidden='true' />
        <h3 className='es-card__sectionTitle'>Wzorcowania — Wykres Gantta</h3>
      </div>

      <div className='es-gantt-shell es-gantt-shell--full'>
        <div className='es-gantt-inner es-gantt-inner--full'>
          {!model.rows || model.rows.length === 0 ? (
            <div className='es-empty'>Brak pozycji do wyświetlenia</div>
          ) : (
            <ResponsiveContainer width='100%' height={CHART.height}>
              <BarChart
                layout='vertical'
                data={model.rows}
                // Spójne dolne marginesy jak w innych wykresach; lewy ciaśniejszy dla labeli Y
                margin={{ ...CHART.margin, left: 56, bottom: CHART.margin.bottom }}
              >
                <CartesianGrid {...gridProps} />

                <XAxis
                  type='number'
                  domain={[-model.pad, model.span + model.pad]}
                  tickFormatter={dateTickYmd(model.domainMin)}
                  interval='preserveStartEnd'
                  minTickGap={24}
                  tickMargin={8}
                  allowDataOverflow
                  scale='time'
                  axisLine
                  tickLine
                  height={36}
                  // Tytuł osi X obniżony spójnie (dy=50)
                  label={<Label content={<AxisTitleX value='Data' dy={50} />} />}
                />

                <YAxis
                  type='category'
                  dataKey='code'
                  width={104}
                  tickLine={false}
                  axisLine
                  interval={0}
                  label={<Label content={<AxisTitleY value='Urządzenie' />} />}
                />

                <Tooltip
                  // Czytelne wartości: dni; offset ukryty
                  formatter={(value, _name, entry) => {
                    const key = entry?.dataKey
                    if (key === 'duration') {
                      const days = Math.round(Number(value) / DAY)
                      return [`${days} dni`, 'Czas trwania']
                    }
                    if (key === 'offset') return [null, null] // ukryj offset
                    return [value, key]
                  }}
                  filterNull
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload
                    if (!p) return ''
                    const start = new Date(p.startTs).toLocaleDateString('pl-PL')
                    const end = new Date(p.endTs).toLocaleDateString('pl-PL')
                    return `${p.code}   (${start} → ${end})`
                  }}
                />

                <Legend {...legendProps} />

                {/* offset tylko „przesuwa” słupek — brak legendy/koloru */}
                <Bar
                  dataKey='offset'
                  stackId='g'
                  fill='transparent'
                  isAnimationActive={false}
                  name=''
                  legendType='none'
                />
                <Bar
                  dataKey='duration'
                  stackId='g'
                  fill={basePalette.AO}
                  name='Czas trwania'
                  radius={[4, 4, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

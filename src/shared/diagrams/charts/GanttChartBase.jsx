// src/shared/diagrams2/charts/GanttChartBase.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import BaseResponsive from './parts/BaseResponsive'
import BaseTooltip from './parts/BaseTooltip'

/**
 * GanttChartBase (SUROWY)
 *
 * data: [{ label, start, duration, color? , ... }]
 * - start i duration: liczby (np. timestamp, dayIndex, minutes) — znaczenie nadaje wrapper
 * - brak tytułów, brak nazw osi, brak domeny (testy/PLN/daty)
 * - opcjonalnie: color per item (Cell)
 */
export default function GanttChartBase({
  data = [],
  yKey = 'label',
  startKey = 'start',
  durationKey = 'duration',
  colorKey = 'color',

  margin = { top: 16, right: 16, bottom: 16, left: 140 },
  showGrid = true,

  // formatery opcjonalne (wrapper decyduje)
  xTickFormatter,
  tooltipLabelFormatter,
  tooltipValueFormatter,

  // jeśli chcesz stały kolor zamiast per-item
  barFill = undefined,
}) {
  // Recharts “stacked bars”: najpierw start (transparent), potem duration (kolor)
  const normalized = useMemo(() => {
    return (Array.isArray(data) ? data : []).map((d) => ({
      ...d,
      __start: Number(d?.[startKey]) || 0,
      __dur: Number(d?.[durationKey]) || 0,
    }))
  }, [data, startKey, durationKey])

  return (
    <div className="d2-chart d2-chart--h440">
      <BaseResponsive>
        <BarChart data={normalized} layout="vertical" margin={margin}>
          {showGrid ? <CartesianGrid strokeDasharray="3 3" /> : null}

          <XAxis type="number" tickFormatter={xTickFormatter} />
          <YAxis type="category" dataKey={yKey} width={140} />

          <Tooltip content={<BaseTooltip labelFormatter={tooltipLabelFormatter} valueFormatter={tooltipValueFormatter} />} />

          {/* “offset bar” — niewidzialny start */}
          <Bar dataKey="__start" stackId="g" fill="rgba(0,0,0,0)" isAnimationActive={false} />

          {/* duration */}
          <Bar
            dataKey="__dur"
            stackId="g"
            isAnimationActive={false}
            radius={[8, 8, 8, 8]}
            fill={barFill}
          >
            {/* per item color (jeśli jest) */}
            {barFill ? null : normalized.map((d, i) => <Cell key={i} fill={d?.[colorKey]} />)}
          </Bar>
        </BarChart>
      </BaseResponsive>
    </div>
  )
}

GanttChartBase.propTypes = {
  data: PropTypes.array,
  yKey: PropTypes.string,
  startKey: PropTypes.string,
  durationKey: PropTypes.string,
  colorKey: PropTypes.string,

  margin: PropTypes.object,
  showGrid: PropTypes.bool,

  xTickFormatter: PropTypes.func,
  tooltipLabelFormatter: PropTypes.func,
  tooltipValueFormatter: PropTypes.func,

  barFill: PropTypes.string,
}
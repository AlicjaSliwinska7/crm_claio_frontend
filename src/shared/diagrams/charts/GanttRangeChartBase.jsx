// src/shared/diagrams2/charts/GanttRangeChartBase.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import BaseResponsive from './parts/BaseResponsive'
import BaseTooltip from './parts/BaseTooltip'

/**
 * GanttRangeChartBase (SUROWY)
 *
 * data: [{ label, start, end, color?, ... }]
 * - start i end: liczby (np. timestamp, dayIndex, minutes) — znaczenie nadaje wrapper
 * - duration = max(0, end - start) liczone wewnątrz
 * - brak tytułów, brak nazw osi, brak domeny
 * - opcjonalnie: color per item (Cell) albo stały barFill
 */
export default function GanttRangeChartBase({
  data = [],
  yKey = 'label',
  startKey = 'start',
  endKey = 'end',
  colorKey = 'color',

  margin = { top: 16, right: 16, bottom: 16, left: 140 },
  showGrid = true,

  xTickFormatter,
  tooltipLabelFormatter,
  tooltipValueFormatter,

  barFill = undefined, // jeśli podasz, będzie jednolity kolor
}) {
  const normalized = useMemo(() => {
    const arr = Array.isArray(data) ? data : []
    return arr.map((d) => {
      const start = Number(d?.[startKey]) || 0
      const end = Number(d?.[endKey]) || 0
      const dur = Math.max(0, end - start)

      return {
        ...d,
        __start: start,
        __dur: dur,
        __end: end,
      }
    })
  }, [data, startKey, endKey])

  return (
    <div className="d2-chart d2-chart--h440">
      <BaseResponsive>
        <BarChart data={normalized} layout="vertical" margin={margin}>
          {showGrid ? <CartesianGrid strokeDasharray="3 3" /> : null}

          <XAxis type="number" tickFormatter={xTickFormatter} />
          <YAxis type="category" dataKey={yKey} width={140} />

          <Tooltip content={<BaseTooltip labelFormatter={tooltipLabelFormatter} valueFormatter={tooltipValueFormatter} />} />

          {/* offset bar */}
          <Bar dataKey="__start" stackId="g" fill="rgba(0,0,0,0)" isAnimationActive={false} />

          {/* duration bar */}
          <Bar
            dataKey="__dur"
            stackId="g"
            isAnimationActive={false}
            radius={[8, 8, 8, 8]}
            fill={barFill}
          >
            {barFill
              ? null
              : normalized.map((d, i) => <Cell key={i} fill={d?.[colorKey]} />)}
          </Bar>
        </BarChart>
      </BaseResponsive>
    </div>
  )
}

GanttRangeChartBase.propTypes = {
  data: PropTypes.array,
  yKey: PropTypes.string,
  startKey: PropTypes.string,
  endKey: PropTypes.string,
  colorKey: PropTypes.string,

  margin: PropTypes.object,
  showGrid: PropTypes.bool,

  xTickFormatter: PropTypes.func,
  tooltipLabelFormatter: PropTypes.func,
  tooltipValueFormatter: PropTypes.func,

  barFill: PropTypes.string,
}
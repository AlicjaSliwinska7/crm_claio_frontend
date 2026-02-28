// src/shared/diagrams2/charts/LineChartBase.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import BaseResponsive from './parts/BaseResponsive'
import BaseTooltip from './parts/BaseTooltip'
import BaseLegend from './parts/BaseLegend'

/**
 * series: [{ key, name?, stroke?, dot?, activeDot? }]
 * - brak tytułów, brak nazw osi
 * - formatery opcjonalne, dostarczane przez wrapper
 */
export default function LineChartBase({
  data = [],
  xKey = 'x',
  series = [],
  margin = { top: 16, right: 16, bottom: 16, left: 10 },

  showGrid = true,
  showLegend = true,
  showTooltip = true,

  xTickFormatter,
  yTickFormatter,
  tooltipLabelFormatter,
  tooltipValueFormatter,
}) {
  const lines = useMemo(() => {
    return (series || []).map((s, idx) => (
      <Line
        key={s.key || idx}
        type="monotone"
        dataKey={s.key}
        name={s.name}
        stroke={s.stroke}
        dot={s.dot ?? false}
        activeDot={s.activeDot ?? { r: 4 }}
        strokeWidth={2}
      />
    ))
  }, [series])

  return (
    <div className="d2-chart">
      <BaseResponsive>
        <LineChart data={data} margin={margin}>
          {showGrid ? <CartesianGrid strokeDasharray="3 3" /> : null}

          <XAxis dataKey={xKey} tickFormatter={xTickFormatter} />
          <YAxis tickFormatter={yTickFormatter} />

          {showTooltip ? (
            <Tooltip content={<BaseTooltip labelFormatter={tooltipLabelFormatter} valueFormatter={tooltipValueFormatter} />} />
          ) : null}

          {showLegend ? <Legend content={<BaseLegend />} /> : null}

          {lines}
        </LineChart>
      </BaseResponsive>
    </div>
  )
}

LineChartBase.propTypes = {
  data: PropTypes.array,
  xKey: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string,
      stroke: PropTypes.string,
      dot: PropTypes.any,
      activeDot: PropTypes.any,
    })
  ),
  margin: PropTypes.object,

  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,

  xTickFormatter: PropTypes.func,
  yTickFormatter: PropTypes.func,
  tooltipLabelFormatter: PropTypes.func,
  tooltipValueFormatter: PropTypes.func,
}
// src/shared/diagrams2/charts/BarChartBase.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import BaseResponsive from './parts/BaseResponsive'
import BaseTooltip from './parts/BaseTooltip'
import BaseLegend from './parts/BaseLegend'

export default function BarChartBase({
  data = [],
  xKey = 'x',
  series = [], // [{ key, name?, fill?, stackId? }]
  margin = { top: 16, right: 16, bottom: 16, left: 10 },

  showGrid = true,
  showLegend = true,
  showTooltip = true,

  xTickFormatter,
  yTickFormatter,
  tooltipLabelFormatter,
  tooltipValueFormatter,
}) {
  const bars = useMemo(() => {
    return (series || []).map((s, idx) => (
      <Bar key={s.key || idx} dataKey={s.key} name={s.name} fill={s.fill} stackId={s.stackId} radius={[6, 6, 0, 0]} />
    ))
  }, [series])

  return (
    <div className="d2-chart">
      <BaseResponsive>
        <BarChart data={data} margin={margin}>
          {showGrid ? <CartesianGrid strokeDasharray="3 3" /> : null}
          <XAxis dataKey={xKey} tickFormatter={xTickFormatter} />
          <YAxis tickFormatter={yTickFormatter} />

          {showTooltip ? (
            <Tooltip content={<BaseTooltip labelFormatter={tooltipLabelFormatter} valueFormatter={tooltipValueFormatter} />} />
          ) : null}
          {showLegend ? <Legend content={<BaseLegend />} /> : null}

          {bars}
        </BarChart>
      </BaseResponsive>
    </div>
  )
}

BarChartBase.propTypes = {
  data: PropTypes.array,
  xKey: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string,
      fill: PropTypes.string,
      stackId: PropTypes.string,
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
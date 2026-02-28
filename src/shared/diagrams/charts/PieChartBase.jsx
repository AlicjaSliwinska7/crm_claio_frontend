// src/shared/diagrams2/charts/PieChartBase.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import BaseResponsive from './parts/BaseResponsive'
import BaseTooltip from './parts/BaseTooltip'
import BaseLegend from './parts/BaseLegend'

/**
 * data: [{ name, value, color? }]
 * - brak tytułów, brak “PLN/%”
 */
export default function PieChartBase({
  data = [],
  valueKey = 'value',
  nameKey = 'name',

  innerRadius = 55,
  outerRadius = 95,

  showLegend = true,
  showTooltip = true,

  tooltipValueFormatter,
}) {
  const cells = useMemo(() => {
    return (data || []).map((d, idx) => <Cell key={`${d?.[nameKey] ?? idx}`} fill={d?.color} />)
  }, [data, nameKey])

  return (
    <div className="d2-chart d2-chart--h320">
      <BaseResponsive>
        <PieChart>
          {showTooltip ? <Tooltip content={<BaseTooltip valueFormatter={tooltipValueFormatter} />} /> : null}
          {showLegend ? <Legend content={<BaseLegend />} /> : null}

          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2}>
            {cells}
          </Pie>
        </PieChart>
      </BaseResponsive>
    </div>
  )
}

PieChartBase.propTypes = {
  data: PropTypes.array,
  valueKey: PropTypes.string,
  nameKey: PropTypes.string,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  tooltipValueFormatter: PropTypes.func,
}
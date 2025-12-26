import React from 'react'
import PropTypes from 'prop-types'

/**
 * Przełączniki sposobu rysowania (grouped/stacked/line), metryki i opcji pomocniczych.
 * Każdy prop jest opcjonalny – renderujemy tylko to, co przekazano.
 */
export default function ChartToolbar({
  chartType, setChartType, chartTypes = ['grouped','stacked','line'],
  metric, setMetric, metrics = [], // np. [{key:'testsCount', label:'Badania'}, ...]
  asPercent, setAsPercent,
  showTotals, setShowTotals,
  children, // slot na kolejne kontrolki
}) {
  return (
    <div className="sum-chartbar">
      {setChartType && (
        <label className="sum-filter">
          <span>Wykres</span>
          <select value={chartType} onChange={e => setChartType(e.target.value)}>
            {chartTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      )}

      {setMetric && metrics?.length > 0 && (
        <label className="sum-filter">
          <span>Metryka</span>
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </label>
      )}

      {typeof asPercent === 'boolean' && setAsPercent && (
        <label className="sum-check">
          <input type="checkbox" checked={asPercent} onChange={e => setAsPercent(e.target.checked)} />
          <span>% udział</span>
        </label>
      )}

      {typeof showTotals === 'boolean' && setShowTotals && (
        <label className="sum-check">
          <input type="checkbox" checked={showTotals} onChange={e => setShowTotals(e.target.checked)} />
          <span>Pokaż sumy</span>
        </label>
      )}

      <div className="sum-chartbar__extra">{children}</div>
    </div>
  )
}
ChartToolbar.propTypes = {
  chartType: PropTypes.string,
  setChartType: PropTypes.func,
  chartTypes: PropTypes.array,
  metric: PropTypes.string,
  setMetric: PropTypes.func,
  metrics: PropTypes.array,
  asPercent: PropTypes.bool,
  setAsPercent: PropTypes.func,
  showTotals: PropTypes.bool,
  setShowTotals: PropTypes.func,
  children: PropTypes.node,
}

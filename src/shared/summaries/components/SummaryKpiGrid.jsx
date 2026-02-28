// src/shared/summaries/components/SummaryKpiGrid.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

function SummaryKpiTile({ label, value, sub }) {
  return (
    <div className="sum-kpi-tile">
      <div className="sum-kpi-value">{value}</div>
      <div className="sum-kpi-underline" aria-hidden="true" />
      <div className="sum-kpi-label">{label}</div>
      {sub ? <div className="sum-kpi-sub">{sub}</div> : null}
    </div>
  )
}

SummaryKpiTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  sub: PropTypes.string,
}

function SummaryKpiGrid({ items = [], columns = 5, className = '', ariaLabel = 'KPI' }) {
  const safe = Array.isArray(items) ? items : []
  const cols = Number(columns) || 5

  return (
    <div
      className={`sum-kpi-grid ${className}`.trim()}
      style={{ '--sum-kpi-cols': cols }}
      role="list"
      aria-label={ariaLabel}
    >
      {safe.map((it, idx) => (
        <div key={it.key || it.label || idx} role="listitem">
          <SummaryKpiTile label={it.label} value={it.value} sub={it.sub} />
        </div>
      ))}
    </div>
  )
}

SummaryKpiGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      sub: PropTypes.string,
    })
  ),
  columns: PropTypes.number,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
}

export default memo(SummaryKpiGrid)
export { SummaryKpiTile }
// src/shared/summary2/components/SummaryKpiItem.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function SummaryKpiItem({ label, value, icon = null }) {
  return (
    <span className="tss-kpi">
      {icon ? <span className="tss-kpi__icon" aria-hidden="true">{icon}</span> : null}
      <strong className="tss-kpi__value">{value}</strong>
      <span className="tss-kpi__label">{label}</span>
    </span>
  )
}

SummaryKpiItem.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.node,
}
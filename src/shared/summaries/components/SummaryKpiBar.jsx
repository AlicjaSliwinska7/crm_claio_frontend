// src/shared/summary2/components/SummaryKpiBar.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryKpiBar({
  className = '',
  row,
  sub,
}) {
  return (
    <div className={clsx('tss-card', 'tss-kpis', className)}>
      {row ? <div className="tss-kpis__row">{row}</div> : null}
      {sub ? <div className="tss-kpis__sub">{sub}</div> : null}
    </div>
  )
}

SummaryKpiBar.propTypes = {
  className: PropTypes.string,
  row: PropTypes.node,
  sub: PropTypes.node,
}
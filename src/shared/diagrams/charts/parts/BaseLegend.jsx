// src/shared/diagrams2/charts/parts/BaseLegend.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function BaseLegend({ payload }) {
  if (!payload?.length) return null
  return (
    <div className="d2-legend">
      {payload.map((p, idx) => {
        const name = p?.value ?? p?.dataKey ?? ''
        const color = p?.color ?? p?.stroke ?? p?.fill
        return (
          <span key={`${name}-${idx}`} className="d2-legend__item" style={{ color }}>
            <span className="d2-legend__dot" aria-hidden="true" />
            <span>{name}</span>
          </span>
        )
      })}
    </div>
  )
}

BaseLegend.propTypes = { payload: PropTypes.array }
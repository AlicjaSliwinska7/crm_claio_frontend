// src/shared/diagrams2/charts/parts/BaseTooltip.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function BaseTooltip({ active, label, payload, labelFormatter, valueFormatter }) {
  if (!active || !payload?.length) return null

  const safeLabel = typeof labelFormatter === 'function' ? labelFormatter(label) : label

  return (
    <div className="d2-tooltip">
      {safeLabel != null && safeLabel !== '' ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{safeLabel}</div> : null}

      <div style={{ display: 'grid', gap: 4 }}>
        {payload.map((p, idx) => {
          const name = p?.name ?? p?.dataKey ?? ''
          const val = p?.value
          const shown = typeof valueFormatter === 'function' ? valueFormatter(val, p) : val
          const color = p?.color || p?.stroke || p?.fill

          return (
            <div key={`${name}-${idx}`} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="d2-legend__dot" style={{ color }} aria-hidden="true" />
              <span style={{ opacity: 0.85 }}>{name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{shown}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

BaseTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.any,
  payload: PropTypes.array,
  labelFormatter: PropTypes.func,
  valueFormatter: PropTypes.func,
}
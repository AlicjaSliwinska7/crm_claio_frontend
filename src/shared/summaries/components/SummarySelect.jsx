import React from 'react'
import PropTypes from 'prop-types'

export default function SummarySelect({
  id,
  label,
  value,
  onChange,
  options = [],
  style,
}) {
  return (
    <div className="es-col" style={style}>
      <label className="es-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="tss-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

SummarySelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.any, label: PropTypes.string })),
  style: PropTypes.object,
}

import React from 'react'
import PropTypes from 'prop-types'
import { Search } from 'lucide-react'

export default function SummarySearchBox({
  id,
  label = 'Szukaj',
  placeholder = 'Szukaj…',
  value,
  onChange,
}) {
  return (
    <div className="es-col" style={{ minWidth: 280 }}>
      <label className="es-label" htmlFor={id}>{label}</label>
      <div className="tss-search__box tss-search__box--limit">
        <span className="tss-search__icon" aria-hidden="true"><Search size={16} /></span>
        <input
          id={id}
          type="text"
          className="tss-input tss-input--search"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          name={id}
          aria-label={label}
        />
      </div>
    </div>
  )
}

SummarySearchBox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

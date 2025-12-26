import React from 'react'
import PropTypes from 'prop-types'

export default function ClientSelect({
  label = 'Klient',
  value,
  onChange,
  options = [],
  placeholder = 'Wybierz klienta...',
  datalistId = 'clients-list',
  clearable = true,
}) {
  return (
    <label className="sum-filter" style={{ minWidth: 280 }}>
      <span>{label}</span>
      <div className="ts-inline">
        <input
          type="text"
          list={datalistId}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="tss-input"
        />
        <datalist id={datalistId}>
          {options.map(opt => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
        {clearable && value && (
          <button
            type="button"
            className="tss-btn"
            onClick={() => onChange('')}
            title="Wyczyść"
            aria-label="Wyczyść"
          >
            Wyczyść
          </button>
        )}
      </div>
    </label>
  )
}

ClientSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  datalistId: PropTypes.string,
  clearable: PropTypes.bool,
}

import React from 'react'
import PropTypes from 'prop-types'

export default function PageSizeSelect({ id, label = 'Na stronę', value, setValue, resetPage, options = [10,20,50,100] }) {
  return (
    <div className="es-col" style={{ maxWidth: 180 }}>
      <label className="es-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="tss-select"
        value={value}
        onChange={e => { setValue(Number(e.target.value)||value); resetPage?.() }}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}

PageSizeSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.number.isRequired,
  setValue: PropTypes.func.isRequired,
  resetPage: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.number),
}

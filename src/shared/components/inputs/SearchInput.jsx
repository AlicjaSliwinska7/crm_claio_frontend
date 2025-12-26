import React from 'react'
import PropTypes from 'prop-types'

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Szukaj...',
  className = '',
  ...rest
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  )
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
}

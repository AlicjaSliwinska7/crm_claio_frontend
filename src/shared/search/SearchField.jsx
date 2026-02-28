// src/shared/components/inputs/SearchField.jsx
import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import SearchInput from './SearchInput'

const SearchField = forwardRef(function SearchField(
  {
    value = '',
    onChange,
    placeholder = 'Szukaj...',
    name = 'search',
    autoFocus = false,
    onSubmit,
    ariaLabel,
    className = '',
    inputClassName = '',
    type = 'text', // pozwolimy ustawić "search"
  },
  ref
) {
  const handleKeyDown = e => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={`search-wrapper ${className}`}>
      <div className="search-container">
        <SearchInput
            ref={ref}            
            type={type}
            name={name}
            className={`search-bar ${inputClassName}`}
            value={value}
            onChange={next => onChange?.(next)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel || placeholder}
            autoFocus={autoFocus}
        />

        <button
          type="button"
          className="search-icon"
          aria-label="Szukaj"
          onClick={onSubmit || (() => {})}
        >
          <i className="fas fa-search" />
        </button>
      </div>
    </div>
  )
})

SearchField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
  onSubmit: PropTypes.func,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  type: PropTypes.string,
}

export default SearchField

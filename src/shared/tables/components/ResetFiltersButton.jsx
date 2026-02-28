import React, { memo } from 'react'
import PropTypes from 'prop-types'

function ResetFiltersButton({
  onClick,
  title = 'Wyczyść filtry',
  ariaLabel = 'Wyczyść filtry',
  className = '',
  disabled = false,
  type = 'button',
}) {
  const cls = ['reset-filters-button', className].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {/* SSOT ikonki resetu filtrów */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m15 9-6 6"></path>
        <path d="m9 9 6 6"></path>
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  )
}

ResetFiltersButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}

export default memo(ResetFiltersButton)

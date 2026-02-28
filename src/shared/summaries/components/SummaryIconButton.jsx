// src/shared/summary2/components/SummaryIconButton.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryIconButton({
  className = '',
  title,
  onClick,
  disabled = false,
  children,
  type = 'button',
}) {
  return (
    <button
      type={type}
      className={clsx('tss-icon-btn', className)}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

SummaryIconButton.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.string,
}
// src/shared/summary2/components/SummarySubtitle.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummarySubtitle({ className = '', children, align = 'center' }) {
  const base = align === 'left' ? 'ts-subtitle' : 'es-subtitle'
  return <div className={clsx(base, className)}>{children}</div>
}

SummarySubtitle.propTypes = {
  className: PropTypes.string,
  align: PropTypes.oneOf(['center', 'left']),
  children: PropTypes.node,
}
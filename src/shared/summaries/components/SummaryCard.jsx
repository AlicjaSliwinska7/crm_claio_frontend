// src/shared/summary2/components/SummaryCard.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryCard({
  className = '',
  variant = 'es', // 'es' | 'ts'
  children,
}) {
  const base = variant === 'ts' ? 'ts-card' : 'es-card'
  return <div className={clsx(base, className)}>{children}</div>
}

SummaryCard.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['es', 'ts']),
  children: PropTypes.node,
}
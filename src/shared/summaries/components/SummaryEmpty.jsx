// src/shared/summary2/components/SummaryEmpty.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryEmpty({ className = '', variant = 'tss', children = 'Brak danych' }) {
  const base = variant === 'es' ? 'es-empty' : 'tss-empty'
  return <div className={clsx(base, className)}>{children}</div>
}

SummaryEmpty.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['tss', 'es']),
  children: PropTypes.node,
}
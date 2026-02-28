// src/shared/summary2/components/SummaryControlCol.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryControlCol({ className = '', actions = false, children }) {
  return (
    <div className={clsx('es-col', actions && 'es-col--actions', className)}>
      {children}
    </div>
  )
}

SummaryControlCol.propTypes = {
  className: PropTypes.string,
  actions: PropTypes.bool,
  children: PropTypes.node,
}
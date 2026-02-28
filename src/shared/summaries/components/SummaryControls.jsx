// src/shared/summary2/components/SummaryControls.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryControls({ className = '', children }) {
  return <div className={clsx('es-panel-controls', className)}>{children}</div>
}

SummaryControls.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
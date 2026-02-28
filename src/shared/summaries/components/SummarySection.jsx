// src/shared/summary2/components/SummarySection.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummarySection({ className = '', children }) {
  return <section className={clsx('es-section', className)}>{children}</section>
}

SummarySection.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
// src/shared/summary2/components/SummaryRoot.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryRoot({
  className = '',
  legacyClassName = '', // np. "tests-summary es-root" żeby 1:1 zachować CSS
  children,
}) {
  return (
    <div className={clsx('summary2-root', legacyClassName, className)}>
      {children}
    </div>
  )
}

SummaryRoot.propTypes = {
  className: PropTypes.string,
  legacyClassName: PropTypes.string,
  children: PropTypes.node,
}
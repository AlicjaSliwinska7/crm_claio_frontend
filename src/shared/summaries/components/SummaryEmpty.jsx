import React from 'react'
import PropTypes from 'prop-types'

export default function SummaryEmpty({ children = 'Brak danych.' }) {
  return <div className="muted ts-empty">{children}</div>
}
SummaryEmpty.propTypes = { children: PropTypes.node }

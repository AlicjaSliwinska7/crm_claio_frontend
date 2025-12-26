// src/shared/summaries/components/KpisGrid.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function KpisGrid({ children }) {
	return <div className='es-kpi-grid'>{children}</div>
}

KpisGrid.propTypes = {
	children: PropTypes.node,
}

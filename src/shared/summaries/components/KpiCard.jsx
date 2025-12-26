// src/shared/summaries/components/KpiCard.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function KpiCard({ icon, value, label, ariaLabel, title }) {
	return (
		<div className='es-kpi' role='group' aria-label={ariaLabel || label}>
			<div className='es-kpi__value' title={title}>
				{icon ? <span style={{ verticalAlign: '-2px', marginRight: 4 }}>{icon}</span> : null}
				{value}
			</div>
			<div className='es-kpi__label'>{label}</div>
		</div>
	)
}

KpiCard.propTypes = {
	icon: PropTypes.node,
	value: PropTypes.node.isRequired,
	label: PropTypes.string.isRequired,
	ariaLabel: PropTypes.string,
	title: PropTypes.string,
}

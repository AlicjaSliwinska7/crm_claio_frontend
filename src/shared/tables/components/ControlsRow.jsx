// src/shared/tables/components/ControlsRow.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

function ControlsRow({
	children,
	className = '',
	style, // pozwala nadpisać inline style bez zmiany domyślnego wyglądu
}) {
	const baseStyle = {
		display: 'flex',
		gap: 8,
		flexWrap: 'wrap',
		alignItems: 'center',
		...style,
	}

	const classes = ['list-controls-row', className].filter(Boolean).join(' ')

	return (
		<div className={classes} style={baseStyle}>
			{children}
		</div>
	)
}

ControlsRow.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	style: PropTypes.object,
}

export default memo(ControlsRow)

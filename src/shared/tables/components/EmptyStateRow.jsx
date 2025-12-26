// src/shared/tables/components/EmptyStateRow.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

function EmptyStateRow({ colSpan = 1, text = 'Brak wyników.', className = 'empty-row', cellClassName = '' }) {
	return (
		<tr className={className}>
			<td colSpan={colSpan} className={cellClassName} style={{ textAlign: 'center', padding: 12 }}>
				{text}
			</td>
		</tr>
	)
}

EmptyStateRow.propTypes = {
	colSpan: PropTypes.number,
	text: PropTypes.string,
	className: PropTypes.string,
	cellClassName: PropTypes.string,
}

export default memo(EmptyStateRow)

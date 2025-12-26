// src/shared/tables/components/ListSummary.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

function ListSummary({ items = [], ariaLabel = 'Podsumowanie listy' }) {
	// items: np. [['Kontakty', 12], ['Działy', 5], ['Budynki', 3]]
	return (
		<div className='list-summary' role='status' aria-label={ariaLabel}>
			{items.map(([label, value], idx) => (
				<span key={label ?? idx}>
					{idx > 0 && (
						<span className='sep' aria-hidden='true'>
							·
						</span>
					)}
					{label}: {value}
				</span>
			))}
		</div>
	)
}

ListSummary.propTypes = {
	items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))),
	ariaLabel: PropTypes.string,
}

export default memo(ListSummary)

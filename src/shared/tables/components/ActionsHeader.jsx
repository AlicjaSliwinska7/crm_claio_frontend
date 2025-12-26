// src/shared/tables/components/ActionsHeader.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * ActionsHeader – nagłówek kolumny akcji.
 * Zgodny ze stylami registers-actions.css:
 *  - bazowa klasa: "actions-col"
 *  - mody szerokości: "w-2" | "w-3" | "w-4" (domyślnie w-3)
 *  - opcjonalnie "sticky" dla przyklejonej ostatniej kolumny
 */
function ActionsHeader({
	className = 'actions-col',
	title = 'Akcje',
	width = 3, // 2 | 3 | 4
	sticky = false,
	'aria-label': ariaLabel,
}) {
	// rozbij klasy z zewnątrz, żeby nie dublować
	const external = (className || '').split(/\s+/).filter(Boolean)

	const hasActionsCol = external.includes('actions-col')
	const hasStickyExternal = external.includes('sticky')
	const hasWidthExternal = external.includes('w-2') || external.includes('w-3') || external.includes('w-4')

	const base = hasActionsCol ? [] : ['actions-col']
	const widthClass = hasWidthExternal ? [] : [width === 2 ? 'w-2' : width === 4 ? 'w-4' : 'w-3']
	const stickyClass = sticky && !hasStickyExternal ? ['sticky'] : []

	const thClass = [...base, ...widthClass, ...stickyClass, ...external].join(' ')

	return (
		<th className={thClass} scope='col' title={title} aria-label={ariaLabel || title}>
			{title}
		</th>
	)
}

ActionsHeader.propTypes = {
	className: PropTypes.string,
	title: PropTypes.string,
	width: PropTypes.oneOf([2, 3, 4]),
	sticky: PropTypes.bool,
	'aria-label': PropTypes.string,
}

export default memo(ActionsHeader)

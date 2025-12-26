// src/app/layout/core/quick-access/components/Rail.jsx
import React, { forwardRef, memo } from 'react'
import PropTypes from 'prop-types'

const Rail = forwardRef(function Rail(
	{
		as: Comp = 'div',
		className = '',
		children,
		ariaLabel, // jeśli podasz, użyjemy aria-label
		ariaLabelledby, // alternatywa: id elementu tytułu
		role = 'group',
		'data-testid': testId,
		...rest
	},
	ref
) {
	const cls = className ? `quick-access-buttons ${className}` : 'quick-access-buttons'
	const ariaProps = {}
	if (ariaLabel) ariaProps['aria-label'] = ariaLabel
	if (ariaLabelledby) ariaProps['aria-labelledby'] = ariaLabelledby

	return (
		<Comp ref={ref} className={cls} role={role} data-testid={testId} {...ariaProps} {...rest}>
			{children}
		</Comp>
	)
})

Rail.displayName = 'Rail'

Rail.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	as: PropTypes.elementType,
	ariaLabel: PropTypes.string,
	ariaLabelledby: PropTypes.string,
	role: PropTypes.string,
	'data-testid': PropTypes.string,
}

export default memo(Rail)

// src/shared/tables/components/AddButton.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Plus } from '../../ui/icons'

function AddButton({
	onClick,
	className = '',
	disabled = false,
	title = 'Dodaj',
	ariaLabel = 'Dodaj',
	type = 'button',
	...rest
}) {
	return (
		<button
			type={type}
			className={`add-btn add-button ${className}`.trim()}
			onClick={onClick}
			disabled={disabled}
			title={title}
			aria-label={ariaLabel}
			{...rest}>
			<Plus size={17} aria-hidden='true' />
		</button>
	)
}

AddButton.propTypes = {
	onClick: PropTypes.func,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	title: PropTypes.string,
	ariaLabel: PropTypes.string,
	type: PropTypes.oneOf(['button', 'submit']),
}

export default memo(AddButton)

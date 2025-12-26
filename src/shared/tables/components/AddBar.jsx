// src/shared/tables/components/AddBar.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Check } from 'lucide-react'

/**
 * AddBar — uniwersalny pasek dodawania.
 * Rysuje poziomy wiersz pól (children) + przycisk akcji na końcu.
 */
function AddBar({
	open,
	children, // JSX: pola formularza
	onSubmit, // () => void
	submitDisabled, // boolean
	submitLabel = 'Zapisz',
	submitAriaLabel = 'Zapisz',
	className = 'form-row', // kontener (spójny z Twoimi stylami)
	buttonClassName = 'add-contact-btn', // klasa przycisku (re-use istniejących styli)
}) {
	if (!open) return null

	return (
		<div className={className} role='group' aria-label='Pasek dodawania'>
			{children}
			<button
				type='button'
				className={buttonClassName}
				onClick={onSubmit}
				title={submitLabel}
				aria-label={submitAriaLabel}
				disabled={!!submitDisabled}>
				<Check size={16} aria-hidden='true' />
			</button>
		</div>
	)
}

AddBar.propTypes = {
	open: PropTypes.bool,
	children: PropTypes.node,
	onSubmit: PropTypes.func,
	submitDisabled: PropTypes.bool,
	submitLabel: PropTypes.string,
	submitAriaLabel: PropTypes.string,
	className: PropTypes.string,
	buttonClassName: PropTypes.string,
}

export default memo(AddBar)

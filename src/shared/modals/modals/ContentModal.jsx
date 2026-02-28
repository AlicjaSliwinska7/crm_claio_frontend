// src/shared/modals/modals/modals/ContentModal.jsx
import React from 'react'
import CalModal from './CalModal'

export default function ContentModal({
	open = true,
	onClose,
	title,
	subtitle,
	children,
	size = 'md',
	className = '',
	bodyClassName = '',
	bodyStyle,
	ariaLabel,
}) {
	// mapowanie “size” -> maxWidth (jak w Twoich modaliach)
	const maxWidth =
		size === 'sm' ? 560 :
		size === 'lg' ? 980 :
		size === 'xl' ? 1180 :
		860

	return (
		<CalModal
			open={open}
			onClose={onClose}
			title={title}
			subtitle={subtitle}
			ariaLabel={ariaLabel}
			maxWidth={maxWidth}
			className={className}
			bodyClassName={bodyClassName}
			bodyStyle={bodyStyle}
		>
			{children}
		</CalModal>
	)
}

import React from 'react'

export default function Panel({ open, pos, children }) {
	return (
		<div
			id='shift-floating-panel'
			role='dialog'
			aria-modal='false'
			aria-labelledby='shift-handle'
			className={`shift-panel ${open ? 'open' : ''}`}
			style={{
				top: `${pos.contentTop}px`,
				left: `${pos.contentLeft}px`,
				width: `${pos.contentWidth}px`,
			}}>
			<div className='shift-groups'>{children}</div>
		</div>
	)
}

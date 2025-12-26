// src/shared/tables/components/cells/ContactCell.jsx
import React from 'react'

export default function ContactCell({ name, phone, email }) {
	return (
		<div className='contact-cell'>
			<span className='contact-cell__name' title={name || ''}>
				{name || '—'}
			</span>
			<span className='contact-cell__phone' title={phone || ''}>
				{phone || '—'}
			</span>
			{email ? (
				<a className='contact-cell__email' href={`mailto:${email}`} title={email}>
					{email}
				</a>
			) : (
				<span className='contact-cell__email'>—</span>
			)}
		</div>
	)
}

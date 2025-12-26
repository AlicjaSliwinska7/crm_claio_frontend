import React from 'react'

// Card wrapper z tytułem, ikoną (FA), opcjonalnym podtytułem i slotem na legendę
export default function ChartCard({ icon, title, subtitle, children, legend }) {
	return (
		<div className='es-section es-card'>
			<div className='es-card__head'>
				{icon && <i className={`fa-solid ${icon}`} aria-hidden='true' style={{ opacity: 0.9 }} />}
				<h3 className='es-title es-title--bar' style={{ margin: 0 }}>
					{title}
				</h3>
			</div>
			{subtitle && <div className='es-subtitle'>{subtitle}</div>}
			<div className='es-card__sub' />
			<div className='es-chart'>{children}</div>
			{legend}
		</div>
	)
}

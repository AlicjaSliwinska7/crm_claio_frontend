import React from 'react'

export default function LegendChips({ items, center = true }) {
	// items: [{name,color}] – kolor jako hex lub css var
	return (
		<div className='es-legend' style={center ? { justifyContent: 'center' } : undefined}>
			{items.map(it => (
				<span key={it.name} className='es-legend__item' title={it.name}>
					<span className='es-legend__dot' style={{ background: it.color }} aria-hidden />
					<span>{it.name}</span>
				</span>
			))}
		</div>
	)
}

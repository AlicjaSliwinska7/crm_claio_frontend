// src/shared/diagrams/components/LegendInline.jsx
import React from 'react'
import { OTHER_COLOR, getSeriesColors } from '../colors' // dostosuj ścieżkę, jeśli plik jest gdzie indziej

/**
 * Prosta, chipowa legenda pod wykresami.
 *
 * Props:
 * - keys: string[]                — kolejność i nazwy serii
 * - counts?: Record<string,number>— opcjonalnie liczebności do mini-badge obok nazw
 * - colors?: Record<string,string>|string[]
 *      • jeśli obiekt: mapowanie { [key]: "#hex" }
 *      • jeśli tablica: kolory w kolejności odpowiadającej keys
 *      • jeśli brak: użyje getSeriesColors(keys)
 * - className?: string            — dodatkowe klasy kontenera
 * - ariaLabel?: string            — własny label ARIA
 * - showBadges?: boolean          — czy wyświetlać badge z counts
 */
function LegendInline({
	keys = [],
	counts = null,
	colors = null,
	className = '',
	ariaLabel = 'Legenda serii',
	showBadges = true,
}) {
	const safeKeys = Array.isArray(keys) ? keys : []

	// Zbuduj mapę kolorów finalColors: key -> color
	let finalColors = {}
	if (Array.isArray(colors)) {
		// tablica kolorów w kolejności keys
		safeKeys.forEach((k, i) => {
			finalColors[k] = colors[i % colors.length]
		})
	} else if (colors && typeof colors === 'object') {
		// obiekt z mapowaniem
		safeKeys.forEach((k, i) => {
			finalColors[k] = colors[k]
		})
	} else {
		// fallback do własnej palety
		const palette = getSeriesColors(safeKeys)
		safeKeys.forEach((k, i) => {
			finalColors[k] = palette[i % palette.length]
		})
	}

	if (!safeKeys.length) {
		return null
	}

	return (
		<div className={`smpl-legend ${className || ''}`.trim()} role='list' aria-label={ariaLabel}>
			{safeKeys.map(k => {
				const color = finalColors[k] || OTHER_COLOR
				const count = counts && typeof counts === 'object' ? counts[k] : undefined
				return (
					<div key={k} className='smpl-legend__item' role='listitem' title={k}>
						<span className='smpl-legend__dot' aria-hidden='true' style={{ background: color }} />
						<span className='smpl-legend__name'>{k}</span>
						{showBadges && Number.isFinite(Number(count)) && (
							<span className='smpl-legend__badge' aria-label={`Liczba: ${count}`}>
								{count}
							</span>
						)}
					</div>
				)
			})}
		</div>
	)
}

export default LegendInline
export { LegendInline }

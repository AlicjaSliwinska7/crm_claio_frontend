// src/shared/diagrams/components/LineChartByMonth.jsx
import React from 'react'
import { getSeriesColors, basePalette } from '../palette' // dostosuj ścieżkę w razie potrzeby

/**
 * Liniowy wykres miesięczny (SVG).
 * - automatyczne kolory z getSeriesColors(keys), chyba że podasz `colors`
 * - bezpieczny dla braków w seriach (przerywa linię na lukach)
 * - delikatna siatka pionowa i oś X
 */
function LineChartByMonth({
	series = {}, // { key: number[] } — wartości w kolejności `labels`
	labels = [], // np. ["I", "II", ...]
	keys = [], // kolejność rysowania serii
	colors = null, // optional: string[] (w kolejności keys) lub map {key:color}
	height = 260,
	pointRadius = 3,
	xStep = 56, // odstęp między miesiącami
	strokeWidth = 2,
	showDots = true,
	showGrid = true,
}) {
	if (!Array.isArray(labels) || !labels.length || !Array.isArray(keys) || !keys.length) {
		return (
			<div className='smpl-card ta-center' style={{ padding: 12 }}>
				Brak danych.
			</div>
		)
	}

	// Zbuduj paletę: preferuj podane kolory, w przeciwnym razie getSeriesColors(keys)
	let paletteForKeys = {}
	if (Array.isArray(colors)) {
		keys.forEach((k, i) => {
			paletteForKeys[k] = colors[i % colors.length]
		})
	} else if (colors && typeof colors === 'object') {
		keys.forEach(k => {
			paletteForKeys[k] = colors[k]
		})
	} else {
		const auto = getSeriesColors(keys)
		keys.forEach((k, i) => {
			paletteForKeys[k] = auto[i % auto.length]
		})
	}

	// Skala Y
	const allVals = keys.flatMap(k => (series[k] || []).map(v => Number(v || 0)))
	const max = Math.max(1, ...allVals) // nigdy 0, żeby uniknąć dzielenia przez 0
	const leftPad = 36
	const rightPad = 12
	const topPad = 12
	const bottomPad = 40
	const innerH = height - topPad - bottomPad
	const width = leftPad + rightPad + (labels.length - 1) * xStep

	const xFor = i => leftPad + i * xStep
	const yFor = v => topPad + innerH - (Number(v || 0) / max) * innerH

	// Helper: buduje path z przerwami, jeśli są luki/NaN
	const buildPath = vals => {
		let d = ''
		vals.forEach((v, i) => {
			const n = Number.isFinite(Number(v)) ? Number(v) : null
			if (n === null) return
			const x = xFor(i)
			const y = yFor(n)
			d += d ? ` L ${x} ${y}` : `M ${x} ${y}`
		})
		return d
	}

	return (
		<div className='smpl-chart'>
			<div className='smpl-chart__inner'>
				<svg width={width} height={height} role='img' aria-label='Line chart by month'>
					{/* Siatka pionowa + oś X */}
					{showGrid &&
						labels.map((_, i) => {
							const x = xFor(i)
							return (
								<line
									key={`grid-${i}`}
									x1={x}
									y1={topPad}
									x2={x}
									y2={topPad + innerH}
									stroke={basePalette.GRID}
									strokeWidth='1'
									opacity='0.6'
								/>
							)
						})}
					<line
						x1={leftPad}
						y1={topPad + innerH}
						x2={width - rightPad}
						y2={topPad + innerH}
						stroke={basePalette.AXIS}
						strokeWidth='1.25'
					/>

					{/* Serie */}
					{keys.map(k => {
						const vals = series[k] || []
						const d = buildPath(vals)
						const color = paletteForKeys[k]
						return (
							<g key={k}>
								<path
									d={d}
									fill='none'
									stroke={color}
									strokeWidth={strokeWidth}
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								{showDots &&
									vals.map((v, i) => {
										const n = Number.isFinite(Number(v)) ? Number(v) : null
										if (n === null) return null
										return <circle key={`${k}-pt-${i}`} cx={xFor(i)} cy={yFor(n)} r={pointRadius} fill={color} />
									})}
							</g>
						)
					})}

					{/* Etykiety osi X */}
					{labels.map((lab, i) => (
						<text
							key={`lab-${i}`}
							x={xFor(i)}
							y={height - 12}
							fontSize='11'
							textAnchor='middle'
							fill={basePalette.TEXT}>
							{lab}
						</text>
					))}
				</svg>
			</div>
		</div>
	)
}

export default LineChartByMonth
export { LineChartByMonth }

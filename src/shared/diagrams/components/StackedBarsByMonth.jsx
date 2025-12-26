// src/shared/diagrams/components/StackedBarsByMonth.jsx
import React from 'react'
import { getSeriesColors, basePalette } from '../palette' // dostosuj ścieżkę

/**
 * Stacked bars by month (SVG)
 * - używa getSeriesColors(keys), chyba że podasz `colors`
 * - bezpieczne dla braków (NaN -> 0)
 * - oś X i delikatna siatka pionowa
 */
function StackedBarsByMonth({
  series = {},        // { key -> number[] } – wartości w kolejności `labels`
  labels = [],        // np. ["I", "II", ...] albo "2025-01"
  keys = [],          // kolejnosc serii (np. ["AO","AZ","BP","BW"])
  colors = null,      // optional: string[] lub {key: color}
  height = 260,
  barWidth = 32,
  gap = 16,
  showGrid = true,
}) {
  if (!Array.isArray(labels) || !labels.length || !Array.isArray(keys) || !keys.length) {
    return <div className="smpl-card ta-center" style={{ padding: 12 }}>Brak danych.</div>
  }

  // Paleta: preferuj podaną, inaczej automatyczna
  let colorForKey = {}
  if (Array.isArray(colors)) {
    keys.forEach((k, i) => { colorForKey[k] = colors[i % colors.length] })
  } else if (colors && typeof colors === 'object') {
    keys.forEach((k) => { colorForKey[k] = colors[k] })
  } else {
    const auto = getSeriesColors(keys)
    keys.forEach((k, i) => { colorForKey[k] = auto[i % auto.length] })
  }

  // sumy kolumn do skalowania
  const totals = labels.map((_, idx) =>
    keys.reduce((acc, k) => {
      const v = Number((series[k] || [])[idx])
      return acc + (Number.isFinite(v) ? v : 0)
    }, 0)
  )
  const max = Math.max(1, ...totals)

  // geometra
  const leftPad = 28
  const rightPad = 12
  const topPad = 16
  const bottomPad = 40
  const innerH = height - topPad - bottomPad
  const baselineY = topPad + innerH
  const width = leftPad + rightPad + labels.length * (barWidth + gap) - gap

  return (
    <div className="smpl-chart">
      <div className="smpl-chart__inner">
        <svg width={width} height={height} role="img" aria-label="Stacked bars by month">
          {/* siatka pionowa */}
          {showGrid && labels.map((_, i) => {
            const x = leftPad + i * (barWidth + gap) + barWidth / 2
            return (
              <line
                key={`grid-${i}`}
                x1={x} y1={topPad}
                x2={x} y2={baselineY}
                stroke={basePalette.GRID}
                strokeWidth="1"
                opacity="0.6"
              />
            )
          })}
          {/* oś X */}
          <line
            x1={leftPad}
            y1={baselineY}
            x2={width - rightPad}
            y2={baselineY}
            stroke={basePalette.AXIS}
            strokeWidth="1.25"
          />

          {/* kolumny */}
          {labels.map((lab, i) => {
            let yCursor = baselineY
            const x = leftPad + i * (barWidth + gap)
            return (
              <g key={lab} transform={`translate(${x},0)`}>
                {keys.map((k) => {
                  const raw = (series[k] || [])[i]
                  const v = Number.isFinite(Number(raw)) ? Number(raw) : 0
                  const h = (v / max) * innerH
                  yCursor -= h
                  return (
                    <rect
                      key={`${k}-${i}`}
                      x={0}
                      y={yCursor}
                      width={barWidth}
                      height={h}
                      rx="3"
                      ry="3"
                      fill={colorForKey[k]}
                    />
                  )
                })}
                {/* etykieta X */}
                <text
                  x={barWidth / 2}
                  y={height - 12}
                  fontSize="11"
                  textAnchor="middle"
                  fill={basePalette.TEXT}
                >
                  {lab}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default StackedBarsByMonth
export { StackedBarsByMonth }

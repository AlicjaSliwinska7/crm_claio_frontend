import React from 'react'
import { getSeriesColors } from '../palette'   // chłodna paleta: szarości/niebieski/fiolet

function BarChartCounts({
  counts,
  keys,
  colors,
  height = 260,     // maksymalna wysokość, jeśli nie podasz własnej
  barHeight = 200,  // maks. wysokość słupka
  barWidth = 36,
  gap = 16,
  showValues = true,
}) {
  const dataCounts = counts && typeof counts === 'object' ? counts : {}
  const dataKeys = Array.isArray(keys) ? keys : Object.keys(dataCounts)

  if (!dataKeys.length) {
    return (
      <div className="smpl-card ta-center" style={{ padding: 12 }}>
        Brak danych do wykresu.
      </div>
    )
  }

  // Kolory
  const palette = Array.isArray(colors) && colors.length
    ? colors
    : getSeriesColors(dataKeys)

  const values = dataKeys.map(k => Number(dataCounts[k] || 0))
  const max = Math.max(1, ...values)

  // Geometria
  const leftPad = 16
  const topPad = 16
  const bottomPad = 48 // miejsce na etykiety osi X (zostawione na przyszłość)
  const baselineY = topPad + barHeight
  const width = leftPad + dataKeys.length * (barWidth + gap) - gap + 16
  const svgHeight = Math.max(height, topPad + barHeight + bottomPad)

  return (
    <div className="smpl-chart">
      <div className="smpl-chart__inner">
        <svg width={width} height={svgHeight} role="img" aria-label="Bar chart (vertical)">
          {/* Oś X */}
          <line x1={leftPad - 8} y1={baselineY} x2={width - 8} y2={baselineY} stroke="#d1d5db" />
          {dataKeys.map((k, i) => {
            const v = values[i]
            const h = (v / max) * barHeight
            const x = leftPad + i * (barWidth + gap)
            const y = baselineY - h
            const fill = palette[i % palette.length]
            return (
              <g key={k} transform={`translate(${x},0)`}>
                <rect x={0} y={y} width={barWidth} height={h} rx="4" ry="4" fill={fill} />
                {showValues && (
                  <text x={barWidth / 2} y={y - 6} fontSize="12" textAnchor="middle" fill="#111827">
                    {v}
                  </text>
                )}
                {/* Zostawione miejsce na podpis X (np. <text>k</text>) */}
                <g transform={`translate(${barWidth / 2}, ${baselineY + 4})`} />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default BarChartCounts
export { BarChartCounts }

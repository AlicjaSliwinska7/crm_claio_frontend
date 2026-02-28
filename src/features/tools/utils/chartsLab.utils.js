// src/features/charts/utils/chartsLab.utils.js
import React from 'react'

// SSOT (bez duplikacji)
import { num, fmtNum, dashToArray } from '../../../shared/diagrams/utils/lab'

/* ===== Stałe odsunięć tytułów osi ===== */
const Y_TITLE_GAP = 14
const X_TITLE_OFFSET = 16

/* ===== Tytuły osi (identyczne jak wcześniej) ===== */
export const XTitle = ({ viewBox, value, fill }) => {
  const { x, y, width, height } = viewBox || {}
  const cx = (x ?? 0) + (width ?? 0) / 2
  const cy = (y ?? 0) + (height ?? 0) + X_TITLE_OFFSET
  return (
    <text x={cx} y={cy} fill={fill} textAnchor='middle' dominantBaseline='hanging'>
      {value}
    </text>
  )
}

export const YTitle = ({ viewBox, value, fill, side }) => {
  const { x, y, width, height } = viewBox || {}
  const cx = side === 'L' ? (x ?? 0) - Y_TITLE_GAP : (x ?? 0) + (width ?? 0) + Y_TITLE_GAP
  const cy = (y ?? 0) + (height ?? 0) / 2
  const angle = side === 'L' ? -90 : 90
  return (
    <text
      x={cx}
      y={cy}
      fill={fill}
      textAnchor='middle'
      dominantBaseline='middle'
      transform={`rotate(${angle} ${cx} ${cy})`}
    >
      {value}
    </text>
  )
}

/* ===== Własna legenda – kolejność = kolejność w sekcjach ===== */
export function CustomLegend({ items }) {
  return (
    <div
      className='recharts-default-legend'
      style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}
    >
      {items.map((it) => (
        <span key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `2px solid ${it.color}`,
              display: 'inline-block',
            }}
          />
          <span>{it.value}</span>
        </span>
      ))}
    </div>
  )
}

export { num, fmtNum, dashToArray }
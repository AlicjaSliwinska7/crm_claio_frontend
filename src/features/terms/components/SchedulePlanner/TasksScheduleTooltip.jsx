import React from 'react'
import { createPortal } from 'react-dom'
import { fmt } from '../../utils/dates' // dopasuj ścieżkę jeśli masz inną

export default function TasksScheduleTooltip({ tip }) {
  if (!tip) return null

  return createPortal(
    <div className={`ts-tooltip ${tip.side === 'bottom' ? 'dir-below' : ''}`} style={{ left: tip.x, top: tip.y }}>
      <div className="ttitle">{tip.it.title}</div>
      <div className="tmeta">
        <span>📅 {fmt(tip.it.start)} – {fmt(tip.it.end)}</span>
        <span>•</span>
        <span>👤 {tip.it.emp}</span>
        <span>•</span>
        <span>🛈 {tip.it.status}</span>
      </div>
      <div className="tmeta">
        <span>Etap: {tip.it.type}</span>
        <span>•</span>
        <span>Rodzaj: {tip.it.kind}</span>
        <span>•</span>
        <span>Trudność: {tip.it.difficulty}</span>
        <span>•</span>
        <span>Priorytet: {tip.it.priority}</span>
      </div>
    </div>,
    document.body
  )
}
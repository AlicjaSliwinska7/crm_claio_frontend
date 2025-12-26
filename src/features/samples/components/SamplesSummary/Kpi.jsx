import React from 'react'

/**
 * Pasek KPI — obsługuje prop `centered` (wyśrodkowanie układu).
 * Wymaga klas z samples-summary.css:
 *   .smpl-kpi, .smpl-kpi__row, .smpl-kpi__sub, .smpl-kpi--center
 */
export default function Kpi({ summary, centered = false }) {
  if (!summary) return null

  const className = `smpl-card smpl-kpi ${centered ? 'smpl-kpi--center' : ''}`

  return (
    <div className={className}>
      <div className='smpl-kpi__row'>
        <strong>Wyniki:</strong>
        <span>{summary.count} próbek</span>
        <span>·</span>
        <span>AO: {summary.countsByCode?.AO ?? 0}</span>
        <span>·</span>
        <span>AZ: {summary.countsByCode?.AZ ?? 0}</span>
        <span>·</span>
        <span>BP: {summary.countsByCode?.BP ?? 0}</span>
        <span>·</span>
        <span>BW: {summary.countsByCode?.BW ?? 0}</span>
        <span>·</span>
        <span>Klienci: {summary.clientsCount}</span>
        <span>·</span>
        <span>Przedmioty: {summary.subjectsCount}</span>
        <span>·</span>
        <span>Miesięcy w zakresie: {summary.monthsCount}</span>
        <span>·</span>
        <span>Zakres: {summary.rangeStr}</span>
      </div>

      <div className='muted smpl-kpi__sub'>
        <span>Σ Energia: <b>{Number(summary.energySum || 0).toFixed(2)}</b> Wh</span>
        <span>·</span>
        <span>Śr. pojemność: <b>{Number(summary.avgCap || 0).toFixed(2)}</b> Ah</span>
        <span>·</span>
        <span>Śr. napięcie: <b>{Number(summary.avgVolt || 0).toFixed(2)}</b> V</span>
        <span>·</span>
        <span>Śr. prąd: <b>{Number(summary.avgCurr || 0).toFixed(2)}</b> A</span>
      </div>
    </div>
  )
}

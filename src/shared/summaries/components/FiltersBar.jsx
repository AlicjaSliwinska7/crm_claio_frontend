import React from 'react'
import PropTypes from 'prop-types'

/**
 * Wspólna belka filtrów zakresu (presety + custom from/to) z „dodatkowym slotem”.
 * Props:
 * - preset, setPreset: 'year' | 'quarter' | 'month' | 'custom'
 * - from, to, setFrom, setTo: ISO yyyy-mm-dd
 * - children: dodatkowe kontrolki (np. clientFilter, select metric)
 */
export default function FiltersBar({
  preset, setPreset, from, setFrom, to, setTo, children,
}) {
  return (
    <div className="sum-filters">
      <label className="sum-filter">
        <span>Zakres</span>
        <select value={preset} onChange={e => setPreset(e.target.value)}>
          <option value="year">Ostatni rok</option>
          <option value="quarter">Ostatni kwartał</option>
          <option value="month">Ostatni miesiąc</option>
          <option value="custom">Niestandardowy</option>
        </select>
      </label>

      {preset === 'custom' && (
        <>
          <label className="sum-filter">
            <span>Od</span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label className="sum-filter">
            <span>Do</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </>
      )}

      <div className="sum-filters__extra">
        {children /* np. <ClientSelect/> <MetricToggle/> */}
      </div>
    </div>
  )
}
FiltersBar.propTypes = {
  preset: PropTypes.string.isRequired,
  setPreset: PropTypes.func.isRequired,
  from: PropTypes.string,
  setFrom: PropTypes.func.isRequired,
  to: PropTypes.string,
  setTo: PropTypes.func.isRequired,
  children: PropTypes.node,
}

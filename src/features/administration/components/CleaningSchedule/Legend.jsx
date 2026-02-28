// src/features/administration/components/CleaningSchedule/CleaningLegend.jsx
import React, { useMemo } from 'react'

const LABELS = {
  a: 'A – budynek A',
  b: 'B – budynek B',
  c: 'C – budynek C',
  d: 'D – budynek D',
}

export default function CleaningLegend({ selectedEmployee, getSummaryForEmployee }) {
  const counts = useMemo(() => {
    if (!selectedEmployee) return null
    return getSummaryForEmployee?.(selectedEmployee)
  }, [selectedEmployee, getSummaryForEmployee])

  const order = ['a', 'b', 'c', 'd']

  return (
    <div className="schedule-legend">
      <h4>{selectedEmployee ? 'Suma:' : 'Legenda:'}</h4>

      <ul>
        {order.map((key) => (
          <li
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={`legend-box shift-${key}`} />
              <span>{LABELS[key]}</span>
            </span>

            {counts != null && <strong className="legend-count">{counts[key] || 0}</strong>}
          </li>
        ))}
      </ul>
    </div>
  )
}
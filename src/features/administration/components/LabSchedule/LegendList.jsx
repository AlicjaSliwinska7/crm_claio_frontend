// src/features/administration/components/LabSchedule/LegendList.jsx
import React from 'react';

const LABELS = {
  '1': '1 – pierwsza zmiana',
  '2': '2 – druga zmiana',
  '3': '3 – trzecia zmiana',
  'u': 'u – urlop',
  'l': 'l – L4',
};

/**
 * Reużywalna lista legendy.
 * - title: nagłówek ("Legenda:" / "Suma:")
 * - order: kolejność pozycji (domyślnie ['1','2','3','u','l'])
 * - counts: opcjonalny obiekt { '1': number, '2': number, ... } — wtedy pokaże kolumnę z liczbami po prawej
 */
export default function LegendList({ title = 'Legenda:', order = ['1','2','3','u','l'], counts }) {
  return (
    <div className="schedule-legend">
      <h4>{title}</h4>
      <ul>
        {order.map((key) => (
          <li
            key={key}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={`legend-box shift-${key}`} />
              <span>{LABELS[key]}</span>
            </span>
            {counts != null && (
              <strong className="legend-count">{counts[key] || 0}</strong>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

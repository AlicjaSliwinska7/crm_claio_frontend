// przeniesione ze starej lokalizacji
import React from 'react'

export default function ListSummary({ items, ariaLabel = 'Podsumowanie listy' }) {
  // items: np. [['Kontakty', 12], ['Działy', 5], ['Budynki', 3]]
  return (
    <div className="list-summary" role="status" aria-label={ariaLabel}>
      {items.map(([label, value], idx) => (
        <span key={label}>
          {idx > 0 && <span className="sep" aria-hidden="true">·</span>}
          {label}: {value}
        </span>
      ))}
    </div>
  )
}

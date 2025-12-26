import React from 'react'

export default function SummaryChips({ label, options, selected = new Set(), onToggle }) {
  return (
    <div className="summary-chips">
      {label && <strong className="summary-chips__label">{label}</strong>}
      <div className="summary-chips__wrap">
        {options.map(opt => {
          const isOn = selected.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              className={`chip ${isOn ? 'chip--on' : ''}`}
              onClick={() => onToggle?.(opt.value)}
              title={opt.title || opt.label}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

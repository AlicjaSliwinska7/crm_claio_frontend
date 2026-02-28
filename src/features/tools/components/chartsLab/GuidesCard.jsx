// src/features/charts/components/chartsLab/GuidesCard.jsx
import React from 'react'

export default function GuidesCard({ guides, newGuide, setNewGuide, addGuide, removeGuide }) {
  return (
    <div className='cl-card'>
      <h3>Granice / linie pomocnicze</h3>

      <div className='cl-guides-new'>
        <div className='cl-grid-3'>
          <label className='cl-field'>
            <span>Rodzaj</span>
            <select value={newGuide.type} onChange={(e) => setNewGuide((g) => ({ ...g, type: e.target.value }))}>
              <option value='x'>Pionowa (X)</option>
              <option value='y'>Pozioma (Y)</option>
            </select>
          </label>

          <label className='cl-field'>
            <span>Wartość</span>
            <input
              value={newGuide.value}
              onChange={(e) => setNewGuide((g) => ({ ...g, value: e.target.value }))}
              placeholder='np. 10'
            />
          </label>

          <label className='cl-field'>
            <span>Etykieta</span>
            <input
              value={newGuide.label}
              onChange={(e) => setNewGuide((g) => ({ ...g, label: e.target.value }))}
              placeholder='opis (opcjonalnie)'
            />
          </label>
        </div>

        <div className='cl-guides-new-actions'>
          <input
            type='color'
            className='cl-color'
            value={newGuide.color}
            onChange={(e) => setNewGuide((g) => ({ ...g, color: e.target.value }))}
          />
          <select className='cl-dash' value={newGuide.dash} onChange={(e) => setNewGuide((g) => ({ ...g, dash: e.target.value }))}>
            <option value='dashed'>przerywana</option>
            <option value='dotted'>kropkowana</option>
            <option value='solid'>ciągła</option>
          </select>
          <button className='btn-secondary' onClick={addGuide}>
            Dodaj
          </button>
          <div className='cl-note sm'>Dla skal logarytmicznych dozwolone są tylko wartości dodatnie.</div>
        </div>
      </div>

      {guides?.length > 0 && (
        <div className='cl-chips'>
          {guides.map((g) => (
            <span key={g.id} className='cl-chip'>
              <span className='cl-chip-color' style={{ background: g.color }} />
              {g.type === 'x' ? 'X' : 'Y'} = {g.value}
              {g.label ? ` — ${g.label}` : ''}
              <button className='cl-chip-x' onClick={() => removeGuide(g.id)} aria-label='Usuń'>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
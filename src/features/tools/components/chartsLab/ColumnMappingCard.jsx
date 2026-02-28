// src/features/charts/components/chartsLab/ColumnMappingCard.jsx
import React from 'react'

export default function ColumnMappingCard({ columns, colRoles, setRole, onApply }) {
  return (
    <div className='cl-card'>
      <h3>Mapowanie kolumn</h3>

      <div className='cl-mapper'>
        <div className='cl-mapper-head'>
          <span>Kolumna</span>
          <span>Rola</span>
        </div>

        <div className='cl-mapper-body'>
          {columns.map((c) => (
            <div key={c} className='cl-mapper-row'>
              <div className='cl-col-name'>{c}</div>
              <div className='cl-col-role'>
                <select value={colRoles?.[c] || 'ignore'} onChange={(e) => setRole(c, e.target.value)}>
                  <option value='x'>X (oś pozioma)</option>
                  <option value='yl'>Y (lewa)</option>
                  <option value='yr'>Y (prawa)</option>
                  <option value='ignore'>Ignoruj</option>
                </select>
                {colRoles?.[c] === 'x' && <small className='cl-muted'>Uwaga: wartości X muszą być liczbami</small>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='cl-add-row'>
        <button className='btn-primary' onClick={onApply}>
          Zastosuj mapowanie
        </button>
      </div>
    </div>
  )
}
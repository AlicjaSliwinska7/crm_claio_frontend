// src/features/charts/components/chartsLab/ExportToolsCard.jsx
import React from 'react'

export default function ExportToolsCard({
  extendTail,
  setExtendTail,
  transparentBg,
  setTransparentBg,
  onAutoFit,
  onExportCSV,
  onExportPNG,
}) {
  return (
    <div className='cl-card'>
      <h3>Eksport & narzędzia</h3>

      <div className='cl-chart-actions' style={{ paddingTop: 4 }}>
        <label className='cl-check-inline' title='Wypełnij ogon ostatnią znaną wartością w renderze'>
          <input type='checkbox' checked={extendTail} onChange={(e) => setExtendTail(e.target.checked)} />
          <span>Utrzymaj ostatnią wartość do końca</span>
        </label>

        <label className='cl-check-inline'>
          <input type='checkbox' checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} />
          <span>Przezroczyste tło PNG</span>
        </label>

        <div style={{ flex: 1 }} />

        <button className='btn-secondary' onClick={onAutoFit}>
          Auto zakresy → pola
        </button>
        <button className='btn-secondary' onClick={onExportCSV}>
          Eksport CSV
        </button>
        <button className='btn-primary' onClick={onExportPNG}>
          Eksport PNG
        </button>
      </div>
    </div>
  )
}
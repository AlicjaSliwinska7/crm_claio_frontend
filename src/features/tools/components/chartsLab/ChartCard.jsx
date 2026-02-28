// src/features/charts/components/chartsLab/ChartCard.jsx
import React from 'react'

export default function ChartCard({ title, setTitle, titleColor, axisTitleColor, chartWrapRef, hasData, children }) {
  return (
    <div className='cl-chart-card'>
      <div className='cl-chart-toolbar'>
        <div className='cl-chart-title'>
          <input className='cl-title-input' value={title} onChange={(e) => setTitle(e.target.value)} style={{ color: titleColor }} />
        </div>
      </div>

      {!hasData ? (
        <div className='cl-empty'>
          <p>
            Wklej dane, przypisz kolumny (X / Y-lewa / Y-prawa) i kliknij <b>Zastosuj mapowanie</b>.
          </p>
          <p className='cl-muted'>W trybie „Ręcznie (tylko Y)” wartości Y są dopasowywane po indeksie do X.</p>
        </div>
      ) : (
        <div className='cl-chart-wrap' ref={chartWrapRef}>
          {children}
        </div>
      )}
    </div>
  )
}
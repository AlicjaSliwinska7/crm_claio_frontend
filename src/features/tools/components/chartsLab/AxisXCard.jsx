// src/features/charts/components/chartsLab/AxisXCard.jsx
import React from 'react'

export default function AxisXCard({ xMin, setXMin, xMax, setXMax, xStep, setXStep, xDecimals, setXDecimals, xLog, setXLog }) {
  return (
    <div className='cl-card'>
      <h3>Oś X (numeryczna)</h3>

      <div className='cl-grid-4 cl-mt'>
        <label className='cl-field'>
          <span>Min</span>
          <input value={xMin} onChange={(e) => setXMin(e.target.value)} placeholder='auto' />
        </label>
        <label className='cl-field'>
          <span>Maks</span>
          <input value={xMax} onChange={(e) => setXMax(e.target.value)} placeholder='auto' />
        </label>
        <label className='cl-field'>
          <span>Krok</span>
          <input value={xStep} onChange={(e) => setXStep(e.target.value)} placeholder='auto' />
        </label>
        <label className='cl-field'>
          <span>Miejsca po przecinku</span>
          <input
            type='number'
            min='0'
            max='12'
            value={xDecimals}
            onChange={(e) => setXDecimals(e.target.value)}
            placeholder='auto'
          />
        </label>
      </div>

      <label className='cl-check-inline'>
        <input type='checkbox' checked={xLog} onChange={(e) => setXLog(e.target.checked)} />
        <span>Skala logarytmiczna</span>
      </label>
    </div>
  )
}
// src/features/charts/components/chartsLab/AxisYCard.jsx
import React from 'react'

export default function AxisYCard({
  title,
  min,
  setMin,
  max,
  setMax,
  step,
  setStep,
  decimals,
  setDecimals,
  isLog,
  setIsLog,
  invalidStyle,
  rangeInvalid,
  minTooHigh,
  maxTooLow,
  dataRange,
  fmtRange,
  minTitle,
  maxTitle,
}) {
  return (
    <div className='cl-card'>
      <h3>{title}</h3>

      <div className='cl-grid-4 cl-mt'>
        <label className='cl-field'>
          <span>Min</span>
          <input value={min} onChange={(e) => setMin(e.target.value)} placeholder='auto' style={invalidStyle(rangeInvalid || minTooHigh)} title={minTitle} />
        </label>

        <label className='cl-field'>
          <span>Maks</span>
          <input value={max} onChange={(e) => setMax(e.target.value)} placeholder='auto' style={invalidStyle(rangeInvalid || maxTooLow)} title={maxTitle} />
        </label>

        <label className='cl-field'>
          <span>Krok</span>
          <input value={step} onChange={(e) => setStep(e.target.value)} placeholder='auto' />
        </label>

        <label className='cl-field'>
          <span>Miejsca po przecinku</span>
          <input type='number' min='0' max='12' value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder='auto' />
        </label>
      </div>

      {dataRange?.has && (
        <div className='cl-note sm' style={{ marginTop: 4 }}>
          Zakres danych: {fmtRange(dataRange.min, dataRange.max)}
        </div>
      )}

      {rangeInvalid && (
        <div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 4 }}>
          Nieprawidłowy zakres: <b>Min</b> musi być mniejszy od <b>Maks</b>.
        </div>
      )}

      {(minTooHigh || maxTooLow) && !rangeInvalid && (
        <div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 2 }}>
          Uwaga: zakres osi nie obejmuje wszystkich punktów danych (wykres może być ucięty).
        </div>
      )}

      <label className='cl-check-inline' style={{ marginTop: 6 }}>
        <input type='checkbox' checked={isLog} onChange={(e) => setIsLog(e.target.checked)} />
        <span>Skala logarytmiczna</span>
      </label>
    </div>
  )
}
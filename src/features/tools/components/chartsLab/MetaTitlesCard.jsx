// src/features/charts/components/chartsLab/MetaTitlesCard.jsx
import React from 'react'

export default function MetaTitlesCard({
  title,
  setTitle,
  titleColor,
  setTitleColor,
  axisTitleColor,
  setAxisTitleColor,
  xTitle,
  setXTitle,
  yLTitle,
  setYLTitle,
  yRTitle,
  setYRTitle,
  xUnit,
  setXUnit,
  yLUnit,
  setYLUnit,
  yRUnit,
  setYRUnit,
}) {
  return (
    <div className='cl-card cl-meta-vertical'>
      <h3>Meta i tytuły</h3>

      <div className='cl-grid-3 cl-mt'>
        <label className='cl-field'>
          <span>Tytuł wykresu</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Kolor tytułu</span>
          <input type='color' value={titleColor} onChange={(e) => setTitleColor(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Kolor tytułów osi</span>
          <input type='color' value={axisTitleColor} onChange={(e) => setAxisTitleColor(e.target.value)} />
        </label>
      </div>

      <div className='cl-grid-3 cl-mt'>
        <label className='cl-field'>
          <span>Tytuł osi X</span>
          <input value={xTitle} onChange={(e) => setXTitle(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Tytuł osi Y (lewa)</span>
          <input value={yLTitle} onChange={(e) => setYLTitle(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Tytuł osi Y (prawa)</span>
          <input value={yRTitle} onChange={(e) => setYRTitle(e.target.value)} />
        </label>
      </div>

      <div className='cl-grid-3 cl-mt'>
        <label className='cl-field'>
          <span>Jednostka X</span>
          <input value={xUnit} onChange={(e) => setXUnit(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Jednostka Y (lewa)</span>
          <input value={yLUnit} onChange={(e) => setYLUnit(e.target.value)} />
        </label>
        <label className='cl-field'>
          <span>Jednostka Y (prawa)</span>
          <input value={yRUnit} onChange={(e) => setYRUnit(e.target.value)} />
        </label>
      </div>
    </div>
  )
}
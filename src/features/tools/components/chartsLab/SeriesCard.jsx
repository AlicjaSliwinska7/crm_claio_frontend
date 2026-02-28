// src/features/charts/components/chartsLab/SeriesCard.jsx
import React from 'react'

export default function SeriesCard({ title, side, series, setSeries, addManualY, addManualPairs }) {
  return (
    <div className='cl-card'>
      <h3>{title}</h3>

      <div
        className='cl-series-list'
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
      >
        {(series || []).map((s, i) => {
          const mode = s.mode === 'manual' ? 'manualPairs' : s.mode

          return (
            <div
              key={s.id}
              className={`cl-series-row ${String(mode).startsWith('manual') ? 'is-manual' : ''}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ side, index: i }))
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                try {
                  const { index: fromIndex } = JSON.parse(e.dataTransfer.getData('text/plain') || '{}')
                  if (fromIndex === undefined) return
                  setSeries((prev) => {
                    const a = [...prev]
                    const [it] = a.splice(fromIndex, 1)
                    a.splice(i, 0, it)
                    return a
                  })
                } catch {}
              }}
            >
              <span className='cl-drag-handle' title='Przeciągnij'>
                ⋮⋮
              </span>

              <select
                className='cl-series-mode'
                value={mode}
                onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, mode: e.target.value } : p)))}
              >
                <option value='column'>Kolumna</option>
                <option value='manualY'>Ręcznie (tylko Y)</option>
                <option value='manualPairs'>Ręcznie (pary x;y)</option>
              </select>

              {mode === 'column' ? (
                <div className='cl-manual-tag'>{s.col}</div>
              ) : (
                <div className='cl-manual-tag'>{mode === 'manualY' ? 'Ręczna Y' : 'Ręczna (x;y)'}</div>
              )}

              <input
                className='cl-series-name'
                placeholder='Etykieta'
                value={s.name}
                onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, name: e.target.value } : p)))}
              />

              <input
                className='cl-color'
                type='color'
                value={s.color}
                onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, color: e.target.value } : p)))}
              />

              <select
                className='cl-width'
                value={s.width}
                onChange={(e) =>
                  setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, width: Number(e.target.value) || 2 } : p)))
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}px
                  </option>
                ))}
              </select>

              <select
                className='cl-dash'
                value={s.dash}
                onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, dash: e.target.value } : p)))}
              >
                <option value='solid'>ciągła</option>
                <option value='dashed'>przerywana</option>
                <option value='dotted'>kropkowana</option>
              </select>

              <button className='cl-series-remove' onClick={() => setSeries((prev) => prev.filter((p) => p.id !== s.id))} aria-label='Usuń serię'>
                ✕
              </button>

              {mode === 'manualY' && (
                <div className='cl-manual-block'>
                  <label className='cl-field'>
                    <span>Wklej wartości Y (po jednej w linii lub rozdzielone TAB/;)</span>
                    <textarea
                      rows={4}
                      placeholder={side === 'L' ? '22.4\n22.9\n23.1' : '1012.2\n1011.7\n1011.3'}
                      value={s.valuesYText || ''}
                      onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, valuesYText: e.target.value } : p)))}
                    />
                  </label>
                </div>
              )}

              {mode === 'manualPairs' && (
                <div className='cl-manual-block'>
                  <label className='cl-field'>
                    <span>
                      Pary <code>x;y</code> (1 linia = 1 punkt)
                    </span>
                    <textarea
                      rows={4}
                      placeholder={side === 'L' ? '0;23.0\n10;23.4' : '0;1012.2\n10;1011.7'}
                      value={s.valuesText || ''}
                      onChange={(e) => setSeries((prev) => prev.map((p) => (p.id === s.id ? { ...p, valuesText: e.target.value } : p)))}
                    />
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className='cl-add-row'>
        <button className='btn-secondary' onClick={() => addManualY(side)}>
          + Dodaj serię (tylko Y)
        </button>
        <button className='btn-secondary' onClick={() => addManualPairs(side)}>
          + Dodaj serię (x;y)
        </button>
      </div>
    </div>
  )
}
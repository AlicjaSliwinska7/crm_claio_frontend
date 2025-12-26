import React from 'react'

export default function RangeControls({
  // zakres
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,

  // domena
  category,
  setCategory,
  kind,
  setKind,

  // laboratoria (NOWE)
  labsOptions = [],          // ['LabTech', 'RADWAG', ...]
  selectedLab = 'all',       // 'all' | nazwa labu
  setSelectedLab,            // setter

  // info
  activeRangeText,
}) {
  const isCustom = preset === 'custom'

  return (
    <div className='es-controls'>
      <div className='es-panel-controls'>
        {/* Preset zakresu */}
        <div className='es-col'>
          <label className='es-label'>Preset zakresu</label>
          <select className='es-select' value={preset} onChange={e => setPreset(e.target.value)}>
            <option value='all'>Wszystkie</option>
            <option value='year'>Bieżący rok</option>
            <option value='month'>Bieżący miesiąc</option>
            <option value='week'>Bieżący tydzień</option>
            <option value='custom'>Zakres niestandardowy</option>
          </select>
        </div>

        {/* Daty dla preset=custom */}
        {isCustom && (
          <>
            <div className='es-col es-col--date'>
              <label className='es-label'>Od</label>
              <input
                type='date'
                className='es-input es-input--date'
                value={customFrom || ''}
                onChange={e => setCustomFrom(e.target.value || '')}
              />
            </div>

            <div className='es-col es-col--date'>
              <label className='es-label'>Do</label>
              <input
                type='date'
                className='es-input es-input--date'
                value={customTo || ''}
                onChange={e => setCustomTo(e.target.value || '')}
              />
            </div>
          </>
        )}

        {/* Kategoria */}
        <div className='es-col es-col--domain'>
          <label className='es-label'>Kategoria</label>
          <select className='es-select' value={category} onChange={e => setCategory(e.target.value)}>
            <option value='all'>Wszystkie</option>
            <option value='termometry'>Termometry</option>
            <option value='wagi'>Wagi</option>
            <option value='inne'>Inne</option>
          </select>
        </div>

        {/* Typ */}
        <div className='es-col es-col--domain'>
          <label className='es-label'>Typ</label>
          <select className='es-select' value={kind} onChange={e => setKind(e.target.value)}>
            <option value='all'>Wszystkie</option>
            <option value='zewn'>Wzorc. zewn.</option>
            <option value='wewn'>Wzorc. wewn.</option>
          </select>
        </div>

        {/* Laboratorium — DROPDOWN w jednej linii (NOWE) */}
        <div className='es-col es-col--domain es-col--labs'>
          <label className='es-label'>Laboratorium</label>
          <select
            className='es-select'
            value={selectedLab}
            onChange={e => setSelectedLab(e.target.value)}
          >
            <option value='all'>Wszystkie</option>
            {labsOptions.map(lab => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>

        {/* Tekst zakresu po prawej */}
        <div className='es-active-range' dangerouslySetInnerHTML={{ __html: activeRangeText }} />
      </div>
    </div>
  )
}

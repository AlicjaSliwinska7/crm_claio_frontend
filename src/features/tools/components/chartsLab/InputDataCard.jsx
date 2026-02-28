// src/features/charts/components/chartsLab/InputDataCard.jsx
import React from 'react'

export default function InputDataCard({ rawText, setRawText, fileName, setFileName, onLoadExample }) {
  return (
    <div className='cl-card'>
      <div className='cl-header'>
        <h3>Dane wejściowe</h3>
        <div className='cl-actions'>
          <button className='btn-secondary' onClick={onLoadExample}>
            Wczytaj przykład
          </button>
        </div>
      </div>

      <label className='cl-field'>
        <span>Plik CSV/TSV</span>
        <input
          type='file'
          accept='.csv,.tsv,.txt,.dat'
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setFileName(f.name)
            const r = new FileReader()
            r.onload = (ev) => setRawText(String(ev.target?.result || ''))
            r.readAsText(f, 'utf-8')
          }}
        />
        {fileName && <small className='cl-file'>{fileName}</small>}
      </label>

      <label className='cl-field'>
        <span>Wklej dane (nagłówek w 1. wierszu; kolumny = TAB)</span>
        <textarea
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={'czas\ttemp\tcisnienie\n0\t22.4\t1012.2'}
        />
      </label>
    </div>
  )
}
import React from 'react'

export default function RangePreset({ preset, setPreset, from, to, setFrom, setTo }) {
  return (
    <div className='smpl-row'>
      <div className='ts-control'>
        <label className='muted small'>Zakres dat</label>
        <select className='smpl-select' value={preset} onChange={e => setPreset(e.target.value)}>
          <option value='all'>Wszystko</option>
          <option value='year'>Rok</option>
          <option value='month'>Miesiąc</option>
          <option value='week'>Tydzień</option>
          <option value='custom'>Niestandardowe</option>
        </select>
      </div>
      {preset === 'custom' && (
        <>
          <div className='ts-control'>
            <label className='muted small'>Data od</label>
            <input type='date' className='smpl-input smpl-input--date' value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className='ts-control'>
            <label className='muted small'>Data do</label>
            <input type='date' className='smpl-input smpl-input--date' value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </>
      )}
    </div>
  )
}

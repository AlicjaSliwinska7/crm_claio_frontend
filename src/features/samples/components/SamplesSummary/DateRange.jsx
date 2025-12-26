import React from 'react'

export default function DateRange({
  datePreset, setDatePreset,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
}) {
  return (
    <div className='smpl-row'>
      <div className='ts-control'>
        <label className='muted small'>Zakres dat</label>
        <select className='smpl-select' value={datePreset} onChange={e => setDatePreset(e.target.value)}>
          <option value='all'>Wszystko</option>
          <option value='year'>Rok</option>
          <option value='month'>Miesiąc</option>
          <option value='week'>Tydzień</option>
          <option value='custom'>Niestandardowe</option>
        </select>
      </div>
      {datePreset === 'custom' && (
        <>
          <div className='ts-control'>
            <label className='muted small'>Data od</label>
            <input type='date' className='smpl-input smpl-input--date' value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className='ts-control'>
            <label className='muted small'>Data do</label>
            <input type='date' className='smpl-input smpl-input--date' value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </>
      )}
    </div>
  )
}

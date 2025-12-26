import React from 'react'

export default function Filters({
  code, setCode,
  uniqueClients, clientQuery, setClientQuery,
  paramKey, setParamKey,
  paramMin, setParamMin,
  paramMax, setParamMax,
}) {
  return (
    <div className='smpl-row smpl-row--wrap'>
      <div className='smpl-row__left'>
        <div className='ts-control'>
          <label className='muted small'>Kod próbki</label>
          <select className='smpl-select' value={code} onChange={e => setCode(e.target.value)}>
            <option value='all'>Wszystkie</option>
            <option value='AO'>AO — akumulatory kwasowe</option>
            <option value='AZ'>AZ — akumulatory zasadowe</option>
            <option value='BP'>BP — baterie pierwotne</option>
            <option value='BW'>BW — badania własne</option>
          </select>
        </div>

        <div className='ts-control ts-control--wide'>
          <label className='muted small'>Klient (wpisz — podpowiedzi)</label>
          <input
            type='text'
            list='clients-datalist'
            className='smpl-input'
            placeholder='np. Meditech'
            value={clientQuery}
            onChange={e => setClientQuery(e.target.value)}
          />
          <datalist id='clients-datalist'>
            {uniqueClients.map(c => (<option key={c} value={c} />))}
          </datalist>
        </div>

        <div className='ts-control'>
          <label className='muted small'>Parametry próbki</label>
          <select className='smpl-select' value={paramKey} onChange={e => setParamKey(e.target.value)}>
            <option value='none'>— brak —</option>
            <option value='energyWh'>Energia nominalna [Wh]</option>
            <option value='capacityAh'>Pojemność [Ah]</option>
            <option value='voltageV'>Napięcie [V]</option>
            <option value='currentA'>Prąd [A]</option>
          </select>
        </div>
      </div>

      <div className='smpl-row__right'>
        {paramKey !== 'none' && (
          <div className='ts-control'>
            <label className='muted small'>Zakres wartości</label>
            <div className='smpl-range'>
              <input type='number' className='smpl-input' placeholder='min' value={paramMin} onChange={e => setParamMin(e.target.value)} />
              <input type='number' className='smpl-input' placeholder='max' value={paramMax} onChange={e => setParamMax(e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

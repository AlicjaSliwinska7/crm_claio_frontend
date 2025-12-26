import React from 'react'

// items: [{label, value, strong?}], sub: [{label, value, suffix?}]
export default function KpiRow({ title = 'Wyniki:', items = [], sub = [] }) {
  return (
    <div className='smpl-card smpl-kpi'>
      <div className='smpl-kpi__row'>
        {title && <strong>{title}</strong>}
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {i>0 && <span>·</span>}
            <span>{it.label}: {it.strong ? <b>{it.value}</b> : it.value}</span>
          </React.Fragment>
        ))}
      </div>
      {sub.length > 0 && (
        <div className='muted smpl-kpi__sub'>
          {sub.map((it, i) => (
            <React.Fragment key={i}>
              {i>0 && <span>·</span>}
              <span>{it.label}: <b>{it.value}</b>{it.suffix || ''}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

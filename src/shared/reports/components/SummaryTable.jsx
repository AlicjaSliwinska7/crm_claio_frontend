import React from 'react'

export default function SummaryTable({ columns, rows, sortField, sortAsc, onSort, sortArrow }) {
  return (
    <div className='smpl-card'>
      <table className='smpl-table'>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`smpl-th ${col.numeric ? 'ta-center' : 'ta-left'}`}
                title='Kliknij, aby sortować'>
                {col.label}{sortArrow(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={`${r.group}-${idx}`}>
              {columns.map(col => {
                let val = r[col.key]
                if (typeof col.fmt === 'function') val = col.fmt(Number(val) || 0)
                return <td key={col.key} className={col.numeric ? 'ta-center' : 'ta-left'}>{val ?? '—'}</td>
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className='empty ta-center'>Brak wyników.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

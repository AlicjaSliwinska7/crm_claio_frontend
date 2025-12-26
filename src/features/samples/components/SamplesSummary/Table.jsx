import React from 'react'

export default function Table({ columns, rows, sortField, sortAsc, onSort, sortArrow }) {
  return (
    <table className='smpl-table'>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              className={`smpl-th ${col.numeric ? 'th--num' : ''}`}
              onClick={() => onSort(col.key)}
              aria-sort={sortField === col.key ? (sortAsc ? 'ascending' : 'descending') : 'none'}
            >
              {col.label}{sortArrow(col.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} className='empty'>Brak danych do wyświetlenia.</td></tr>
        ) : (
          rows.map((r, i) => (
            <tr key={r.id || `${i}-${r[columns[0]?.key]}`}>
              {columns.map(col => {
                const raw = r[col.key]
                const val = typeof col.fmt === 'function' ? col.fmt(raw, r) : raw
                return <td key={col.key} className={col.numeric ? 'td--num' : ''}>{val ?? ''}</td>
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

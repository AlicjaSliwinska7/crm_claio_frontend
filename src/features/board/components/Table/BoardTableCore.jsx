// src/features/board/components/Table/BoardTableCore.jsx
import React, { useMemo, useState } from 'react'

function safeRows(rows) {
  return Array.isArray(rows) ? rows : []
}

function cmp(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  // string/number/date-ish
  return String(a).localeCompare(String(b), 'pl', { numeric: true, sensitivity: 'base' })
}

/**
 * Wspólne: jedna tabela dla Board i BoardPreview.
 *
 * Props:
 * - rows: wpisy
 * - variant: 'board' | 'preview' (tylko do klas CSS)
 * - onRowClick(row)
 * - initialSort: { key: 'targetDate', dir: 'desc' }
 * - className
 */
export default function BoardTableCore({
  rows,
  variant = 'board',
  onRowClick,
  initialSort = { key: 'targetDate', dir: 'desc' },
  className = '',
}) {
  const [sort, setSort] = useState(initialSort)

  const data = useMemo(() => {
    const arr = safeRows(rows).slice()
    const { key, dir } = sort || {}
    if (!key) return arr

    arr.sort((r1, r2) => {
      const v1 = r1?.[key]
      const v2 = r2?.[key]
      const res = cmp(v1, v2)
      return dir === 'asc' ? res : -res
    })
    return arr
  }, [rows, sort])

  const safeOnRowClick = typeof onRowClick === 'function' ? onRowClick : null

  const toggleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className={`board-table-core board-table-core--${variant} ${className}`}>
      <table className="board-table-core__table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('targetDate')} role="button">Data</th>
            <th onClick={() => toggleSort('type')} role="button">Typ</th>
            <th onClick={() => toggleSort('title')} role="button">Tytuł</th>
            <th onClick={() => toggleSort('author')} role="button">Autor</th>
            <th>Tagi</th>
            <th>Wzmianki</th>
            <th onClick={() => toggleSort('priority')} role="button">Priorytet</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row?.id ?? `${row?.author}-${row?.date}-${row?.title}`}
              className={safeOnRowClick ? 'is-clickable' : ''}
              onClick={() => safeOnRowClick?.(row)}
            >
              <td>{row?.targetDate || ''}</td>
              <td>{row?.type || ''}</td>
              <td className="board-table-core__title">{row?.title || ''}</td>
              <td>{row?.author || ''}</td>
              <td>{Array.isArray(row?.tags) ? row.tags.join(', ') : ''}</td>
              <td>{Array.isArray(row?.mentions) ? row.mentions.join(', ') : ''}</td>
              <td>{row?.priority || ''}</td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr className="board-table-core__empty">
              <td colSpan={7}>Brak wpisów do wyświetlenia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
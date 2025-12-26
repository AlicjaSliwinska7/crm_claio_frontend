// src/features/lists/components/SortableTh.jsx
import React, { useCallback } from 'react'

/**
 * Wspólny <th> z logiką sortowania i wskaźnikiem ▲▼ (spójny z DataTableWithActions).
 *
 * API:
 *  - columnKey: klucz kolumny (string)
 *  - label: etykieta nagłówka
 *  - sortConfig: { key, direction }
 *  - setSortConfig: fn
 *  - onAfterSort?: fn
 *  - className?: string
 *  - sortable?: bool (domyślnie true)
 *  - disabled?: bool
 *  - title?: string
 *  - numeric?: bool (wyrównanie prawe)
 */
export default function SortableTh({
  columnKey,
  label,
  sortConfig,
  setSortConfig,
  onAfterSort,
  className = '',
  sortable = true,
  disabled = false,
  title,
  numeric = false,
}) {
  const active = sortConfig?.key === columnKey
  const dir = active ? sortConfig.direction : undefined

  const doSort = useCallback(() => {
    if (!sortable || disabled || !setSortConfig || !columnKey) return

    setSortConfig((prev) => {
      const prevKey = prev?.key
      const prevDir = prev?.direction || 'asc'
      const nextDir =
        prevKey === columnKey ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc'

      return { key: columnKey, direction: nextDir }
    })

    onAfterSort?.()
  }, [sortable, disabled, setSortConfig, columnKey, onAfterSort])

  const onKeyDown = (e) => {
    if (!sortable || disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      doSort()
    }
  }

  const ariaSort =
    sortable && !disabled
      ? active
        ? dir === 'asc'
          ? 'ascending'
          : 'descending'
        : 'none'
      : undefined

  const classes = [
    'sortable', // bazowa klasa jak w DataTableWithActions
    active && dir ? `sorted-${dir}` : '',
    numeric ? 'align-right' : '',
    disabled || !sortable ? 'th--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={classes}
      title={title}
      onClick={sortable && !disabled ? doSort : undefined}
      onKeyDown={onKeyDown}
      tabIndex={sortable && !disabled ? 0 : undefined}
      role="columnheader"
    >
      <span className="th-label">{label}</span>
      {/* pusty span – strzałka rysowana w CSS jak w DataTableWithActions */}
      {sortable && <span className="th-sort-caret" aria-hidden />}
    </th>
  )
}

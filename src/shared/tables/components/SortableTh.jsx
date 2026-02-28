// src/shared/tables/components/SortableTh.jsx
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * Wspólny <th> z logiką sortowania.
 * Strzałki nie są renderowane w DOM – robimy je CSS-em po klasach:
 *  - .sortable
 *  - .sorted-asc / .sorted-desc
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
  align,     // 'left' | 'center' | 'right' (opcjonalnie)
  width,     // string | number (opcjonalnie)
  minWidth,  // string | number (opcjonalnie)
}) {
  const active = sortConfig?.key === columnKey
  const dir = active ? sortConfig.direction : undefined

  const doSort = useCallback(() => {
    if (!sortable || disabled || !setSortConfig || !columnKey) return

    setSortConfig((prev) => {
      const prevKey = prev?.key
      const prevDir = prev?.direction || 'asc'
      const nextDir = prevKey === columnKey ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc'
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
    align ? `align-${align}` : '',
    sortable ? 'sortable' : '',
    active && dir ? `sorted-${dir}` : '',
    disabled || !sortable ? 'th--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style = {}
  if (width != null) style.width = typeof width === 'number' ? `${width}px` : width
  if (minWidth != null) style.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={ariaSort}
      className={classes}
      title={title}
      style={style}
      onClick={sortable && !disabled ? doSort : undefined}
      onKeyDown={onKeyDown}
      tabIndex={sortable && !disabled ? 0 : undefined}
      {...(align ? { 'data-align': align } : {})}
    >
      <span className="th-label">{label}</span>
    </th>
  )
}

SortableTh.propTypes = {
  columnKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  setSortConfig: PropTypes.func,
  onAfterSort: PropTypes.func,
  className: PropTypes.string,
  sortable: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

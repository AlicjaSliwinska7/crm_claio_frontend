// src/shared/tables/components/DataTableWithActions.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'

import ActionsHeader from './ActionsHeader'
import EmptyStateRow from './EmptyStateRow'
import ActionsCell from './cells/ActionsCell'
import SortableTh from './SortableTh'
import TableScrollWrapper from './TableScrollWrapper'

import DataCell from './cells/DataCell'
import StatusCell from './cells/StatusCell'

function DataTableWithActions({
  columns = [],
  rows = [],
  sortConfig,
  setSortConfig,
  onAfterSort,
  actionsForRow,
  rowProps,
  onRowClick,
  bare = false,
  ariaLabel = 'Tabela',
  actionsWidth = 3,
  actionsSticky = false,
}) {
  const asCssWidth = (w) => (w == null ? undefined : typeof w === 'number' ? `${w}px` : w)

  const actionsColClass = [
    'actions-col',
    actionsSticky && 'sticky',
    actionsWidth === 2 ? 'w-2' : actionsWidth === 4 ? 'w-4' : 'w-3',
  ]
    .filter(Boolean)
    .join(' ')

  const tableClass = ['data-table', bare && 'data-table--bare'].filter(Boolean).join(' ')
  const containerClass = ['table-container', bare && 'table-container--bare'].filter(Boolean).join(' ')

  // deps: tylko rzeczy wpływające na szerokość
  const scrollDeps = useMemo(
    () => [
      rows?.length || 0,
      columns?.length || 0,
      bare,
      actionsWidth,
      actionsSticky,
      Boolean(actionsForRow),
      sortConfig?.key || '',
      sortConfig?.direction || '',
    ],
    [
      rows?.length,
      columns?.length,
      bare,
      actionsWidth,
      actionsSticky,
      actionsForRow,
      sortConfig?.key,
      sortConfig?.direction,
    ]
  )

  return (
    <TableScrollWrapper className={containerClass} deps={scrollDeps}>
      <table className={tableClass} aria-label={ariaLabel}>
        <colgroup>
          {columns.map((c) => (
            <col
              key={c.key || c.label}
              style={{
                width: asCssWidth(c.width),
                minWidth: asCssWidth(c.minWidth),
                maxWidth: asCssWidth(c.maxWidth),
              }}
            />
          ))}
          {actionsForRow ? <col className="col-actions" /> : null}
        </colgroup>

        <thead>
          <tr>
            {columns.map((col, i) => {
              const key = col.key ?? `col-${i}`
              const isSortable = col.sortable !== false && Boolean(col.key)

              if (!isSortable) {
                const style = {}
                if (col.width) style.width = asCssWidth(col.width)
                if (col.minWidth != null) style.minWidth = asCssWidth(col.minWidth)
                if (col.maxWidth != null) style.maxWidth = asCssWidth(col.maxWidth)

                const thClass = [col.align ? `align-${col.align}` : ''].filter(Boolean).join(' ')

                return (
                  <th
                    key={key}
                    className={thClass}
                    style={style}
                    title={col.title}
                    scope="col"
                    {...(col.align ? { 'data-align': col.align } : {})}
                  >
                    <span className="th-label">{col.label}</span>
                  </th>
                )
              }

              return (
                <SortableTh
                  key={key}
                  columnKey={col.key}
                  label={col.label}
                  align={col.align}
                  width={col.width}
                  minWidth={col.minWidth}
                  maxWidth={col.maxWidth}
                  title={col.title}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  onAfterSort={onAfterSort}
                />
              )
            })}

            {actionsForRow ? (
              <ActionsHeader className={actionsColClass} title="Akcje" width={actionsWidth} sticky={actionsSticky} />
            ) : null}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => {
            const baseRowProps = typeof rowProps === 'function' ? rowProps(row) || {} : {}
            const finalRowProps = { ...baseRowProps }

            if (onRowClick && !finalRowProps.onClick) {
              finalRowProps.onClick = () => onRowClick(row)
            }

            return (
              <tr key={row?.id ?? ri} {...finalRowProps}>
                {columns.map((col, ci) => {
                  const value = col.key ? row?.[col.key] : undefined
                  const cellKey = col.key ?? ci

                  if (col.type === 'status') {
                    return <StatusCell key={cellKey} row={row} col={col} value={value} />
                  }

                  return <DataCell key={cellKey} row={row} col={col} value={value} />
                })}

                {actionsForRow ? (
                  <ActionsCell className={actionsColClass} actions={actionsForRow(row)} sticky={actionsSticky} />
                ) : null}
              </tr>
            )
          })}

          {!rows?.length ? (
            <EmptyStateRow
              colSpan={columns.length + (actionsForRow ? 1 : 0)}
              text="Brak danych"
              className="empty-row"
              cellClassName="empty-cell"
            />
          ) : null}
        </tbody>
      </table>
    </TableScrollWrapper>
  )
}

DataTableWithActions.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array,
  sortConfig: PropTypes.object,
  setSortConfig: PropTypes.func,
  onAfterSort: PropTypes.func,
  actionsForRow: PropTypes.func,
  rowProps: PropTypes.func,
  onRowClick: PropTypes.func,
  bare: PropTypes.bool,
  ariaLabel: PropTypes.string,
  actionsWidth: PropTypes.oneOf([2, 3, 4]),
  actionsSticky: PropTypes.bool,
}

export default memo(DataTableWithActions)
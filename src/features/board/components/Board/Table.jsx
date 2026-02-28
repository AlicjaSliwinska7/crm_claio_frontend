// src/features/board/components/Board/Table.jsx
import React, { useCallback, useMemo, useState, useEffect } from 'react'

// ✅ skin boards (tabela + paginacja)
import '../../../../shared/tables/styles/boards/board/index.css'

import {
  DataTableWithActions,
  Pagination, // ✅ shared/tables/components/Pagination.jsx
  rowNavigateProps,
  sortRows,
} from '../../../../shared/tables'

import { paginate, pageCountOf } from '../../../../shared/tables/utils' // ✅ shared paginate/pageCountOf

import {
  BOARD_TABLE_COLUMNS,
  BOARD_TABLE_SORT_OPTIONS,
  BOARD_TABLE_DEFAULT_SORT,
} from '../../config/boardTable.config'

import { adaptBoardRows } from '../../utils/boardTableAdapter'

const PAGE_SIZE = 10

function Table({ rows = [], onOpenRow }) {
  const data = Array.isArray(rows) ? rows : []
  const canOpen = typeof onOpenRow === 'function'

  const [sortConfig, setSortConfig] = useState(BOARD_TABLE_DEFAULT_SORT)
  const [currentPage, setCurrentPage] = useState(1)

  // ✅ SSOT: te same “wiersze domenowe” co w preview
  const adapted = useMemo(() => adaptBoardRows(data), [data])

  const sortedRows = useMemo(() => {
    return sortRows(adapted, sortConfig, BOARD_TABLE_SORT_OPTIONS, { locale: 'pl', nulls: 'last' })
  }, [adapted, sortConfig])

  const pageCount = useMemo(() => pageCountOf(sortedRows, PAGE_SIZE), [sortedRows])
  const visibleRows = useMemo(() => paginate(sortedRows, currentPage, PAGE_SIZE), [sortedRows, currentPage])

  // ✅ gdy filtr/sort zmieni liczbę stron – skoryguj currentPage
  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount)
    if (currentPage < 1) setCurrentPage(1)
  }, [currentPage, pageCount])

  const actionsForRow = useCallback(
    (row) => {
      if (!canOpen) return []
      const payload = row?.original ?? row
      return [
        {
          type: 'preview',
          label: 'Podgląd',
          title: 'Podgląd',
          onClick: () => onOpenRow({ ...payload }),
        },
      ]
    },
    [canOpen, onOpenRow]
  )

  const rowProps = useCallback(
    (row) => {
      if (!canOpen) return {}
      const payload = row?.original ?? row
      return rowNavigateProps(row?.id, () => onOpenRow({ ...payload }), {
        role: 'button',
        label: row?.title ? `Otwórz: ${row.title}` : 'Otwórz wpis',
      })
    },
    [canOpen, onOpenRow]
  )

  return (
    <div className="table-container bl-table-container">
      <DataTableWithActions
        ariaLabel="Wpisy tablicy"
        columns={BOARD_TABLE_COLUMNS}
        rows={visibleRows}
        sortConfig={sortConfig}
        setSortConfig={(next) => {
          setSortConfig(next)
          setCurrentPage(1) // ✅ reset strony po zmianie sortu
        }}
        actionsForRow={canOpen ? actionsForRow : undefined}
        rowProps={canOpen ? rowProps : undefined}
        actionsWidth={2}
        actionsSticky={false}
        bare={false}
      />

      {/* ✅ zawsze renderujemy (nawet 1/1), żeby było widać że działa */}
      <div className="bl-board-pagination">
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          className="pagination pagination--inline"
          ariaLabel="Paginacja tabeli tablicy"
          window={2}
        />
      </div>
    </div>
  )
}

export { Table }
export default Table
// src/features/board/components/BoardPreview/Table.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Pagination } from '../../../../shared/tables'
import {
  paginate,
  pageCountOf,
  sortRows,
  nextDirection,
  sortIndicator,
  sortAria,
} from '../../../../shared/tables/utils'

// baza tabeli (reszta stylu)
import '../../../../shared/tables/styles/boards/board-preview/index.css'
// ✅ tylko pasek paginacji
import '../../../../shared/tables/styles/boards/board-preview/pagination.css'

import { adaptBoardRows } from '../../utils/boardTableAdapter'

const PAGE_SIZE = 10

function getTypeClass(type) {
  return type === 'task' ? 'type-task' : 'type-post'
}
function getTypeLabel(type) {
  return type === 'task' ? 'Zadanie' : 'Post'
}
function getPriorityClass(priority) {
  switch (priority) {
    case 'wysoki':
      return 'priority-wysoki'
    case 'normalny':
      return 'priority-normalny'
    case 'niski':
      return 'priority-niski'
    default:
      return 'priority-blank'
  }
}

export default function Table({ rows, onRowClick }) {
  const data = Array.isArray(rows) ? rows : []
  const rowClickable = typeof onRowClick === 'function'

  const normalized = useMemo(() => adaptBoardRows(data), [data])

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const next =
        !prev || prev.key !== key
          ? { key, direction: 'asc' }
          : { key, direction: nextDirection(prev.direction) }

      setCurrentPage(1)
      return next
    })
  }

  const sorted = useMemo(() => {
    return sortRows(
      normalized,
      sortConfig,
      {
        createdAt: { type: 'date', accessor: (r) => r.createdAt },
        title: { type: 'text', accessor: (r) => r.title },
        author: { type: 'text', accessor: (r) => r.author },
        type: { type: 'text', accessor: (r) => r.type },
        priority: { type: 'text', accessor: (r) => r.priority },
        tags: { type: 'text', accessor: (r) => (r.tags || []).join(', ') },
      },
      { locale: 'pl', nulls: 'last' }
    )
  }, [normalized, sortConfig])

  const pageCount = useMemo(() => pageCountOf(sorted, PAGE_SIZE), [sorted])
  const paged = useMemo(() => paginate(sorted, currentPage, PAGE_SIZE), [sorted, currentPage])

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount)
    if (currentPage < 1) setCurrentPage(1)
  }, [currentPage, pageCount])

  // ✅ info "Wyniki: od–do z total"
  const total = sorted.length
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total)

  const shouldIgnoreRowClick = useCallback((e) => {
    const el = e?.target
    if (!(el instanceof Element)) return false
    return Boolean(el.closest('.tag-chip,.type-chip,.priority-chip,a,button,[role="button"]'))
  }, [])

  return (
    <div className="board-flat-table-wrapper">
      <table className="board-flat-table" role="table">
        <thead>
          <tr>
            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('createdAt')}
              aria-sort={sortAria(sortConfig, 'createdAt')}
              title="Sortuj po dacie dodania"
            >
              Data {sortIndicator(sortConfig, 'createdAt', { asc: '▲', desc: '▼', idle: '' })}
            </th>

            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('title')}
              aria-sort={sortAria(sortConfig, 'title')}
            >
              Tytuł {sortIndicator(sortConfig, 'title', { asc: '▲', desc: '▼', idle: '' })}
            </th>

            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('author')}
              aria-sort={sortAria(sortConfig, 'author')}
            >
              Autor {sortIndicator(sortConfig, 'author', { asc: '▲', desc: '▼', idle: '' })}
            </th>

            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('type')}
              aria-sort={sortAria(sortConfig, 'type')}
            >
              Typ {sortIndicator(sortConfig, 'type', { asc: '▲', desc: '▼', idle: '' })}
            </th>

            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('priority')}
              aria-sort={sortAria(sortConfig, 'priority')}
            >
              Priorytet {sortIndicator(sortConfig, 'priority', { asc: '▲', desc: '▼', idle: '' })}
            </th>

            <th
              scope="col"
              className="sortable"
              onClick={() => handleSort('tags')}
              aria-sort={sortAria(sortConfig, 'tags')}
            >
              Tagi {sortIndicator(sortConfig, 'tags', { asc: '▲', desc: '▼', idle: '' })}
            </th>
          </tr>
        </thead>

        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td className="empty-state" colSpan={6}>
                Brak wpisów w tym zakresie.
              </td>
            </tr>
          ) : (
            paged.map((r) => (
              <tr
                key={r.id}
                onClick={
                  rowClickable
                    ? (e) => {
                        if (shouldIgnoreRowClick(e)) return
                        onRowClick(r.original ?? r)
                      }
                    : undefined
                }
                tabIndex={rowClickable ? 0 : undefined}
                onKeyDown={
                  rowClickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') onRowClick(r.original ?? r)
                      }
                    : undefined
                }
                style={rowClickable ? { cursor: 'pointer' } : undefined}
              >
                <td data-label="Data">{r.dayText ?? '—'}</td>
                <td data-label="Tytuł">{r.title || '—'}</td>
                <td data-label="Autor">{r.author || '—'}</td>

                <td data-label="Typ">
                  <span className={`type-chip ${getTypeClass(r.type)}`}>{getTypeLabel(r.type)}</span>
                </td>

                <td data-label="Priorytet">
                  <span className={`priority-chip ${getPriorityClass(r.priority)}`}>
                    {r.priority ? r.priority : '—'}
                  </span>
                </td>

                <td data-label="Tagi" className="tags">
                  {r.tags?.length
                    ? r.tags.map((t) => (
                        <span key={t} className="tag-chip">
                          {t}
                        </span>
                      ))
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ pasek paginacji (TestsSummary-like) */}
      <div className="board-flat-table-pagination">
        <div className="tss-pagination__info">
          Wyniki: <strong>{from}-{to}</strong> z <strong>{total}</strong>
        </div>

        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          className="pagination pagination--inline"
          ariaLabel="Paginacja tabeli podglądu tablicy"
          window={2}
        />
      </div>
    </div>
  )
}
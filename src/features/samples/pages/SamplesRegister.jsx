// src/features/sales/pages/SamplesRegister.jsx
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

import {
  ListLayout,
  SearchBar,
  ListSummary,
  Pagination,
  EmptyStateRow,
  ExportCsvButton,
  FilterSelect,
  TableScrollWrapper,
  useUrlPagination,
  useCsvExport,
  useListQuery,
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,
  getColStyle,
} from '../../../shared/tables'

// ✅ jak w OrdersRegister / OffersRegister
import RowActionsButtons from '../../../shared/tables/components/RowActionsButtons'

import {
  HEADER_COLS,
  CSV_COLUMNS,
  SAMPLE_STATUSES,
  initialSamples,
  normalizeOnLoad,
  statusLabel,
  getSearchFields,
} from '../config/samples.config'

const toStr = (v) => (v ?? '').toString()

// mały helper: sort toggle jak w HeaderRow
const nextDir = (currDir) => (currDir === 'asc' ? 'desc' : 'asc')

export default function SamplesRegister({ samples = [] }) {
  const navigate = useNavigate()

  // 1) Dane (normalize tylko raz)
  const rows = useMemo(() => {
    const input = Array.isArray(samples) && samples.length ? samples : initialSamples
    return normalizeOnLoad(input)
  }, [samples])

  // 2) Wyszukiwanie + sortowanie
  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(rows, HEADER_COLS, {
    initialSort: { key: 'receivedDate', direction: 'desc' },
    getSearchFields,
  })

  // 3) Filtr statusu
  const [filterStatus, setFilterStatus] = useState('wszystkie')

  const filtered = useMemo(() => {
    if (filterStatus === 'wszystkie') return filteredSorted
    return filteredSorted.filter((r) => r.status === filterStatus)
  }, [filteredSorted, filterStatus])

  // 4) Paginacja (URL)
  const [sp, setSp] = useSearchParams()
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filtered, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // 5) CSV (bieżący widok) — status jako label
  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: filtered.map((r) => ({
      ...r,
      status: statusLabel(r.status),
    })),
    filename: 'rejestr_probek.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // 6) Podsumowanie po statusach (dla przefiltrowanego widoku)
  const statusSummaryItems = useMemo(() => {
    const map = new Map(SAMPLE_STATUSES.map((s) => [s.key, 0]))
    for (const r of filtered) {
      if (map.has(r.status)) map.set(r.status, (map.get(r.status) || 0) + 1)
    }
    return [['Próbki', filtered.length], ...SAMPLE_STATUSES.map((s) => [s.label, map.get(s.key) || 0])]
  }, [filtered])

  // ✅ przejście do formularza próbki (dostosuj ścieżkę jeśli masz inną)
  const goToForm = useCallback((id) => navigate(`/sprzedaz/probki/${encodeURIComponent(id)}/formularz`), [navigate])

  // klik w nagłówek sortujący
  const handleSortClick = useCallback(
    (col) => {
      if (!col?.sortable) return
      setSortConfig((prev) => {
        const sameKey = prev?.key === col.key
        return { key: col.key, direction: sameKey ? nextDir(prev?.direction) : 'asc' }
      })
      resetToFirstPage(true)
    },
    [setSortConfig, resetToFirstPage]
  )

  const isSorted = useCallback((key) => sortConfig?.key === key, [sortConfig])
  const sortDir = sortConfig?.direction

  // ✅ klawiatura: Enter/Spacja sortuje (bonus, bez zmiany UX myszą)
  const handleThKeyDown = useCallback(
    (e, col) => {
      if (!col?.sortable) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSortClick(col)
      }
    },
    [handleSortClick]
  )

  // deps dla TableScrollWrapper: kiedy tabela ma przeliczyć pasek poziomy
  const scrollDeps = useMemo(
    () => [visible.length, filtered.length, searchQuery, filterStatus, sortConfig?.key, sortConfig?.direction],
    [visible.length, filtered.length, searchQuery, filterStatus, sortConfig?.key, sortConfig?.direction]
  )

  const statusOptions = useMemo(
    () => (Array.isArray(SAMPLE_STATUSES) ? SAMPLE_STATUSES.map((s) => ({ key: s.key, value: s.key, label: s.label })) : []),
    []
  )

  return (
    <ListLayout
      rootClassName="samplesRegister-list"
      controlsClassName="samplesRegister-controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Szukaj w rejestrze próbek..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ custom FilterSelect: options jako {key,value,label} -> bez “podwójnego underline” */}
          <FilterSelect
            label={null}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              resetToFirstPage(true)
            }}
            options={statusOptions}
            includeAll
            allValue="wszystkie"
            allLabel="Wszystkie statusy"
            title="Filtr statusu próbek"
            ariaLabel="Filtr statusu próbek"
            className="samplesRegister-filter"
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary ariaLabel="Zestawienie próbek po statusach (bieżący widok)" items={statusSummaryItems} />
        </>
      }
    >
      <TableScrollWrapper deps={scrollDeps} className="table-container">
        <table className="data-table" aria-label="Tabela rejestru próbek">
          <colgroup>
            {HEADER_COLS.map((c) => (
              <col key={c.key} style={getColStyle(c)} />
            ))}
            {/* ✅ kolumna akcji */}
            <col className="col-actions" />
          </colgroup>

          <thead>
            <tr>
              {HEADER_COLS.map((col) => {
                const sorted = isSorted(col.key)
                const dir = sorted ? sortDir : null

                return (
                  <th
                    key={col.key}
                    className={[
                      col.align ? `align-${col.align}` : '',
                      col.sortable ? 'th-sortable' : '',
                      sorted ? `is-sorted is-sorted--${dir}` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSortClick(col)}
                    onKeyDown={col.sortable ? (e) => handleThKeyDown(e, col) : undefined}
                    role={col.sortable ? 'button' : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    title={col.sortable ? 'Sortuj' : undefined}
                    style={getColStyle(col)}
                    aria-sort={sorted ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="th-label">{col.label}</span>

                    {/* ✅ BEZ ↕: pokazuj strzałki dopiero gdy kolumna jest posortowana */}
                    {col.sortable && sorted && (
                      <span className="sort-indicator" aria-hidden="true">
                        {dir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                )
              })}

              {/* ✅ nagłówek akcji */}
              <th className="actions-col" title="Akcje">
                Akcje
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {HEADER_COLS.map((col) => (
                  <td
                    key={col.key}
                    className={col.align ? `align-${col.align}` : undefined}
                    title={col.titleAccessor ? col.titleAccessor(row) : undefined}
                  >
                    {col.render ? col.render(row[col.key], row) : toStr(row[col.key] ?? '')}
                  </td>
                ))}

                {/* ✅ Register: tylko FORMULARZ */}
                <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                  <RowActionsButtons onForm={() => goToForm(row.id)} titles={{ form: 'Formularz próbki' }} />
                </td>
              </tr>
            ))}

            {visible.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
          </tbody>
        </table>
      </TableScrollWrapper>
    </ListLayout>
  )
}
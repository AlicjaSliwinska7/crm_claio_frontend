// src/features/tests/pages/TestsRegister.jsx
import React, { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// skórka tabel rejestrów
import '../../../shared/tables/styles/directories_lists_registers/index.css'

import {
  // layout + toolbar
  ListLayout,
  SearchBar,
  FilterSelect,
  Pagination,
  ListSummary,
  ExportCsvButton,
  DataTableWithActions,

  // hooki
  useListQuery,
  useUrlPagination,
  useCsvExport,

  // stałe wspólne
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,

  // util: nawigacja po wierszu (Enter/Space + rola button)
  rowNavigateProps as makeRowNavigateProps,
} from '../../../shared/tables'

import {
  STATUS_DEFS,
  OUTCOME_DEFS,
  CSV_COLUMNS,
  initialTests,
  makeTestsColumns,
  norm,
  fmtDate,
  getSearchFields,
} from '../config/tests.config'

export default function TestsRegister() {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  // dane (docelowo fetch → setRows)
  const [rows] = useState(initialTests)

  // filtry dodatkowe (status/wynik/daty)
  const [filterStatus, setFilterStatus] = useState('wszystkie')
  const [filterOutcome, setFilterOutcome] = useState('wszystkie')
  const [startOn, setStartOn] = useState('')
  const [endOn, setEndOn] = useState('')

  // kolumny – wstrzykujemy Link (kolumny trzyma SSOT w configu)
  const columns = useMemo(() => makeTestsColumns(Link), [])

  // nawigacja do programu badań
  const goToProgram = useCallback(
    (row) => navigate(`/badania/rejestr-badan/PB/${encodeURIComponent(row.orderNo || row.id)}`),
    [navigate]
  )

  // shared/tables: search + sort
  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(
    rows,
    columns,
    {
      initialSort: { key: 'startDate', direction: 'desc' },
      getSearchFields,
    }
  )

  // dodatkowe filtry (status/wynik/dokładna data) nakładamy na filteredSorted
  const filtered = useMemo(() => {
    return (filteredSorted || []).filter((r) => {
      const matchesStatus =
        filterStatus === 'wszystkie' ? true : norm(r.status) === norm(filterStatus)

      const matchesOutcome =
        filterOutcome === 'wszystkie' ? true : norm(r.outcome) === norm(filterOutcome)

      // dokładna data
      const s = (r.startDate || '').slice(0, 10)
      const e = (r.endDate || '').slice(0, 10)
      const matchesStart = startOn ? s === startOn : true
      const matchesEnd = endOn ? e === endOn : true

      return matchesStatus && matchesOutcome && matchesStart && matchesEnd
    })
  }, [filteredSorted, filterStatus, filterOutcome, startOn, endOn])

  // paginacja (URL)
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(
    filtered,
    {
      pageSize: PAGE_SIZE,
      searchParams: sp,
      setSearchParams: setSp,
      param: 'page',
      scrollSelector: SCROLL_SELECTOR,
      canonicalize: true,
    }
  )

  // CSV (bieżący widok)
  const csvRows = useMemo(
    () =>
      filtered.map((r) => ({
        ...r,
        samples: (r.samples || []).join(', '),
        samplesCount: r.samplesCount ?? (r.samples?.length || 0),
        startDate: fmtDate(r.startDate),
        endDate: fmtDate(r.endDate),
      })),
    [filtered]
  )

  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: csvRows,
    filename: 'rejestr_badan.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // podsumowania
  const statusSummaryItems = useMemo(() => {
    const counts = new Map(STATUS_DEFS.map((s) => [s.key, 0]))
    for (const r of filtered) {
      const k = norm(r.status)
      if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
    }
    const items = [['Badania', filtered.length]]
    STATUS_DEFS.forEach((s) => {
      const n = counts.get(s.key) || 0
      if (n > 0) items.push([s.label, n])
    })
    return items
  }, [filtered])

  const outcomeSummaryItems = useMemo(() => {
    const counts = new Map(OUTCOME_DEFS.map((o) => [o.key, 0]))
    for (const r of filtered) {
      const k = norm(r.outcome)
      if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
    }
    const items = [['Badania', filtered.length]]
    OUTCOME_DEFS.forEach((o) => {
      const n = counts.get(o.key) || 0
      if (n > 0) items.push([o.label, n])
    })
    return items
  }, [filtered])

  // reset filtrów
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterStatus('wszystkie')
    setFilterOutcome('wszystkie')
    setStartOn('')
    setEndOn('')
    resetToFirstPage(true)
  }, [resetToFirstPage, setSearchQuery])

  // props do nawigacji po wierszu
  const handleRowClick = useCallback((id, row) => goToProgram(row), [goToProgram])

  const rowProps = useCallback(
    (row) => ({
      ...makeRowNavigateProps(row.id, () => handleRowClick(row.id, row)),
      className: 'row-clickable',
      title: 'Kliknij, aby przejść do Programu Badań',
    }),
    [handleRowClick]
  )

  /**
   * ✅ KLUCZOWE: ActionsCell obsługuje TYLKO: preview/edit/delete/form/download/link(download)
   * Więc tu zwracamy type:'form' zamiast type:'custom'
   */
  const actionsForRow = useCallback(
    (row) => [
      {
        type: 'form',
        key: 'form',
        label: 'Program badań',
        title: 'Program badań',
        onClick: () => goToProgram(row),
      },
    ],
    [goToProgram]
  )

  return (
    <ListLayout
      rootClassName="tests-list"
      controlsClassName="tests-controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Znajdź badanie..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ Filtry pod searchbarem — zostawiamy CSS (flex-start) */}
          <div className="list-controls-row">
            <FilterSelect
              label="Status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                resetToFirstPage(true)
              }}
              options={STATUS_DEFS}
              includeAll
              allValue="wszystkie"
              allLabel="Wszystkie statusy"
              title="Filtr statusu"
              ariaLabel="Filtr statusu"
            />

            <FilterSelect
              label="Wynik"
              value={filterOutcome}
              onChange={(e) => {
                setFilterOutcome(e.target.value)
                resetToFirstPage(true)
              }}
              options={OUTCOME_DEFS}
              includeAll
              allValue="wszystkie"
              allLabel="Wszystkie wyniki"
              title="Filtr wyniku"
              ariaLabel="Filtr wyniku"
            />

            <label className="rg-field">
              <span className="rg-label">Data rozpoczęcia</span>
              <input
                id="filter-startOn"
                type="date"
                className="rg-input"
                value={startOn}
                onChange={(e) => {
                  setStartOn(e.target.value)
                  resetToFirstPage(true)
                }}
                title="Data rozpoczęcia"
                aria-label="Data rozpoczęcia"
              />
            </label>

            <label className="rg-field">
              <span className="rg-label">Data zakończenia</span>
              <input
                id="filter-endOn"
                type="date"
                className="rg-input"
                value={endOn}
                onChange={(e) => {
                  setEndOn(e.target.value)
                  resetToFirstPage(true)
                }}
                title="Data zakończenia"
                aria-label="Data zakończenia"
              />
            </label>

            <button
              type="button"
              className="reset-filters-button"
              onClick={clearFilters}
              title="Wyczyść filtry"
              aria-label="Wyczyść filtry"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6"></path>
                <path d="m9 9 6 6"></path>
              </svg>
            </button>
          </div>
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <div className="list-summary" role="status" aria-label="Podsumowanie rejestru badań">
            <ListSummary ariaLabel="Podsumowanie (statusy)" items={statusSummaryItems} />
            <ListSummary ariaLabel="Podsumowanie (wyniki)" items={outcomeSummaryItems} />
          </div>
        </>
      }
    >
      <DataTableWithActions
        columns={columns}
        rows={visible}
        sortConfig={sortConfig}
        setSortConfig={(cfg) => {
          setSortConfig(cfg)
          resetToFirstPage(true)
        }}
        actionsForRow={actionsForRow}
        rowProps={rowProps}
        actionsSticky
        ariaLabel="Rejestr badań"
      />
    </ListLayout>
  )
}
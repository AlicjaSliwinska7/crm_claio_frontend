// src/features/sales/pages/SamplesDisposal.jsx
import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

import {
  ListLayout,
  SearchBar,
  FilterSelect,
  ListSummary,
  Pagination,
  ExportCsvButton,
  EmptyStateRow,
  TableScrollWrapper,
  SortableTh,
  useUrlPagination,
  useCsvExport,
  useListQuery,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,
  getColStyle,
} from '../../../shared/tables'

// ✅ lokalny modal (bez Table/Controls z komponentu)
import ConfirmModal from '../components/SamplesDisposal/ConfirmModal'

// SSOT
import {
  VIEW_ALL,
  VIEW_ACTIVE,
  VIEW_ARCHIVE,
  PAGE_SIZE,
  todayISO,
  initialDisposal,
  initialDisposalArchive,
  csvColumnsFor,
  makeColumns,
} from '../config/samplesDisposal.config'

const toStr = (v) => (v ?? '').toString()

export default function SamplesDisposal({ disposal, setDisposal, disposalArchive, setDisposalArchive }) {
  // fallback na lokalny stan
  const [localDisposal, setLocalDisposal] = useState(initialDisposal)
  const [localArchive, setLocalArchive] = useState(initialDisposalArchive)

  const rowsActive = Array.isArray(disposal) ? disposal : localDisposal
  const rowsArchive = Array.isArray(disposalArchive) ? disposalArchive : localArchive

  const updateActive = setDisposal || setLocalDisposal
  const updateArchive = setDisposalArchive || setLocalArchive

  // view + URL pagination
  const [view, setView] = useState(VIEW_ACTIVE)
  const [sp, setSp] = useSearchParams()

  // confirm modal
  const [confirm, setConfirm] = useState({ open: false, id: null, date: todayISO() })

  // handlers (memo)
  const handlers = useMemo(
    () => ({
      openConfirm: (row) => setConfirm({ open: true, id: row.id, date: row.disposedAt || todayISO() }),

      patchArchive: (id, patch) => updateArchive((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),

      restoreToActive: (id) => {
        const row = rowsArchive.find((r) => r.id === id)
        if (!row) return
        updateActive((prev) => [{ ...row, disposed: false, disposedAt: '' }, ...prev])
        updateArchive((prev) => prev.filter((r) => r.id !== id))
      },
    }),
    [rowsArchive, updateActive, updateArchive]
  )

  const COLS_BY_VIEW = useMemo(() => makeColumns({ LinkCmp: Link, handlers }), [handlers])
  const COLS = COLS_BY_VIEW[view] || []

  // ───────────────────────────────────────────────────────────
  // VIEW_ALL: aktywne + archiwum z polami pomocniczymi
  // __viewGroup, __done, __doneAt
  // ───────────────────────────────────────────────────────────
  const rowsAll = useMemo(() => {
    const active = (rowsActive || [])
      .filter((r) => !r?.disposed)
      .map((r) => ({
        ...r,
        __viewGroup: 'Aktywne',
        __done: 'nie',
        __doneAt: '',
      }))

    const archive = (rowsArchive || []).map((r) => ({
      ...r,
      __viewGroup: 'Archiwum',
      __done: 'tak',
      __doneAt: r.disposedAt || '',
    }))

    return [...active, ...archive]
  }, [rowsActive, rowsArchive])

  // current rows per view
  const currentRows = useMemo(() => {
    if (view === VIEW_ALL) return rowsAll
    return view === VIEW_ACTIVE ? rowsActive : rowsArchive
  }, [view, rowsAll, rowsActive, rowsArchive])

  // search vector
  const getSearchFields = useMemo(() => {
    return (row) => {
      if (!row) return []
      return Object.values(row).map((v) => {
        if (v == null) return ''
        if (typeof v === 'object') {
          try {
            return JSON.stringify(v)
          } catch {
            return String(v)
          }
        }
        return String(v)
      })
    }
  }, [])

  // ✅ shared/tables: search + sort
  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(currentRows, COLS, {
    initialSort: { key: 'sampleNo', direction: 'asc' },
    getSearchFields,
  })

  // pagination
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // CSV
  const csvColumns = useMemo(() => csvColumnsFor(view), [view])
  const exportCSV = useCsvExport({
    columns: csvColumns,
    rows: filteredSorted.map((r) => {
      // normalizacja booleanów dla ACTIVE/ARCHIVE
      if (view === VIEW_ALL) return r
      return {
        ...r,
        disposed: typeof r.disposed === 'boolean' ? (r.disposed ? 'tak' : 'nie') : r.disposed,
      }
    }),
    filename:
      view === VIEW_ALL ? 'utylizacja_wszystkie.csv' : view === VIEW_ACTIVE ? 'do_utylizacji.csv' : 'zutylizowane.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // summary (wspólny filtr wyszukiwania)
  const summaryItems = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase()
    const matches = (r) => {
      if (!q) return true
      return Object.values(r || {}).some((v) =>
        toStr(typeof v === 'object' ? JSON.stringify(v) : v)
          .toLowerCase()
          .includes(q)
      )
    }

    const toDispose = (rowsActive || []).filter((r) => !r.disposed && matches(r)).length
    const disposedCount = (rowsArchive || []).filter((r) => !!r.disposed && matches(r)).length
    const all = toDispose + disposedCount

    return [
      ['Wszystkie', all],
      ['Do utylizacji', toDispose],
      ['Zutylizowane', disposedCount],
    ]
  }, [rowsActive, rowsArchive, searchQuery])

  // confirm flow
  const closeConfirm = () => setConfirm({ open: false, id: null, date: todayISO() })

  const confirmProceed = () => {
    if (!confirm.date) {
      alert('Wybierz datę utylizacji.')
      return
    }
    const row = rowsActive.find((r) => r.id === confirm.id)
    if (!row) {
      closeConfirm()
      return
    }

    updateArchive((prev) => [{ ...row, disposed: true, disposedAt: confirm.date }, ...prev.filter((x) => x.id !== row.id)])
    updateActive((prev) => prev.filter((r) => r.id !== row.id))
    closeConfirm()
  }

  // deps dla paska przewijania
  const scrollDeps = useMemo(
    () => [view, visible.length, filteredSorted.length, searchQuery, sortConfig?.key, sortConfig?.direction],
    [view, visible.length, filteredSorted.length, searchQuery, sortConfig?.key, sortConfig?.direction]
  )

  // ✅ options jako {key,value,label}
  const viewOptions = useMemo(
    () => [
      { key: VIEW_ALL, value: VIEW_ALL, label: 'Wszystkie' },
      { key: VIEW_ACTIVE, value: VIEW_ACTIVE, label: 'Do utylizacji' },
      { key: VIEW_ARCHIVE, value: VIEW_ARCHIVE, label: 'Archiwum – zutylizowane' },
    ],
    []
  )

  return (
    <ListLayout
      rootClassName="samplesDisposal-list"
      controlsClassName="samplesDisposal-controls"
      controls={
        <>
          <div className="search-container">
            <SearchBar
              value={searchQuery}
              placeholder="Szukaj w utylizacji próbek..."
              onChange={(val) => {
                setSearchQuery(val)
                resetToFirstPage(true)
              }}
              onClear={() => {
                setSearchQuery('')
                resetToFirstPage(true)
              }}
            />
          </div>

          <FilterSelect
            label={null}
            value={view}
            onChange={(e) => {
              setView(e.target.value)
              resetToFirstPage(true)
            }}
            options={viewOptions}
            includeAll={false}
            title="Wybierz widok"
            ariaLabel="Wybierz widok"
            className="samplesDisposal-filter"
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary ariaLabel="Zestawienie próbek (utylizacja)" items={summaryItems} />
        </>
      }
    >
      <TableScrollWrapper deps={scrollDeps} className="table-container">
        <table className="data-table" aria-label="Tabela utylizacji próbek">
          <colgroup>
            {COLS.map((c) => (
              <col key={c.key} style={getColStyle(c)} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLS.map((c) =>
                c.sortable ? (
                  <SortableTh
                    key={c.key}
                    columnKey={c.key}
                    label={c.label}
                    sortConfig={sortConfig}
                    setSortConfig={(cfg) => {
                      setSortConfig(cfg)
                      resetToFirstPage(true)
                    }}
                    onAfterSort={() => resetToFirstPage(true)}
                    align={c.align}
                    width={c.width}
                    minWidth={c.minWidth}
                    title={c.label}
                    className={c.align ? `align-${c.align}` : ''}
                    sortable={!!c.sortable}
                    disabled={c.sortable === false}
                  />
                ) : (
                  <th
                    key={c.key}
                    className={c.align ? `align-${c.align}` : undefined}
                    title={c.label}
                    style={{
                      ...(c.width != null ? { width: typeof c.width === 'number' ? `${c.width}px` : c.width } : {}),
                      ...(c.minWidth != null
                        ? { minWidth: typeof c.minWidth === 'number' ? `${c.minWidth}px` : c.minWidth }
                        : {}),
                    }}
                  >
                    {c.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {COLS.map((col) => (
                  <td key={col.key} className={col.align ? `align-${col.align}` : undefined}>
                    {col.render ? col.render(row) : toStr(row?.[col.key])}
                  </td>
                ))}
              </tr>
            ))}

            {visible.length === 0 && <EmptyStateRow colSpan={COLS.length} />}
          </tbody>
        </table>
      </TableScrollWrapper>

      <ConfirmModal
        open={confirm.open}
        date={confirm.date}
        setDate={(d) => setConfirm((c) => ({ ...c, date: d }))}
        onConfirm={confirmProceed}
        onClose={closeConfirm}
      />
    </ListLayout>
  )
}
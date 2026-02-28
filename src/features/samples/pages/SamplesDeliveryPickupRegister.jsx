// src/features/samples/pages/SamplesDeliveryPickupRegister.jsx
import React, { useMemo, useState, useCallback } from 'react'
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

import ConfirmModal from '../components/SamplesDeliveryPickup/ConfirmModal'

import {
  VIEW_ALL,
  VIEW_PRE,
  VIEW_PICKUP,
  VIEW_ARCH_DELIVERED,
  VIEW_ARCH_PICKEDUP,
  todayISO,
  initialPreDelivery,
  initialDeliveredHistory,
  initialPickup,
  initialPickupHistory,
  csvColumnsFor,
  makeColumns,
} from '../config/samplesDeliveryPickup.config'

const toStr = (v) => (v ?? '').toString()

export default function SamplesDeliveryPickupRegister({
  preDelivery,
  setPreDelivery,
  pickup,
  setPickup,
  deliveredHistory: deliveredHistoryProp,
  setDeliveredHistory: setDeliveredHistoryProp,
  pickupHistory: pickupHistoryProp,
  setPickupHistory: setPickupHistoryProp,
}) {
  const [localPre, setLocalPre] = useState(initialPreDelivery)
  const [localPickup, setLocalPickup] = useState(initialPickup)
  const [localDeliveredHistory, setLocalDeliveredHistory] = useState(initialDeliveredHistory)
  const [localPickupHistory, setLocalPickupHistory] = useState(initialPickupHistory)

  const rowsPre = Array.isArray(preDelivery) ? preDelivery : localPre
  const rowsPickup = Array.isArray(pickup) ? pickup : localPickup
  const deliveredHistory = Array.isArray(deliveredHistoryProp) ? deliveredHistoryProp : localDeliveredHistory
  const pickupHistory = Array.isArray(pickupHistoryProp) ? pickupHistoryProp : localPickupHistory

  const updatePre = setPreDelivery || setLocalPre
  const updatePickup = setPickup || setLocalPickup
  const updateDeliveredHistory = setDeliveredHistoryProp || setLocalDeliveredHistory
  const updatePickupHistory = setPickupHistoryProp || setLocalPickupHistory

  const [view, setView] = useState(VIEW_PRE)
  const [sp, setSp] = useSearchParams()

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    id: null,
    date: todayISO(),
  })

  const handlers = useMemo(
    () => ({
      askConfirmDeliver: (row) =>
        setConfirm({ open: true, type: 'deliver', id: row.id, date: row.deliveredAt || todayISO() }),

      patchPre: (id, patch) => updatePre((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),

      askConfirmPickup: (row) =>
        setConfirm({ open: true, type: 'pickup', id: row.id, date: row.pickedUpAt || todayISO() }),

      patchPickup: (id, patch) =>
        updatePickup((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),

      updateDeliveredHistoryDate: (row, newVal) =>
        updateDeliveredHistory((prev) => prev.map((x) => (x.id === row.id ? { ...x, deliveredAt: newVal } : x))),

      updatePickupHistoryDate: (row, newVal) =>
        updatePickupHistory((prev) => prev.map((x) => (x.id === row.id ? { ...x, pickedUpAt: newVal } : x))),

      restoreFromDelivered: (id) => {
        const row = deliveredHistory.find((r) => r.id === id)
        if (!row) return
        updatePre((prev) => [{ ...row, delivered: false, deliveredAt: '' }, ...prev])
        updateDeliveredHistory((prev) => prev.filter((x) => x.id !== id))
      },

      restoreFromPickedUp: (id) => {
        const row = pickupHistory.find((r) => r.id === id)
        if (!row) return
        updatePickup((prev) => [{ ...row, pickedUp: false, pickedUpAt: '' }, ...prev])
        updatePickupHistory((prev) => prev.filter((x) => x.id !== id))
      },
    }),
    [deliveredHistory, pickupHistory, updatePre, updatePickup, updateDeliveredHistory, updatePickupHistory]
  )

  const COLS_BY_VIEW = useMemo(() => makeColumns({ LinkCmp: Link, handlers }), [handlers])
  const COLS = COLS_BY_VIEW[view] || []

  // ───────────────────────────────────────────────────────────
  // VIEW_ALL: aktywne + archiwa (4 listy naraz) + pola pomocnicze:
  // __type, __eta, __done, __doneAt, __viewGroup
  // ───────────────────────────────────────────────────────────
  const rowsAll = useMemo(() => {
    const preActive = (rowsPre || [])
      .filter((r) => !r?.delivered)
      .map((r) => ({
        ...r,
        __type: 'Dostawa',
        __eta: r.etaDelivery || '',
        __done: false,
        __doneAt: '',
        __viewGroup: 'Aktywne',
      }))

    const pickupActive = (rowsPickup || [])
      .filter((r) => !r?.pickedUp)
      .map((r) => ({
        ...r,
        __type: 'Odbiór',
        __eta: r.etaPickup || '',
        __done: false,
        __doneAt: '',
        __viewGroup: 'Aktywne',
      }))

    const deliveredArch = (deliveredHistory || []).map((r) => ({
      ...r,
      __type: 'Dostawa',
      __eta: r.etaDelivery || '',
      __done: true,
      __doneAt: r.deliveredAt || '',
      __viewGroup: 'Archiwum',
    }))

    const pickedupArch = (pickupHistory || []).map((r) => ({
      ...r,
      __type: 'Odbiór',
      __eta: r.etaPickup || '',
      __done: true,
      __doneAt: r.pickedUpAt || '',
      __viewGroup: 'Archiwum',
    }))

    return [...preActive, ...pickupActive, ...deliveredArch, ...pickedupArch]
  }, [rowsPre, rowsPickup, deliveredHistory, pickupHistory])

  const currentRows = useMemo(() => {
    switch (view) {
      case VIEW_ALL:
        return rowsAll
      case VIEW_PRE:
        return rowsPre
      case VIEW_PICKUP:
        return rowsPickup
      case VIEW_ARCH_DELIVERED:
        return deliveredHistory
      case VIEW_ARCH_PICKEDUP:
        return pickupHistory
      default:
        return []
    }
  }, [view, rowsAll, rowsPre, rowsPickup, deliveredHistory, pickupHistory])

  // VIEW_PRE / VIEW_PICKUP wycinamy “zrobione”; VIEW_ALL ma już wszystko gotowe
  const baseRowsForView = useMemo(() => {
    let base = Array.isArray(currentRows) ? currentRows : []
    if (view === VIEW_PRE) base = base.filter((r) => !r.delivered)
    if (view === VIEW_PICKUP) base = base.filter((r) => !r.pickedUp)
    return base
  }, [currentRows, view])

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

  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(baseRowsForView, COLS, {
    initialSort: { key: null, direction: 'asc' },
    getSearchFields,
  })

  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
    pageSize: 50,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  const csvColumns = useMemo(() => csvColumnsFor(view), [view])
  const exportCSV = useCsvExport({
    columns: csvColumns,
    rows: filteredSorted,
    filename: 'logistyka_probek.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

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

    const waitingDelivery = (rowsPre || []).filter((r) => !r.delivered && matches(r)).length
    const waitingPickup = (rowsPickup || []).filter((r) => !r.pickedUp && matches(r)).length
    const allActive = waitingDelivery + waitingPickup

    return [
      ['Wszystkie (aktywne)', allActive],
      ['Czeka na dostawę', waitingDelivery],
      ['Do odbioru', waitingPickup],
    ]
  }, [rowsPre, rowsPickup, searchQuery])

  const cancelProceed = useCallback(() => setConfirm({ open: false, type: null, id: null, date: todayISO() }), [])

  const confirmProceed = useCallback(() => {
    if (!confirm.date) {
      alert('Wybierz datę.')
      return
    }

    if (confirm.type === 'deliver') {
      const row = rowsPre.find((r) => r.id === confirm.id)
      if (!row) return cancelProceed()

      const withDate = { ...row, delivered: true, deliveredAt: confirm.date }
      updateDeliveredHistory((prev) => [{ ...withDate }, ...prev.filter((x) => x.id !== row.id)])
      updatePre((prev) => prev.filter((r) => r.id !== row.id))
    } else if (confirm.type === 'pickup') {
      const row = rowsPickup.find((r) => r.id === confirm.id)
      if (!row) return cancelProceed()

      const withDate = { ...row, pickedUp: true, pickedUpAt: confirm.date }
      updatePickupHistory((prev) => [{ ...withDate }, ...prev.filter((x) => x.id !== row.id)])
      updatePickup((prev) => prev.filter((r) => r.id !== row.id))
    }

    cancelProceed()
  }, [
    confirm.date,
    confirm.id,
    confirm.type,
    rowsPre,
    rowsPickup,
    updateDeliveredHistory,
    updatePre,
    updatePickupHistory,
    updatePickup,
    cancelProceed,
  ])

  const scrollDeps = useMemo(
    () => [view, visible.length, filteredSorted.length, searchQuery, sortConfig?.key, sortConfig?.direction],
    [view, visible.length, filteredSorted.length, searchQuery, sortConfig?.key, sortConfig?.direction]
  )

  const viewOptions = useMemo(
    () => [
      { key: VIEW_ALL, value: VIEW_ALL, label: 'Wszystkie' },
      { key: VIEW_PRE, value: VIEW_PRE, label: 'Przed dostawą' },
      { key: VIEW_PICKUP, value: VIEW_PICKUP, label: 'Do odbioru' },
      { key: VIEW_ARCH_DELIVERED, value: VIEW_ARCH_DELIVERED, label: 'Archiwum – dostarczone' },
      { key: VIEW_ARCH_PICKEDUP, value: VIEW_ARCH_PICKEDUP, label: 'Archiwum – odebrane' },
    ],
    []
  )

  return (
    <ListLayout
      rootClassName="samplesLogistics-list"
      controlsClassName="samplesLogistics-controls"
      controls={
        <>
          <div className="search-container">
            <SearchBar
              value={searchQuery}
              placeholder="Szukaj w logistyce próbek..."
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
            className="samplesLogistics-filter"
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary ariaLabel="Zestawienie próbek (bieżący widok/filtr)" items={summaryItems} />
        </>
      }
    >
      <TableScrollWrapper deps={scrollDeps} className="table-container">
        <table className="data-table" aria-label="Tabela logistyki próbek">
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
                  <td
                    key={col.key}
                    className={col.align ? `align-${col.align}` : undefined}
                    title={col.titleAccessor ? col.titleAccessor(row) : undefined}
                  >
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
        type={confirm.type}
        date={confirm.date}
        setDate={(d) => setConfirm((c) => ({ ...c, date: d }))}
        onConfirm={confirmProceed}
        onClose={cancelProceed}
      />
    </ListLayout>
  )
}
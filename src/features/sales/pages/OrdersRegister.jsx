// src/features/sales/pages/OrdersRegister.jsx  (albo gdzie masz ten plik)
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

import {
  ListLayout,
  SearchBar,
  Pagination,
  ListSummary,
  ExportCsvButton,
  DataTableWithActions,
  FilterSelect,

  // hooki i utils
  useListQuery,
  useUrlPagination,
  useCsvExport,
  rowNavigateProps as makeRowNavigateProps,

  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  SCROLL_SELECTOR,
  csvFilename,
} from '../../../shared/tables'

// konfiguracja SSOT
import { HEADER_COLS, CSV_COLUMNS, STAGES, initialOrders, normalizeOnLoad, getSearchFields } from '../config/orders.config'

export default function OrdersRegister() {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  // filtr etapu
  const [filterStage, setFilterStage] = useState('wszystkie')

  // 1️⃣ dane (docelowo backend)
  const orders = useMemo(() => normalizeOnLoad(initialOrders), [])

  // 2️⃣ wyszukiwanie + sortowanie
  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(orders, HEADER_COLS, {
    initialSort: { key: 'date', direction: 'desc' },
    getSearchFields,
  })

  // 3️⃣ filtr etapu
  const filteredByStage = useMemo(() => {
    if (filterStage === 'wszystkie') return filteredSorted
    return filteredSorted.filter((r) => r.stage === filterStage)
  }, [filteredSorted, filterStage])

  // 4️⃣ paginacja
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByStage, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // 5️⃣ eksport CSV
  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: filteredByStage,
    filename: csvFilename('zlecenia'),
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // 6️⃣ podsumowanie
  const stageSummaryItems = useMemo(() => {
    const map = new Map(STAGES.map((s) => [s, 0]))
    for (const o of filteredByStage) {
      if (map.has(o.stage)) map.set(o.stage, (map.get(o.stage) || 0) + 1)
    }
    return [['Zlecenia', filteredByStage.length], ...Array.from(map.entries())]
  }, [filteredByStage])

  // 7️⃣ klik w wiersz → formularz zlecenia
  const handleRowClick = useCallback(
    (id) => navigate(`/sprzedaz/rejestr-zlecen/${encodeURIComponent(id)}/formularz`),
    [navigate]
  )

  const rowNavProps = useCallback((id) => makeRowNavigateProps(id, handleRowClick), [handleRowClick])

  const stageOptions = useMemo(() => STAGES.map((s) => ({ key: s, value: s, label: s })), [])

  return (
    <ListLayout
      rootClassName="ordersRegister-list"
      controlsClassName="ordersRegister-controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Znajdź zlecenie..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ custom FilterSelect z shared/tables: ten sam mechanizm + styling jak w Documents */}
          <FilterSelect
            label={null}
            value={filterStage}
            onChange={(e) => {
              setFilterStage(e.target.value)
              resetToFirstPage(true)
            }}
            options={stageOptions}
            includeAll
            allValue="wszystkie"
            allLabel="Wszystkie etapy"
            title="Filtruj po etapie"
            ariaLabel="Filtruj po etapie"
            className="ordersRegister-controls__stageFilter"
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary ariaLabel="Zestawienie zleceń po etapach" items={stageSummaryItems} />
        </>
      }
    >
      <DataTableWithActions
        columns={HEADER_COLS}
        rows={visible}
        sortConfig={sortConfig}
        setSortConfig={(cfg) => {
          setSortConfig(cfg)
          resetToFirstPage(true)
        }}
        onAfterSort={() => resetToFirstPage(true)}
        actionsForRow={(row) => [
          {
            type: 'form',
            label: 'Formularz zlecenia',
            title: 'Formularz zlecenia',
            onClick: () => handleRowClick(row.id),
          },
        ]}
        rowProps={(row) => ({
          ...rowNavProps(row.id),
          className: 'row-clickable',
          title: 'Przejdź do formularza zlecenia',
        })}
        actionsSticky
        ariaLabel="Tabela rejestru zleceń"
      />
    </ListLayout>
  )
}
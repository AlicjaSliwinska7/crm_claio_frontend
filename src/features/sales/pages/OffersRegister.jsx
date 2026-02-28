// src/features/sales/pages/OffersRegister.jsx
import React, { useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// skórka tabel rejestrów
import '../../../shared/tables/styles/directories_lists_registers/index.css'

// wspólne komponenty
import {
  ListLayout,
  SearchBar,
  Pagination,
  ListSummary,
  ExportCsvButton,
  DataTableWithActions,

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
import {
  HEADER_COLS,
  CSV_COLUMNS,
  initialOffers,
  normalizeOnLoad,
  getSearchFields,
} from '../config/offers.config'

export default function OffersRegister({ offers }) {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  // 1) dane (docelowo backend)
  const items = useMemo(
    () => normalizeOnLoad(offers?.length ? offers : initialOffers),
    [offers]
  )

  // 2) wyszukiwanie + sortowanie
  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    filteredSorted,
    total,
  } = useListQuery(items, HEADER_COLS, {
    initialSort: { key: 'validUntil', direction: 'desc' },
    getSearchFields,
  })

  // 3) paginacja (URL)
  const {
    pageCount,
    currentPage,
    visible,
    onPageChange,
    resetToFirstPage,
  } = useUrlPagination(filteredSorted, {
    pageSize: PAGE_SIZE,
    searchParams: sp,
    setSearchParams: setSp,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // 4) eksport CSV
  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: filteredSorted,
    filename: csvFilename('oferty'),
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // 5) klik w wiersz → formularz oferty
  const handleRowClick = useCallback(
    (id) => navigate(`/sprzedaz/oferty/${encodeURIComponent(id)}/formularz`),
    [navigate]
  )

  const rowNavProps = useCallback(
    (id) => makeRowNavigateProps(id, handleRowClick),
    [handleRowClick]
  )

  return (
    <ListLayout
      rootClassName="offers-register"
      controlsClassName="offers-register__controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Znajdź ofertę..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={onPageChange}
            />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary
            ariaLabel="Podsumowanie rejestru ofert"
            items={[['Oferty', total]]}
          />
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
        // ✅ tylko FORM (bez edit/delete)
        actionsForRow={(row) => [
          { type: 'form', label: 'Formularz oferty', title: 'Formularz oferty', onClick: () => handleRowClick(row.id) },
        ]}
        rowProps={(row) => ({
          ...rowNavProps(row.id),
          className: 'row-clickable',
          title: 'Przejdź do formularza oferty',
        })}
        actionsSticky
        ariaLabel="Tabela rejestru ofert"
      />
    </ListLayout>
  )
}
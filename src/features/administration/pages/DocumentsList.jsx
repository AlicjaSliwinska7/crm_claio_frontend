import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// style
import '../../../shared/tables/styles/directories_lists_registers/index.css'
import '../../../shared/modals/styles/documents-upload-inline.css'

// wspólne klocki
import {
  ListLayout,
  SearchBar,
  AddButton,
  Pagination,
  ListSummary,
  FilterSelect,
  useListQuery,
  useUrlPagination,
  useCsvExport,
  PAGE_SIZE,
  CSV_DELIMITER,
  CSV_BOM,
  ExportCsvButton,
  DataTableWithActions,
  SCROLL_SELECTOR,
} from '../../../shared/tables'

// modale
import DocumentUploadModal from '../../../shared/modals/modals/DocumentUploadModal'
import { DeleteDialog } from '../../../shared/modals'

// utils
import { formatBytes } from '../../../shared/utils/formatBytes'
import { fmtDateTimeDMYHM } from '../../../shared/tables/utils/formatters/dateTime'

// konfiguracja (SSOT)
import {
  DOC_CATEGORIES,
  HEADER_COLS,
  validateNow,
  VALIDATION_DEFAULTS,
  CSV_COLUMNS,
  getSearchFields,
  INITIAL_DOCUMENTS,
} from '../config/documents.config'

export default function DocumentsList() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('cat') || 'all'
  const [filterCategory, setFilterCategory] = useState(initialCat)

  const [openAdd, setOpenAdd] = useState(false)

  // blob: url cleanup
  const pickedBlobUrlsRef = useRef(new Set())

  // 1) Wyszukiwanie + sortowanie
  const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(documents, HEADER_COLS, {
    initialSort: { key: 'addedAt', direction: 'desc' },
    getSearchFields,
  })

  // 2) Filtrowanie po kategorii
  const filteredByCategory = useMemo(
    () => (filterCategory === 'all' ? filteredSorted : filteredSorted.filter((d) => d?.category === filterCategory)),
    [filteredSorted, filterCategory]
  )

  // 3) Paginacja (URL)
  const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByCategory, {
    pageSize: PAGE_SIZE,
    searchParams,
    setSearchParams,
    param: 'page',
    scrollSelector: SCROLL_SELECTOR,
    canonicalize: true,
  })

  // 4) Eksport CSV
  const exportCSV = useCsvExport({
    columns: CSV_COLUMNS,
    rows: filteredByCategory,
    filename: 'dokumenty.csv',
    delimiter: CSV_DELIMITER,
    includeHeader: true,
    addBOM: CSV_BOM,
  })

  // 5) Dodawanie (z modala/panelu)
  const handleAdd = useCallback(
    ({ name, category, file }) => {
      const fileURL = URL.createObjectURL(file)
      pickedBlobUrlsRef.current.add(fileURL)

      setDocuments((prev) => [
        ...prev,
        {
          name,
          category,
          file: fileURL,
          fileName: file.name,
          fileSize: file.size,
          addedAt: new Date().toISOString(),
        },
      ])

      setOpenAdd(false)
      resetToFirstPage(true)
    },
    [resetToFirstPage]
  )

  // 6) Usuwanie
  const [showDelete, setShowDelete] = useState(false)
  const [docToDelete, setDocToDelete] = useState(null)

  const askDelete = useCallback((row) => {
    setDocToDelete(row)
    setShowDelete(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!docToDelete) return

    if (docToDelete.file?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(docToDelete.file)
      } catch {
        // ignore
      }
    }

    setDocuments((prev) => prev.filter((d) => d !== docToDelete))
    setShowDelete(false)
    setDocToDelete(null)
    resetToFirstPage(true)
  }, [docToDelete, resetToFirstPage])

  // 7) Sprzątanie blob: URL przy unmount
  useEffect(() => {
    return () => {
      pickedBlobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {
          // ignore
        }
      })
    }
  }, [])

  // 8) Sync filtra kategorii z URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (filterCategory !== 'all') next.set('cat', filterCategory)
    else next.delete('cat')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory])

  const delLabel = docToDelete?.name || ''
  const delInfo = docToDelete
    ? [docToDelete.fileName, formatBytes(docToDelete.fileSize), fmtDateTimeDMYHM(docToDelete.addedAt)]
        .filter(Boolean)
        .join(' • ')
    : ''

  const categoryOptions = useMemo(
    () => DOC_CATEGORIES.map((c) => ({ key: c.key, value: c.key, label: c.label })),
    []
  )

  return (
    <ListLayout
      rootClassName="documents-list"
      controlsClassName="documents-list__controls"
      controls={
        <>
          <SearchBar
            value={searchQuery}
            placeholder="Znajdź dokument..."
            onChange={(val) => {
              setSearchQuery(val)
              resetToFirstPage(true)
            }}
            onClear={() => {
              setSearchQuery('')
              resetToFirstPage(true)
            }}
          />

          {/* ✅ custom FilterSelect z shared/tables: full style + search + auto-close */}
          <FilterSelect
            label={null}
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              resetToFirstPage(true)
            }}
            options={categoryOptions}
            includeAll
            allValue="all"
            allLabel="Wszystkie kategorie"
            ariaLabel="Filtr kategorii"
            className="documents-list__categoryFilter"
          />

          <AddButton className="add-document-btn" onClick={() => setOpenAdd(true)} title="Dodaj dokument" />

          {/* ✅ Rozwijany panel uploadu pod toolbar'em */}
          <DocumentUploadModal
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            onSubmit={handleAdd}
            categories={DOC_CATEGORIES}
            defaultCategory="inne"
            allowedExts={VALIDATION_DEFAULTS.allowedExts}
            validate={(name, file) => validateNow(name, file)}
            mode="inline"
          />
        </>
      }
      footer={
        <>
          <div className="table-actions table-actions--inline">
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
            <ExportCsvButton onClick={exportCSV} iconOnly />
          </div>

          <ListSummary items={[['Dokumenty', filteredByCategory.length]]} ariaLabel="Podsumowanie" />
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
        actionsForRow={(row) => [
          { type: 'download', label: 'Pobierz', href: row.file || row.url },
          { type: 'delete', label: 'Usuń', onClick: () => askDelete(row) },
        ]}
        actionsSticky
        ariaLabel="Tabela dokumentów"
      />

      <DeleteDialog
        open={showDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setShowDelete(false)
          setDocToDelete(null)
        }}
        label={delLabel}
        what="dokument"
        customMessage={
          <>
            Na pewno chcesz usunąć dokument <strong>{delLabel}</strong>?
            <br />
            {delInfo && <span className="muted">{delInfo}</span>}
          </>
        }
      />
    </ListLayout>
  )
}
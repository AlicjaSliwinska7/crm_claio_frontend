// src/shared/tables/index.js

// ───────────────────────────────────────────────────────────
// Stałe wspólne dla list
// ───────────────────────────────────────────────────────────
export { PAGE_SIZE, CSV_DELIMITER, CSV_BOM, SCROLL_SELECTOR } from './constants'

// ───────────────────────────────────────────────────────────
// Komponenty list (layout, tabela, nagłówki, akcje)
// ───────────────────────────────────────────────────────────
export { default as ListLayout } from './components/ListLayout'
export { default as ListSummary } from './components/ListSummary'
export { default as Pagination } from './components/Pagination'

export { default as SearchBar } from './components/SearchBar'
export { default as ListToolbar } from './components/ListToolbar'
export { default as FilterSelect } from './components/FilterSelect'

export { default as HeaderRow } from './components/HeaderRow'
export { default as SortableTh } from './components/SortableTh'
export { default as EmptyStateRow } from './components/EmptyStateRow'
export { default as DataTableWithActions } from './components/DataTableWithActions'

export { default as ActionsHeader } from './components/ActionsHeader'
export { default as ActionsCell } from './components/cells/ActionsCell'

// Przyciski / akcje
export { default as AddButton } from './components/AddButton'
export { default as RowActionsButtons } from './components/RowActionsButtons' // legacy alias
export { default as ExportCsvButton } from './components/ExportCsvButton'

// Dokumenty / podglądy
export { default as DocumentPreviewModal } from './components/DocumentPreviewModal'

// Dodatkowe klocki z paska dodawania (opcjonalne)
export { default as AddBar } from './components/AddBar'
export { default as FileUploaderCompact } from './components/FileUploaderCompact'

// ───────────────────────────────────────────────────────────
// Hooki
// ───────────────────────────────────────────────────────────
export { useUrlPagination } from './hooks/usePagination'
export { useListCrud } from './hooks/useListCrud'
export { useListQuery } from './hooks/useListQuery'
export { useCsvExport } from './hooks/useCsvExport'

// ───────────────────────────────────────────────────────────
// Utilsy
// ───────────────────────────────────────────────────────────
// CSV (low-level + helper do nazwy pliku)
export { downloadCsv, toCsvString, escapeCsvCell, csvFilename } from './utils/csv'

// Kolumny, akcje wiersza, wyszukiwanie
export { getColStyle, col } from './utils/columns'
export { makeSearchFields } from './utils/search'

// Akcje wiersza (presety)
export { editDeleteActions } from './utils/actions'
export { downloadAction, downloadEditDeleteActions } from './utils/actions'

// Agregacje, sortowanie, nawigacja po wierszu
export {
	rowNavigateProps,
	rowNavigateProps as makeRowNavigateProps, // legacy alias
} from './utils/rowNavigateProps'

export { sortRows, nextDirection, sortIndicator, sortAria, buildDateTimeAccessor } from './utils/sorters'
export * as sorters from './utils/sorters'
export * as renderers from './utils/renderers'

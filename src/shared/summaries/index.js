// src/shared/summaries/index.js

// ————————————————————————————————
// Side-effect styles (jeśli istnieją)
// ————————————————————————————————
import './styles/summary.css'

// ————————————————————————————————
// Komponenty UI (exporty nazwane)
// ————————————————————————————————
export { default as Section } from './components/Section.jsx'
export { default as FiltersBar } from './components/FiltersBar.jsx'
export { default as ChartToolbar } from './components/ChartToolbar.jsx'
export { default as ClientSelect } from './components/ClientSelect.jsx'
export { default as SummarySelect } from './components/SummarySelect.jsx'
export { default as SummaryEmpty } from './components/SummaryEmpty.jsx'
export { default as DataTableLite } from './components/DataTableLite.jsx'
export { default as ExportCsvButton } from './components/ExportCsvButton.jsx'
export { default as SummaryPagination } from './components/SummaryPagination.jsx'

// 👉 KPI klocki wymagane przez KPIs.jsx
export { default as KpiCard } from './components/KpiCard.jsx'
export { default as KpisGrid } from './components/KpisGrid.jsx'

// (opcjonalne – jeśli używasz w innych miejscach)
export { default as CopyLinkButton } from './components/CopyLinkButton.jsx'
export { default as SummarySearchBox } from './components/SummarySearchBox.jsx'
export { default as PageSizeSelect } from './components/PageSizeSelect.jsx'

// ————————————————————————————————
// Hooki
// ————————————————————————————————
export { default as useRangePreset } from './hooks/useRangePreset.js'
export { default as useChartControls } from './hooks/useChartControls.js'
export { default as usePagination } from './hooks/usePagination.js'
export { default as useUniqueValues } from './hooks/useUniqueValues.js'
export { default as useTableSort } from './hooks/useTableSort.js'

// ————————————————————————————————
// Utils / Namespaces
// (ważne: summaryColors zawiera withAlpha)
// ————————————————————————————————
export * as summaryColors from './utils/colors.js'
export * as summaryTime from './utils/time.js'
export * as summaryData from './utils/data.js'
export * as summaryFormatters from './utils/formatters.js'
export * as csvFormatters from './utils/csvFormatters.js'
export * as summaryLinks from './utils/links.js'

// ————————————————————————————————
// Stałe i ustawienia wykresów
// ————————————————————————————————
export * from './constants.js' // METRICS_TESTS_SAMPLES, KPI_ICON_SIZE, itp.
export * from './utils/charts.js' // DEFAULT_MARGINS, DEFAULT_MARGINS_WITH_BOTTOM_AXIS

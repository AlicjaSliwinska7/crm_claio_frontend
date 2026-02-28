// src/shared/summary2/index.js
import './styles/classic/index.css'

export { default as SummaryRoot } from './components/SummaryRoot'
export { default as SummarySection } from './components/SummarySection'
export { default as SummaryCard } from './components/SummaryCard'
export { default as SummaryHeader } from './components/SummaryHeader'
export { default as SummarySubtitle } from './components/SummarySubtitle'

export { default as SummaryControls } from './components/SummaryControls'
export { default as SummaryControlCol } from './components/SummaryControlCol'
export { default as SummaryIconButton } from './components/SummaryIconButton'

export { default as SummaryKpiBar } from './components/SummaryKpiBar'
export { default as SummaryKpiItem } from './components/SummaryKpiItem'

export { default as SummaryEmpty } from './components/SummaryEmpty'
export { default as SummaryPage } from './components/SummaryPage.jsx'
export { default as CsvIconAction } from './components/CsvIconAction.jsx'
export { default as SummaryActionsRenderer } from './components/SummaryActionsRenderer.jsx'
export * as summaryActions from './utils/actions'
export * as summaryControls from './utils/controls'
export * as summaryCsv from './utils/csv'
export * as summarySections from './utils/sections'
export * as summaryKpi from './utils/kpi'
export * as summaryBlocks from './utils/blocks'
export * as summaryPage from './utils/page'
export function chartSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function tableSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function filtersSection(id, Component, props = {}) {
  return { id, Component, props }
}
export function kpiSection(id, Component, props = {}) {
  return { id, Component, props }
}
export * as summaryTime from './utils/time.js'
export { default as SummaryKpiGrid } from './components/SummaryKpiGrid'
export * as summaryKpiFmt from './utils/kpiFormatters'
export { getKpiItems, kpiRegistry } from './kpi/kpiRegistry'
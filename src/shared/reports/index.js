// === istniejące (zostaw) ===
export { default as SummarySection } from './components/SummarySection'
export { default as KpiRow } from './components/KpiRow'
export { default as RangePreset } from './components/RangePreset'
export { default as ListSummary } from './components/ListSummary'

export { useDatePreset } from './hooks/useDatePreset'
export { useSorting } from './hooks/useSorting'

export * as aggregate from './utils/aggregate'

// === NOWE: wspólne dla stron "Summary" ===
export { default as SummaryToolbar } from './components/SummaryToolbar'
export { useDateRange } from './hooks/useDateRange'
export { useGroupBy } from './hooks/useGroupBy'
export { useSearch } from './hooks/useSearch'
export { inRange, parseISO } from './utils/filters'
export * from './hooks';
export * from './utils';

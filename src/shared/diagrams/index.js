// src/shared/diagrams/index.js
import './styles/index.css'

// Charts (raw / base)
export { default as LineChartBase } from './charts/LineChartBase'
export { default as BarChartBase } from './charts/BarChartBase'
export { default as PieChartBase } from './charts/PieChartBase'
export { default as GanttChartBase } from './charts/GanttChartBase'
export { default as GanttRangeChartBase } from './charts/GanttRangeChartBase'

// Public utils (API used by configs)
export { computePresetRange, mainDateISO, monthKeyFromISO } from './utils/time'
export { withinRange, groupByKey, buildChartData } from './utils/data'
export { getSeriesColors } from './utils/colors'

// Legacy namespaces (opcjonalnie public)
export * as d2Colors from './utils/colors'
export * as d2Charts from './utils/charts'
// ChartLab helpers (parser/scale/export) — neutralne, bez stylu
export * from './utils/lab'

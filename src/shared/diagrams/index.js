// src/shared/diagrams2/index.js
import './styles/index.css'

// Charts (raw / base)
export { default as LineChartBase } from './charts/LineChartBase'
export { default as BarChartBase } from './charts/BarChartBase'
export { default as PieChartBase } from './charts/PieChartBase'
export { default as GanttChartBase } from './charts/GanttChartBase'
export { default as GanttRangeChartBase } from './charts/GanttRangeChartBase'

// Utils (opcjonalnie public)
export * as d2Colors from './utils/colors'
export * as d2Charts from './utils/charts'
// src/shared/diagrams/utils/lab/index.js
export { palette, nextDistinctColor } from './colors'
export { dashToArray } from './lines'
export { num, toNumOrNull, toIntOrNull, fmtNum } from './numbers'
export { detectDelimiter, parseTable, parseYList } from './parsing'
export { makeTicks, niceNum, computeTightXScale, computeCenteredScale } from './scales'
export { safeFile, exportCSVCore, exportPNGCore } from './export'
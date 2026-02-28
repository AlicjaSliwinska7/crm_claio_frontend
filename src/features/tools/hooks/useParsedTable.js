// src/features/charts/hooks/useParsedTable.js
import { useMemo } from 'react'
import { parseTable, num } from '../../../shared/diagrams/utils/lab'

export default function useParsedTable(rawText) {
  const { columns, rows } = useMemo(() => parseTable(rawText), [rawText])

  const numericCols = useMemo(() => {
    return columns.filter((c) => rows.some((r) => Number.isFinite(num(r[c]))))
  }, [columns, rows])

  return { columns, rows, numericCols }
}
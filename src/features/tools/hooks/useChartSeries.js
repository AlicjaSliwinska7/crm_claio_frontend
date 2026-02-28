// src/features/charts/hooks/useChartSeries.js
import { useCallback, useMemo, useState } from 'react'
import { nextDistinctColor, palette } from '../../../shared/diagrams/utils/lab'

export default function useChartSeries({ columns, colRoles, xTitle, setXTitle }) {
  const [leftSeries, setLeftSeries] = useState([])
  const [rightSeries, setRightSeries] = useState([])

  const xColSelected = useMemo(() => {
    return Object.keys(colRoles || {}).find((k) => colRoles[k] === 'x') || ''
  }, [colRoles])

  const applyMapping = useCallback(() => {
    const yLCols = (columns || []).filter((c) => colRoles?.[c] === 'yl')
    const yRCols = (columns || []).filter((c) => colRoles?.[c] === 'yr')

    const used = new Set()

    const mk = (side, cols) =>
      cols.map((c, i) => ({
        id: `${side}-col-${c}-${Date.now()}-${i}`,
        side,
        mode: 'column',
        col: c,
        name: c,
        color: nextDistinctColor(used, palette),
        width: 2,
        dash: 'solid',
      }))

    const left = mk('L', yLCols)
    const right = mk('R', yRCols)

    setLeftSeries(left)
    setRightSeries(right)

    if (xTitle === 'Oś X' && xColSelected) setXTitle(xColSelected)
  }, [columns, colRoles, xColSelected, xTitle, setXTitle])

  const addManualY = useCallback(
    (side) => {
      const used = new Set([...leftSeries, ...rightSeries].map((s) => s.color).filter(Boolean))
      const setter = side === 'L' ? setLeftSeries : setRightSeries
      setter((prev) => [
        ...prev,
        {
          id: `${side}-manualY-${Date.now()}`,
          side,
          mode: 'manualY',
          name: 'Ręczna Y',
          color: nextDistinctColor(used, palette),
          width: 2,
          dash: 'solid',
          valuesYText: '',
        },
      ])
    },
    [leftSeries, rightSeries]
  )

  const addManualPairs = useCallback(
    (side) => {
      const used = new Set([...leftSeries, ...rightSeries].map((s) => s.color).filter(Boolean))
      const setter = side === 'L' ? setLeftSeries : setRightSeries
      setter((prev) => [
        ...prev,
        {
          id: `${side}-manualPairs-${Date.now()}`,
          side,
          mode: 'manualPairs',
          name: 'Ręczna (x;y)',
          color: nextDistinctColor(used, palette),
          width: 2,
          dash: 'solid',
          valuesText: '',
        },
      ])
    },
    [leftSeries, rightSeries]
  )

  return {
    leftSeries,
    setLeftSeries,
    rightSeries,
    setRightSeries,
    applyMapping,
    addManualY,
    addManualPairs,
  }
}
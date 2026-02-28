// src/features/tools/hooks/useChartExport.js
import { useCallback } from 'react'

import {
  exportPNGCore,
  exportCSVCore,
} from '../../../shared/diagrams/utils/lab'

/**
 * Hook eksportów dla ChartsLab.
 * Etap 1: używamy SSOT z shared/diagrams/utils/lab:
 * - exportPNGCore
 * - exportCSVCore
 *
 * API hooka zostaje takie samo (exportPNG/exportCSV),
 * żeby nie ruszać komponentu strony i nie psuć układu.
 */
export default function useChartExport({
  chartWrapRef,
  title,
  titleColor,
  transparentBg,
  legendPayload,

  xSet,
  leftSeries,
  rightSeries,
  chartData,

  xTitle,
  xUnit,
  xMin,
  xMax,
  xStep,
  xDecimals,
  xLog,

  yLTitle,
  yLUnit,
  yLMin,
  yLMax,
  yLStep,
  yLDecimals,
  yLLog,

  yRTitle,
  yRUnit,
  yRMin,
  yRMax,
  yRStep,
  yRDecimals,
  yRLog,
}) {
  const exportPNG = useCallback(() => {
    exportPNGCore({
      chartWrapRef,
      title,
      titleColor,
      transparentBg,
      legendPayload,
    })
  }, [chartWrapRef, title, titleColor, transparentBg, legendPayload])

  const exportCSV = useCallback(() => {
    exportCSVCore({
      title,
      xSet,
      leftSeries,
      rightSeries,
      chartData,

      xTitle,
      xUnit,
      xMin,
      xMax,
      xStep,
      xDecimals,
      xLog,

      yLTitle,
      yLUnit,
      yLMin,
      yLMax,
      yLStep,
      yLDecimals,
      yLLog,

      yRTitle,
      yRUnit,
      yRMin,
      yRMax,
      yRStep,
      yRDecimals,
      yRLog,
    })
  }, [
    title,
    xSet,
    leftSeries,
    rightSeries,
    chartData,
    xTitle,
    xUnit,
    xMin,
    xMax,
    xStep,
    xDecimals,
    xLog,
    yLTitle,
    yLUnit,
    yLMin,
    yLMax,
    yLStep,
    yLDecimals,
    yLLog,
    yRTitle,
    yRUnit,
    yRMin,
    yRMax,
    yRStep,
    yRDecimals,
    yRLog,
  ])

  return { exportPNG, exportCSV }
}
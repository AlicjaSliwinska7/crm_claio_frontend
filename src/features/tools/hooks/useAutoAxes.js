// src/features/charts/hooks/useAutoAxes.js
import { useMemo } from 'react'
import {
  computeCenteredScale,
  computeTightXScale,
  makeTicks,
  toIntOrNull,
  toNumOrNull,
  fmtNum,
} from '../../../shared/diagrams/utils/lab'

export default function useAutoAxes(props) {
  const {
    xSet,
    xLog,
    xMin,
    xMax,
    xStep,
    xDecimals,

    leftSeries,
    rightSeries,
    chartData,

    yLLog,
    yLMin,
    yLMax,
    yLStep,
    yLDecimals,

    yRLog,
    yRMin,
    yRMax,
    yRStep,
    yRDecimals,

    setXMin,
    setXMax,
    setXStep,
    setYLMin,
    setYLMax,
    setYLStep,
    setYRMin,
    setYRMax,
    setYRStep,
  } = props

  const collectValues = (keys) => {
    const vals = []
    ;(chartData || []).forEach((r) =>
      keys.forEach((k) => {
        const v = r[k]
        if (Number.isFinite(v)) vals.push(v)
      })
    )
    return vals
  }

  const xAuto = useMemo(() => {
    if (xLog) return null
    if (!xSet?.length) return null
    return computeTightXScale(xSet, { targetTicks: 7 })
  }, [xSet, xLog])

  const yLAuto = useMemo(() => {
    if (yLLog) return null
    const keys = (leftSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id))
    const vals = collectValues(keys)
    if (!vals.length) return null
    return computeCenteredScale(vals, { targetTicks: 6, fillRatio: 0.6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, leftSeries, yLLog])

  const yRAuto = useMemo(() => {
    if (yRLog) return null
    const keys = (rightSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id))
    const vals = collectValues(keys)
    if (!vals.length) return null
    return computeCenteredScale(vals, { targetTicks: 6, fillRatio: 0.6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, rightSeries, yRLog])

  const pickAxis = (autoObj, minStr, maxStr, stepStr, isLog) => {
    if (isLog) return { domain: ['auto', 'auto'], ticks: undefined }
    const minManual = toNumOrNull(minStr)
    const maxManual = toNumOrNull(maxStr)
    const stepManual = toNumOrNull(stepStr)
    const minV = minManual ?? autoObj?.min
    const maxV = maxManual ?? autoObj?.max
    const domain = [Number.isFinite(minV) ? minV : 'auto', Number.isFinite(maxV) ? maxV : 'auto']
    let ticks
    if (Number.isFinite(stepManual) && Number.isFinite(minV) && Number.isFinite(maxV)) {
      ticks = makeTicks(minV, maxV, stepManual)
    } else {
      ticks = autoObj?.ticks
    }
    return { domain, ticks }
  }

  const xAxisCfg = useMemo(() => pickAxis(xAuto, xMin, xMax, xStep, xLog), [xAuto, xMin, xMax, xStep, xLog])
  const yLAxisCfg = useMemo(() => pickAxis(yLAuto, yLMin, yLMax, yLStep, yLLog), [yLAuto, yLMin, yLMax, yLStep, yLLog])
  const yRAxisCfg = useMemo(() => pickAxis(yRAuto, yRMin, yRMax, yRStep, yRLog), [yRAuto, yRMin, yRMax, yRStep, yRLog])

  const xDec = toIntOrNull(xDecimals)
  const yLDec = toIntOrNull(yLDecimals)
  const yRDec = toIntOrNull(yRDecimals)

  const yLDataRange = useMemo(() => {
    const vals = collectValues((leftSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id)))
    if (!vals.length) return { has: false, min: null, max: null }
    return { has: true, min: Math.min(...vals), max: Math.max(...vals) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, leftSeries])

  const yRDataRange = useMemo(() => {
    const vals = collectValues((rightSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id)))
    if (!vals.length) return { has: false, min: null, max: null }
    return { has: true, min: Math.min(...vals), max: Math.max(...vals) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, rightSeries])

  const lMinVal = toNumOrNull(yLMin)
  const lMaxVal = toNumOrNull(yLMax)
  const rMinVal = toNumOrNull(yRMin)
  const rMaxVal = toNumOrNull(yRMax)

  const lMinTooHigh = yLDataRange.has && Number.isFinite(lMinVal) && lMinVal > yLDataRange.min
  const lMaxTooLow = yLDataRange.has && Number.isFinite(lMaxVal) && lMaxVal < yLDataRange.max
  const lRangeInvalid = Number.isFinite(lMinVal) && Number.isFinite(lMaxVal) && lMinVal >= lMaxVal

  const rMinTooHigh = yRDataRange.has && Number.isFinite(rMinVal) && rMinVal > yRDataRange.min
  const rMaxTooLow = yRDataRange.has && Number.isFinite(rMaxVal) && rMaxVal < yRDataRange.max
  const rRangeInvalid = Number.isFinite(rMinVal) && Number.isFinite(rMaxVal) && rMinVal >= rMaxVal

  const invalidStyle = (cond) =>
    cond ? { borderColor: '#d64545', boxShadow: '0 0 0 3px rgba(214,69,69,.12)' } : undefined

  const handleAutoFit = () => {
    const leftVals = collectValues((leftSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id)))
    const rightVals = collectValues((rightSeries || []).map((s) => (s.mode === 'column' ? s.col : s.id)))

    const l = leftVals.length ? computeCenteredScale(leftVals, { targetTicks: 6, fillRatio: 0.6 }) : null
    const r = rightVals.length ? computeCenteredScale(rightVals, { targetTicks: 6, fillRatio: 0.6 }) : null

    setYLMin(l ? String(l.min) : '')
    setYLMax(l ? String(l.max) : '')
    setYLStep('')

    setYRMin(r ? String(r.min) : '')
    setYRMax(r ? String(r.max) : '')
    setYRStep('')

    if (xSet?.length) {
      const ax = computeTightXScale(xSet, { targetTicks: 7 })
      if (ax) {
        setXMin(String(ax.min))
        setXMax(String(ax.max))
        setXStep('')
      }
    }
  }

  const zeroVisibleOnLeft = useMemo(() => {
    const d = yLAxisCfg?.domain || []
    const a = d[0]
    const b = d[1]
    if (Number.isFinite(a) && Number.isFinite(b)) return a <= 0 && 0 <= b
    return true
  }, [yLAxisCfg])

  // (opcjonalnie) pod ręką, gdybyś chciała tooltipy gdzieś w osiach
  const _fmtRange = (a, b, dec) => `${fmtNum(a, dec)} — ${fmtNum(b, dec)}`

  return {
    xAxisCfg,
    yLAxisCfg,
    yRAxisCfg,
    xDec,
    yLDec,
    yRDec,
    yLDataRange,
    yRDataRange,
    invalidStyle,
    lRangeInvalid,
    rRangeInvalid,
    lMinTooHigh,
    lMaxTooLow,
    rMinTooHigh,
    rMaxTooLow,
    handleAutoFit,
    zeroVisibleOnLeft,
    _fmtRange,
  }
}
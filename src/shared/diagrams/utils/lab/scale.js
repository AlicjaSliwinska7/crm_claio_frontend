// src/shared/diagrams/utils/lab/scale.js

/* =========================================================
   ChartLab helpers — ticks & "nice" scales
   ========================================================= */

export function makeTicks(min, max, step) {
  if (![min, max, step].every(Number.isFinite) || step <= 0) return undefined
  const out = []
  for (let v = min; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(10)))
  return out
}

/* ===== Nice numbers (1–2–5) ===== */
function niceNum(x, round) {
  const exp = Math.floor(Math.log10(Math.max(Math.abs(x), 1e-12)))
  const f = x / Math.pow(10, exp)
  let nf
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nf * Math.pow(10, exp)
}

export function computeTightXScale(values, { targetTicks = 7 } = {}) {
  if (!values?.length) return null
  let minV = Math.min(...values)
  let maxV = Math.max(...values)
  if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null
  if (minV === maxV) {
    const pad = Math.abs(minV || 1) * 0.05
    minV -= pad
    maxV += pad
  }
  const range = maxV - minV
  const rawStep = range / Math.max(2, targetTicks - 1)
  const step = niceNum(rawStep, true)
  const ticks = []
  for (let t = minV; t <= maxV + 1e-9; t += step) ticks.push(Number(t.toFixed(10)))
  if (Math.abs(ticks[0] - minV) > 1e-9) ticks.unshift(Number(minV.toFixed(10)))
  if (Math.abs(ticks[ticks.length - 1] - maxV) > 1e-9) ticks.push(Number(maxV.toFixed(10)))
  return { min: minV, max: maxV, step, ticks }
}

export function computeCenteredScale(values, { targetTicks = 6, fillRatio = 0.6 } = {}) {
  if (!values?.length) return null
  let minV = Math.min(...values)
  let maxV = Math.max(...values)
  if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null
  if (minV === maxV) {
    const pad = Math.abs(minV || 1) * 0.05
    minV -= pad
    maxV += pad
  }
  const mid = (minV + maxV) / 2
  const amp = maxV - minV
  const desiredSpan = amp / Math.max(Math.min(fillRatio, 0.95), 0.05)
  const rawStep = desiredSpan / Math.max(2, targetTicks - 1)
  const step = niceNum(rawStep, true)
  const halfSpan = (step * Math.max(2, targetTicks - 1)) / 2
  const niceMin = Math.floor((mid - halfSpan) / step) * step
  const niceMax = Math.ceil((mid + halfSpan) / step) * step
  const ticks = []
  for (let t = niceMin; t <= niceMax + 1e-9; t += step) ticks.push(Number(t.toFixed(10)))
  return { min: niceMin, max: niceMax, step, ticks }
}
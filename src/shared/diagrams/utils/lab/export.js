// src/shared/diagrams/utils/lab/export.js

import { fmtNum } from './numbers'

export const safeFile = (s) => (s || 'wykres').replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 60)

/**
 * exportCSVCore – generuje CSV jako string
 * (hook tworzy blob i klika <a>)
 */
export function exportCSVCore({
  title,
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

  leftSeries = [],
  rightSeries = [],
  chartData = [],

  delimiter = ';',
}) {
  const colsDesc = [
    ...leftSeries.map((s) => ({ key: s.mode === 'column' ? s.col : s.id, label: s.name || s.col || s.id })),
    ...rightSeries.map((s) => ({ key: s.mode === 'column' ? s.col : s.id, label: s.name || s.col || s.id })),
  ]

  const meta = [
    `# Title: ${title}`,
    `# X: ${xTitle}${xUnit ? ` [${xUnit}]` : ''}; min=${xMin || 'auto'}; max=${xMax || 'auto'}; step=${xStep || 'auto'}; dec=${
      xDecimals || 'auto'
    }; scale=${xLog ? 'log' : 'linear'}`,
    `# YL: ${yLTitle}${yLUnit ? ` [${yLUnit}]` : ''}; min=${yLMin || 'auto'}; max=${yLMax || 'auto'}; step=${
      yLStep || 'auto'
    }; dec=${yLDecimals || 'auto'}; scale=${yLLog ? 'log' : 'linear'}`,
    rightSeries.length
      ? `# YR: ${yRTitle}${yRUnit ? ` [${yRUnit}]` : ''}; min=${yRMin || 'auto'}; max=${yRMax || 'auto'}; step=${
          yRStep || 'auto'
        }; dec=${yRDecimals || 'auto'}; scale=${yRLog ? 'log' : 'linear'}`
      : `# YR: (brak)`,
    `# Delimiter: "${delimiter}"`,
  ]

  const header = ['x', ...colsDesc.map((c) => c.label)].join(delimiter)

  const lines = chartData.map((r) =>
    [r.__x, ...colsDesc.map((c) => (Number.isFinite(r[c.key]) ? String(r[c.key]) : ''))].join(delimiter),
  )

  return [...meta, header, ...lines].join('\r\n')
}

/**
 * exportPNGCore – robi snapshot SVG->Canvas i zwraca dataURL png.
 * Hook odpowiada za pobranie: <a download=... href=dataURL>
 */
export async function exportPNGCore({
  wrapEl, // element .cl-chart-wrap
  title,
  titleColor,
  transparentBg,
  legendItems = [], // [{value,color}]
}) {
  if (!wrapEl) return null
  const svg = wrapEl.querySelector('svg')
  if (!svg) return null

  const { width, height } = wrapEl.getBoundingClientRect()

  const cloned = svg.cloneNode(true)
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  cloned.setAttribute('width', `${Math.round(width)}`)
  cloned.setAttribute('height', `${Math.round(height)}`)

  const blob = new Blob([new XMLSerializer().serializeToString(cloned)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()

  const dataUrl = await new Promise((resolve) => {
    img.onload = () => {
      const topPad = 36

      // Legend layout measurement (drawn on canvas)
      const measCtx = document.createElement('canvas').getContext('2d')
      measCtx.font = '14px Segoe UI, Arial'
      const items = legendItems || []
      const gapOuter = 14
      const gapInner = 6
      const symW = 10
      const itemStartPad = symW + gapInner

      const rows = []
      let row = []
      let rowW = 0
      const maxW = Math.round(width) - 16

      items.forEach((it) => {
        const textW = measCtx.measureText(it.value).width
        const iw = itemStartPad + textW
        const sep = row.length ? gapOuter : 0
        if (row.length && rowW + sep + iw > maxW) {
          rows.push(row)
          row = [{ ...it, _w: iw }]
          rowW = iw
        } else {
          row.push({ ...it, _w: iw })
          rowW += sep + iw
        }
      })
      if (row.length) rows.push(row)

      const rowH = 20
      const legendTopPad = items.length ? 8 : 0
      const legendBottomPad = items.length ? 12 : 0
      const legendHeight = items.length ? legendTopPad + rows.length * rowH + legendBottomPad : 0

      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width)
      canvas.height = Math.round(height + topPad + legendHeight)
      const ctx = canvas.getContext('2d')

      if (transparentBg) ctx.clearRect(0, 0, canvas.width, canvas.height)
      else {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // title
      ctx.fillStyle = titleColor
      ctx.font = '600 16px Segoe UI, Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(title, canvas.width / 2, 22)

      // chart
      ctx.drawImage(img, 0, topPad)

      // legend
      if (items.length) {
        ctx.save()
        ctx.font = '14px Segoe UI, Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'

        const baseY0 = topPad + height + legendTopPad + 14

        rows.forEach((r, i) => {
          const totalW = r.reduce((acc, it, idx) => acc + it._w + (idx ? gapOuter : 0), 0)
          let x = (canvas.width - totalW) / 2
          const y = baseY0 + i * rowH

          r.forEach((it, idx) => {
            if (idx) x += gapOuter
            ctx.beginPath()
            ctx.strokeStyle = it.color
            ctx.lineWidth = 2
            ctx.arc(x + symW / 2, y - 4, symW / 2, 0, Math.PI * 2)
            ctx.stroke()

            x += itemStartPad
            ctx.fillStyle = '#26435e'
            ctx.fillText(it.value, x, y)
            x += measCtx.measureText(it.value).width
          })
        })

        ctx.restore()
      }

      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => resolve(null)
    img.src = url
  })

  URL.revokeObjectURL(url)
  return dataUrl
}
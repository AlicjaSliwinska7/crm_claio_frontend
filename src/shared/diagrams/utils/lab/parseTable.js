// src/shared/diagrams/utils/lab/parseTable.js

/* =========================================================
   ChartLab helpers — parse pasted CSV/TSV text into table
   ========================================================= */

export function detectDelimiter(text) {
  const first = text.split(/\r?\n/).find((l) => l.trim().length) || ''
  const cnt = (ch) => (first.match(new RegExp(`\\${ch}`, 'g')) || []).length
  const pairs = [
    ['\t', cnt('\t')],
    [';', cnt(';')],
    [',', cnt(',')],
  ]
  pairs.sort((a, b) => b[1] - a[1])
  return pairs[0][1] > 0 ? pairs[0][0] : '\t'
}

export function parseTable(text) {
  if (!text?.trim()) return { columns: [], rows: [] }
  const delim = detectDelimiter(text)
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length)
  if (!lines.length) return { columns: [], rows: [] }
  const header = lines[0].split(delim).map((s) => s.trim())
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(delim)
    const obj = {}
    header.forEach((h, i) => {
      const raw = (cells[i] ?? '').trim()
      const asNum = Number(raw.replace(',', '.'))
      obj[h] = Number.isFinite(asNum) && raw !== '' ? asNum : raw
    })
    return obj
  })
  return { columns: header, rows }
}
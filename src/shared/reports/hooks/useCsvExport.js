// src/features/reporting/hooks/useCsvExport.js
import { useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

/* ---------- helpers ---------- */
const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`

function toCsv(header = [], rows = [], delimiter = ';') {
  const out = []
  if (header.length) out.push(header.map(esc).join(delimiter))
  for (const r of rows) out.push(r.map(esc).join(delimiter))
  return out.join('\r\n')
}

function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function defaultMonthLabel(iso) {
  const [y, m] = String(iso).split('-').map(Number)
  const d = parseISO(`${y}-${String(m).padStart(2, '0')}-01`)
  return format(d, 'MMM yyyy', { locale: pl })
}

/* ---------- uniwersalny hook: exportRows / exportObjects ---------- */
export default function useCsvExport() {
  const exportRows = useCallback((filename, header, rows, delimiter = ';') => {
    const csv = toCsv(header, rows, delimiter)
    downloadCsv(filename, csv)
  }, [])

  const exportObjects = useCallback((filename, columns, objects, delimiter = ';') => {
    const header = columns.map(c => c.label)
    const rows = objects.map(obj =>
      columns.map(c => {
        const raw = obj[c.key]
        return typeof c.fmt === 'function' ? c.fmt(Number(raw) || 0) : (raw ?? '')
      })
    )
    const csv = toCsv(header, rows, delimiter)
    downloadCsv(filename, csv)
  }, [])

  return { exportRows, exportObjects }
}

/* ---------- specjalizowany hook pod „SalesSummary” ---------- */
export function useSalesCsvExport({
  aggregated,
  from,
  to,
  monthLabel = defaultMonthLabel,
  filenamePrefix = 'zestawienia_sprzedaz',
}) {
  const exportCSV = useCallback(() => {
    const rows = [
      ['Miesiąc', 'Przychód', 'Pipeline', 'Wygrane'],
      ...aggregated.months.map(k => {
        const m = monthLabel(k)
        const sales = aggregated.salesSeries.find(r => r.month === m)?.revenue ?? 0
        const off = aggregated.offersSeries.find(r => r.month === m) || { pipeline: 0, won: 0 }
        return [m, sales, off.pipeline, off.won]
      }),
      [],
      ['KPI (sprzedaż)'],
      ['Przychód łączny', aggregated.revenueTotal],
      ['Liczba zleceń', aggregated.ordersCount],
      ['Średnia wartość zlecenia',
        typeof aggregated.avgOrder === 'number' ? aggregated.avgOrder.toFixed(2) : (aggregated.avgOrder ?? '')
      ],
      [],
      ['KPI (oferty)'],
      ['Pipeline łączny', aggregated.pipelineTotal],
      ['Wygrane łącznie', aggregated.wonTotal],
      ['Win rate', ((aggregated.winRate || 0) * 100).toFixed(1) + '%'],
    ]

    // semikolony + \n (Excel łyka oba CRLF/LF)
    const csv = rows.map(r => r.map(esc).join(';')).join('\n')
    const filename = `${filenamePrefix}_${format(from, 'yyyyMMdd')}_${format(to, 'yyyyMMdd')}.csv`
    downloadCsv(filename, csv)
  }, [aggregated, from, to, monthLabel, filenamePrefix])

  return exportCSV
}

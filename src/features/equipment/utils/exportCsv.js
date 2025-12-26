export default function exportCsv({ rows, filename, STATUS_LABEL }) {
  const csvCell = (v) => {
    const s = (v ?? '').toString()
    return /[;\n"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = [
    'Kod','Nazwa','Rodzaj','Ostatnia kalibracja','Następna kalibracja',
    'Plan wysyłki','Plan zwrotu','Miejsce','Status',
  ].join(';')

  const lines = rows.map(r =>
    [
      csvCell(r.code || r.id || ''),
      csvCell(r.name || ''),
      csvCell(r.type || ''),
      csvCell(r.lastCalibration || ''),
      csvCell(r.nextCalibration || ''),
      csvCell(r.plannedSend || ''),
      csvCell(r.plannedReturn || ''),
      csvCell(r.shippingPlace || ''),
      csvCell(STATUS_LABEL[r._status] || ''),
    ].join(';')
  )

  const csv = [head, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

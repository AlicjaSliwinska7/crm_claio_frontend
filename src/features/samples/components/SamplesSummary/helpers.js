// daty/formaty
export const fmtDate = d => (d ? new Date(d).toLocaleDateString('pl-PL') : '—')
export const mainDate = s => s?.testedDate || s?.receivedDate || ''
export const monthKey = s => (s ? String(s).slice(0, 7) : '')
export const toLocalISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// filtry/warunki
export function withinRange(val, min, max) {
  if (val == null || isNaN(val)) return false
  if (min !== '' && !isNaN(min) && Number(val) < Number(min)) return false
  if (max !== '' && !isNaN(max) && Number(val) > Number(max)) return false
  return true
}

export function groupByKey(arr, keyFn) {
  const m = new Map()
  for (const x of arr || []) {
    const k = keyFn(x)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(x)
  }
  return m
}

// kolumny tabeli per tryb
export function buildColumnsByMode(groupBy) {
  if (groupBy === 'byCode') {
    return [
      { key: 'group', label: 'Kod', numeric: false },
      { key: 'count', label: 'Liczba próbek', numeric: true },
      { key: 'clientsCount', label: 'Klienci (unik.)', numeric: true },
      { key: 'subjectsCount', label: 'Przedmioty (unik.)', numeric: true },
      { key: 'energySumWh', label: 'Σ Energia [Wh]', numeric: true, fmt: v => Number(v ?? 0).toFixed(2) },
      { key: 'capAvgAh', label: 'Śr. Pojemność [Ah]', numeric: true, fmt: v => Number(v ?? 0).toFixed(2) },
      { key: 'voltAvgV', label: 'Śr. Napięcie [V]', numeric: true, fmt: v => Number(v ?? 0).toFixed(2) },
      { key: 'currAvgA', label: 'Śr. Prąd [A]', numeric: true, fmt: v => Number(v ?? 0).toFixed(2) },
    ]
  }
  if (groupBy === 'bySubject') {
    return [
      { key: 'group', label: 'Przedmiot badawczy', numeric: false },
      { key: 'AO', label: 'AO', numeric: true },
      { key: 'AZ', label: 'AZ', numeric: true },
      { key: 'BP', label: 'BP', numeric: true },
      { key: 'BW', label: 'BW', numeric: true },
      { key: 'total', label: 'Razem', numeric: true },
      { key: 'clientsCount', label: 'Klienci (unik.)', numeric: true },
    ]
  }
  return [
    { key: 'group', label: 'Klient', numeric: false },
    { key: 'AO', label: 'AO', numeric: true },
    { key: 'AZ', label: 'AZ', numeric: true },
    { key: 'BP', label: 'BP', numeric: true },
    { key: 'BW', label: 'BW', numeric: true },
    { key: 'total', label: 'Razem', numeric: true },
    { key: 'subjectsCount', label: 'Przedmioty (unik.)', numeric: true },
    { key: 'period', label: 'Okres', numeric: false },
  ]
}

// src/features/equipment/components/EquipmentSummary/helpers.js

/* ===== Stałe ===== */
export const DAY = 24 * 60 * 60 * 1000

/* ===== Utils czasu/dat ===== */
export const toTs = v => {
  if (v == null || v === '') return null
  const d = v instanceof Date ? v : new Date(v)
  const t = d.getTime()
  return Number.isFinite(t) ? t : null
}

export const fmtDate = (t, withTime = false) => {
  const d = new Date(t)
  if (!Number.isFinite(d.getTime())) return '—'
  const pad = n => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  if (!withTime) return `${yyyy}-${mm}-${dd}`
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

export const addDays = (dateLike, days) => {
  const t = toTs(dateLike)
  if (t == null) return null
  return new Date(t + days * DAY)
}

export const startOfDay = dateLike => {
  const t = toTs(dateLike)
  if (t == null) return null
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d
}

export const endOfDay = dateLike => {
  const t = toTs(dateLike)
  if (t == null) return null
  const d = new Date(t)
  d.setHours(23, 59, 59, 999)
  return d
}

/* ===== Nowe: zakresy presetów dla EquipmentSummary ===== */
/**
 * Zwraca { from, to, labelHTML } dla presetów:
 * - 'this-month' | 'last-month' | 'last-30d' | 'custom'
 * customFrom/customTo w formacie 'YYYY-MM-DD' albo Date.
 */
export function computePresetRange(preset, { today = new Date(), customFrom = null, customTo = null } = {}) {
  const y = today.getFullYear()
  const m = today.getMonth() // 0..11

  const iso = d => fmtDate(d, false) // YYYY-MM-DD
  let from, to, labelHTML

  if (preset === 'this-month') {
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0) // ostatni dzień
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (bieżący miesiąc)`
  } else if (preset === 'last-month') {
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (poprzedni miesiąc)`
  } else if (preset === 'last-30d') {
    const end = startOfDay(today)
    const start = addDays(end, -29)
    from = iso(start)
    to = iso(end)
    labelHTML = `Zakres: <b>${from}</b> – <b>${to}</b> (ostatnie 30 dni)`
  } else {
    // 'custom'
    const f = customFrom ? startOfDay(customFrom) : null
    const t = customTo ? endOfDay(customTo) : null
    from = f ? iso(f) : null
    to = t ? iso(t) : null
    labelHTML = from && to ? `Zakres: <b>${from}</b> – <b>${to}</b>` : 'Zakres: —'
  }

  return { from, to, labelHTML }
}

/* ===== Nowe: konwersja danych do wierszy wykresu Gantta ===== */
/**
 * Przyjmuje tablicę obiektów z polami: { id?, code, device, start, end, lab?, cost? }
 * Zwraca tablicę: { id, label, start, end, meta }
 * start/end jako timestamp (ms).
 */
export function makeGanttRowsFromNormalized(items = []) {
  return items
    .map((it, idx) => {
      const start = toTs(it.start)
      const end = toTs(it.end)
      if (start == null || end == null) return null
      const label = [it.code, it.device].filter(Boolean).join(' — ') || it.code || it.device || `Pozycja ${idx + 1}`
      return {
        id: it.id || `g-${idx}`,
        label,
        start,
        end,
        meta: {
          lab: it.lab ?? null,
          cost: it.cost ?? null,
          code: it.code ?? null,
          device: it.device ?? null,
        },
      }
    })
    .filter(Boolean)
}

/* ===== Dane demo: rejestr sprzętu ===== */
export const sampleEquipment = [
  {
    id: 'M-001',
    name: 'Frezarka CNC',
    serialNumber: 'FZ-9932',
    assetNumber: '12345-A',
    operator: 'Jan Kowalski',
    status: 'sprawny',
    location: 'Hala 1',
    group: 'Mechanika',
    model: 'HAAS VF-2',
    power: '7.5kW',
    producer: 'HAAS',
    supplier: 'TechSup',
    purchaseDate: '2023-05-10',
    purchaseCost: 150000,
    info: 'Głowica 3-osiowa',
  },
  {
    id: 'M-002',
    name: 'Wtryskarka',
    serialNumber: 'WT-2201',
    assetNumber: '12345-B',
    operator: 'Alicja Śliwińska',
    status: 'w kalibracji',
    location: 'Hala 2',
    group: 'Tworzywa',
    model: 'Arburg 320C',
    power: '9kW',
    producer: 'Arburg',
    supplier: 'PolPlast',
    purchaseDate: '2022-02-17',
    purchaseCost: 120000,
    info: 'Podajnik boczny',
  },
  {
    id: 'EQ-WG-10',
    name: 'Waga analityczna',
    serialNumber: 'WG-9811',
    assetNumber: '55512-C',
    operator: 'Piotr Nowak',
    status: 'sprawny',
    location: 'Lab 1',
    group: 'Pomiary',
    model: 'Radwag XA 10',
    power: '—',
    producer: 'Radwag',
    supplier: 'Pro-Met',
    purchaseDate: '2024-10-04',
    purchaseCost: 16900,
    info: 'D=0.1 mg',
  },
  {
    id: 'EQ-TH-A',
    name: 'Termometr A',
    serialNumber: 'TH-3302',
    assetNumber: '55512-D',
    operator: 'Jan Kowalski',
    status: 'sprawny',
    location: 'Lab 2',
    group: 'Pomiary',
    model: 'Fluke 1524',
    power: '—',
    producer: 'Fluke',
    supplier: 'TechSup',
    purchaseDate: '2024-01-20',
    purchaseCost: 8100,
    info: 'PT100',
  },
  {
    id: 'EQ-MN-X',
    name: 'Manometr X',
    serialNumber: 'MN-200X',
    assetNumber: '55512-E',
    operator: 'Alicja Śliwińska',
    status: 'sprawny',
    location: 'Lab 3',
    group: 'Pomiary',
    model: 'WIKA 213.53',
    power: '—',
    producer: 'WIKA',
    supplier: 'Pro-Met',
    purchaseDate: '2023-11-02',
    purchaseCost: 990,
    info: '0–10 bar',
  },
]

/* ===== Dane demo: kalibracje ===== */
export const sampleCalibrations = [
  {
    id: 'CAL-001',
    code: 'EQ-WG-10',
    device: 'Waga analityczna',
    start: '2025-02-01',
    end: '2025-02-03',
    lab: 'LAB1',
    cost: 1250,
  },
  {
    id: 'CAL-002',
    code: 'EQ-TH-A',
    device: 'Termometr A',
    start: '2025-02-15',
    end: '2025-02-16',
    lab: 'LAB1',
    cost: 450,
  },
  {
    id: 'CAL-003',
    code: 'M-001',
    device: 'Frezarka CNC',
    start: '2025-03-10',
    end: '2025-03-12',
    lab: 'LAB3',
    cost: 2400,
  },
  {
    id: 'CAL-004',
    code: 'M-002',
    device: 'Wtryskarka',
    start: '2025-03-20',
    end: '2025-03-22',
    lab: 'LAB1',
    cost: 980,
  },
]

export const sampleFailures = [
  // w failures pole "device" ustawiamy również na kod, żeby w tooltipach/legendach też był kod
  { id: 'F-100', date: '2025-02-02', downtimeHours: 10, repairCost: 1200, device: 'EQ-TH-A' },
  { id: 'F-101', date: '2025-02-06', downtimeHours: 4, repairCost: 400, device: 'EQ-MN-X' },
  { id: 'F-102', date: '2025-02-13', downtimeHours: 16, repairCost: 3600, device: 'EQ-WG-10' },
  { id: 'F-103', date: '2025-03-03', downtimeHours: 2, repairCost: 300, device: 'EQ-TH-B' },
]

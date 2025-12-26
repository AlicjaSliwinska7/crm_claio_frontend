import {
  addDays, endOfMonth, endOfWeek, isAfter, isBefore,
  parseISO, format, startOfMonth, startOfWeek,
} from 'date-fns'
import { pl } from 'date-fns/locale'

// === MOCK (podmienisz backendem) ===
export const MOCK = [
  { id: 'M-001', code: 'M-001', name: 'Frezarka CNC', type: 'maszyna', lastCalibration: '2025-08-12', nextCalibration: '2025-11-10', progress: 'none', plannedSend: '', plannedReturn: '', shippingPlace: 'LabTech' },
  { id: 'P-001', code: 'P-001', name: 'Wagosuszarka RADWAG MA 50.R', type: 'przyrząd', lastCalibration: '2025-06-02', nextCalibration: '2025-09-28', progress: 'in_progress', plannedSend: '2025-09-05', plannedReturn: '2025-09-19', shippingPlace: 'RADWAG Service' },
  { id: 'P-002', code: 'P-002', name: 'Mikrometr zewnętrzny 0–25 mm', type: 'przyrząd', lastCalibration: '2024-12-10', nextCalibration: '2025-09-05', progress: 'none', plannedSend: '', plannedReturn: '', shippingPlace: '' },
  { id: 'M-002', code: 'M-002', name: 'Tokarka konwencjonalna', type: 'maszyna', lastCalibration: '2024-07-01', nextCalibration: '2025-07-01', progress: 'none', plannedSend: '', plannedReturn: '', shippingPlace: 'MetalCal' },
  { id: 'P-003', code: 'P-003', name: 'Termometr wzorcowy', type: 'przyrząd', lastCalibration: '2025-01-15', nextCalibration: '', progress: 'none', plannedSend: '', plannedReturn: '', shippingPlace: '' },
]

// === Statusy (bez „aktualne” w kalendarzu) ===
export const STATUS = { DUE_SOON: 'due_soon', OVERDUE: 'overdue', IN_PROGRESS: 'in_progress' }
export const STATUS_LABEL = {
  [STATUS.DUE_SOON]: 'Do wzorcowania',
  [STATUS.OVERDUE]: 'Po terminie',
  [STATUS.IN_PROGRESS]: 'W trakcie',
}
export const STATUS_COLOR = {
  [STATUS.DUE_SOON]: '#8196ffff',
  [STATUS.OVERDUE]: '#d60000',
  [STATUS.IN_PROGRESS]: '#6b6b6bff',
}

// planowanie (nie statusy)
export const COLOR_PLANNED_SEND = '#5d00ffff'
export const COLOR_PLANNED_RETURN = '#5b5b5bff'

// helpers
export const toDate = d => (d instanceof Date ? d : d ? parseISO(d) : null)
export const fmt = (d, f = 'yyyy-MM-dd') => (d ? format(d, f, { locale: pl }) : '—')
export const toStr = v => (v ?? '').toString()
export const csvCell = v => {
  const s = toStr(v)
  return /[;\n"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function computeStatus(item, ref = new Date(), soonDays = 30) {
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
  if (item.progress === 'in_progress') return STATUS.IN_PROGRESS
  const next = toDate(item.nextCalibration)
  if (!next) return null
  if (isBefore(next, today)) return STATUS.OVERDUE
  const soonLimit = addDays(today, soonDays)
  if (!isAfter(next, soonLimit)) return STATUS.DUE_SOON
  return null
}

// fallback święta PL (2025)
export const FALLBACK_PL_2025 = new Set([
  '2025-01-01','2025-01-06','2025-04-20','2025-04-21','2025-05-01','2025-05-03',
  '2025-06-08','2025-06-19','2025-08-15','2025-11-01','2025-11-11','2025-12-25','2025-12-26',
])

export function buildDays(cursorDate) {
  const monthStart = startOfMonth(cursorDate)
  const monthEnd = endOfMonth(cursorDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const out = []
  for (let d = gridStart; !isAfter(d, gridEnd); d = addDays(d, 1)) out.push(d)
  return out
}

// src/features/administration/config/appointments.config.js
import { col, buildDateTimeAccessor, makeSearchFields } from '../../../shared/tables'
import { joinArray } from '../../../shared/utils/formatters'

/* =========================================================
   Statusy spotkań (klucze w danych)
   ========================================================= */

export const APPOINTMENT_STATUSES = [
  { key: 'planowane', label: 'Planowane' },
  { key: 'wtrakcie', label: 'W trakcie' },
  { key: 'zakonczone', label: 'Zakończone' },
  { key: 'odwolane', label: 'Odwołane' },
]

const STATUS_LABEL_BY_KEY = Object.fromEntries(APPOINTMENT_STATUSES.map(s => [s.key, s.label]))

/**
 * statusKey
 * Normalizacja wejścia
 */
export const statusKey = (v) => {
  const raw = String(v ?? '').trim()
  if (!raw) return ''

  const k = raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const ALIASES = {
    'wtrakcie': 'wtrakcie',
    'zkonczone': 'zakonczone',
    'zakoncone': 'zakonczone',
    'zakonczone': 'zakonczone',
    'zakonczono': 'zakonczone',
    'odwolane': 'odwolane',
    'anulowane': 'odwolane',
    'planowane': 'planowane',
    'zaplanowane': 'planowane',
  }

  if (STATUS_LABEL_BY_KEY[k]) return k
  if (ALIASES[k]) return ALIASES[k]
  if (APPOINTMENT_STATUSES.some(s => s.key === k)) return k

  return k
}

export const getStatusLabel = (keyOrLabel) => {
  const k = statusKey(keyOrLabel)
  return STATUS_LABEL_BY_KEY[k] ?? String(keyOrLabel ?? '')
}

/* =========================================================
   Kolumny tabeli — SYSTEMOWE SZEROKOŚCI
   ========================================================= */

const joinMembers = (arr) => joinArray(arr, '; ')

export const HEADER_COLS = [
  col('topic', 'Temat', {
    sortable: true,
    type: 'string',
    minWidth: 260,        // główna kolumna tekstowa
  }),

  col('date', 'Data', {
    sortable: true,
    type: 'date',
    align: 'center',
    width: 120,          // wąska, stała
    accessor: buildDateTimeAccessor('date', 'time'),
  }),

  col('time', 'Godzina', {
    sortable: true,
    type: 'string',
    align: 'center',
    width: 90,           // bardzo wąska
  }),

  col('status', 'Status', {
    sortable: true,
    type: 'status',
    width: 120,          // wartości krótkie → nie puchnie
    accessor: (row) => statusKey(row?.status) || 'planowane',
    titleAccessor: (row) => getStatusLabel(row?.status),
  }),

  col('members', 'Uczestnicy', {
    sortable: false,
    minWidth: 220,       // tekst, ale nie dominujący
    render: (_v, row) => joinMembers(row?.members),
    titleAccessor: (row) => joinMembers(row?.members),
  }),

  col('place', 'Miejsce', {
    sortable: true,
    type: 'string',
    minWidth: 180,       // tekst średniej długości
  }),
]

/* =========================================================
   Formularz – puste wartości
   ========================================================= */

export const EMPTY_FORM = {
  id: '',
  topic: '',
  date: '',
  time: '',
  status: 'planowane',
  members: [],
  place: '',
  arrangements: '',
}

/* =========================================================
   Dane przykładowe
   ========================================================= */

export const initialAppointments = [
  {
    id: 'A-001',
    topic: 'Kickoff projektu X',
    date: '2025-09-15',
    time: '10:00',
    status: 'planowane',
    members: ['Alicja Śliwińska', 'Jan Kowalski'],
    place: 'Sala konferencyjna 2 / Teams',
    arrangements: 'Ustalić zakres MVP, terminy, role.',
  },
  {
    id: 'A-002',
    topic: 'Spotkanie z klientem TechSolutions',
    date: '2025-09-18',
    time: '14:30',
    status: 'wtrakcie',
    members: ['Alicja Śliwińska', 'Opiekun klienta'],
    place: 'Biuro klienta / online',
    arrangements: 'Omówienie wymagań, potwierdzenie budżetu.',
  },
]

/* =========================================================
   Normalizacja
   ========================================================= */

const normalizeMembers = (value) =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)

export const normalizeOnLoad = (arr) =>
  arr.map((a) => ({
    ...a,
    status: statusKey(a.status) || 'planowane',
    members: normalizeMembers(a.members),
  }))

export const normalizeOnSave = (f) => ({
  ...f,
  status: statusKey(f.status) || 'planowane',
  members: normalizeMembers(f.members),
})

/* =========================================================
   Walidacja
   ========================================================= */

export const validateAppointment = (f) =>
  !f.topic || !f.date ? 'Uzupełnij co najmniej temat i datę.' : null

/* =========================================================
   Inne
   ========================================================= */

export const users = ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']

export const labelForDelete = (row) =>
  row ? `${row.topic} — ${row.date}${row.time ? ` ${row.time}` : ''}` : ''

/* =========================================================
   Wyszukiwanie
   ========================================================= */

export const getSearchFields = makeSearchFields(
  'id',
  'topic',
  'date',
  'time',
  'status',
  (r) => getStatusLabel(r.status),
  'place',
  'arrangements',
  (r) => joinMembers(r.members)
)

/* =========================================================
   CSV
   ========================================================= */

export const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'topic', label: 'Temat' },
  { key: 'date', label: 'Data' },
  { key: 'time', label: 'Godzina' },
  { key: 'status', label: 'Status' },
  { key: 'members', label: 'Uczestnicy' },
  { key: 'place', label: 'Miejsce' },
  { key: 'arrangements', label: 'Ustalenia' },
]

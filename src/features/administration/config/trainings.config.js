// src/features/administration/config/trainings.config.js
import { makeSearchFields } from '../../../shared/tables'
import { joinArray } from '../../../shared/utils/formatters'

/* =========================================================
   Słowniki / stałe UI
   ========================================================= */

export const TRAINING_TYPES = [
  { key: 'wewnętrzne', label: 'Wewnętrzne' },
  { key: 'zewnętrzne', label: 'Zewnętrzne' },
]

// Klucze w danych (bez polskich znaków – stabilne klucze)
export const TRAINING_STATUSES = [
  { key: 'planowane', label: 'Planowane' },
  { key: 'wtrakcie', label: 'W trakcie' },
  { key: 'zakonczone', label: 'Zakończone' },
  { key: 'odwolane', label: 'Odwołane' },
]

export const getTypeLabel = key => TRAINING_TYPES.find(t => t.key === key)?.label ?? key
export const getStatusLabel = key => TRAINING_STATUSES.find(s => s.key === key)?.label ?? key

/* =========================================================
   Domyślne wartości formularza
   ========================================================= */

export const DEFAULT_TRAINING = {
  id: null,
  type: 'wewnętrzne',
  title: '',
  topic: '',
  date: '', // YYYY-MM-DD
  status: 'planowane',
  participants: [],
  note: '',
}

/* =========================================================
   Kolumny do CSV / eksportu
   ========================================================= */

export const TRAINING_CSV_COLUMNS = [
  { key: 'title', label: 'Tytuł' },
  { key: 'topic', label: 'Temat' },
  { key: 'type', label: 'Typ' },
  { key: 'date', label: 'Data' },
  { key: 'status', label: 'Status' },
  { key: 'participants', label: 'Uczestnicy' },
  { key: 'note', label: 'Notatka' },
]

/* =========================================================
   Kolumny tabeli (dla listy szkoleń)
   ========================================================= */

export const TRAINING_TABLE_COLS = [
  {
    key: 'title',
    label: 'Tytuł',
    sortable: true,
    type: 'string',
    render: v => String(v ?? ''),
    titleAccessor: row => String(row?.title ?? ''),
  },
  {
    key: 'topic',
    label: 'Temat',
    sortable: true,
    type: 'string',
    render: v => String(v ?? ''),
    titleAccessor: row => String(row?.topic ?? ''),
  },
  {
    key: 'type',
    label: 'Typ',
    sortable: true,
    type: 'string',
    render: (_v, row) => getTypeLabel(row?.type),
    accessor: row => getTypeLabel(row?.type),
    titleAccessor: row => getTypeLabel(row?.type),
  },
  {
    key: 'date',
    label: 'Data',
    sortable: true,
    type: 'date', // DataCell -> dd-mm-yyyy + nowrap
    align: 'center',
    titleAccessor: row => row?.date ?? '',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    type: 'status', // ✅ StatusCell

    // ✅ bez statusMap — StatusCell mapuje automatycznie po nazwie/kluczu
    accessor: row => String(row?.status ?? DEFAULT_TRAINING.status),

    // Tooltip zawsze po polsku:
    titleAccessor: row => getStatusLabel(row?.status ?? DEFAULT_TRAINING.status),
    align: 'center',
  },
  {
    key: 'participants',
    label: 'Uczestnicy',
    sortable: false,
    minWidth: 240,
    render: (_v, row) => joinArray(row?.participants || [], ', '),
    titleAccessor: row => joinArray(row?.participants || [], ', '),
  },
]

/* =========================================================
   Walidacja pól
   ========================================================= */

export const validateTraining = t => {
  const errors = {}
  const val = v => String(v ?? '').trim()

  if (!val(t.title)) errors.title = 'Podaj tytuł.'
  if (!val(t.topic)) errors.topic = 'Podaj temat.'
  if (!val(t.date)) errors.date = 'Podaj datę.'

  if (!Array.isArray(t.participants) || t.participants.length === 0) {
    errors.participants = 'Wybierz co najmniej jednego uczestnika.'
  }

  if (t.status && !TRAINING_STATUSES.some(s => s.key === t.status)) {
    errors.status = 'Nieprawidłowy status.'
  }

  if (!TRAINING_TYPES.some(x => x.key === t.type)) {
    errors.type = 'Nieprawidłowy typ.'
  }

  return errors
}

/* =========================================================
   Normalizacja danych
   ========================================================= */

const toStr = v => (v ?? '').toString()

export const normalizeTraining = (input = {}) => ({
  id: input.id ?? null,
  type: toStr(input.type || DEFAULT_TRAINING.type),
  title: toStr(input.title),
  topic: toStr(input.topic),
  date: toStr(input.date),
  status: toStr(input.status || DEFAULT_TRAINING.status),
  participants: Array.isArray(input.participants)
    ? input.participants
    : typeof input.participants === 'string'
      ? input.participants
          .split(/[;,]/)
          .map(s => s.trim())
          .filter(Boolean)
      : [],
  note: toStr(input.note || ''),
})

/* =========================================================
   Label do usuwania (DeleteDialog)
   ========================================================= */

export const labelForDelete = row => {
  if (!row) return ''
  const date = row.date ? ` — ${row.date}` : ''
  const title = String(row.title || '').trim()
  return `${title}${date}`.trim()
}

/* =========================================================
   Przykładowe dane (mock)
   ========================================================= */

export const INITIAL_TRAININGS = [
  normalizeTraining({
    id: 'TR-001',
    type: 'wewnętrzne',
    title: 'Szkolenie BHP',
    topic: 'Zasady bezpieczeństwa w laboratorium',
    date: '2025-07-12',
    status: 'planowane',
    participants: ['Alicja Śliwińska', 'Jan Kowalski'],
    note: 'Szkolenie obowiązkowe dla pracowników laboratorium.',
  }),
  normalizeTraining({
    id: 'TR-002',
    type: 'zewnętrzne',
    title: 'Chromatografia cieczowa – praktyka',
    topic: 'Optymalizacja metod HPLC',
    date: '2025-08-05',
    status: 'wtrakcie',
    participants: ['Alicja Śliwińska'],
    note: 'Szkolenie w firmie zewnętrznej – dział badań.',
  }),
  normalizeTraining({
    id: 'TR-003',
    type: 'wewnętrzne',
    title: 'Szkolenie z systemu CLAIO',
    topic: 'Obsługa modułów próbek i badań',
    date: '2025-09-10',
    status: 'zakonczone',
    participants: ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak'],
    note: 'Wprowadzenie do korzystania z systemu.',
  }),
]

/* =========================================================
   Pola wyszukiwania (dla useListQuery)
   ========================================================= */

const participantsForSearch = t => joinArray(t?.participants || [], ', ')

export const getSearchFields = makeSearchFields(
  'title',
  'topic',
  'type',
  'date',
  'status',
  t => participantsForSearch(t),
  // dodatkowo: label statusu i typu (żeby można było wpisać "Zakończone")
  t => getTypeLabel(t?.type),
  t => getStatusLabel(t?.status)
)

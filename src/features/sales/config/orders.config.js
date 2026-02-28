import React from 'react'
import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

const s = (v) => safeString(v)

/* ───────────────────────────────────────────────────────────
 * Etapy procesu (workflow)
 * ─────────────────────────────────────────────────────────── */

export const STAGE_DEFS = [
  { key: 'Rejestracja', label: 'Rejestracja' },
  { key: 'Przyjęcie próbki', label: 'Przyjęcie próbki' },
  { key: 'W trakcie badań', label: 'W trakcie badań' },
  { key: 'Raport', label: 'Raport' },
  { key: 'Wysyłka', label: 'Wysyłka' },
  { key: 'Rozliczenie', label: 'Rozliczenie' },
]

export const STAGES = STAGE_DEFS.map((s) => s.label)

export const stageLabel = (k) => STAGE_DEFS.find((s) => s.key === k || s.label === k)?.label || k

/* ───────────────────────────────────────────────────────────
 * Statusy zleceń (Appointments-style w StatusCell)
 * ─────────────────────────────────────────────────────────── */

export const STATUS_DEFS = [
  { key: 'zarejestrowane', label: 'Zarejestrowane' },
  { key: 'w toku', label: 'W toku' },
  { key: 'sprawozdanie', label: 'Sprawozdanie' },
]

export const statusLabel = (k) => STATUS_DEFS.find((s) => s.key === k || s.label === k)?.label || k

/* ───────────────────────────────────────────────────────────
 * Pill dla ETAPU (zostaje jako badge)
 * ─────────────────────────────────────────────────────────── */

const normalizeKeyForClass = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const stagePill = (fieldKey) => ({
  render: (value, row) => {
    const raw = row?.[fieldKey] ?? value
    const norm = normalizeKeyForClass(raw)
    const cls = ['label-pill', 'label-pill--stage']
    if (norm) cls.push(`label-pill--stage-${norm}`)
    const text = stageLabel(raw)
    return <span className={cls.join(' ')}>{text || '—'}</span>
  },
  titleAccessor: (row) => {
    const raw = row?.[fieldKey]
    return raw ? String(stageLabel(raw)) : ''
  },
  accessor: (row) => {
    const raw = row?.[fieldKey]
    return raw ? String(stageLabel(raw)) : ''
  },
})

/* ───────────────────────────────────────────────────────────
 * Kolumny tabeli
 * ─────────────────────────────────────────────────────────── */

export const HEADER_COLS = [
  {
    key: 'number',
    label: 'Nr zlecenia',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('number'),
  },
  {
    key: 'client',
    label: 'Klient',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('client'),
  },
  {
    key: 'date',
    label: 'Data',
    sortable: true,
    type: 'date',
    align: 'center',
    titleAccessor: (row) => row?.date ?? '',
  },
  {
    key: 'stage',
    label: 'Etap',
    sortable: true,
    type: 'string',
    ...stagePill('stage'),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    type: 'status',
    width: 140,
    accessor: (row) => String(row?.status ?? ''),
    titleAccessor: (row) => statusLabel(row?.status),
  },
  {
    key: 'subject',
    label: 'Przedmiot',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('subject'),
  },
]

/* ───────────────────────────────────────────────────────────
 * CSV
 * ─────────────────────────────────────────────────────────── */

export const CSV_COLUMNS = [
  { key: 'number', label: 'Nr zlecenia' },
  { key: 'client', label: 'Klient' },
  { key: 'date', label: 'Data' },
  { key: 'stage', label: 'Etap' },
  { key: 'status', label: 'Status' },
  { key: 'subject', label: 'Przedmiot' },
]

/* ───────────────────────────────────────────────────────────
 * Normalizacje
 * ─────────────────────────────────────────────────────────── */

export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((r, i) => ({
    id: s(r.id || r.number || `Z-${Date.now()}-${i}`),
    number: s(r.number),
    client: s(r.client || r.clientName || ''),
    date: s(r.date),
    stage: s(r.stage),
    status: s(r.status),
    subject: s(r.subject || r.item || ''),
  }))

export const normalizeOnSave = (obj = {}) => ({
  ...obj,
  id: s(obj.id || obj.number || ''),
  number: s(obj.number),
  client: s(obj.client),
  date: s(obj.date),
  stage: s(obj.stage),
  status: s(obj.status),
  subject: s(obj.subject),
})

/* ───────────────────────────────────────────────────────────
 * Demo
 * ─────────────────────────────────────────────────────────── */

export const initialOrders = normalizeOnLoad([
  {
    id: 'Z-2025-001',
    number: 'Z-2025-001',
    client: 'AutoMax SA',
    date: '2025-10-02',
    stage: 'Przyjęcie próbki',
    status: 'zarejestrowane',
    subject: 'Elementy stalowe – badania mechaniczne',
  },
  {
    id: 'Z-2025-002',
    number: 'Z-2025-002',
    client: 'GreenEnergy SA',
    date: '2025-10-05',
    stage: 'W trakcie badań',
    status: 'w toku',
    subject: 'Tworzywa – palność',
  },
  {
    id: 'Z-2025-003',
    number: 'Z-2025-003',
    client: 'TechPlast Sp. z o.o.',
    date: '2025-10-12',
    stage: 'Raport',
    status: 'sprawozdanie',
    subject: 'Kompozyty – wytrzymałość na zginanie',
  },
])

/* ───────────────────────────────────────────────────────────
 * Pola wyszukiwania
 * ─────────────────────────────────────────────────────────── */

export const getSearchFields = makeSearchFields(
  'number',
  'client',
  'date',
  (row) => stageLabel(row.stage),
  (row) => statusLabel(row.status),
  'subject'
)
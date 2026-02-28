// src/features/sales/config/offers.config.js
import React from 'react'
import { col, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

/* =========================================================
   Statusy ofert
   ========================================================= */

export const OFFER_STATUSES = [
  { key: 'wprzygotowaniu', label: 'W przygotowaniu' },
  { key: 'wyslana', label: 'Wysłana' },
  { key: 'przyjeta', label: 'Przyjęta' },
  { key: 'odrzucona', label: 'Odrzucona' },
]

const STATUS_LABEL_BY_KEY = Object.fromEntries(
  OFFER_STATUSES.map((s) => [s.key, s.label])
)
const ALLOWED_STATUS = new Set(OFFER_STATUSES.map((s) => s.key))

export const statusKey = (v) => {
  const raw = String(v ?? '').trim()
  if (!raw) return 'wprzygotowaniu'

  const k = raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const ALIASES = {
    wprzygotowaniu: 'wprzygotowaniu',
    przygotowanie: 'wprzygotowaniu',
    draft: 'wprzygotowaniu',

    wyslana: 'wyslana',
    wyslano: 'wyslana',
    sent: 'wyslana',

    przyjeta: 'przyjeta',
    zaakceptowana: 'przyjeta',
    accepted: 'przyjeta',

    odrzucona: 'odrzucona',
    odrzucone: 'odrzucona',
    rejected: 'odrzucona',
  }

  const resolved = ALIASES[k] ?? k
  return ALLOWED_STATUS.has(resolved) ? resolved : 'wprzygotowaniu'
}

export const getStatusLabel = (keyOrLabel) =>
  STATUS_LABEL_BY_KEY[statusKey(keyOrLabel)] ?? String(keyOrLabel ?? '')

/* =========================================================
   Kolumny tabeli — SYSTEMOWE SZEROKOŚCI
   ========================================================= */

export const HEADER_COLS = [
  col('number', 'Nr oferty', {
    sortable: true,
    type: 'string',
    width: 140,
  }),

  col('companyName', 'Firma', {
    sortable: true,
    type: 'string',
    minWidth: 220,
  }),

  col('contact', 'Osoba kontaktowa', {
    sortable: true,
    type: 'string',
    minWidth: 180,
  }),

  col('validUntil', 'Ważność do', {
    sortable: true,
    type: 'date',
    align: 'center',
    width: 120,
    titleAccessor: (row) => safeString(row?.validUntil),
  }),

  // ✅ Status jak w Appointments: obsługa przez StatusCell (ikona + kolor + status-text)
  col('status', 'Status', {
    sortable: true,
    type: 'status',
    width: 140,
    accessor: (row) => statusKey(row?.status) || 'wprzygotowaniu',
    titleAccessor: (row) => getStatusLabel(row?.status),
  }),

  col('amount', 'Kwota', {
    sortable: true,
    type: 'number',
    align: 'right',
    width: 120,
    render: (value) => (value === '' || value == null ? '' : String(value)),
    titleAccessor: (row) => String(row?.amount ?? ''),
  }),

  col('subject', 'Przedmiot badań', {
    sortable: true,
    type: 'string',
    minWidth: 240,
  }),

  col('sampleSize', 'Liczebność próbki', {
    sortable: true,
    type: 'number',
    align: 'right',
    width: 140,
    render: (value) => (value === '' || value == null ? '' : String(value)),
    titleAccessor: (row) => String(row?.sampleSize ?? ''),
  }),

  col('testsBy', 'Badania wg', {
    sortable: true,
    type: 'string',
    minWidth: 180,
  }),
]

/* =========================================================
   CSV
   ========================================================= */

export const CSV_COLUMNS = [
  { key: 'number', label: 'Nr oferty' },
  { key: 'companyName', label: 'Firma' },
  { key: 'contact', label: 'Osoba kontaktowa' },
  { key: 'validUntil', label: 'Ważność do' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Kwota' },
  { key: 'subject', label: 'Przedmiot badań' },
  { key: 'sampleSize', label: 'Liczebność próbki' },
  { key: 'testsBy', label: 'Badania wg' },
]

/* =========================================================
   Normalizacja
   ========================================================= */

const s = (v) => safeString(v)

export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((r, i) => ({
    id: s(r.id || r.number || `OF-${Date.now()}-${i}`),
    number: s(r.number),
    companyName: s(r.companyName || r.company || ''),
    contact: s(r.contact || r.contactPerson || ''),
    validUntil: s(r.validUntil || r.valid_to || ''),
    status: statusKey(r.status || 'wprzygotowaniu'),
    amount: Number.isFinite(+r.amount) ? +r.amount : '',
    subject: s(r.subject || r.item || ''),
    sampleSize: Number.isFinite(+r.sampleSize) ? +r.sampleSize : '',
    testsBy: s(r.testsBy || r.method || r.standard || ''),
    companyId: s(r.companyId || ''),
  }))

/* =========================================================
   Demo
   ========================================================= */

export const initialOffers = normalizeOnLoad([
  {
    id: 'OF-001',
    number: 'OF-001/2025',
    companyName: 'AutoMax SA',
    contact: 'Jan Kowalski',
    validUntil: '2025-12-31',
    status: 'wprzygotowaniu',
    amount: 12500,
    subject: 'Elementy stalowe – badania mechaniczne',
    sampleSize: 12,
    testsBy: 'PN-EN 10002-1',
  },
  {
    id: 'OF-002',
    number: 'OF-002/2025',
    companyName: 'GreenEnergy SA',
    contact: 'Anna Nowak',
    validUntil: '2025-11-30',
    status: 'wyslana',
    amount: 8600,
    subject: 'Tworzywa – palność',
    sampleSize: 8,
    testsBy: 'PN-EN ISO 11925-2',
  },
])

/* =========================================================
   Wyszukiwanie
   ========================================================= */

export const makeOfferSearchFields = (clients = []) => {
  const byId = new Map(
    (Array.isArray(clients) ? clients : []).map((c) => [s(c?.id), s(c?.name)])
  )

  return (row) => {
    const companyFromId = row?.companyId ? byId.get(s(row.companyId)) : ''
    return [
      s(row?.number),
      s(row?.companyName || companyFromId),
      s(row?.contact),
      s(row?.validUntil),
      getStatusLabel(row?.status),
      s(row?.subject),
      s(row?.testsBy),
      s(row?.amount),
      s(row?.sampleSize),
    ]
  }
}

export const getSearchFields = makeSearchFields(
  'id',
  'number',
  'companyName',
  'contact',
  'validUntil',
  (r) => getStatusLabel(r?.status),
  'subject',
  'testsBy',
  'amount',
  'sampleSize'
)
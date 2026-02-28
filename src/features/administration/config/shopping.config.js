// src/features/administration/config/shopping.config.js
// ✅ Konfiguracja listy zakupów: słowniki, kolumny, dane startowe i utilsy

import React from 'react'
import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

export const CATEGORIES = [
  { key: 'biuro', label: 'Materiały biurowe' },
  { key: 'czystosc', label: 'Środki czystości' },
  { key: 'narzedzia', label: 'Narzędzia' },
  { key: 'odziez', label: 'Odzież robocza' },
  { key: 'inne', label: 'Inne' },
]

export const STATUSES = [
  { key: 'todo', label: 'Do zamówienia' },
  { key: 'ordered', label: 'Zamówione' },
  { key: 'received', label: 'Dostarczone' },
  { key: 'cancelled', label: 'Anulowane' },
]

export const catLabel = k => CATEGORIES.find(c => c.key === k)?.label || k
export const statusLabel = k => STATUSES.find(s => s.key === k)?.label || k

// ───────────────────────────────────────────────────────────
// Kolumny tabeli — reużywalne renderery z shared/tables
// + statusy przez StatusCell (type: 'status')
// ───────────────────────────────────────────────────────────
export const HEADER_COLS = [
  {
    key: 'name',
    label: 'Nazwa',
    sortable: true,
    type: 'string',
    minWidth: 220,
    ...renderers.textRenderer('name'),
  },
  {
    key: 'category',
    label: 'Kategoria',
    sortable: true,
    type: 'string',
    minWidth: 170,
    ...renderers.labelRenderer('category', catLabel),
    accessor: row => catLabel(row?.category),
  },
  {
    key: 'quantity',
    label: 'Ilość',
    sortable: true,
    type: 'number',
    width: 90,
    align: 'center',
    ...renderers.numberRenderer('quantity'),
  },
  {
    key: 'link',
    label: 'Link',
    sortable: false,
    minWidth: 240,
    // czytelniej: key zamiast fn
    ...renderers.linkRenderer('link', { blank: true }),
  },

  // ✅ STATUS → wspólny StatusCell (auto kolor/ikona/tooltip po nazwie)
  // Uwaga: trzymamy w danych klucze 'todo/ordered/received/cancelled',
  // ale label pokazujemy po polsku przez getStatusLabel.
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    type: 'status',
    align: 'center',

    // co StatusCell ma "widzieć" jako wartość (klucz)
    accessor: row => String(row?.status ?? 'todo'),

    // tooltip (ładna etykieta PL)
    titleAccessor: row => statusLabel(row?.status ?? 'todo'),

    // jeśli StatusCell umie przyjąć value/label w obiekcie, możesz to włączyć:
    // getStatus: (row) => ({ value: row?.status, label: statusLabel(row?.status) }),
    // ale accessor+titleAccessor w zupełności wystarczy przy auto-mappingu po nazwie.
  },

  {
    key: 'addedBy',
    label: 'Dodał(a)',
    sortable: true,
    type: 'string',
    minWidth: 140,
    ...renderers.textRenderer('addedBy'),
  },
  {
    key: 'note',
    label: 'Notatka',
    sortable: false,
    minWidth: 220,
    ...renderers.textWithTitleRenderer('note'),
  },
]

// ───────────────────────────────────────────────────────────
// CSV
// ───────────────────────────────────────────────────────────
export const CSV_COLUMNS = [
  { key: 'name', label: 'Nazwa' },
  { key: 'category', label: 'Kategoria' },
  { key: 'quantity', label: 'Ilość' },
  { key: 'link', label: 'Link' },
  { key: 'status', label: 'Status' },
  { key: 'addedBy', label: 'Dodał(a)' },
  { key: 'note', label: 'Notatka' },
]

// ───────────────────────────────────────────────────────────
// Dane startowe
// ───────────────────────────────────────────────────────────
export const initialItems = [
  {
    id: 1,
    name: 'Papier ksero A4 80g',
    category: 'biuro',
    quantity: 10,
    link: 'sklep.pl/papier-a4',
    status: 'todo',
    note: '',
    addedBy: 'System',
  },
  {
    id: 2,
    name: 'Długopis żelowy 0.5',
    category: 'biuro',
    quantity: 20,
    link: '',
    status: 'todo',
    note: '',
    addedBy: 'System',
  },
  {
    id: 3,
    name: 'Płyn dezynfekujący 5L',
    category: 'czystosc',
    quantity: 2,
    link: 'https://sklep.pl/dezynfekcja',
    status: 'ordered',
    note: 'do magazynu',
    addedBy: 'System',
  },
  {
    id: 4,
    name: 'Wkrętarka 12V',
    category: 'narzedzia',
    quantity: 1,
    link: 'allegro.pl/wkretarka-12v',
    status: 'todo',
    note: '',
    addedBy: 'System',
  },
  {
    id: 5,
    name: 'Bluza robocza L',
    category: 'odziez',
    quantity: 3,
    link: '',
    status: 'received',
    note: '',
    addedBy: 'System',
  },
]

// ───────────────────────────────────────────────────────────
// Utilsy
// ───────────────────────────────────────────────────────────
export const toStr = safeString

// lokalny normalizer URL (nie wymaga utils/url)
export const normalizeUrl = url => {
  const s = String(url || '').trim()
  if (!s) return ''
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

export const resolveCurrentUserName = currentUser => {
  if (typeof currentUser === 'string' && currentUser.trim()) return currentUser.trim()
  if (currentUser && typeof currentUser === 'object') {
    return currentUser.displayName || currentUser.name || currentUser.fullName || currentUser.email || 'Użytkownik'
  }
  if (typeof window !== 'undefined') {
    const fromLs = window.localStorage?.getItem('currentUserName')
    if (fromLs) return fromLs
  }
  return 'Użytkownik'
}

// walidacja pojedynczej pozycji (dla useListCrud)
export const validateItem = draft => (!draft?.name || !draft.name.trim() ? 'Uzupełnij nazwę pozycji.' : null)

// label do delete dialog
export const labelForDelete = row => (row ? String(row?.name || '').trim() : '')

// pola wyszukiwania (dla useListQuery)
export const getSearchFields = makeSearchFields(
  'name',
  'note',
  'link',
  'addedBy',
  r => catLabel(r.category),
  r => statusLabel(r.status)
)

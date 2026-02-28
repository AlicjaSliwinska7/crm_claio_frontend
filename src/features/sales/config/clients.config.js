// src/features/sales/config/clients.config.js
// ✅ Konfiguracja listy klientów (kolumny, CSV, dane startowe)

import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

/* ===================== SSOT: pusty rekord (dla openAdd) ===================== */
export const EMPTY_CLIENT = {
  id: '',
  name: '',
  address: '',
  NIP: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
}

export const HEADER_COLS = [
  {
    key: 'name',
    label: 'Nazwa firmy',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('name'),
  },
  {
    key: 'address',
    label: 'Adres',
    sortable: false,
    type: 'string',
    ...renderers.textRenderer('address'),
  },
  {
    key: 'NIP',
    label: 'NIP',
    sortable: true,
    type: 'string',
    align: 'center',
    ...renderers.textRenderer('NIP'),
  },
  {
    key: 'contactPerson',
    label: 'Osoba kontaktowa',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('contactPerson'),
  },
  {
    key: 'contactPhone',
    label: 'Telefon',
    sortable: true,
    type: 'string',
    align: 'center',
    ...renderers.textRenderer('contactPhone'),
  },
  {
    key: 'contactEmail',
    label: 'E-mail',
    sortable: true,
    type: 'string',
    ...renderers.emailRenderer('contactEmail'),
  },
]

export const CSV_COLUMNS = [
  { key: 'name', label: 'Nazwa firmy' },
  { key: 'address', label: 'Adres' },
  { key: 'NIP', label: 'NIP' },
  { key: 'contactPerson', label: 'Osoba kontaktowa' },
  { key: 'contactPhone', label: 'Telefon' },
  { key: 'contactEmail', label: 'E-mail' },
]

export const initialClients = [
  {
    id: 'c1',
    name: 'GreenEnergy SA',
    address: 'ul. Zielona 12, 00-100 Warszawa',
    NIP: '123-456-78-90',
    contactPerson: 'Anna Nowak',
    contactPhone: '+48 501 234 567',
    contactEmail: 'anna.nowak@greenenergy.pl',
  },
  {
    id: 'c2',
    name: 'AutoMax Sp. z o.o.',
    address: 'ul. Przemysłowa 5, 02-222 Katowice',
    NIP: '222-333-44-55',
    contactPerson: 'Piotr Kowalski',
    contactPhone: '+48 502 765 432',
    contactEmail: 'piotr.kowalski@automax.pl',
  },
]

/* ===================== Normalizery ===================== */

// helper: proste id fallback (żeby CRUD nigdy nie dostał pustego id)
const fallbackId = (c, i) =>
  safeString(c?.id) ||
  `C-${Date.now()}-${i}`

// tolerujemy też nip (małe litery), ale zapisujemy do NIP (bo takie masz w tabeli)
const pickNip = (draft) => (draft?.NIP ?? draft?.nip ?? '')

export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((c, i) => ({
    ...EMPTY_CLIENT,
    ...c,
    id: fallbackId(c, i),
    NIP: safeString(pickNip(c)),
    name: safeString(c?.name),
    address: safeString(c?.address),
    contactPerson: safeString(c?.contactPerson),
    contactPhone: safeString(c?.contactPhone),
    contactEmail: safeString(c?.contactEmail),
  }))

export const normalizeOnSave = (draft = {}) => ({
  ...EMPTY_CLIENT,
  ...draft,
  id: safeString(draft?.id),
  name: safeString(draft?.name),
  address: safeString(draft?.address),
  NIP: safeString(pickNip(draft)),
  contactPerson: safeString(draft?.contactPerson),
  contactPhone: safeString(draft?.contactPhone),
  contactEmail: safeString(draft?.contactEmail),
})

export const labelForDelete = row => (row?.name ? `klienta ${row.name}` : 'klienta')

/* ===================== Search fields ===================== */
export const getSearchFields = makeSearchFields(
  'name',
  'NIP',
  'address',
  'contactPerson',
  'contactPhone',
  'contactEmail'
)

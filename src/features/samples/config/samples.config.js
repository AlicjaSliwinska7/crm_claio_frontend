// src/features/sales/config/samples.config.js
// SSOT dla Rejestru Próbek: kolumny, CSV, statusy, dane demo, normalizacja

import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

const s = (v) => safeString(v)

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
const norm = (v) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// ───────────────────────────────────────────────────────────
// Statusy (SSOT: klucze bez spacji i bez PL znaków)
// + dodajemy "wszystkie" do filtra jako normalną opcję
// ───────────────────────────────────────────────────────────
export const SAMPLE_STATUSES = [
  { key: 'wszystkie', label: 'Wszystkie statusy' },

  { key: 'zarejestrowane', label: 'Zarejestrowane' },
  { key: 'przyjete', label: 'Przyjęte' },
  { key: 'w_trakcie_badan', label: 'W trakcie badań' },
  { key: 'po_badaniach', label: 'Po badaniach' },
  { key: 'po_badaniach_czeka_na_zwrot', label: 'Po badaniach / czekają na zwrot' },
  { key: 'do_zwrotu', label: 'Do zwrotu' },
  { key: 'do_utylizacji', label: 'Do utylizacji' },
]

// ✅ szybki lookup zamiast find() na każdą komórkę/eksport
const STATUS_LABEL_MAP = Object.fromEntries(SAMPLE_STATUSES.map((x) => [x.key, x.label]))

// aliasy w formie ZNORMALIZOWANEJ (bez ogonków, ujednolicone spacje)
const STATUS_ALIASES_NORM = {
  // poprawne klucze
  wszystkie: 'wszystkie',
  zarejestrowane: 'zarejestrowane',
  przyjete: 'przyjete',
  w_trakcie_badan: 'w_trakcie_badan',
  po_badaniach: 'po_badaniach',
  po_badaniach_czeka_na_zwrot: 'po_badaniach_czeka_na_zwrot',
  do_zwrotu: 'do_zwrotu',
  do_utylizacji: 'do_utylizacji',

  // stare teksty / warianty (po norm())
  'w przygotowaniu': 'zarejestrowane', // jeśli kiedyś tak wpada
  'w trakcie badan': 'w_trakcie_badan',
  'po badaniach': 'po_badaniach',

  'po badaniach/czekaja na zwrot': 'po_badaniach_czeka_na_zwrot',
  'po badaniach / czekaja na zwrot': 'po_badaniach_czeka_na_zwrot',
  'po badaniach / czekaja na zwrot': 'po_badaniach_czeka_na_zwrot',

  'do zwrotu': 'do_zwrotu',
  'do utylizacji': 'do_utylizacji',
}

// zwróć SSOT-owy klucz statusu (z danych może przyjść tekst albo klucz)
export const statusKey = (v) => {
  const raw = String(v ?? '').trim()
  if (!raw) return 'zarejestrowane'

  const n = norm(raw)

  // 1) alias po norm(raw)
  const fromNorm = STATUS_ALIASES_NORM[n]
  if (fromNorm && STATUS_LABEL_MAP[fromNorm]) return fromNorm

  // 2) czasem w danych mogą być klucze z "_" ale z dziwnymi spacjami
  const asUnderscore = n.replace(/ /g, '_')
  const fromUnderscore = STATUS_ALIASES_NORM[asUnderscore]
  if (fromUnderscore && STATUS_LABEL_MAP[fromUnderscore]) return fromUnderscore

  // 3) jeśli ktoś podał już poprawny klucz SSOT
  if (STATUS_LABEL_MAP[raw]) return raw

  return 'zarejestrowane'
}

export const statusLabel = (k) => STATUS_LABEL_MAP[statusKey(k)] || String(k ?? '')

// ───────────────────────────────────────────────────────────
// Kolumny tabeli
// ───────────────────────────────────────────────────────────
export const HEADER_COLS = [
  {
    key: 'receivedDate',
    label: 'Data przyjęcia',
    sortable: true,
    type: 'date',
    align: 'center',
    ...renderers.textRenderer('receivedDate'),
    titleAccessor: (row) => row?.receivedDate ?? '',
  },
  {
    key: 'orderNo',
    label: 'Nr zlecenia / umowy',
    sortable: true,
    type: 'string',
    ...renderers.textRenderer('orderNo'),
  },
  { key: 'code', label: 'KOD', sortable: true, type: 'string', width: 120, ...renderers.textRenderer('code') },
  {
    key: 'sampleNo',
    label: 'Nr próbki',
    sortable: true,
    type: 'string',
    width: 120,
    ...renderers.textRenderer('sampleNo'),
  },
  {
    key: 'item',
    label: 'Przedmiot badań',
    sortable: true,
    type: 'string',
    minWidth: 220,
    ...renderers.textRenderer('item'),
  },
  {
    key: 'qty',
    label: 'Ilość sztuk',
    sortable: true,
    type: 'number',
    width: 120,
    align: 'right',
    ...renderers.numberRenderer('qty'),
  },
  {
    key: 'client',
    label: 'Zleceniodawca',
    sortable: true,
    type: 'string',
    minWidth: 200,
    ...renderers.textRenderer('client'),
  },
  {
    key: 'scope',
    label: 'Zakres badań',
    sortable: true,
    type: 'string',
    minWidth: 220,
    ...renderers.textRenderer('scope'),
  },
  {
    key: 'afterTest',
    label: 'Po badaniu',
    sortable: true,
    type: 'string',
    width: 140,
    ...renderers.textRenderer('afterTest'),
  },
  { key: 'notes', label: 'Uwagi', sortable: false, minWidth: 180, ...renderers.textRenderer('notes') },

  {
    key: 'status',
    label: 'Status',
    sortable: true,
    type: 'string',
    width: 210,
    ...renderers.labelRenderer('status', statusLabel),
  },

  {
    key: 'returnDate',
    label: 'Data zwrotu',
    sortable: true,
    type: 'date',
    align: 'center',
    width: 140,
    ...renderers.textRenderer('returnDate'),
    titleAccessor: (row) => row?.returnDate ?? '',
  },
  { key: 'comment', label: 'Komentarz', sortable: false, minWidth: 200, ...renderers.textRenderer('comment') },
]

// ───────────────────────────────────────────────────────────
// CSV
// ───────────────────────────────────────────────────────────
export const CSV_COLUMNS = [
  { key: 'receivedDate', label: 'Data przyjęcia' },
  { key: 'orderNo', label: 'Nr zlecenia / umowy' },
  { key: 'code', label: 'KOD' },
  { key: 'sampleNo', label: 'Nr próbki' },
  { key: 'item', label: 'Przedmiot badań' },
  { key: 'qty', label: 'Ilość sztuk' },
  { key: 'client', label: 'Zleceniodawca' },
  { key: 'scope', label: 'Zakres badań' },
  { key: 'afterTest', label: 'Po badaniu' },
  { key: 'notes', label: 'Uwagi' },
  { key: 'status', label: 'Status' },
  { key: 'returnDate', label: 'Data zwrotu' },
  { key: 'comment', label: 'Komentarz' },
]

// ───────────────────────────────────────────────────────────
// Wyszukiwanie (SSOT)
// ───────────────────────────────────────────────────────────
export const getSearchFields = makeSearchFields(
  'receivedDate',
  'orderNo',
  'code',
  'sampleNo',
  'item',
  (r) => String(r?.qty ?? ''),
  'client',
  'scope',
  'afterTest',
  'notes',
  (r) => statusLabel(r?.status),
  'returnDate',
  'comment'
)

// ───────────────────────────────────────────────────────────
// Normalizacje
// ───────────────────────────────────────────────────────────
export const normalizeOnLoad = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((r, i) => ({
    id: s(r.id || r.sampleNo || r.code || `S-${String(i + 1).padStart(3, '0')}`),
    receivedDate: s(r.receivedDate),
    orderNo: s(r.orderNo),
    code: s(r.code),
    sampleNo: s(r.sampleNo),
    item: s(r.item),
    qty: Number.isFinite(+r.qty) ? +r.qty : '',
    client: s(r.client),
    scope: s(r.scope),
    afterTest: s(r.afterTest),
    notes: s(r.notes),
    status: statusKey(r.status),
    returnDate: s(r.returnDate),
    comment: s(r.comment),
  }))

export const normalizeOnSave = (obj = {}) => ({
  ...obj,
  id: s(obj.id || obj.sampleNo || obj.code || ''),
  receivedDate: s(obj.receivedDate),
  orderNo: s(obj.orderNo),
  code: s(obj.code),
  sampleNo: s(obj.sampleNo),
  item: s(obj.item),
  qty: Number.isFinite(+obj.qty) ? +obj.qty : '',
  client: s(obj.client),
  scope: s(obj.scope),
  afterTest: s(obj.afterTest),
  notes: s(obj.notes),
  status: statusKey(obj.status),
  returnDate: s(obj.returnDate),
  comment: s(obj.comment),
})

// ───────────────────────────────────────────────────────────
// Dane demo (fallback)
// ───────────────────────────────────────────────────────────
export const initialSamples = normalizeOnLoad([
  {
    id: 'S-001',
    receivedDate: '2025-09-10',
    orderNo: 'ZL/2025/091-01',
    code: 'K-AX12',
    sampleNo: 'PR-0001',
    item: 'Płyta kompozytowa X',
    qty: 12,
    client: 'TechSolutions Sp. z o.o.',
    scope: 'PN-EN 1234:2020; PB-998; 6 pkt',
    afterTest: 'zwrot',
    notes: 'Dodatkowa partia 2 szt.',
    status: 'w trakcie badań',
    returnDate: '',
    comment: '',
  },
  {
    id: 'S-002',
    receivedDate: '2025-09-12',
    orderNo: 'UM/2025/114-07',
    code: 'K-BT77',
    sampleNo: 'PR-0002',
    item: 'Uszczelka EPDM',
    qty: 4,
    client: 'GreenEnergy SA',
    scope: 'PB-45/2022; 4 pkt',
    afterTest: 'likwidacja',
    notes: '',
    status: 'po badaniach',
    returnDate: '',
    comment: 'Czeka na decyzję klienta',
  },
  {
    id: 'S-003',
    receivedDate: '2025-09-05',
    orderNo: 'ZL/2025/080-03',
    code: 'K-Z9X1',
    sampleNo: 'PR-0003',
    item: 'Profil aluminiowy 30x30',
    qty: 8,
    client: 'AluForm sp. k.',
    scope: 'PN-EN 755; 5 pkt',
    afterTest: 'zwrot',
    notes: '',
    status: 'po badaniach/czekają na zwrot',
    returnDate: '2025-09-19',
    comment: 'Umówiony kurier',
  },
])

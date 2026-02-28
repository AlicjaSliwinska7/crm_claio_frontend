// src/features/administration/config/documents.config.js
import { makeSearchFields } from '../../../shared/tables'
import {
  validateDocumentForm,
  ALLOWED_EXTS_DEFAULT,
  NAME_MIN_DEFAULT,
  NAME_MAX_DEFAULT,
  FILE_NAME_MIN_DEFAULT,
  FILE_NAME_MAX_DEFAULT,
} from '../../../shared/utils/validators'

// ✅ spójnie z DataCell / formatterami w tabelach
import { fmtDateTimeDMYHM } from '../../../shared/tables/utils/formatters/dateTime'

/* ===== Kategorie ===== */
export const DOC_CATEGORIES = [
  { key: 'procedury', label: 'Procedury' },
  { key: 'instrukcje', label: 'Instrukcje' },
  { key: 'normy', label: 'Normy' },
  { key: 'inne', label: 'Inne' },
]

const CATEGORIES_MAP = Object.fromEntries(DOC_CATEGORIES.map((c) => [c.key, c.label]))
export const catLabel = (key) => CATEGORIES_MAP[key] ?? key

/* ===== Kolumny tabeli (SSOT) ===== */
export const HEADER_COLS = [
  {
    key: 'name',
    label: 'Nazwa dokumentu',
    sortable: true,
    type: 'string',
  },
  {
    key: 'category',
    label: 'Kategoria',
    sortable: true,
    type: 'string',
    render: (_value, row) => catLabel(row?.category),
    accessor: (row) => catLabel(row?.category),
    titleAccessor: (row) => catLabel(row?.category),
  },
  {
    key: 'addedAt',
    label: 'Dodano',
    sortable: true,
    type: 'datetime', // ✅ DataCell: dd-mm-yyyy hh:mm
    titleAccessor: (row) => (row?.addedAt ? fmtDateTimeDMYHM(row.addedAt) : ''),
  },
]

/**
 * ===== Kolumny CSV =====
 * Trzymamy format kompatybilny z shared/tables/utils/csv:
 * { key, label }
 *
 * Transformacje robimy w DocumentsList.jsx (csvRows).
 */
export const CSV_COLUMNS = [
  { key: 'name', label: 'Nazwa dokumentu' },
  { key: 'category', label: 'Kategoria' },
  { key: 'addedAt', label: 'Dodano' },
  { key: 'fileName', label: 'Nazwa pliku' },
  { key: 'file', label: 'Link' },
]

/* ===== Walidacja — domyślne progi i helper ===== */
export const VALIDATION_DEFAULTS = {
  allowedExts: ALLOWED_EXTS_DEFAULT,
  nameMin: NAME_MIN_DEFAULT,
  nameMax: NAME_MAX_DEFAULT,
  fileNameMin: FILE_NAME_MIN_DEFAULT,
  fileNameMax: FILE_NAME_MAX_DEFAULT,
}

export const validateNow = (name, file, overrides = {}) =>
  validateDocumentForm(
    { name, file },
    {
      ...VALIDATION_DEFAULTS,
      ...overrides,
    }
  )

/* ===== Pola wyszukiwania ===== */
export const getSearchFields = makeSearchFields(
  'name',
  (d) => catLabel(d?.category),
  'fileName',
  (d) => (d?.addedAt ? fmtDateTimeDMYHM(d.addedAt) : '')
)

/* ===== Startowe dokumenty (mock / demo) ===== */
export const INITIAL_DOCUMENTS = [
  {
    name: 'Wzór karty nadgodzin',
    url: '/docs/wzor_karta_nadgodzin.docx',
    addedAt: '2025-01-15T10:00:00.000Z',
    category: 'instrukcje',
  },
  {
    name: 'Zestawienie pracy',
    url: '/docs/zestawienie_pracy.docx',
    addedAt: '2025-02-10T14:00:00.000Z',
    category: 'inne',
  },
]

// src/components/pages/contents/config/documents.config.js

import { makeSearchFields } from '../../../shared/tables'
import {
	validateDocumentForm,
	ALLOWED_EXTS_DEFAULT,
	NAME_MIN_DEFAULT,
	NAME_MAX_DEFAULT,
	FILE_NAME_MIN_DEFAULT,
	FILE_NAME_MAX_DEFAULT,
} from '../../../shared/utils/validators'

/* ===== Kategorie ===== */
export const DOC_CATEGORIES = [
	{ key: 'procedury', label: 'Procedury' },
	{ key: 'instrukcje', label: 'Instrukcje' },
	{ key: 'normy', label: 'Normy' },
	{ key: 'inne', label: 'Inne' },
]

const CATEGORIES_MAP = Object.fromEntries(DOC_CATEGORIES.map(c => [c.key, c.label]))

export const catLabel = key => CATEGORIES_MAP[key] ?? key

/* ===== Formatery ===== */
export const fmtDateTime = iso =>
	iso
		? new Date(iso).toLocaleString('pl-PL', {
				dateStyle: 'medium',
				timeStyle: 'short',
		  })
		: ''

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
		// ⬇⬇⬇ ważne: (value, row), nie tylko (row)
		render: (value, row) => catLabel(row.category),
	},
	{
		key: 'addedAt',
		label: 'Dodano',
		sortable: true,
		type: 'date',
		render: (value, row) => fmtDateTime(row.addedAt),
	},
]

/* ===== Kolumny CSV (bazowe + dodatkowe) ===== */
export const CSV_BASE_COLUMNS = [
	{ key: 'name', label: 'Nazwa dokumentu' },
	{ key: 'category', label: 'Kategoria' },
	{ key: 'addedAt', label: 'Dodano' },
]
export const CSV_EXTRA_COLUMNS = [
	{ key: 'link', label: 'Link do pliku' },
	{ key: 'fileName', label: 'Nazwa pliku' },
]

/**
 * Łączne kolumny CSV z transformacjami (ładne wartości)
 * Używane w useCsvExport w komponencie Documents.
 * Pola `header` i `map` są zgodne z aktualną implementacją useCsvExport.
 */
export const CSV_COLUMNS = [
	{
		key: 'name',
		header: 'Nazwa dokumentu',
	},
	{
		key: 'category',
		header: 'Kategoria',
		map: v => catLabel(v),
	},
	{
		key: 'addedAt',
		header: 'Dodano',
		map: v => (v ? fmtDateTime(v) : ''),
	},
	{
		key: 'fileName',
		header: 'Nazwa pliku',
	},
	{
		key: 'file',
		header: 'Link',
		map: (_, row) => row.file || row.url || '',
	},
]

/* ===== Walidacja — domyślne progi i helper ===== */
export const VALIDATION_DEFAULTS = {
	allowedExts: ALLOWED_EXTS_DEFAULT,
	nameMin: NAME_MIN_DEFAULT,
	nameMax: NAME_MAX_DEFAULT,
	fileNameMin: FILE_NAME_MIN_DEFAULT,
	fileNameMax: FILE_NAME_MAX_DEFAULT,
}

/**
 * validateNow
 *  - name: ciąg z pola nazwy dokumentu
 *  - file: opcjonalnie wybrany plik File
 *  - overrides: umożliwia zmiany progów walidacji
 *
 * Zwraca obiekt błędów jak w validateDocumentForm
 */
export const validateNow = (name, file, overrides = {}) =>
	validateDocumentForm(
		{ name, file },
		{
			...VALIDATION_DEFAULTS,
			...overrides,
		}
	)

/* ===== Pola wyszukiwania (dla useListQuery) ===== */
export const getSearchFields = makeSearchFields(
	'name',
	d => catLabel(d.category),
	'fileName',
	d => fmtDateTime(d.addedAt)
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

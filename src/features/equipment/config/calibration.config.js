// src/features/equipment/config/calibration.config.js
// SSOT: konfiguracja laboratoriów wzorcowania + stałe dla CalibrationSchedule
// Wersja BEZ statusów laboratoriów.

import { renderers, makeSearchFields } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

/* =========================================================
   Stałe używane w CalibrationSchedule/*
   (zostawiamy, bo komponenty tego importują)
   ========================================================= */

export const MSG = {
	// Directory / CRUD
	DELETE_CONFIRM: 'Na pewno chcesz usunąć laboratorium?',

	// Schedule / planowanie (fallbacki dla komunikatów)
	RETURN_BEFORE_SEND: 'Zwrot nie może być wcześniej niż wysyłka.',
	PLAN_PAST_WEEKEND_HOLIDAY: 'Nie można planować w przeszłości, na weekendy ani święta.',
	SEND_PAST_WEEKEND_HOLIDAY: 'Nie można zaplanować wysyłki w przeszłości, na weekend ani święto.',
	RETURN_PAST_WEEKEND_HOLIDAY: 'Nie można zaplanować zwrotu w przeszłości, na weekend ani święto.',
}

export const LEGEND_LABELS = {
	email: 'E-mail',
	phone: 'Telefon',
}

// kolory elementów planowania w kalendarzu
export const COLOR_PLANNED_SEND = '#3b82f6'
export const COLOR_PLANNED_RETURN = '#8b5cf6'

// drag & drop MIME (CalendarGrid/LeftList/CalendarDnD)
export const DND_MIME = 'application/x-calibration-lab'

// jeśli gdzieś trzymasz fallback roku / locale (zostawiamy dla kompatybilności)
export const FALLBACK_PL_2025 = '2025'

/* =========================================================
   Kolumny tabeli laboratoriów (rejestr/directory)
   Pola: name, city, email, phone, scope, accreditation
   ========================================================= */

export const HEADER_COLS = [
	{
		key: 'name',
		label: 'Nazwa',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('name'),
	},
	{
		key: 'city',
		label: 'Miasto',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('city'),
	},
	{
		key: 'email',
		label: 'E-mail',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('email'),
	},
	{
		key: 'phone',
		label: 'Telefon',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('phone'),
	},
	{
		key: 'scope',
		label: 'Zakres',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('scope'),
	},
	{
		key: 'accreditation',
		label: 'Akredytacja',
		sortable: true,
		type: 'string',
		...renderers.textRenderer('accreditation'),
	},
]

/* =========================================================
   CSV
   ========================================================= */

export const CSV_COLUMNS = [
	{ key: 'name', label: 'Nazwa' },
	{ key: 'city', label: 'Miasto' },
	{ key: 'email', label: 'E-mail' },
	{ key: 'phone', label: 'Telefon' },
	{ key: 'scope', label: 'Zakres' },
	{ key: 'accreditation', label: 'Akredytacja' },
]

/* =========================================================
   Search fields
   ========================================================= */

export const getSearchFields = makeSearchFields('name', 'city', 'email', 'phone', 'scope', 'accreditation')

/* =========================================================
   Normalizacja danych
   ========================================================= */

const s = v => safeString(v)

export const normalizeOnLoad = (arr = []) =>
	(Array.isArray(arr) ? arr : []).map(r => ({
		id: s(r.id || r.name),
		name: s(r.name),
		city: s(r.city || r.location || ''),
		email: s(r.email || r.mail || ''),
		phone: s(r.phone || r.tel || ''),
		scope: s(r.scope || r.range || ''),
		accreditation: s(r.accreditation || r.accr || ''),
	}))

export const normalizeOnSave = (obj = {}) => ({
	...obj,
	id: s(obj.id || obj.name),
	name: s(obj.name),
	city: s(obj.city),
	email: s(obj.email),
	phone: s(obj.phone),
	scope: s(obj.scope),
	accreditation: s(obj.accreditation),
})

export const labelForDelete = row => row?.name || row?.id || ''

/* =========================================================
   Dane przykładowe
   ========================================================= */

export const initialLabs = normalizeOnLoad([
	{
		id: 'LAB-001',
		name: 'Instytut Metrologii',
		city: 'Warszawa',
		email: 'kontakt@imet.pl',
		phone: '+48 22 123 45 67',
		scope: 'Masa, temperatura, objętość',
		accreditation: 'PCA AB-123',
	},
	{
		id: 'LAB-002',
		name: 'RADWAG',
		city: 'Radom',
		email: 'serwis@radwag.pl',
		phone: '+48 48 123 45 67',
		scope: 'Wagi, etalony masy',
		accreditation: 'PCA AP-456',
	},
	{
		id: 'LAB-003',
		name: 'LabTech',
		city: 'Kraków',
		email: 'info@labtech.pl',
		phone: '+48 12 222 33 44',
		scope: 'Czujniki, przetworniki',
		accreditation: '',
	},
])

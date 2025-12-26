// src/features/administration/config/appointments.config.js
import { col, buildDateTimeAccessor, makeSearchFields } from '../../../shared/tables'
import { joinArray } from '../../../shared/utils/formatters'

// Mały helper – spójny zapis uczestników
const joinMembers = arr => joinArray(arr, '; ')

/* ───────────────────────────────────────────────────────────
 * Statusy spotkań – klucze dopasowane do statuses.css
 * ─────────────────────────────────────────────────────────── */

export const APPOINTMENT_STATUSES = [
	{ key: 'planowane', label: 'Planowane' },
	{ key: 'wtrakcie', label: 'W trakcie' },
	{ key: 'zakonczone', label: 'Zakończone' },
	{ key: 'odwolane', label: 'Odwołane' },
]

export const getStatusLabel = key => APPOINTMENT_STATUSES.find(s => s.key === key)?.label ?? key

// ✅ lokalny helper do klas pill (zgodne z statuses.css)
const pillKey = v =>
	String(v ?? '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')

// ✅ lokalny renderer statusu: zawsze .label-pill + .label-pill--status-<key>
const appointmentStatusRenderer = (fieldKey = 'status') => ({
	render: (value, row) => {
		const raw = row?.[fieldKey] ?? value
		const key = pillKey(raw)
		const label = getStatusLabel(raw)
		return <span className={`label-pill label-pill--status label-pill--status-${key}`}>{label}</span>
	},
	titleAccessor: row => getStatusLabel(row?.[fieldKey]),
})

/* ───────────────────────────────────────────────────────────
 * Kolumny tabeli
 * ─────────────────────────────────────────────────────────── */

export const HEADER_COLS = [
	col('topic', 'Temat', {
		sortable: true,
		type: 'string',
		minWidth: 240,
	}),
	col('date', 'Data', {
		sortable: true,
		type: 'date',
		align: 'center',
		accessor: buildDateTimeAccessor('date', 'time'),
	}),
	col('time', 'Godzina', {
		sortable: true,
		type: 'string',
		align: 'center',
		width: 100,
	}),

	// ✅ kolorowy status (pill z statuses.css)
	col('status', 'Status', {
		sortable: true,
		type: 'string',
		...appointmentStatusRenderer('status'),
	}),

	col('members', 'Uczestnicy', {
		sortable: false,
		minWidth: 240,
		render: (_value, row) => joinMembers(row?.members),
		titleAccessor: row => joinMembers(row?.members),
	}),
	col('place', 'Miejsce', {
		sortable: true,
		type: 'string',
		minWidth: 200,
	}),
]

/* ───────────────────────────────────────────────────────────
 * Formularz – puste wartości
 * ─────────────────────────────────────────────────────────── */

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

/* ───────────────────────────────────────────────────────────
 * Dane przykładowe
 * ─────────────────────────────────────────────────────────── */

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

/* ───────────────────────────────────────────────────────────
 * Normalizacje
 * ─────────────────────────────────────────────────────────── */

const normalizeMembers = value =>
	Array.isArray(value)
		? value
		: String(value || '')
				.split(';')
				.map(s => s.trim())
				.filter(Boolean)

export const normalizeOnLoad = arr =>
	arr.map(a => ({
		...a,
		status: a.status || 'planowane',
		members: normalizeMembers(a.members),
	}))

export const normalizeOnSave = f => ({
	...f,
	status: f.status || 'planowane',
	members: normalizeMembers(f.members),
})

/* ───────────────────────────────────────────────────────────
 * Walidacja
 * ─────────────────────────────────────────────────────────── */

export const validateAppointment = f => (!f.topic || !f.date ? 'Uzupełnij co najmniej temat i datę.' : null)

/* ───────────────────────────────────────────────────────────
 * Inne stałe
 * ─────────────────────────────────────────────────────────── */

export const users = ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']

export const labelForDelete = row => (row ? `${row.topic} — ${row.date}${row.time ? ` ${row.time}` : ''}` : '')

/* ───────────────────────────────────────────────────────────
 * Pola wyszukiwania
 * ─────────────────────────────────────────────────────────── */

export const getSearchFields = makeSearchFields('id', 'topic', 'date', 'time', 'status', 'place', 'arrangements', r =>
	joinMembers(r.members)
)

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

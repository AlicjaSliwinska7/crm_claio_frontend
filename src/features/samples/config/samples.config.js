// SSOT dla Rejestru Próbek: kolumny, CSV, statusy, typy, dane demo, normalizacja
import { renderers } from '../../../shared/tables'
import { safeString } from '../../../shared/utils/formatters'

const s = v => safeString(v)

// ───────────────────────────────────────────────────────────
// Statusy (zgodne z Twoimi wcześniejszymi opisami + dane demo)
// ───────────────────────────────────────────────────────────
export const SAMPLE_STATUSES = [
	{ key: 'zarejestrowane', label: 'Zarejestrowane' },
	{ key: 'przyjęte', label: 'Przyjęte' },
	{ key: 'w trakcie badań', label: 'W trakcie badań' },
	{ key: 'po badaniach', label: 'Po badaniach' },
	{ key: 'po badaniach/czekają na zwrot', label: 'Po badaniach / czekają na zwrot' },
	{ key: 'do zwrotu', label: 'Do zwrotu' },
	{ key: 'do utylizacji', label: 'Do utylizacji' },
]

export const statusLabel = k => SAMPLE_STATUSES.find(s => s.key === k)?.label || k

// ───────────────────────────────────────────────────────────
// Typy kolumn do sortowania (dla getColStyle / sortów liczbowych/dat)
// ───────────────────────────────────────────────────────────
export const TYPE_MAP = {
	receivedDate: 'date',
	qty: 'number',
	returnDate: 'date',
}

// ───────────────────────────────────────────────────────────
// Kolumny tabeli (spójne renderery z shared/lists)
// ───────────────────────────────────────────────────────────
export const HEADER_COLS = [
	{
		key: 'receivedDate',
		label: 'Data przyjęcia',
		sortable: true,
		type: 'date',
		align: 'center',
		...renderers.textRenderer('receivedDate'),
		titleAccessor: row => row?.receivedDate ?? '',
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
	{ key: 'status', label: 'Status', sortable: true, type: 'string', width: 210, ...renderers.textRenderer('status') },
	{
		key: 'returnDate',
		label: 'Data zwrotu',
		sortable: true,
		type: 'date',
		align: 'center',
		width: 140,
		...renderers.textRenderer('returnDate'),
		titleAccessor: row => row?.returnDate ?? '',
	},
	{ key: 'comment', label: 'Komentarz', sortable: false, minWidth: 200, ...renderers.textRenderer('comment') },
]

// ───────────────────────────────────────────────────────────
// CSV
// ───────────────────────────────────────────────────────────
export const CSV_COLUMNS = [
	{ key: 'receivedDate', header: 'Data przyjęcia' },
	{ key: 'orderNo', header: 'Nr zlecenia / umowy' },
	{ key: 'code', header: 'KOD' },
	{ key: 'sampleNo', header: 'Nr próbki' },
	{ key: 'item', header: 'Przedmiot badań' },
	{ key: 'qty', header: 'Ilość sztuk' },
	{ key: 'client', header: 'Zleceniodawca' },
	{ key: 'scope', header: 'Zakres badań' },
	{ key: 'afterTest', header: 'Po badaniu' },
	{ key: 'notes', header: 'Uwagi' },
	{ key: 'status', header: 'Status' },
	{ key: 'returnDate', header: 'Data zwrotu' },
	{ key: 'comment', header: 'Komentarz' },
]

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
		status: s(r.status),
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
	status: s(obj.status),
	returnDate: s(obj.returnDate),
	comment: s(obj.comment),
})

// ───────────────────────────────────────────────────────────
// Dane demo (fallback) — spójne z Twoim przykładem
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

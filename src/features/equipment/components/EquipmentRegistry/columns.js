export const TYPE_OPTS = [
	{ value: 'all', label: 'Rodzaj: wszystko' },
	{ value: 'maszyna', label: 'Maszyny' },
	{ value: 'przyrząd', label: 'Przyrządy' },
]

export const STATUS_OPTS = [
	{ value: '', label: 'Status: wszystkie' },
	{ value: 'sprawny', label: 'Sprawny' },
	{ value: 'w kalibracji', label: 'W kalibracji' },
	{ value: 'w naprawie', label: 'W naprawie' },
	{ value: 'wycofane', label: 'Wycofane' },
]

// Kanoniczne statusy do podsumowania
export const STATUS_DEFS = [
	{ key: 'sprawny', label: 'Sprawny' },
	{ key: 'w kalibracji', label: 'W kalibracji' },
	{ key: 'w naprawie', label: 'W naprawie' },
	{ key: 'wycofane', label: 'Wycofane' },
]

export const HEADERS = {
	all: [
		{ key: 'id', label: 'ID', center: true, type: 'string' },
		{ key: 'name', label: 'Nazwa', type: 'string' },
		{ key: 'status', label: 'Status', center: true, type: 'string' },
		{ key: 'location', label: 'Lokalizacja', center: true, type: 'string' },
		{ key: 'group', label: 'Grupa', center: true, type: 'string' },
		{ key: 'type', label: 'Typ', center: true, type: 'string' },
		{ key: 'usageMode', label: 'Tryb użycia', center: true, type: 'string' },
	],
	maszyna: [
		{ key: 'id', label: 'ID', center: true, type: 'string' },
		{ key: 'name', label: 'Nazwa', type: 'string' },
		{ key: 'status', label: 'Status', center: true, type: 'string' },
		{ key: 'location', label: 'Lokalizacja', center: true, type: 'string' },
		{ key: 'group', label: 'Grupa', center: true, type: 'string' },
		{ key: 'model', label: 'Model', center: true, type: 'string' },
		{ key: 'producer', label: 'Producent', center: true, type: 'string' },
		{ key: 'operator', label: 'Operator', center: true, type: 'string' },
		{ key: 'power', label: 'Moc', center: true, type: 'string' },
		{ key: 'usageMode', label: 'Tryb użycia', center: true, type: 'string' },
	],
	przyrząd: [
		{ key: 'id', label: 'ID', center: true, type: 'string' },
		{ key: 'name', label: 'Nazwa', type: 'string' },
		{ key: 'status', label: 'Status', center: true, type: 'string' },
		{ key: 'location', label: 'Lokalizacja', center: true, type: 'string' },
		{ key: 'group', label: 'Grupa', center: true, type: 'string' },
		{ key: 'model', label: 'Model', center: true, type: 'string' },
		{ key: 'producer', label: 'Producent', center: true, type: 'string' },
		{ key: 'measures', label: 'Wielkość', center: true, type: 'string' },
		{ key: 'range', label: 'Zakres', center: true, type: 'string' },
		{ key: 'usageMode', label: 'Tryb użycia', center: true, type: 'string' },
	],
}

export const rangeToString = r => {
	const unit = r.unit ? ` ${r.unit}` : ''
	const val = [r.rangeMin ?? '', r.rangeMax ?? ''].filter(Boolean).join(' – ')
	return val ? `${val}${unit}` : ''
}

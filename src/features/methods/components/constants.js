// Stałe (SSOT) i dane demo

export const PAGE_SIZE = 50

export const HEADER_COLS = [
	{ key: 'standardNo', label: 'Nr normy/dokumentu', sortable: true, type: 'string' },
	{ key: 'title', label: 'Tytuł', sortable: true, type: 'string' },
	{ key: 'methodNo', label: 'Nr metody badawczej', sortable: true, type: 'string' },
	{ key: 'accreditedText', label: 'Akredytacja', sortable: true, type: 'string' },
	{ key: 'methodName', label: 'Nazwa metody badawczej', sortable: true, type: 'string' },
]

export const demoStandards = [
	{
		standardNo: 'ISO 527-1:2019',
		title: 'Plastics — Determination of tensile properties — Part 1: General principles',
		methods: [
			{ methodNo: 'M-PL-001', accredited: true, methodName: 'Rozciąganie próbek typu 1A' },
			{ methodNo: 'M-PL-002', accredited: false, methodName: 'Rozciąganie próbek typu 1B' },
			{ methodNo: 'M-PL-003', accredited: true, methodName: 'Wyznaczanie modułu sprężystości' },
		],
	},
	{
		standardNo: 'PN-EN ISO 868:2005',
		title: 'Tworzywa sztuczne i ebonit — Oznaczanie twardości w skali Shore’a',
		methods: [
			{ methodNo: 'M-PL-010', accredited: true, methodName: 'Twardość Shore A' },
			{ methodNo: 'M-PL-011', accredited: true, methodName: 'Twardość Shore D' },
		],
	},
	{
		standardNo: 'ISO 178:2019',
		title: 'Plastics — Determination of flexural properties',
		methods: [{ methodNo: 'M-PL-020', accredited: false, methodName: 'Zginanie trójpunktowe' }],
	},
]

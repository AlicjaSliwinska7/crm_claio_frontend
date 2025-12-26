import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useUrlPagination } from '../../../shared/tables/hooks/usePagination'
import { sortRows } from '../../../shared/tables/utils/sorters'
import { downloadCsv } from '../../../shared/tables/utils/csv'
import { TYPE_OPTS, STATUS_OPTS, STATUS_DEFS, HEADERS, rangeToString } from '../components/EquipmentRegistry/columns'

const PAGE_SIZE = 50
const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

const MOCK_ITEMS = [
	{
		type: 'maszyna',
		id: 'M-001',
		name: 'Frezarka CNC',
		serialNumber: 'FZ-9932',
		assetNumber: '12345-A',
		operator: 'Jan Kowalski',
		status: 'sprawny',
		location: 'Hala 1',
		group: 'Mechanika',
		model: 'HAAS VF-2',
		power: '7.5kW',
		producer: 'HAAS',
		supplier: 'TechMasz',
		purchaseDate: '2022-05-12',
		usageMode: 'dłuższa sesja',
	},
	{
		type: 'przyrząd',
		id: 'P-001',
		name: 'Wagosuszarka',
		serialNumber: 'WS-5501',
		assetNumber: '78910-B',
		instrumentType: 'pomiarowy',
		producer: 'RADWAG',
		model: 'MA 50.R',
		info: 'Wagosuszarka laboratoryjna',
		measures: 'masa',
		unit: 'g',
		rangeMin: '0.01',
		rangeMax: '50',
		location: 'Laboratorium 2',
		user: 'Anna Nowak',
		group: 'Chemia',
		contractor: 'LabTech',
		status: 'w kalibracji',
		techCondition: 'dobry',
		purchaseDate: '2023-01-18',
		usageMode: 'krótki pomiar',
	},
]

export default function useEquipmentRegistry(initialItems = MOCK_ITEMS) {
	const [data, setData] = useState(initialItems || [])

	// Filtry / sort / search
	const [typeFilter, setTypeFilter] = useState('all')
	const [statusFilter, setStatusFilter] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

	// Kolumny zależne od typu
	const cols = useMemo(() => HEADERS[typeFilter], [typeFilter])

	// Filtrowanie
	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase()
		return (data || []).filter(r => {
			if (typeFilter !== 'all' && r.type !== typeFilter) return false
			if (statusFilter && norm(r.status) !== norm(statusFilter)) return false
			if (!q) return true
			const hay = [
				r.id,
				r.name,
				r.type,
				r.status,
				r.location,
				r.group,
				r.model,
				r.producer,
				r.operator,
				r.user,
				r.measures,
				r.rangeMin,
				r.rangeMax,
				r.usageMode,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
			return hay.includes(q)
		})
	}, [data, typeFilter, statusFilter, searchQuery])

	// Sortowanie (wraz z kolumną "range")
	const typeMap = useMemo(() => {
		const m = {}
		cols.forEach(c => {
			m[c.key] = { type: c.type || 'string' }
		})
		m.range = { type: 'number' }
		return m
	}, [cols])

	const sorted = useMemo(() => {
		const normalized = filtered.map(r => ({
			...r,
			range: (() => {
				const min = parseFloat(r.rangeMin ?? '')
				const max = parseFloat(r.rangeMax ?? '')
				if (Number.isFinite(min)) return min
				if (Number.isFinite(max)) return max
				return Number.NaN
			})(),
		}))
		return sortRows(normalized, sortConfig, typeMap)
	}, [filtered, sortConfig, typeMap])

	// Szybki indeks po id
	const idIndexMap = useMemo(() => new Map(sorted.map((x, i) => [x.id, i])), [sorted])

	// Paginacja (URL)
	const [sp, setSp] = useSearchParams()
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(sorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: '.table-container, .equipment-list',
		canonicalize: true,
	})

	// Reset strony przy zmianie filtrów/szukania
	const onFilterChange = useCallback(
		fn => eOrVal => {
			fn(typeof eOrVal === 'string' ? eOrVal : eOrVal.target.value)
			resetToFirstPage(true)
		},
		[resetToFirstPage]
	)

	// CRUD (modale)
	const [showModal, setShowModal] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [editIndex, setEditIndex] = useState(null)
	const [formItem, setFormItem] = useState({
		type: 'maszyna',
		id: '',
		name: '',
		status: '',
		location: '',
		group: '',
		model: '',
		producer: '',
		operator: '',
		power: '',
		measures: '',
		unit: '',
		rangeMin: '',
		rangeMax: '',
		usageMode: 'krótki pomiar',
	})

	const openAdd = useCallback(() => {
		const defaultType = typeFilter !== 'all' ? typeFilter : 'maszyna'
		setFormItem(f => ({ ...f, type: defaultType, id: '', name: '' }))
		setIsEditing(false)
		setEditIndex(null)
		setShowModal(true)
	}, [typeFilter])

	const openEdit = useCallback(
		row => {
			// znajdź indeks w ORYGINALNYCH danych (po id)
			const idx = (data || []).findIndex(x => x.id === row.id)
			if (idx < 0) return
			setFormItem({ ...row })
			setIsEditing(true)
			setEditIndex(idx)
			setShowModal(true)
		},
		[data]
	)

	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteIndex, setDeleteIndex] = useState(null)
	const askDelete = useCallback(
		row => {
			const idx = (data || []).findIndex(x => x.id === row.id)
			if (idx < 0) return
			setDeleteIndex(idx)
			setShowDeleteModal(true)
		},
		[data]
	)

	const confirmDelete = useCallback(() => {
		if (deleteIndex == null) return
		setData(prev => prev.filter((_, i) => i !== deleteIndex))
		setShowDeleteModal(false)
		setDeleteIndex(null)
		if (isEditing && editIndex === deleteIndex) {
			setShowModal(false)
			setIsEditing(false)
			setEditIndex(null)
		}
		resetToFirstPage(true)
	}, [deleteIndex, isEditing, editIndex, resetToFirstPage])

	const closeDelete = useCallback(() => {
		setShowDeleteModal(false)
		setDeleteIndex(null)
	}, [])

	const submitForm = useCallback(
		e => {
			e?.preventDefault?.()
			if (!formItem.id || !formItem.name || !formItem.type) {
				alert('Uzupełnij przynajmniej: Typ, ID, Nazwa.')
				return
			}
			if (isEditing && editIndex != null) {
				setData(prev => {
					const copy = [...prev]
					copy[editIndex] = { ...copy[editIndex], ...formItem }
					return copy
				})
			} else {
				setData(prev => [...prev, { ...formItem }])
			}
			setShowModal(false)
			setIsEditing(false)
			setEditIndex(null)
			resetToFirstPage(true)
		},
		[formItem, isEditing, editIndex, resetToFirstPage]
	)

	const deleteLabel = deleteIndex != null ? `${data[deleteIndex]?.id ?? ''} — ${data[deleteIndex]?.name ?? ''}` : ''

	// Summary (statusy)
	const counts = useMemo(() => {
		const total = sorted.length
		let machines = 0,
			instruments = 0
		for (const r of sorted) {
			if (r.type === 'maszyna') machines++
			else if (r.type === 'przyrząd') instruments++
		}
		return { total, machines, instruments }
	}, [sorted])

	const statusSummaryItems = useMemo(() => {
		const makeMap = () => new Map(STATUS_DEFS.map(s => [s.key, 0]))
		const mach = makeMap()
		const instr = makeMap()

		for (const r of sorted) {
			const k = norm(r.status)
			if (r.type === 'maszyna' && mach.has(k)) mach.set(k, (mach.get(k) || 0) + 1)
			if (r.type === 'przyrząd' && instr.has(k)) instr.set(k, (instr.get(k) || 0) + 1)
		}

		const REPAIR = 'w naprawie'
		const RETIRED = 'wycofane'
		const mRepair = mach.get(REPAIR) || 0
		const pRepair = instr.get(REPAIR) || 0
		const mRetired = mach.get(RETIRED) || 0
		const pRetired = instr.get(RETIRED) || 0

		const items = [
			['Wyposażenie', counts.total],
			['Maszyny', counts.machines],
			['Przyrządy', counts.instruments],
			[`W naprawie (Maszyny: ${mRepair} · Przyrządy: ${pRepair})`, mRepair + pRepair],
			[`Wycofane (Maszyny: ${mRetired} · Przyrządy: ${pRetired})`, mRetired + pRetired],
		]

		STATUS_DEFS.filter(s => s.key !== REPAIR && s.key !== RETIRED).forEach(s => {
			const m = mach.get(s.key) || 0
			const p = instr.get(s.key) || 0
			const sum = m + p
			if (sum > 0) items.push([`${s.label} (Maszyny: ${m} · Przyrządy: ${p})`, sum])
		})

		return items
	}, [sorted, counts.total, counts.machines, counts.instruments])

	// Eksport CSV
	const exportCSV = useCallback(() => {
		const columns = cols.map(c => ({ key: c.key, label: c.label }))
		const rowsForExport = sorted.map(r => ({ ...r, range: rangeToString(r) }))
		downloadCsv({
			filename: 'rejestr_wyposazenia.csv',
			columns,
			rows: rowsForExport,
			delimiter: ';',
			includeHeader: true,
			addBOM: true,
		})
	}, [cols, sorted])

	return {
		// kolumny / dane
		cols,
		visibleRows: visible,
		hasRows: visible.length > 0,
		totalCount: sorted.length,

		// sort/szukaj/paginacja
		sortConfig,
		setSortConfig,
		searchQuery,
		setSearchQuery,
		pageCount,
		currentPage,
		onPageChange,
		resetToFirstPage,

		// filtry
		TYPE_OPTS,
		STATUS_OPTS,
		typeFilter,
		setTypeFilter,
		statusFilter,
		setStatusFilter,
		onFilterChange,

		// CRUD
		showModal,
		setShowModal,
		isEditing,
		openAdd,
		openEdit,
		showDeleteModal,
		askDelete,
		confirmDelete,
		closeDelete,
		deleteLabel,

		// formularz
		formItem,
		setFormItem,
		submitForm,

		// summary + eksport
		statusSummaryItems,
		exportCSV,
	}
}

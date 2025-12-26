import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUrlPagination } from '../../../shared/tables/hooks/usePagination'
import { useListQuery } from '../../../shared/tables/hooks/useListQuery'
import { downloadCsv } from '../../../shared/tables/utils/csv'
import { buildCalibrationLabColumns } from '../components/CalibrationLabs/columns'

const STORAGE_KEY = 'calibrationLabs'
const PAGE_SIZE = 50

const INITIAL = [
	{
		id: 'lab-1',
		name: 'Instytut Metrologii',
		city: 'Warszawa',
		address: 'ul. Prosta 12',
		contactPerson: 'Jan Nowak',
		email: 'kontakt@im.pl',
		phone: '+48 22 111 22 33',
		services: ['kalibracja wag', 'termometry'],
	},
	{
		id: 'lab-2',
		name: 'KalLab',
		city: 'Kraków',
		address: 'ul. Cicha 4',
		contactPerson: 'Anna Zielińska',
		email: 'biuro@kallab.pl',
		phone: '+48 12 987 65 43',
		services: ['manometry', 'termometry'],
	},
]

export function useCalibrationLabs() {
	const [params, setParams] = useSearchParams()
	const [rows, setRows] = useState(() => {
		try {
			const s = localStorage.getItem(STORAGE_KEY)
			if (s) return JSON.parse(s)
		} catch {}
		return INITIAL
	})

	// filters
	const [searchQuery, setSearchQuery] = useState(params.get('q') || '')
	const [serviceFilter, setServiceFilter] = useState(params.get('service') || 'all')

	// pagination
	const { page, setPage, pageCount, slice } = useUrlPagination(rows.length, PAGE_SIZE)

	// derived
	const allServices = useMemo(() => {
		const set = new Set()
		rows.forEach(r => (r.services || []).forEach(s => set.add(s)))
		return Array.from(set).sort()
	}, [rows])

	const filtered = useMemo(() => {
		let out = rows
		if (searchQuery) {
			const q = searchQuery.toLowerCase()
			out = out.filter(r =>
				[r.name, r.city, r.address, r.contactPerson, r.email, r.phone]
					.filter(Boolean)
					.some(x => String(x).toLowerCase().includes(q))
			)
		}
		if (serviceFilter !== 'all') {
			out = out.filter(r => (r.services || []).includes(serviceFilter))
		}
		return out
	}, [rows, searchQuery, serviceFilter])

	const visible = useMemo(() => filtered.slice(...slice), [filtered, slice])

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
	}, [rows])

	// query sync
	useEffect(() => {
		const next = new URLSearchParams(params)
		if (searchQuery) next.set('q', searchQuery)
		else next.delete('q')
		if (serviceFilter && serviceFilter !== 'all') next.set('service', serviceFilter)
		else next.delete('service')
		setParams(next, { replace: true })
	}, [searchQuery, serviceFilter]) // eslint-disable-line react-hooks/exhaustive-deps

	// CRUD
	const [showModal, setShowModal] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [form, setForm] = useState({})

	const openAdd = () => {
		setForm({})
		setIsEditing(false)
		setShowModal(true)
	}

	const openEdit = row => {
		setForm(row)
		setIsEditing(true)
		setShowModal(true)
	}

	// delete
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteId, setDeleteId] = useState(null)
	const [deleteLabel, setDeleteLabel] = useState('')

	const openDelete = id => {
		const found = rows.find(r => r.id === id)
		setDeleteId(id)
		setDeleteLabel(found?.name || '')
		setShowDeleteModal(true)
	}
	const closeDelete = () => {
		setShowDeleteModal(false)
		setDeleteId(null)
		setDeleteLabel('')
	}
	const confirmDelete = () => {
		if (deleteId) {
			setRows(prev => prev.filter(r => r.id !== deleteId))
		}
		closeDelete()
	}

	const handleSubmit = e => {
		e.preventDefault()
		if (!form?.name) return
		if (isEditing) {
			setRows(prev => prev.map(r => (r.id === form.id ? { ...r, ...form } : r)))
		} else {
			const id = `lab-${Math.random().toString(36).slice(2, 8)}`
			setRows(prev => [{ ...form, id }, ...prev])
		}
		setShowModal(false)
		setForm({})
	}

	const exportCSV = () => {
		const rowsForCsv = filtered.map(r => ({
			Nazwa: r.name,
			Miasto: r.city,
			Adres: r.address,
			'Osoba kontaktowa': r.contactPerson,
			Email: r.email,
			Telefon: r.phone,
			Usługi: (r.services || []).join(', '),
		}))
		downloadCsv(rowsForCsv, 'laboratoria_kalibracyjne.csv')
	}

	return {
		// dane
		rows,
		setRows,
		filtered,
		visible,
		page,
		setPage,
		pageCount,

		// filtry
		searchQuery,
		setSearchQuery,
		serviceFilter,
		setServiceFilter,
		allServices,

		// modale + CRUD
		showModal,
		setShowModal,
		isEditing,
		openAdd,
		openEdit,
		showDeleteModal,
		openDelete,
		closeDelete,
		confirmDelete,
		deleteLabel,

		// formularz
		form,
		setForm,
		handleSubmit,

		// eksport
		exportCSV,
	}
}

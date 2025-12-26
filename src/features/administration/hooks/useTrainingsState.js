import { useMemo, useState } from 'react'
import { sortRows } from '../../../shared/tables/utils/sorters'

const HEADER_COLS = [
	{ key: 'title', label: 'Tytuł', sortable: true, type: 'string' },
	{ key: 'topic', label: 'Temat', sortable: true, type: 'string' },
	{ key: 'type', label: 'Typ', sortable: true, type: 'string' },
	{ key: 'date', label: 'Data', sortable: true, type: 'date' },
	{ key: 'participants', label: 'Uczestnicy', sortable: false, render: r => (r.participants || []).join(', ') },
]

export function useTrainingsState(initialUsers) {
	const users = initialUsers ?? ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']

	const [trainings, setTrainings] = useState([
		{
			id: 1,
			type: 'wewnętrzne',
			title: 'Szkolenie BHP',
			topic: 'Zasady bezpieczeństwa w laboratorium',
			date: '2025-07-12',
			participants: ['Alicja Śliwińska', 'Jan Kowalski'],
		},
	])

	const [searchQuery, setSearchQuery] = useState('')
	const [filterType, setFilterType] = useState('wszystkie')
	const [filterParticipant, setFilterParticipant] = useState('wszyscy')
	const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

	const [showModal, setShowModal] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [editId, setEditId] = useState(null)
	const [newTraining, setNewTraining] = useState({
		type: 'wewnętrzne',
		title: '',
		topic: '',
		date: '',
		participants: [],
	})

	const toStr = v => (v ?? '').toString()

	const filteredAndSorted = useMemo(() => {
		const q = String(searchQuery || '').toLowerCase()
		let result = trainings.filter(t => {
			const matchesText = [
				toStr(t.title).toLowerCase(),
				toStr(t.topic).toLowerCase(),
				toStr(t.type).toLowerCase(),
				toStr(t.date).toLowerCase(),
				...(t.participants || []).map(p => toStr(p).toLowerCase()),
			].some(field => field.includes(q))
			if (!matchesText) return false
			if (filterType !== 'wszystkie' && t.type !== filterType) return false
			if (filterParticipant !== 'wszyscy' && !(t.participants || []).includes(filterParticipant)) return false
			return true
		})

		const typeMap = HEADER_COLS.reduce((acc, c) => {
			if (c.sortable) acc[c.key] = { type: c.type || 'string' }
			return acc
		}, {})
		return sortConfig.key ? sortRows(result, sortConfig, typeMap) : result
	}, [trainings, searchQuery, filterType, filterParticipant, sortConfig])

	const typeSummary = useMemo(() => {
		const map = new Map([
			['wewnętrzne', 0],
			['zewnętrzne', 0],
		])
		for (const t of filteredAndSorted) {
			const k = t.type || 'wewnętrzne'
			map.set(k, (map.get(k) || 0) + 1)
		}
		return { internal: map.get('wewnętrzne') || 0, external: map.get('zewnętrzne') || 0 }
	}, [filteredAndSorted])

	const openAdd = () => {
		setNewTraining({ type: 'wewnętrzne', title: '', topic: '', date: '', participants: [] })
		setIsEditing(false)
		setEditId(null)
		setShowModal(true)
	}

	const openEdit = id => {
		const found = trainings.find(t => t.id === id)
		if (!found) return
		setNewTraining({ ...found })
		setEditId(id)
		setIsEditing(true)
		setShowModal(true)
	}

	const saveTraining = e => {
		e.preventDefault()
		const ok = newTraining.title && newTraining.topic && newTraining.date && newTraining.participants?.length
		if (!ok) {
			alert('Uzupełnij wszystkie pola i wybierz uczestników.')
			return
		}
		if (isEditing && editId != null) {
			setTrainings(prev => prev.map(t => (t.id === editId ? { ...newTraining, id: editId } : t)))
		} else {
			const id = Date.now()
			setTrainings(prev => [...prev, { id, ...newTraining }])
		}
		closeModal()
	}

	const closeModal = () => {
		setNewTraining({ type: 'wewnętrzne', title: '', topic: '', date: '', participants: [] })
		setIsEditing(false)
		setEditId(null)
		setShowModal(false)
	}

	const askDelete = (id, setDeleteId, setShowDeleteModal) => {
		setDeleteId(id)
		setShowDeleteModal(true)
	}

	return {
		users,
		trainings,
		setTrainings,
		filteredAndSorted,
		typeSummary,
		HEADER_COLS,
		searchQuery,
		setSearchQuery,
		filterType,
		setFilterType,
		filterParticipant,
		setFilterParticipant,
		sortConfig,
		setSortConfig,
		showModal,
		isEditing,
		newTraining,
		setNewTraining,
		openAdd,
		openEdit,
		saveTraining,
		closeModal,
	}
}

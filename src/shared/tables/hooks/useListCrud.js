// src/shared/tables/hooks/useListCrud.js
import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Uniwersalny CRUD dla list (dodaj/edytuj/usuń + modale)
 *
 * Opcje:
 *  - initialItems: Array        (startowa lista)
 *  - idKey: string              (klucz ID w rekordzie, domyślnie 'id')
 *  - makeId: (row)=>string      (generator ID; domyślnie crypto.randomUUID/Date.now)
 *  - validate: (form)=>string?  (tekst błędu lub null)
 *  - normalizeOnSave: (form)=>any
 *  - labelForDelete: (row)=>string
 *  - onChange: (nextList)=>void (callback po zmianie listy)
 *  - onError: (message)=>void   (np. toast zamiast alert)
 */
export function useListCrud({
	initialItems = [],
	idKey = 'id',
	makeId = row => {
		// domyślny, bezpieczny generator
		if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
		return String(Date.now())
	},
	validate = () => null,
	normalizeOnSave = x => x,
	labelForDelete = row => row?.[idKey] || '',
	onChange,
	onError,
} = {}) {
	const [list, setList] = useState(() => (Array.isArray(initialItems) ? initialItems : []))
	const [modalOpen, setModalOpen] = useState(false)
	const [editingId, setEditingId] = useState(null)
	const [form, setForm] = useState({})
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteId, setDeleteId] = useState(null)

	// 🔄 synchronizacja, gdy zmienia się initialItems
	useEffect(() => {
		if (Array.isArray(initialItems)) setList(initialItems)
	}, [initialItems])

	const isEditing = editingId != null

	const pendingDelete = useMemo(() => list.find(r => r?.[idKey] === deleteId) || null, [list, deleteId, idKey])

	const deleteLabel = useMemo(() => labelForDelete(pendingDelete), [pendingDelete, labelForDelete])

	const notifyChange = useCallback(
		next => {
			setList(next)
			onChange?.(next)
		},
		[onChange]
	)

	const openAdd = useCallback((emptyForm = {}) => {
		setEditingId(null)
		setForm(emptyForm)
		setModalOpen(true)
	}, [])

	const openEdit = useCallback(
		id => {
			const found = list.find(r => r?.[idKey] === id)
			if (!found) return
			setEditingId(id)
			setForm({ ...found })
			setModalOpen(true)
		},
		[list, idKey]
	)

	const closeModal = useCallback(() => setModalOpen(false), [])

	const askDelete = useCallback(id => {
		setDeleteId(id)
		setShowDeleteModal(true)
	}, [])

	const cancelDelete = useCallback(() => {
		setShowDeleteModal(false)
		setDeleteId(null)
	}, [])

	const confirmDelete = useCallback(
		({ after } = {}) => {
			if (deleteId == null) return
			const next = list.filter(r => r?.[idKey] !== deleteId)
			notifyChange(next)
			setShowDeleteModal(false)
			if (editingId === deleteId) {
				setModalOpen(false)
				setEditingId(null)
			}
			setDeleteId(null)
			after?.()
		},
		[deleteId, list, idKey, editingId, notifyChange]
	)

	const save = useCallback(
		(e, { after } = {}) => {
			e?.preventDefault?.()

			const err = validate(form)
			if (err) {
				onError?.(err)
				!onError && alert(err) // fallback
				return { ok: false, error: err }
			}

			const normalized = normalizeOnSave(form)

			if (!isEditing) {
				const currentId = normalized?.[idKey]
				const newId = (typeof currentId === 'string' && currentId.trim()) || makeId(normalized)

				if (list.some(r => r?.[idKey] === newId)) {
					const msg = `Rekord o ${idKey}="${newId}" już istnieje.`
					onError?.(msg)
					!onError && alert(msg)
					return { ok: false, error: msg }
				}

				const next = [...list, { ...normalized, [idKey]: newId }]
				notifyChange(next)
			} else {
				const next = list.map(r => (r?.[idKey] === editingId ? { ...normalized, [idKey]: editingId } : r))
				notifyChange(next)
			}

			setModalOpen(false)
			after?.()
			return { ok: true }
		},
		[form, isEditing, list, idKey, makeId, normalizeOnSave, validate, editingId, notifyChange, onError]
	)

	return {
		// state
		list,
		setList,
		form,
		setForm,
		modalOpen,
		openAdd,
		openEdit,
		closeModal,
		isEditing,
		editingId,
		showDeleteModal,
		askDelete,
		cancelDelete,
		confirmDelete,
		pendingDelete,
		deleteLabel,
		save,
	}
}

export default useListCrud

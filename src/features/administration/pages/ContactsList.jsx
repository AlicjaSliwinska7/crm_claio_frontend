// src/features/administration/pages/ContactsList.jsx
import React, { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// style (skórki "registers")
import '../../../shared/tables/styles/directories_lists_registers/index.css'

// modale
import { Modal, DeleteDialog } from '../../../shared/modals'

// wspólne listowe klocki
import {
	ListLayout,
	ListSummary,
	Pagination,
	SearchBar,
	AddButton,
	useUrlPagination,
	useListCrud,
	useListQuery,
	useCsvExport,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	DataTableWithActions,
	ExportCsvButton,
	SCROLL_SELECTOR,
} from '../../../shared/tables'

// lokalne elementy (SSOT)
import {
	HEADER_COLS,
	COMMON_DEPARTMENTS,
	INITIAL_DATA,
	CSV_COLUMNS,
	labelForDelete,
	normalizeOnLoad,
	EMPTY_CONTACT,
	CONTACT_SCHEMA,
	getSearchFields,
} from '../config/contacts.config'

// formularz
import ContactForm from '../forms/ContactForm'

// walidacja (silnik)
import { validateObject, firstErrorKey } from '../../../shared/utils/validators'

export default function ContactsList() {
	const [searchParams, setSearchParams] = useSearchParams()
	const [errors, setErrors] = useState({})

	// dane startowe – znormalizowane raz
	const initialItems = useMemo(() => normalizeOnLoad(INITIAL_DATA), [])

	// CRUD
	const {
		list: contacts,
		form,
		setForm,
		modalOpen,
		openAdd,
		openEdit,
		closeModal,
		isEditing,
		showDeleteModal,
		askDelete,
		cancelDelete,
		confirmDelete,
		deleteLabel,
		save,
	} = useListCrud({
		initialItems,
		idKey: 'id',
		makeId: () => `CN-${Date.now()}`,
		validate: () => null, // walidacja robiona w onSubmitForm
		normalizeOnSave: x => x,
		labelForDelete,
	})

	// wyszukiwanie + sort
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(
		contacts,
		HEADER_COLS,
		{
			initialSort: { key: 'lastName', direction: 'asc' },
			getSearchFields,
		}
	)

	// paginacja w URL
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
		pageSize: PAGE_SIZE,
		searchParams,
		setSearchParams,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// liczniki
	const departmentsCount = useMemo(
		() => new Set(filteredSorted.map(c => (c?.department || '').trim())).size,
		[filteredSorted]
	)

	const buildingsCount = useMemo(
		() => new Set(filteredSorted.map(c => (c?.building || '').trim())).size,
		[filteredSorted]
	)

	// opcje działów
	const departmentOptions = useMemo(() => {
		const fromData = contacts.map(c => c?.department)
		return [...new Set([...COMMON_DEPARTMENTS, ...fromData].filter(Boolean))].sort((a, b) =>
			a.localeCompare(b, 'pl', { sensitivity: 'base' })
		)
	}, [contacts])

	// CSV
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredSorted,
		filename: 'kontakty.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// submit formularza
	const onSubmitForm = useCallback(
		e => {
			e.preventDefault()
			const { errors: errs, isValid } = validateObject(form || {}, CONTACT_SCHEMA)
			setErrors(errs)

			if (!isValid) {
				const key = firstErrorKey(errs)
				if (key) {
					const el = document.querySelector(`.modal-form [name="${key}"]`)
					el?.focus()
				}
				return
			}

			save(e, { after: () => resetToFirstPage(true) })
		},
		[form, save, resetToFirstPage]
	)

	return (
		<ListLayout
			rootClassName='contacts-list'
			controlsClassName='contacts-list__controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź kontakt...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>
					<AddButton
						className='add-contact-btn'
						label='Dodaj kontakt'
						onClick={() => {
							setErrors({})
							openAdd(EMPTY_CONTACT)
						}}
					/>
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary
						ariaLabel='Podsumowanie listy kontaktów'
						items={[
							['Rekordy', filteredSorted.length],
							['Działy', departmentsCount],
							['Budynki', buildingsCount],
						]}
					/>
				</>
			}>
			<DataTableWithActions
				columns={HEADER_COLS}
				rows={visible}
				sortConfig={sortConfig}
				setSortConfig={cfg => {
					setSortConfig(cfg)
					resetToFirstPage(true)
				}}
				/* ✅ usuń redundancję: bez onAfterSort (reset już jest wyżej) */
				actionsForRow={row => [
					{
						type: 'edit',
						label: 'Edytuj kontakt',
						onClick: () => {
							setErrors({})
							openEdit(row.id)
						},
					},
					{
						type: 'delete',
						label: 'Usuń kontakt',
						onClick: () => askDelete(row.id),
					},
				]}
				actionsSticky
				ariaLabel='Tabela kontaktów'
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj kontakt' : 'Dodaj nowy kontakt'} onClose={closeModal} size='sm'>
					<ContactForm
						form={form || EMPTY_CONTACT}
						setForm={setForm}
						errors={errors}
						setErrors={setErrors}
						departmentOptions={departmentOptions}
						onSubmitForm={onSubmitForm}
						onClose={closeModal}
					/>
				</Modal>
			)}

			<DeleteDialog
				open={showDeleteModal}
				onConfirm={() => confirmDelete({ after: () => resetToFirstPage(true) })}
				onClose={cancelDelete}
				label={deleteLabel}
				what='kontakt'
			/>
		</ListLayout>
	)
}

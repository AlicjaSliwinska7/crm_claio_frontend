// src/features/administration/pages/AppointmentsRegister.jsx
import React, { useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// skórka tabel rejestrów
import '../../../shared/tables/styles/directories_lists_registers/index.css'

import { Modal, DeleteDialog } from '../../../shared/modals'

import {
	// layout + pasek narzędzi
	ListLayout,
	SearchBar,
	AddButton,
	Pagination,
	ListSummary,
	ExportCsvButton,
	DataTableWithActions,

	// hooki / utils list
	useUrlPagination,
	useListCrud,
	useListQuery,
	useCsvExport,
	rowNavigateProps as makeRowNavigateProps,

	// stałe wspólne
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,

	// utilsy listowe
	csvFilename,
	editDeleteActions,
} from '../../../shared/tables'

import { rid } from '../../../shared/utils/id'
import AppointmentForm from '../forms/AppointmentForm'

import {
	HEADER_COLS,
	EMPTY_FORM,
	initialAppointments,
	normalizeOnLoad,
	normalizeOnSave,
	users,
	labelForDelete,
	CSV_COLUMNS,
	validateAppointment,
	getSearchFields,
} from '../config/appointments.config'

// helper do eksportu CSV (łączymy members w string)
const membersToCsv = members => (Array.isArray(members) ? members.join('; ') : String(members || ''))

export default function AppointmentsRegister() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	// 1) Dane startowe + walidacja
	const initialItems = useMemo(() => normalizeOnLoad(initialAppointments), [])
	const validate = useCallback(validateAppointment, [])

	// 2) CRUD
	const {
		list: appointments,
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
		makeId: () => rid('A'),
		validate,
		normalizeOnSave,
		labelForDelete,
	})

	// 3) Filtrowanie/sortowanie
	const {
		searchQuery,
		setSearchQuery,
		sortConfig,
		setSortConfig,
		filteredSorted,
		total: totalAppointments,
	} = useListQuery(appointments, HEADER_COLS, {
		initialSort: { key: 'date', direction: 'desc' },
		getSearchFields,
	})

	// 4) Paginacja (URL)
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
		pageSize: PAGE_SIZE,
		searchParams,
		setSearchParams,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 5) Eksport CSV (z bieżącego widoku)
	const csvRows = useMemo(
		() =>
			filteredSorted.map(r => ({
				...r,
				members: membersToCsv(r.members),
			})),
		[filteredSorted]
	)

	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: csvRows,
		filename: csvFilename('spotkania'),
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 6) Nawigacja po wierszu
	const handleRowClick = useCallback(id => navigate(`/administracja/spotkania/${encodeURIComponent(id)}`), [navigate])

	const rowNavProps = useCallback(id => makeRowNavigateProps(id, handleRowClick), [handleRowClick])

	// 7) Render
	return (
		<ListLayout
			rootClassName='appointments-register'
			controlsClassName='appointments-register__controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź spotkanie...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>
					<AddButton className='add-appointment-btn' label='Dodaj spotkanie' onClick={() => openAdd(EMPTY_FORM)} />
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>
					<ListSummary ariaLabel='Podsumowanie rejestru spotkań' items={[['Spotkania', totalAppointments]]} />
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
				actionsForRow={row =>
					editDeleteActions(
						() => openEdit(row.id),
						() => askDelete(row.id)
					)
				}
				rowProps={row => ({
					...rowNavProps(row.id),
					className: 'row-clickable',
				})}
				actionsSticky
				ariaLabel='Tabela spotkań'
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj spotkanie' : 'Dodaj spotkanie'} onClose={closeModal} size='sm'>
					<AppointmentForm
						key={isEditing ? `edit-${form?.id ?? 'new'}` : 'add'}
						appointment={form ?? EMPTY_FORM}
						setAppointment={setForm}
						onSubmit={e => save(e, { after: () => resetToFirstPage(true) })}
						onClose={closeModal}
						users={users}
					/>
				</Modal>
			)}

			<DeleteDialog
				open={showDeleteModal}
				onConfirm={() => confirmDelete({ after: () => resetToFirstPage(true) })}
				onClose={cancelDelete}
				label={deleteLabel}
				what='spotkanie'
			/>
		</ListLayout>
	)
}

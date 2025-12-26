// src/features/sales/pages/ClientsDirectory.jsx (lub analogiczna ścieżka)
import React, { useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// wspólne layouty i klocki
import {
	ListLayout,
	SearchBar,
	AddButton,
	Pagination,
	ListSummary,
	ExportCsvButton,
	DataTableWithActions,
	useListCrud,
	useListQuery,
	useUrlPagination,
	useCsvExport,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
	editDeleteActions,
} from '../../../shared/tables'

import { Modal, DeleteDialog } from '../../../shared/modals'

// formularz + konfiguracja
import ClientForm from '../forms/ClientForm'
import {
	HEADER_COLS,
	CSV_COLUMNS,
	initialClients,
	normalizeOnSave,
	normalizeOnLoad,
	labelForDelete,
	getSearchFields,
} from '../config/clients.config'

import { rid } from '../../../shared/utils/id'

export default function ClientsDirectory() {
	const navigate = useNavigate()
	const [sp, setSp] = useSearchParams()

	// 1️⃣ CRUD (spójnie z resztą modułów)
	const validate = useCallback(
		draft => (!draft?.name || !draft?.address ? 'Uzupełnij nazwę i adres klienta.' : null),
		[]
	)

	const {
		list: clients,
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
		initialItems: normalizeOnLoad(initialClients),
		idKey: 'id',
		makeId: () => rid('C'),
		validate,
		normalizeOnSave,
		labelForDelete,
	})

	// 2️⃣ Wyszukiwanie i sortowanie
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted, total } = useListQuery(
		clients,
		HEADER_COLS,
		{
			initialSort: { key: 'name', direction: 'asc' },
			getSearchFields,
		}
	)

	// 3️⃣ Paginacja (spójna z URL)
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 4️⃣ Eksport CSV
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredSorted,
		filename: 'klienci.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 5️⃣ Klik w wiersz
	const handleRowClick = useCallback(id => navigate(`/sprzedaz/klienci/${encodeURIComponent(id)}`), [navigate])

	// 6️⃣ Render
	return (
		<ListLayout
			rootClassName='clients-list'
			controlsClassName='clients-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź klienta...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>
					<AddButton className='add-client-btn' label='Dodaj klienta' onClick={() => openAdd({})} />
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary ariaLabel='Podsumowanie listy klientów' items={[['Klienci', total]]} />
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
				onAfterSort={() => resetToFirstPage(true)}
				ariaLabel='Tabela klientów'
				actionsForRow={row =>
					editDeleteActions(
						() => openEdit(row.id),
						() => askDelete(row.id)
					)
				}
				actionsSticky
				rowProps={row => ({
					className: 'row-clickable',
					onClick: () => handleRowClick(row.id),
				})}
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj klienta' : 'Dodaj klienta'} onClose={closeModal} size='md'>
					<ClientForm
						newClient={form || {}}
						setNewClient={setForm}
						onSubmit={e => save(e, { after: () => resetToFirstPage(true) })}
						onClose={closeModal}
					/>
				</Modal>
			)}

			<DeleteDialog
				open={showDeleteModal}
				onConfirm={() => confirmDelete({ after: () => resetToFirstPage(true) })}
				onClose={cancelDelete}
				label={deleteLabel}
				what='klienta'
			/>
		</ListLayout>
	)
}

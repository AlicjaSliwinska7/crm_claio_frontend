// src/components/pages/contents/EquipmentRegistry.js
import React, { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// skórka list „registers”
import '../../../shared/tables/styles/directories_lists_registers/index.css'

import {
	// layout + UI
	ListLayout,
	SearchBar,
	AddButton,
	Pagination,
	ListSummary,
	ExportCsvButton,
	DataTableWithActions,

	// hooki
	useUrlPagination,
	useListQuery,
	useListCrud,
	useCsvExport,

	// stałe + utils
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
	editDeleteActions,
} from '../../../shared/tables'

import { Modal, DeleteDialog } from '../../../shared/modals'

// ✅ formularz (Twoja ścieżka w projekcie może być inna — patrz uwaga niżej)
import EquipmentForm from '../../../features/equipment/forms/EquipmentForm'

// SSOT: konfiguracja rejestru sprzętu
import {
	HEADER_COLS,
	CSV_COLUMNS,
	initialEquipment,
	normalizeOnSave,
	labelForDelete,
	getSearchFields,
} from '../../../features/equipment/config/equipments.config'

export default function EquipmentRegistry() {
	const [sp, setSp] = useSearchParams()

	/* ===== CRUD ===== */
	const validate = useCallback(f => (!f?.name || !String(f.name).trim() ? 'Uzupełnij nazwę.' : null), [])

	const EMPTY_EQUIP = useMemo(
		() => ({
			id: '',
			name: '',
			code: '',
			status: 'sprawny',
			location: '',
			group: '',
			model: '',
			producer: '',
			purchaseDate: '',
			purchaseCost: '',
		}),
		[]
	)

	const {
		list: items,
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
		initialItems: initialEquipment,
		idKey: 'id',
		makeId: () => `EQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
		validate,
		normalizeOnSave,
		labelForDelete,
	})

	/* ===== Wyszukiwanie + sort ===== */
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(items, HEADER_COLS, {
		initialSort: { key: 'name', direction: 'asc' },
		getSearchFields, // ✅ SSOT (z configu)
	})

	/* ===== Paginacja (URL) ===== */
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	/* ===== CSV ===== */
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredSorted,
		filename: 'sprzet.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	/* ===== Podsumowanie ===== */
	const summaryItems = useMemo(() => [['Pozycje', filteredSorted.length]], [filteredSorted.length])

	return (
		<ListLayout
			rootClassName='equipment-list'
			controlsClassName='equipment-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Szukaj w rejestrze sprzętu...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					<AddButton className='add-equipment-btn' label='Dodaj pozycję' onClick={() => openAdd(EMPTY_EQUIP)} />
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary ariaLabel='Podsumowanie rejestru sprzętu' items={summaryItems} />
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
				ariaLabel='Rejestr sprzętu'
				actionsForRow={row =>
					editDeleteActions(
						() => openEdit(row.id),
						() => askDelete(row.id)
					)
				}
				actionsSticky
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj pozycję' : 'Dodaj pozycję'} onClose={closeModal} size='md'>
					<EquipmentForm
						item={form || EMPTY_EQUIP}
						setItem={setForm}
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
				what='pozycję'
			/>
		</ListLayout>
	)
}

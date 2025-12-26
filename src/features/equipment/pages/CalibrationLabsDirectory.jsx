// src/features/equipment/pages/CalibrationLabs.jsx
import React, { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

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
	rowNavigateProps as makeRowNavigateProps,
	editDeleteActions,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
} from '../../../shared/tables'

import { Modal, DeleteDialog } from '../../../shared/modals'
import CalibrationLabForm from '../forms/CalibrationLabForm'

import {
	HEADER_COLS,
	CSV_COLUMNS,
	initialLabs,
	normalizeOnLoad,
	normalizeOnSave,
	labelForDelete,
	getSearchFields,
} from '../config/calibration.config'

import { rid } from '../../../shared/utils/id'

export default function CalibrationLabs() {
	const navigate = useNavigate()
	const [sp, setSp] = useSearchParams()

	const validate = useCallback(draft => (!draft?.name ? 'Nazwa laboratorium jest wymagana.' : null), [])

	const {
		list: labs,
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
		initialItems: normalizeOnLoad(initialLabs),
		idKey: 'id',
		makeId: () => rid('LAB'),
		validate,
		normalizeOnSave,
		labelForDelete,
	})

	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted, total } = useListQuery(
		labs,
		HEADER_COLS,
		{
			initialSort: { key: 'name', direction: 'asc' },
			getSearchFields,
		}
	)

	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredSorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredSorted,
		filename: 'laboratoria_wzorcowania.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	const handleRowClick = useCallback(
		id => navigate(`/wyposazenie/laboratoria-wzorcowania/${encodeURIComponent(id)}`),
		[navigate]
	)

	const rowNavProps = useCallback(id => makeRowNavigateProps(id, handleRowClick), [handleRowClick])

	const summaryItems = useMemo(() => [['Laboratoria wzorcowania', total]], [total])

	return (
		<ListLayout
			rootClassName='calibrationLabs-list'
			controlsClassName='calibrationLabs-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź laboratorium...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					<AddButton className='add-lab-btn' label='Dodaj laboratorium' onClick={() => openAdd({})} />
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary ariaLabel='Podsumowanie listy laboratoriów' items={summaryItems} />
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
				rowProps={row => ({
					...rowNavProps(row.id),
					className: 'row-clickable',
					title: `Przejdź do laboratorium ${row.name}`,
				})}
				actionsForRow={row =>
					editDeleteActions(
						() => openEdit(row.id),
						() => askDelete(row.id)
					)
				}
				actionsSticky
				ariaLabel='Tabela laboratoriów wzorcowania'
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj laboratorium' : 'Dodaj laboratorium'} onClose={closeModal} size='md'>
					<CalibrationLabForm
						lab={form}
						setLab={setForm}
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
				what='laboratorium'
			/>
		</ListLayout>
	)
}

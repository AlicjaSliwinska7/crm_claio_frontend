// src/features/administration/pages/ShoppingListRegister.jsx
import React, { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// style „registers”
import '../../../shared/tables/styles/directories_lists_registers/index.css'

// modale
import { Modal, DeleteDialog } from '../../../shared/modals'

// wspólne listowe klocki (barrel)
import {
	ListLayout,
	SearchBar,
	AddButton,
	Pagination,
	ListSummary,
	ExportCsvButton,
	DataTableWithActions,
	useUrlPagination,
	useListQuery,
	useCsvExport,
	useListCrud,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
	editDeleteActions,
} from '../../../shared/tables'

// dodatkowe utilsy współdzielone
import { makeEmptyRecord } from '../../../shared/utils/records'
import { countBy, mapCountsToLabels } from '../../../shared/utils/arrays'

// formularz
import ShoppingForm from '../forms/ShoppingForm'

// konfiguracja (SSOT)
import {
	CATEGORIES,
	STATUSES,
	HEADER_COLS,
	CSV_COLUMNS,
	initialItems,
	catLabel,
	statusLabel,
	normalizeUrl,
	resolveCurrentUserName,
	validateItem,
	getSearchFields,
} from '../config/shopping.config'

// ========= Fabryka pustego rekordu =========
const makeEmptyItem = makeEmptyRecord(ctx => ({
	name: '',
	category: 'biuro',
	quantity: 1,
	link: '',
	status: 'todo',
	addedBy: ctx.currentUserName,
	note: '',
}))

export default function ShoppingListRegister({ currentUser }) {
	const currentUserName = resolveCurrentUserName(currentUser)

	// URL params
	const [searchParams, setSearchParams] = useSearchParams()

	// filtry UI
	const [filterCategory, setFilterCategory] = useState('all')
	const [filterStatus, setFilterStatus] = useState('all')

	// ===== CRUD =====
	const validate = useCallback(validateItem, [])

	const normalizeOnSave = useCallback(
		x => ({
			...x,
			name: (x.name || '').trim(),
			quantity: Math.max(1, parseInt(x.quantity, 10) || 1),
			link: normalizeUrl(x.link),
			addedBy: (x.addedBy || currentUserName).trim(),
		}),
		[currentUserName]
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
		initialItems,
		idKey: 'id',
		makeId: () => Date.now(),
		validate,
		normalizeOnSave,
	})

	// ===== Wyszukiwanie + sort =====
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(items, HEADER_COLS, {
		initialSort: { key: 'category', direction: 'asc' },
		getSearchFields,
	})

	// dodatkowe filtry kategorii i statusu
	const filteredByFilters = useMemo(
		() =>
			filteredSorted.filter(r => {
				if (filterCategory !== 'all' && r.category !== filterCategory) return false
				if (filterStatus !== 'all' && r.status !== filterStatus) return false
				return true
			}),
		[filteredSorted, filterCategory, filterStatus]
	)

	// ===== Paginacja (URL) =====
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByFilters, {
		pageSize: PAGE_SIZE,
		searchParams,
		setSearchParams,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// ===== CSV =====
	const csvRows = useMemo(
		() =>
			filteredByFilters.map(r => ({
				...r,
				category: catLabel(r.category),
				status: statusLabel(r.status),
			})),
		[filteredByFilters]
	)

	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: csvRows,
		filename: 'lista_zakupow.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// ===== Summary =====
	const total = filteredByFilters.length

	const catCountsLabeled = useMemo(() => {
		const raw = countBy(filteredByFilters, r => r.category)
		return mapCountsToLabels(raw, catLabel)
	}, [filteredByFilters])

	const summaryItems = useMemo(() => {
		const arr = [['Zamówienia', total]]
		for (const c of CATEGORIES) {
			const n = catCountsLabeled.get(c.label) || 0
			if (n > 0) arr.push([c.label, n])
		}
		return arr
	}, [total, catCountsLabeled])

	// ===== Render =====
	return (
		<ListLayout
			rootClassName='shopping-list'
			controlsClassName='shopping-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Szukaj w zakupach...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					<select
						value={filterCategory}
						onChange={e => {
							setFilterCategory(e.target.value)
							resetToFirstPage(true)
						}}
						className='training-filter-select'
						title='Filtr kategorii'
						aria-label='Filtr kategorii'>
						<option value='all'>Wszystkie kategorie</option>
						{CATEGORIES.map(c => (
							<option key={c.key} value={c.key}>
								{c.label}
							</option>
						))}
					</select>

					<select
						value={filterStatus}
						onChange={e => {
							setFilterStatus(e.target.value)
							resetToFirstPage(true)
						}}
						className='training-filter-select'
						title='Filtr statusu'
						aria-label='Filtr statusu'>
						<option value='all'>Wszystkie statusy</option>
						{STATUSES.map(s => (
							<option key={s.key} value={s.key}>
								{s.label}
							</option>
						))}
					</select>

					<AddButton
						className='add-contact-btn'
						label='Dodaj pozycję'
						onClick={() => openAdd(makeEmptyItem({ currentUserName }))}
					/>
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary ariaLabel='Podsumowanie listy zakupów' items={summaryItems} />
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
				actionsForRow={row =>
					editDeleteActions(
						() => openEdit(row.id),
						() => askDelete(row.id)
					)
				}
				actionsSticky
				ariaLabel='Tabela zakupów'
			/>

			{modalOpen && (
				<Modal title={isEditing ? 'Edytuj pozycję' : 'Dodaj pozycję'} onClose={closeModal} size='sm'>
					<ShoppingForm
						draft={form || makeEmptyItem({ currentUserName })}
						setDraft={setForm}
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

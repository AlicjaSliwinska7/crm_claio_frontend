// src/features/administration/pages/ShoppingListRegister.jsx
import React, { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

import { Modal, DeleteDialog } from '../../../shared/modals'

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

import { makeEmptyRecord } from '../../../shared/utils/records'
import { countBy, mapCountsToLabels } from '../../../shared/utils/arrays'

import ShoppingForm from '../forms/ShoppingForm'

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
	const [searchParams, setSearchParams] = useSearchParams()

	const [filterCategory, setFilterCategory] = useState('all')
	const [filterStatus, setFilterStatus] = useState('all')

	const normalizeOnSave = useCallback(
		x => ({
			...x,
			name: x.name.trim(),
			quantity: Math.max(1, Number(x.quantity) || 1),
			link: normalizeUrl(x.link),
			addedBy: x.addedBy || currentUserName,
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
		validate: validateItem,
		normalizeOnSave,
	})

	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(items, HEADER_COLS, {
		initialSort: { key: 'category', direction: 'asc' },
		getSearchFields,
	})

	const filtered = useMemo(
		() =>
			filteredSorted.filter(r => {
				if (filterCategory !== 'all' && r.category !== filterCategory) return false
				if (filterStatus !== 'all' && r.status !== filterStatus) return false
				return true
			}),
		[filteredSorted, filterCategory, filterStatus]
	)

	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filtered, {
		pageSize: PAGE_SIZE,
		searchParams,
		setSearchParams,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filtered.map(r => ({
			...r,
			category: catLabel(r.category),
			status: statusLabel(r.status),
		})),
		filename: 'lista_zakupow.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	const summaryItems = useMemo(() => {
		const total = filtered.length
		const counts = mapCountsToLabels(
			countBy(filtered, r => r.category),
			catLabel
		)

		const items = [['Pozycje', total]]
		for (const c of CATEGORIES) {
			const n = counts.get(c.label)
			if (n) items.push([c.label, n])
		}
		return items
	}, [filtered])

	return (
		<ListLayout
			rootClassName='shopping-list'
			controlsClassName='shopping-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Szukaj w zakupach...'
						onChange={v => {
							setSearchQuery(v)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					<select
						className='training-filter-select'
						value={filterCategory}
						onChange={e => {
							setFilterCategory(e.target.value)
							resetToFirstPage(true)
						}}>
						<option value='all'>Wszystkie kategorie</option>
						{CATEGORIES.map(c => (
							<option key={c.key} value={c.key}>
								{c.label}
							</option>
						))}
					</select>

					<select
						className='training-filter-select'
						value={filterStatus}
						onChange={e => {
							setFilterStatus(e.target.value)
							resetToFirstPage(true)
						}}>
						<option value='all'>Wszystkie statusy</option>
						{STATUSES.map(s => (
							<option key={s.key} value={s.key}>
								{s.label}
							</option>
						))}
					</select>

					<AddButton label='Dodaj pozycję' onClick={() => openAdd(makeEmptyItem({ currentUserName }))} />
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary items={summaryItems} />
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

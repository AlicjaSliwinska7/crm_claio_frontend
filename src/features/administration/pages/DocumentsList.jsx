// src/features/administration/pages/DocumentsList.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// style
import '../../../shared/tables/styles/directories_lists_registers/index.css'
import '../styles/documents.css'

// wspólne klocki
import {
	ListLayout,
	SearchBar,
	AddButton,
	Pagination,
	ListSummary,
	useListQuery,
	useUrlPagination,
	useCsvExport,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	AddBar,
	FileUploaderCompact,
	ExportCsvButton,
	DataTableWithActions,
	SCROLL_SELECTOR,
} from '../../../shared/tables'

// modale i add bar
import { DeleteDialog, InlineExpand } from '../../../shared/modals'

// utils
import { formatBytes } from '../../../shared/utils/formatBytes'

// konfiguracja (SSOT)
import {
	DOC_CATEGORIES,
	HEADER_COLS,
	fmtDateTime,
	validateNow,
	VALIDATION_DEFAULTS,
	CSV_COLUMNS,
	getSearchFields,
	INITIAL_DOCUMENTS,
} from '../config/documents.config'

export default function DocumentsList() {
	const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)

	const [searchParams, setSearchParams] = useSearchParams()
	const initialCat = searchParams.get('cat') || 'all'
	const [filterCategory, setFilterCategory] = useState(initialCat)

	const [openAdd, setOpenAdd] = useState(false)
	const [newDocName, setNewDocName] = useState('')
	const [newDocCategory, setNewDocCategory] = useState('inne')
	const [newFile, setNewFile] = useState(null)
	const [errors, setErrors] = useState({ name: '', file: '' })
	const pickedBlobUrlsRef = useRef(new Set())

	// 1) Wyszukiwanie + sortowanie
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(
		documents,
		HEADER_COLS,
		{
			initialSort: { key: 'addedAt', direction: 'desc' },
			getSearchFields,
		}
	)

	// 2) Filtrowanie po kategorii
	const filteredByCategory = useMemo(
		() => (filterCategory === 'all' ? filteredSorted : filteredSorted.filter(d => d?.category === filterCategory)),
		[filteredSorted, filterCategory]
	)

	// 3) Paginacja (URL)
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByCategory, {
		pageSize: PAGE_SIZE,
		searchParams,
		setSearchParams,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 4) Eksport CSV (bieżący widok)
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredByCategory,
		filename: 'dokumenty.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 5) Walidacja addbara
	const isFormValid =
		newDocName.trim().length >= VALIDATION_DEFAULTS.nameMin && !!newFile && !errors.name && !errors.file

	const handleAdd = () => {
		const errs = validateNow(newDocName, newFile)
		setErrors(errs)
		if (errs.name || errs.file) return

		const fileURL = URL.createObjectURL(newFile)
		pickedBlobUrlsRef.current.add(fileURL)

		setDocuments(prev => [
			...prev,
			{
				name: newDocName.trim(),
				category: newDocCategory,
				file: fileURL,
				fileName: newFile.name,
				fileSize: newFile.size,
				addedAt: new Date().toISOString(),
			},
		])

		setNewDocName('')
		setNewDocCategory('inne')
		setNewFile(null)
		setErrors({ name: '', file: '' })
		setOpenAdd(false)
		resetToFirstPage(true)
	}

	// 6) Usuwanie
	const [showDelete, setShowDelete] = useState(false)
	const [docToDelete, setDocToDelete] = useState(null)

	const askDelete = useCallback(row => {
		setDocToDelete(row)
		setShowDelete(true)
	}, [])

	const handleConfirmDelete = useCallback(() => {
		if (!docToDelete) return

		if (docToDelete.file?.startsWith('blob:')) {
			try {
				URL.revokeObjectURL(docToDelete.file)
			} catch {
				// ignore
			}
		}

		setDocuments(prev => prev.filter(d => d !== docToDelete))
		setShowDelete(false)
		setDocToDelete(null)
		resetToFirstPage(true)
	}, [docToDelete, resetToFirstPage])

	// 7) Sprzątanie blob: URL przy unmount
	useEffect(() => {
		return () => {
			pickedBlobUrlsRef.current.forEach(u => {
				try {
					URL.revokeObjectURL(u)
				} catch {
					// ignore
				}
			})
		}
	}, [])

	// 8) Sync filtra kategorii z URL
	useEffect(() => {
		const next = new URLSearchParams(searchParams)
		if (filterCategory !== 'all') next.set('cat', filterCategory)
		else next.delete('cat')
		setSearchParams(next, { replace: true })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterCategory])

	const delLabel = docToDelete?.name || ''

	const delInfo = docToDelete
		? [docToDelete.fileName, formatBytes(docToDelete.fileSize), fmtDateTime(docToDelete.addedAt)]
				.filter(Boolean)
				.join(' • ')
		: ''

	return (
		<ListLayout
			rootClassName='documents-list'
			controlsClassName='documents-list__controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź dokument...'
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
						aria-label='Filtr kategorii'>
						<option value='all'>Wszystkie kategorie</option>
						{DOC_CATEGORIES.map(c => (
							<option key={c.key} value={c.key}>
								{c.label}
							</option>
						))}
					</select>

					<AddButton
						className='add-document-btn'
						onClick={() => setOpenAdd(o => !o)}
						title={openAdd ? 'Zamknij pasek dodawania' : 'Dodaj dokument'}
						ariaLabel={openAdd ? 'Zamknij pasek dodawania' : 'Dodaj dokument'}
					/>
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary items={[['Dokumenty', filteredByCategory.length]]} ariaLabel='Podsumowanie' />
				</>
			}>
			{/* Pasek dodawania */}
			<InlineExpand open={openAdd} onClose={() => setOpenAdd(false)}>
				<AddBar
					open
					onSubmit={handleAdd}
					submitDisabled={!isFormValid}
					renderSubmit={({ disabled, onClick }) => (
						<AddButton
							onClick={onClick}
							disabled={disabled}
							className='addbar-submit'
							title='Dodaj dokument'
							ariaLabel='Dodaj dokument'
						/>
					)}>
					<div className='doc-name'>
						<input
							type='text'
							placeholder='Nazwa dokumentu'
							value={newDocName}
							onChange={e => {
								const value = e.target.value
								setNewDocName(value)
								setErrors(validateNow(value, newFile))
							}}
							className={errors.name ? 'input-error' : undefined}
						/>
						{errors.name && <small className='field-error'>{errors.name}</small>}
					</div>

					<select
						value={newDocCategory}
						onChange={e => setNewDocCategory(e.target.value)}
						className='training-filter-select'
						aria-label='Kategoria'>
						{DOC_CATEGORIES.map(c => (
							<option key={c.key} value={c.key}>
								{c.label}
							</option>
						))}
					</select>

					<FileUploaderCompact
						value={newFile}
						onChange={file => {
							setNewFile(file)
							setErrors(validateNow(newDocName, file))
						}}
						accept={VALIDATION_DEFAULTS.allowedExts.join(',')}
						error={errors.file}
					/>
				</AddBar>
			</InlineExpand>

			<DataTableWithActions
				columns={HEADER_COLS}
				rows={visible}
				sortConfig={sortConfig}
				setSortConfig={cfg => {
					setSortConfig(cfg)
					resetToFirstPage(true)
				}}
				/* ✅ bez onAfterSort – reset już jest wyżej */
				actionsForRow={row => [
					{ type: 'download', label: 'Pobierz', href: row.file || row.url },
					{ type: 'delete', label: 'Usuń', onClick: () => askDelete(row) },
				]}
				actionsSticky
				ariaLabel='Tabela dokumentów'
			/>

			<DeleteDialog
				open={showDelete}
				onConfirm={handleConfirmDelete}
				onClose={() => {
					setShowDelete(false)
					setDocToDelete(null)
				}}
				label={delLabel}
				what='dokument'
				customMessage={
					<>
						Na pewno chcesz usunąć dokument <strong>{delLabel}</strong>?
						<br />
						{delInfo && <span className='muted'>{delInfo}</span>}
					</>
				}
			/>
		</ListLayout>
	)
}

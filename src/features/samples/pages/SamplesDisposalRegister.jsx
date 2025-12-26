// src/features/sales/pages/SamplesDisposal.jsx
import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// wspólne klocki
import { ListLayout, ListSummary, Pagination, useUrlPagination, useCsvExport } from '../../../shared/tables'
import { sortRows } from '../../../shared/tables/utils/sorters'
import { buildTypeMap } from '../../../shared/tables/utils/columns'

// lokalne części (UI)
import { Controls, Table, ConfirmModal } from '../components/SamplesDisposal'

// konfiguracja (SSOT)
import {
	VIEW_ACTIVE,
	VIEW_ARCHIVE,
	PAGE_SIZE,
	todayISO,
	initialDisposal,
	initialDisposalArchive,
	csvColumnsFor,
	makeColumns,
} from '../config/samplesDisposal.config'

const toStr = v => (v ?? '').toString()

export default function SamplesDisposal({ disposal, setDisposal, disposalArchive, setDisposalArchive }) {
	// fallback na lokalny stan
	const [localDisposal, setLocalDisposal] = useState(initialDisposal)
	const [localArchive, setLocalArchive] = useState(initialDisposalArchive)

	const rowsActive = Array.isArray(disposal) ? disposal : localDisposal
	const rowsArchive = Array.isArray(disposalArchive) ? disposalArchive : localArchive

	const updateActive = setDisposal || setLocalDisposal
	const updateArchive = setDisposalArchive || setLocalArchive

	// sterowanie
	const [filter, setFilter] = useState('')
	const [view, setView] = useState(VIEW_ACTIVE)
	const [sortConfig, setSortConfig] = useState({ key: 'sampleNo', direction: 'asc' })
	const [sp, setSp] = useSearchParams()

	// modal potwierdzenia
	const [confirm, setConfirm] = useState({
		open: false,
		id: null,
		date: todayISO(),
	})

	// handlery przekazywane do kolumn
	const handlers = {
		openConfirm: row => setConfirm({ open: true, id: row.id, date: row.disposedAt || todayISO() }),
		patchArchive: (id, patch) => updateArchive(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r))),
		restoreToActive: id => {
			const row = rowsArchive.find(r => r.id === id)
			if (!row) return
			updateActive(prev => [{ ...row, disposed: false, disposedAt: '' }, ...prev])
			updateArchive(prev => prev.filter(r => r.id !== id))
		},
	}

	// kolumny dla obu widoków (linki wstrzykujemy tu, żeby nie importować react-router w configu)
	const COLS_BY_VIEW = useMemo(
		() => makeColumns({ LinkCmp: Link, handlers }),
		// uwaga: handlers używa rowsArchive, więc jeśli chcesz super-ścisłej zależności, można dołączyć rowsArchive,
		// ale w codziennym użyciu nie jest to konieczne – update robi się w handlerach
		[]
	)

	const COLS = COLS_BY_VIEW[view] || []

	// aktualna lista (aktywny widok)
	const currentRows = view === VIEW_ACTIVE ? rowsActive : rowsArchive

	// filtr + sort
	const filteredAndSorted = useMemo(() => {
		const q = String(filter || '').toLowerCase()

		const base = (currentRows || []).filter(r =>
			Object.values(r)
				.map(v => toStr(typeof v === 'object' ? JSON.stringify(v) : v))
				.join(' ')
				.toLowerCase()
				.includes(q)
		)

		const typeMap = buildTypeMap(COLS)

		return sortConfig.key ? sortRows(base, sortConfig, typeMap) : base
	}, [currentRows, filter, sortConfig, COLS])

	// podsumowanie
	const summaryItems = useMemo(() => {
		const q = String(filter || '').toLowerCase()
		const matches = r =>
			Object.values(r)
				.map(v => toStr(typeof v === 'object' ? JSON.stringify(v) : v))
				.join(' ')
				.toLowerCase()
				.includes(q)

		const toDispose = (rowsActive || []).filter(r => !r.disposed && matches(r)).length
		const disposed = (rowsArchive || []).filter(r => !!r.disposed && matches(r)).length
		const all = toDispose + disposed

		return [
			['Wszystkie', all],
			['Do utylizacji', toDispose],
			['Zutylizowane', disposed],
		]
	}, [rowsActive, rowsArchive, filter])

	// paginacja
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredAndSorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: '.table-container, .samplesDisposal-list',
		canonicalize: true,
	})

	// CSV
	const csvColumns = useMemo(() => csvColumnsFor(view), [view])
	const exportCSV = useCsvExport({
		columns: csvColumns,
		rows: filteredAndSorted.map(r => ({
			...r,
			disposed: typeof r.disposed === 'boolean' ? (r.disposed ? 'tak' : 'nie') : r.disposed,
		})),
		filename: view === VIEW_ACTIVE ? 'do_utylizacji.csv' : 'zutylizowane.csv',
		delimiter: ';',
		includeHeader: true,
		addBOM: true,
	})

	// potwierdzenie
	const closeConfirm = () => setConfirm({ open: false, id: null, date: todayISO() })

	const confirmProceed = () => {
		if (!confirm.date) {
			// zachowujemy dotychczasowe zachowanie (alert)
			alert('Wybierz datę utylizacji.')
			return
		}
		const row = rowsActive.find(r => r.id === confirm.id)
		if (!row) {
			closeConfirm()
			return
		}
		// przenosimy do archiwum
		// 1) dodaj do archiwum
		updateArchive(prev => [{ ...row, disposed: true, disposedAt: confirm.date }, ...prev.filter(x => x.id !== row.id)])
		// 2) usuń z aktywnych
		updateActive(prev => prev.filter(r => r.id !== row.id))
		closeConfirm()
	}

	return (
		<ListLayout
			rootClassName='samplesDisposal-list'
			controlsClassName='samplesDisposal-controls'
			controls={
				<Controls
					filter={filter}
					setFilter={setFilter}
					view={view}
					setView={setView}
					resetToFirstPage={resetToFirstPage}
					setSortConfig={setSortConfig}
					VIEW_ACTIVE={VIEW_ACTIVE}
					VIEW_ARCHIVE={VIEW_ARCHIVE}
				/>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<button
							className='download-btn download-btn--primary'
							onClick={exportCSV}
							title='Eksportuj CSV'
							aria-label='Eksportuj CSV'>
							<i className='fa-solid fa-file-export' />
						</button>
					</div>

					<ListSummary ariaLabel='Zestawienie próbek (utylizacja)' items={summaryItems} />
				</>
			}>
			<Table
				COLS={COLS}
				visible={visible}
				sortConfig={sortConfig}
				setSortConfig={setSortConfig}
				resetToFirstPage={resetToFirstPage}
				toStr={toStr}
			/>

			<ConfirmModal
				open={confirm.open}
				date={confirm.date}
				setDate={d => setConfirm(c => ({ ...c, date: d }))}
				onConfirm={confirmProceed}
				onClose={closeConfirm}
			/>
		</ListLayout>
	)
}

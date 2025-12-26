import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

// wspólne klocki
import {
	ListLayout,
	SearchBar,
	Pagination,
	EmptyStateRow,
	SortableTh,
	ActionsHeader,
	ActionsCell,
	ListSummary,
	useUrlPagination,
	useCsvExport,
} from '../../../shared/tables'

import { sortRows } from '../../../shared/tables/utils/sorters'
import { buildTypeMap } from '../../../shared/tables/utils/columns'
import { CircleX, FileText } from '../../../shared/modals/ui/icons/icons'

// stałe modułu (filtry, formatery)
import { PAGE_SIZE, STATUS_DEFS, OUTCOME_DEFS, fmtDate, norm, toStr } from '../components/constants'

// nowy config
import { initialTests, makeTestsColumns, CSV_COLUMNS } from '../config/testsRegistry.config'

export default function TestsRegistry() {
	const navigate = useNavigate()

	// dane (docelowo fetch → setRows)
	const [rows] = useState(initialTests)

	// filtry
	const [filter, setFilter] = useState('')
	const [filterStatus, setFilterStatus] = useState('wszystkie')
	const [filterOutcome, setFilterOutcome] = useState('wszystkie')
	const [startOn, setStartOn] = useState('')
	const [endOn, setEndOn] = useState('')

	// sort
	const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' })

	// ?page=
	const [sp, setSp] = useSearchParams()

	// kolumny – wstrzykujemy Link
	const HEADER_COLS = useMemo(() => makeTestsColumns(Link), [])

	// nawigacja do programu badań
	const goToProgram = r => navigate(`/badania/rejestr-badan/PB/${encodeURIComponent(r.orderNo || r.id)}`)

	// filtr + sort
	const filteredAndSorted = useMemo(() => {
		const q = norm(filter)

		const base = (rows || []).filter(r => {
			const searchable = [
				r.id,
				r.orderNo,
				r.client,
				r.subject,
				r.standard,
				r.method,
				r.methodPoint,
				...(r.samples || []),
			]
				.map(toStr)
				.join(' ')
				.toLowerCase()

			const matchesText = searchable.includes(q)
			const matchesStatus = filterStatus === 'wszystkie' ? true : norm(r.status) === norm(filterStatus)
			const matchesOutcome = filterOutcome === 'wszystkie' ? true : norm(r.outcome) === norm(filterOutcome)

			const matchesStart = startOn ? (r.startDate || '').slice(0, 10) === startOn : true
			const matchesEnd = endOn ? (r.endDate || '').slice(0, 10) === endOn : true

			return matchesText && matchesStatus && matchesOutcome && matchesStart && matchesEnd
		})

		const typeMap = buildTypeMap(HEADER_COLS)

		return sortConfig.key ? sortRows(base, sortConfig, typeMap) : base
	}, [rows, filter, filterStatus, filterOutcome, startOn, endOn, sortConfig, HEADER_COLS])

	// podsumowania
	const statusSummaryItems = useMemo(() => {
		const counts = new Map(STATUS_DEFS.map(s => [s.key, 0]))
		for (const r of filteredAndSorted) {
			const k = norm(r.status)
			if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
		}
		const items = [['Badania', filteredAndSorted.length]]
		STATUS_DEFS.forEach(s => {
			const n = counts.get(s.key) || 0
			if (n > 0) items.push([s.label, n])
		})
		return items
	}, [filteredAndSorted])

	const outcomeSummaryItems = useMemo(() => {
		const counts = new Map(OUTCOME_DEFS.map(o => [o.key, 0]))
		for (const r of filteredAndSorted) {
			const k = norm(r.outcome)
			if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1)
		}
		const items = [['Badania', filteredAndSorted.length]]
		OUTCOME_DEFS.forEach(o => {
			const n = counts.get(o.key) || 0
			if (n > 0) items.push([o.label, n])
		})
		return items
	}, [filteredAndSorted])

	// paginacja
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredAndSorted, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: '.table-container, .tests-list',
		canonicalize: true,
	})

	// CSV – identyczne kolumny jak w oryginale
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: useMemo(
			() =>
				filteredAndSorted.map(r => ({
					...r,
					samples: (r.samples || []).join(', '),
					samplesCount: r.samplesCount ?? (r.samples?.length || 0),
					startDate: fmtDate(r.startDate),
					endDate: fmtDate(r.endDate),
				})),
			[filteredAndSorted]
		),
		filename: 'rejestr_badan.csv',
		delimiter: ';',
		includeHeader: true,
		addBOM: true,
	})

	return (
		<ListLayout
			rootClassName='tests-list'
			controlsClassName='tests-controls'
			controls={
				<div style={{ display: 'grid', gap: 8 }}>
					{/* rząd 1: search */}
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
						<SearchBar
							value={filter}
							placeholder='Znajdź badanie...'
							onChange={val => {
								setFilter(val)
								resetToFirstPage(true)
							}}
							onClear={() => {
								setFilter('')
								resetToFirstPage(true)
							}}
						/>
					</div>

					{/* rząd 2: filtry */}
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
						<select
							className='training-filter-select'
							value={filterStatus}
							onChange={e => {
								setFilterStatus(e.target.value)
								resetToFirstPage(true)
							}}
							title='Filtr statusu'
							style={{ minWidth: 180 }}>
							<option value='wszystkie'>Wszystkie statusy</option>
							{STATUS_DEFS.map(s => (
								<option key={s.key} value={s.key}>
									{s.label}
								</option>
							))}
						</select>

						<select
							className='training-filter-select'
							value={filterOutcome}
							onChange={e => {
								setFilterOutcome(e.target.value)
								resetToFirstPage(true)
							}}
							title='Filtr wyniku'
							style={{ minWidth: 160 }}>
							<option value='wszystkie'>Wszystkie wyniki</option>
							{OUTCOME_DEFS.map(o => (
								<option key={o.key} value={o.key}>
									{o.label}
								</option>
							))}
						</select>

						{/* daty */}
						<div className='ts-control' style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
							<label htmlFor='filter-startOn' className='muted' style={{ fontSize: 12 }}>
								Data rozpoczęcia
							</label>
							<input
								id='filter-startOn'
								type='date'
								className='search-bar ts-date'
								value={startOn}
								onChange={e => {
									setStartOn(e.target.value)
									resetToFirstPage(true)
								}}
								title='Data rozpoczęcia'
								style={{ minWidth: 160 }}
							/>
						</div>

						<div className='ts-control' style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
							<label htmlFor='filter-endOn' className='muted' style={{ fontSize: 12 }}>
								Data zakończenia
							</label>
							<input
								id='filter-endOn'
								type='date'
								className='search-bar ts-date'
								value={endOn}
								onChange={e => {
									setEndOn(e.target.value)
									resetToFirstPage(true)
								}}
								title='Data zakończenia'
								style={{ minWidth: 160 }}
							/>
						</div>

						{/* reset */}
						<button
							type='button'
							className='reset-filters-button'
							onClick={() => {
								setFilter('')
								setFilterStatus('wszystkie')
								setFilterOutcome('wszystkie')
								setStartOn('')
								setEndOn('')
								resetToFirstPage(true)
							}}
							title='Wyczyść filtry'
							aria-label='Wyczyść filtry'
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: 34,
								width: 38,
								borderRadius: 8,
							}}>
							<CircleX size={20} strokeWidth={2} />
							<span className='sr-only'>Wyczyść</span>
						</button>
					</div>
				</div>
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

					<div
						className='list-summary'
						role='status'
						aria-label='Podsumowanie rejestru badań'
						style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
						<ListSummary ariaLabel='Podsumowanie rejestru badań (statusy)' items={statusSummaryItems} />
						<ListSummary ariaLabel='Podsumowanie rejestru badań (wyniki)' items={outcomeSummaryItems} />
					</div>
				</>
			}>
			<table className='data-table' aria-label='Rejestr badań'>
				<colgroup>
					{HEADER_COLS.map(col => (
						<col key={col.key} />
					))}
					<col className='col-actions' />
				</colgroup>

				<thead>
					<tr>
						{HEADER_COLS.map(col =>
							col.sortable ? (
								<SortableTh
									key={col.key}
									columnKey={col.key}
									label={col.label}
									sortConfig={sortConfig}
									setSortConfig={setSortConfig}
									onAfterSort={() => resetToFirstPage(true)}
									className={col.align === 'left' ? 'text-left' : undefined}
								/>
							) : (
								<th key={col.key} className={col.align === 'left' ? 'text-left' : undefined}>
									{col.label}
								</th>
							)
						)}
						<ActionsHeader className='actions-col' />
					</tr>
				</thead>

				<tbody>
					{visible.map(r => (
						<tr
							key={r.id}
							className='row-clickable'
							onClick={() => goToProgram(r)}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									goToProgram(r)
								}
							}}
							tabIndex={0}
							role='button'
							aria-label={`Przejdź do Programu Badań dla ${r.orderNo || r.id}`}
							title='Kliknij, aby przejść do Programu Badań'
							style={{ cursor: 'pointer' }}>
							{HEADER_COLS.map(col => (
								<td key={col.key} className={col.align === 'left' ? 'text-left' : undefined}>
									{col.render ? col.render(r) : toStr(r[col.key] ?? '—')}
								</td>
							))}

							<ActionsCell
								actions={[
									{
										type: 'link',
										label: 'Program badań',
										href: `/badania/rejestr-badan/PB/${encodeURIComponent(r.orderNo || r.id)}`,
										title: 'Przejdź do Programu Badań',
										icon: FileText,
									},
								]}
								onActionClick={e => e.stopPropagation()}
							/>
						</tr>
					))}

					{visible.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
				</tbody>
			</table>
		</ListLayout>
	)
}

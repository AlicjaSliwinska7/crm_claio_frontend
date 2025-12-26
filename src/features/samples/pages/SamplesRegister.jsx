import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// wspólne klocki z barrel'a
import {
	ListLayout,
	SearchBar,
	ListSummary,
	Pagination,
	SortableTh,
	ActionsHeader,
	EmptyStateRow,
	ExportCsvButton,

	// hooki / utils
	useUrlPagination,
	useCsvExport,
	useListQuery,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
	getColStyle,
	makeSearchFields,
} from '../../../shared/tables'

// SSOT rejestru próbek
import {
	HEADER_COLS,
	CSV_COLUMNS,
	SAMPLE_STATUSES,
	initialSamples,
	normalizeOnLoad,
	statusLabel,
} from '../config/samples.config'

const toStr = v => (v ?? '').toString()

export default function SamplesRegister({ samples = [] }) {
	// 1) Dane wejściowe (fallback do demka z configu)
	const rows = useMemo(() => normalizeOnLoad(samples.length ? samples : initialSamples), [samples])

	// 2) Wyszukiwanie + sortowanie
	const getSearchFields = useCallback(
		makeSearchFields(
			'receivedDate',
			'orderNo',
			'code',
			'sampleNo',
			'item',
			r => String(r.qty ?? ''),
			'client',
			'scope',
			'afterTest',
			'notes',
			'status',
			'returnDate',
			'comment'
		),
		[]
	)

	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(rows, HEADER_COLS, {
		initialSort: { key: 'receivedDate', direction: 'desc' },
		getSearchFields,
	})

	// 3) Dodatkowy filtr statusu — identyczne stylowanie jak w Trainings/Documents
	const [filterStatus, setFilterStatus] = useState('wszystkie')

	const filtered = useMemo(() => {
		if (filterStatus === 'wszystkie') return filteredSorted
		return filteredSorted.filter(r => r.status === filterStatus)
	}, [filteredSorted, filterStatus])

	// 4) Paginacja (URL)
	const [sp, setSp] = useSearchParams()
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filtered, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 5) CSV (bieżący widok)
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filtered,
		filename: 'rejestr_probek.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 6) Podsumowanie po statusach (na SAMYM DOLE)
	const statusSummaryItems = useMemo(() => {
		const map = new Map(SAMPLE_STATUSES.map(s => [s.key, 0]))
		for (const r of filtered) {
			if (map.has(r.status)) map.set(r.status, (map.get(r.status) || 0) + 1)
		}
		return [['Próbki', filtered.length], ...SAMPLE_STATUSES.map(s => [s.label, map.get(s.key) || 0])]
	}, [filtered])

	return (
		<ListLayout
			rootClassName='samplesRegister-list'
			controlsClassName='samplesRegister-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Szukaj w rejestrze próbek...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					{/* Filtr statusu — identyczny markup/klasy jak w innych listach */}
					<select
						value={filterStatus}
						onChange={e => {
							setFilterStatus(e.target.value)
							resetToFirstPage(true)
						}}
						className='training-filter-select'
						title='Filtr statusu próbek'
						aria-label='Filtr statusu próbek'>
						<option value='wszystkie'>Wszystkie statusy</option>
						{SAMPLE_STATUSES.map(s => (
							<option key={s.key} value={s.key}>
								{s.label}
							</option>
						))}
					</select>
				</>
			}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
						<ExportCsvButton onClick={exportCSV} iconOnly />
					</div>

					<ListSummary ariaLabel='Zestawienie próbek po statusach (bieżący widok)' items={statusSummaryItems} />
				</>
			}>
			{/* Tabela zgodna z patternem Registers */}
			<div className='table-container'>
				<table className='data-table' aria-label='Tabela rejestru próbek'>
					<colgroup>
						{HEADER_COLS.map(c => (
							<col key={c.key} style={getColStyle(c)} />
						))}
						{/* brak akcji kolumnowych w wierszu — więc bez col-actions */}
					</colgroup>

					<thead>
						<tr>
							{HEADER_COLS.map(col =>
								col.sortable === false ? (
									<th key={col.key} className={col.align ? `align-${col.align}` : undefined} title={col.title}>
										<span className='th-label'>{col.label}</span>
									</th>
								) : (
									<SortableTh
										key={col.key}
										columnKey={col.key}
										label={col.label}
										align={col.align}
										sortConfig={sortConfig}
										setSortConfig={cfg => {
											setSortConfig(cfg)
											resetToFirstPage(true)
										}}
										onAfterSort={() => resetToFirstPage(true)}
									/>
								)
							)}
							{/* tu nie dodajemy <ActionsHeader />, bo nie ma akcji wierszowych */}
						</tr>
					</thead>

					<tbody>
						{visible.map(row => (
							<tr key={row.id}>
								{HEADER_COLS.map(col => (
									<td
										key={col.key}
										className={col.align ? `align-${col.align}` : undefined}
										title={col.titleAccessor ? col.titleAccessor(row) : undefined}>
										{col.render ? col.render(row[col.key], row) : toStr(row[col.key])}
									</td>
								))}
							</tr>
						))}

						{visible.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length} />}
					</tbody>
				</table>
			</div>
		</ListLayout>
	)
}

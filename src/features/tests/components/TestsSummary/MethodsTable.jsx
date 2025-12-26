// src/features/tests/components/TestsSummary/MethodsTable.jsx
import React, { useMemo, memo } from 'react'
import PropTypes from 'prop-types'
import { Table as TableIcon, Search } from 'lucide-react'

import {
	Section,
	ExportCsvButton,
	SummaryPagination,
	summaryFormatters, // { fmtPLN, fmtDatePL, isoDate }
} from '../../../../shared/summaries'

/**
 * Tabela metod + filtr akredytacji + wyszukiwarka + paginacja + eksport CSV.
 * Spójna wizualnie: nagłówki sekcji jak w EquipmentSummary (es-*),
 * kontrolki i tabela jak w TestsSummary (tss-*).
 */
function MethodsTable({
	// dane
	rows = [],
	tableRows = [],

	// kontrolki
	filter = '',
	setFilter = () => {},
	accrFilter = 'wszystkie',
	setAccrFilter = () => {},
	sortField = null,
	setSortField = () => {},
	sortAsc = true,
	setSortAsc = () => {},

	// paginacja (sterowana z zewnątrz – zachowujemy API)
	mPage = 1,
	setMPage = () => {},
	mPageSize = 10,
	setMPageSize = () => {},

	// opcjonalnie własny formatter PLN
	fmtPLN = summaryFormatters.fmtPLN,
}) {
	const { fmtDatePL, isoDate } = summaryFormatters

	// ── gwarancje tablic
	const safeRows = Array.isArray(rows) ? rows : []
	const safeTableRows = Array.isArray(tableRows) ? tableRows : safeRows

	// ── sort helpers
	const handleSort = f => {
		if (sortField === f) setSortAsc(p => !p)
		else {
			setSortField(f)
			setSortAsc(true)
		}
	}
	const sortArrow = f => (sortField === f ? (sortAsc ? ' ▲' : ' ▼') : '')

	// kolumny liczbowe – precyzyjniejszy comparator
	const numericCols = useMemo(() => new Set(['testsCount', 'samplesCount', 'avgTATDays', 'revenue', 'laborCost']), [])

	const sortedRows = useMemo(() => {
		if (!sortField) return safeTableRows
		const arr = [...safeTableRows]
		const cmp = (a, b) => {
			const va = a?.[sortField]
			const vb = b?.[sortField]
			if (numericCols.has(sortField)) {
				const na = Number(va) || 0
				const nb = Number(vb) || 0
				return na - nb
			}
			const sa = String(va ?? '')
			const sb = String(vb ?? '')
			return sa.localeCompare(sb, 'pl')
		}
		arr.sort((a, b) => (sortAsc ? cmp(a, b) : cmp(b, a)))
		return arr
	}, [safeTableRows, sortField, sortAsc, numericCols])

	// ── paginacja
	const mTotal = sortedRows.length
	const pageSize = mPageSize || 10
	const mTotalPages = Math.max(1, Math.ceil(mTotal / pageSize))
	const page = Math.min(Math.max(1, mPage || 1), mTotalPages)

	const mStart = (page - 1) * pageSize
	const mEnd = Math.min(mTotal, mStart + pageSize)

	const mVisibleRows = useMemo(() => sortedRows.slice(mStart, mEnd), [sortedRows, mStart, mEnd])

	const rangeLabel = mTotal > 0 ? `Wiersze ${mStart + 1}–${mEnd} z ${mTotal}` : 'Brak wierszy do wyświetlenia'

	// ── kolumny CSV
	const csvColumns = useMemo(
		() => [
			{ key: 'standard', label: 'Norma/Dokument' },
			{ key: 'methodNo', label: 'Nr metody' },
			{ key: 'methodName', label: 'Nazwa metody' },
			{ key: 'accredited', label: 'Akredytowana', fmt: v => (v ? 'Tak' : 'Nie') },
			{ key: 'testsCount', label: 'Liczba badań' },
			{ key: 'samplesCount', label: 'Liczba próbek' },
			{ key: 'lastPerformedDate', label: 'Ostatnie wykonanie', fmt: v => (v ? fmtDatePL(v) : '') },
			{ key: 'avgTATDays', label: 'Śr. TAT [dni]', fmt: v => (v != null ? Number(v).toFixed(1) : '') },
			{ key: 'revenue', label: 'Przychód [PLN]', fmt: v => fmtPLN(v) },
			{ key: 'laborCost', label: 'Koszt RH [PLN]', fmt: v => fmtPLN(v) },
		],
		[fmtDatePL, fmtPLN]
	)

	// ── aria-sort helper
	const ariaSort = col => (sortField !== col ? 'none' : sortAsc ? 'ascending' : 'descending')

	// ── actions
	const actions = (
		<ExportCsvButton
			filename='metody_badawcze.csv'
			columns={csvColumns}
			rows={sortedRows}
			title='Eksportuj CSV (wszystkie)'
			ariaLabel='Eksportuj CSV (wszystkie)'
			className='tss-btn tss-btn--export tss-btn--icon'
		/>
	)

	return (
		<Section title='Metody badawcze' icon={<TableIcon className='es-headIcon' aria-hidden='true' />} actions={actions}>
			{/* Kontrolki nad tabelą */}
			<div
				className='es-panel-controls'
				style={{
					gap: '8px 10px',
					justifyContent: 'flex-start',
					alignItems: 'flex-end',
				}}>
				<div className='es-col' style={{ width: 340 }}>
					<label className='es-label' htmlFor='methods-search'>
						Szukaj normy / metody
					</label>
					<div className='tss-search__box tss-search__box--limit'>
						<span className='tss-search__icon' aria-hidden='true'>
							<Search size={16} />
						</span>
						<input
							id='methods-search'
							type='text'
							className='tss-input tss-input--search'
							placeholder='np. ISO 527 lub PB-101'
							value={filter}
							onChange={e => setFilter(e.target.value)}
							name='methods-search'
							aria-label='Szukaj metody badawczej'
						/>
					</div>
				</div>

				<div className='es-col' style={{ width: 200 }}>
					<label className='es-label' htmlFor='accr-filter'>
						Akredytacja
					</label>
					<select
						id='accr-filter'
						className='tss-select'
						title='Filtr akredytacji'
						value={accrFilter}
						onChange={e => setAccrFilter(e.target.value)}>
						<option value='wszystkie'>Wszystkie</option>
						<option value='akredytowane'>Akredytowane</option>
						<option value='nieakredytowane'>Nieakredytowane</option>
					</select>
				</div>
			</div>

			{/* Tabela */}
			<div className='tss-table-wrap'>
				<table className='tss-table' style={{ minWidth: '100%' }}>
					<thead>
						<tr>
							<th onClick={() => handleSort('standard')} title='Sortuj' aria-sort={ariaSort('standard')}>
								Norma/dokument{sortArrow('standard')}
							</th>
							<th
								onClick={() => handleSort('methodNo')}
								title='Sortuj'
								aria-sort={ariaSort('methodNo')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Nr metody{sortArrow('methodNo')}
							</th>
							<th onClick={() => handleSort('methodName')} title='Sortuj' aria-sort={ariaSort('methodName')}>
								Nazwa metody{sortArrow('methodName')}
							</th>
							<th
								onClick={() => handleSort('accredited')}
								title='Sortuj'
								aria-sort={ariaSort('accredited')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Akredytacja{sortArrow('accredited')}
							</th>
							<th
								onClick={() => handleSort('testsCount')}
								title='Sortuj'
								aria-sort={ariaSort('testsCount')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Badania{sortArrow('testsCount')}
							</th>
							<th
								onClick={() => handleSort('samplesCount')}
								title='Sortuj'
								aria-sort={ariaSort('samplesCount')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Próbek{sortArrow('samplesCount')}
							</th>
							<th
								onClick={() => handleSort('lastPerformedDate')}
								title='Sortuj'
								aria-sort={ariaSort('lastPerformedDate')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Ostatnie wykonanie{sortArrow('lastPerformedDate')}
							</th>
							<th
								onClick={() => handleSort('avgTATDays')}
								title='Sortuj'
								aria-sort={ariaSort('avgTATDays')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Śr. TAT [dni]{sortArrow('avgTATDays')}
							</th>
							<th
								onClick={() => handleSort('revenue')}
								title='Sortuj'
								aria-sort={ariaSort('revenue')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Przychód{sortArrow('revenue')}
							</th>
							<th
								onClick={() => handleSort('laborCost')}
								title='Sortuj'
								aria-sort={ariaSort('laborCost')}
								style={{ width: '1%', whiteSpace: 'nowrap' }}>
								Koszt RH{sortArrow('laborCost')}
							</th>
						</tr>
					</thead>

					<tbody>
						{mVisibleRows.length > 0 ? (
							mVisibleRows.map(row => (
								<tr key={row.id || `${row.methodNo}-${row.standard}`}>
									<td title={row.standard}>{row.standard}</td>
									<td style={{ whiteSpace: 'nowrap' }}>{row.methodNo}</td>
									<td title={row.methodName}>{row.methodName || '—'}</td>
									<td>{row.accredited ? 'Tak' : 'Nie'}</td>
									<td>{row.testsCount ?? 0}</td>
									<td>{row.samplesCount ?? 0}</td>
									<td>
										{row.lastPerformedDate ? (
											<time dateTime={isoDate(row.lastPerformedDate)}>{fmtDatePL(row.lastPerformedDate)}</time>
										) : (
											'—'
										)}
									</td>
									<td>{row.avgTATDays != null ? Number(row.avgTATDays).toFixed(1) : '—'}</td>
									<td>{fmtPLN(row.revenue)}</td>
									<td>{fmtPLN(row.laborCost)}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={10} className='tss-empty'>
									Brak wyników.
								</td>
							</tr>
						)}
					</tbody>
				</table>

				{/* Paginacja */}
				<div className='tss-pagination'>
					<div className='tss-pagination__info'>{rangeLabel}</div>
					<SummaryPagination
						page={page}
						setPage={setMPage}
						totalPages={mTotalPages}
						pageSize={pageSize}
						setPageSize={setMPageSize}
						options={[10, 20, 50, 100]}
					/>
				</div>
			</div>
		</Section>
	)
}

MethodsTable.propTypes = {
	rows: PropTypes.array,
	tableRows: PropTypes.array,
	filter: PropTypes.string,
	setFilter: PropTypes.func,
	accrFilter: PropTypes.string,
	setAccrFilter: PropTypes.func,
	sortField: PropTypes.string,
	setSortField: PropTypes.func,
	sortAsc: PropTypes.bool,
	setSortAsc: PropTypes.func,
	mPage: PropTypes.number,
	setMPage: PropTypes.func,
	mPageSize: PropTypes.number,
	setMPageSize: PropTypes.func,
	fmtPLN: PropTypes.func,
}

export default memo(MethodsTable)

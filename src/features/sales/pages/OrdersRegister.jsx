// src/features/sales/pages/OrdersRegister.jsx
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import '../../../shared/tables/styles/directories_lists_registers/index.css'

// wspólne komponenty
import {
	ListLayout,
	SearchBar,
	Pagination,
	ListSummary,
	HeaderRow,
	ActionsHeader,
	EmptyStateRow,
	ExportCsvButton,

	// hooki i utils
	useListQuery,
	useUrlPagination,
	useCsvExport,
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
	getColStyle,
} from '../../../shared/tables'

// przyciski akcji (nasz lekki komponent)
import RowActionsButtons from '../../../shared/tables/components/RowActionsButtons'

// konfiguracja SSOT
import {
	HEADER_COLS,
	CSV_COLUMNS,
	STAGES,
	initialOrders,
	normalizeOnLoad,
	getSearchFields,
} from '../config/orders.config'

export default function OrdersRegister() {
	const navigate = useNavigate()
	const [sp, setSp] = useSearchParams()

	// filtr etapu
	const [filterStage, setFilterStage] = useState('wszystkie')

	// 1️⃣ dane (docelowo backend)
	const orders = useMemo(() => normalizeOnLoad(initialOrders), [])

	// 2️⃣ wyszukiwanie + sortowanie
	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(orders, HEADER_COLS, {
		initialSort: { key: 'date', direction: 'desc' },
		getSearchFields,
	})

	// 3️⃣ filtr etapu
	const filteredByStage = useMemo(
		() => filteredSorted.filter(r => (filterStage === 'wszystkie' ? true : r.stage === filterStage)),
		[filteredSorted, filterStage]
	)

	// 4️⃣ paginacja
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByStage, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 5️⃣ eksport CSV
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredByStage,
		filename: 'zlecenia.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 6️⃣ podsumowanie
	const stageSummaryItems = useMemo(() => {
		const map = new Map(STAGES.map(s => [s, 0]))
		for (const o of filteredByStage) {
			if (map.has(o.stage)) {
				map.set(o.stage, (map.get(o.stage) || 0) + 1)
			}
		}
		return [['Zlecenia', filteredByStage.length], ...Array.from(map.entries())]
	}, [filteredByStage])

	// 7️⃣ klik w wiersz → formularz zlecenia
	const handleRowClick = useCallback(
		id => navigate(`/sprzedaz/rejestr-zlecen/${encodeURIComponent(id)}/formularz`),
		[navigate]
	)

	return (
		<ListLayout
			rootClassName='ordersRegister-list'
			controlsClassName='ordersRegister-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź zlecenie...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					{/* filtr etapu — shared wygląd */}
					<select
						value={filterStage}
						onChange={e => {
							setFilterStage(e.target.value)
							resetToFirstPage(true)
						}}
						className='training-filter-select'
						title='Filtruj po etapie'
						aria-label='Filtruj po etapie'>
						<option value='wszystkie'>Wszystkie etapy</option>
						{STAGES.map(s => (
							<option key={s} value={s}>
								{s}
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

					<ListSummary ariaLabel='Zestawienie zleceń po etapach' items={stageSummaryItems} />
				</>
			}>
			<div className='table-container'>
				<table className='data-table' aria-label='Tabela rejestru zleceń'>
					<colgroup>
						{HEADER_COLS.map(c => (
							<col key={c.key} style={getColStyle(c)} />
						))}
						{/* kolumna akcji → formularz */}
						<col className='col-actions' />
					</colgroup>

					<thead>
						<HeaderRow
							columns={HEADER_COLS}
							sortConfig={sortConfig}
							setSortConfig={cfg => {
								setSortConfig(cfg)
								resetToFirstPage(true)
							}}
							onAfterSort={() => resetToFirstPage(true)}
							renderActionsHeader={() => <ActionsHeader className='actions-col' />}
						/>
					</thead>

					<tbody>
						{visible.map(row => (
							<tr
								key={row.id}
								className='row-clickable'
								onClick={() => handleRowClick(row.id)}
								title='Przejdź do formularza zlecenia'>
								{HEADER_COLS.map(col => (
									<td
										key={col.key}
										className={col.align ? `align-${col.align}` : undefined}
										title={col.titleAccessor ? col.titleAccessor(row) : undefined}>
										{col.render ? col.render(row[col.key], row) : row[col.key]}
									</td>
								))}

								{/* IKONA FORMULARZA – z RowActionsButtons */}
								<td
									className='actions-col'
									// dodatkowy safeguard, ale RowActionsButtons i tak ma stopPropagation
									onClick={e => e.stopPropagation()}>
									<RowActionsButtons onForm={() => handleRowClick(row.id)} titles={{ form: 'Formularz zlecenia' }} />
								</td>
							</tr>
						))}

						{visible.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
					</tbody>
				</table>
			</div>
		</ListLayout>
	)
}

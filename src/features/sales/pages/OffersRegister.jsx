// src/features/sales/pages/OffersRegister.jsx
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Wspólne klocki z beczki (spójnie z Appointments/Trainings)
import {
	// layout + pasek narzędzi
	ListLayout,
	SearchBar,

	// tabela i akcje
	Pagination,
	ListSummary,
	ExportCsvButton,
	DataTableWithActions,

	// hooki / utils list
	useListQuery,
	useUrlPagination,
	useCsvExport,

	// stałe wspólne
	PAGE_SIZE,
	CSV_DELIMITER,
	CSV_BOM,
	SCROLL_SELECTOR,
} from '../../../shared/tables'

// Konfiguracja ofert (SSOT)
import { HEADER_COLS, STATUS_DEFS, CSV_COLUMNS, makeOfferSearchFields, statusLabel } from '../config/offers.config'

export default function OffersRegister({ offers = [], clients = [] }) {
	const [sp, setSp] = useSearchParams()

	// 1) Dane wejściowe (bez CRUD – tylko przegląd)
	const rows = useMemo(() => (Array.isArray(offers) ? offers : []), [offers])

	// 2) Wyszukiwanie + sortowanie
	const getSearchFields = useCallback(makeOfferSearchFields(clients), [clients])

	const { searchQuery, setSearchQuery, sortConfig, setSortConfig, filteredSorted } = useListQuery(rows, HEADER_COLS, {
		initialSort: { key: 'validUntil', direction: 'desc' },
		getSearchFields,
	})

	// 3) Dodatkowy filtr statusu (identyczny markup/klasy jak w Trainings/Documents)
	const [filterStatus, setFilterStatus] = useState('wszystkie')
	const filteredByStatus = useMemo(() => {
		if (filterStatus === 'wszystkie') return filteredSorted
		return filteredSorted.filter(r => r.status === filterStatus)
	}, [filteredSorted, filterStatus])

	// 4) Paginacja (URL)
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filteredByStatus, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: SCROLL_SELECTOR,
		canonicalize: true,
	})

	// 5) Podsumowanie (liczebność wg statusów)
	const statusSummaryItems = useMemo(() => {
		const map = new Map(STATUS_DEFS.map(s => [s.key, 0]))
		for (const r of filteredByStatus) {
			if (map.has(r.status)) {
				map.set(r.status, (map.get(r.status) || 0) + 1)
			}
		}
		return [['Oferty', filteredByStatus.length], ...STATUS_DEFS.map(s => [s.label, map.get(s.key) || 0])]
	}, [filteredByStatus])

	// 6) Eksport CSV (z bieżącego widoku)
	const exportCSV = useCsvExport({
		columns: CSV_COLUMNS,
		rows: filteredByStatus.map(r => ({
			...r,
			status: statusLabel(r.status),
		})),
		filename: 'oferty.csv',
		delimiter: CSV_DELIMITER,
		includeHeader: true,
		addBOM: CSV_BOM,
	})

	// 7) Render
	return (
		<ListLayout
			rootClassName='offers-list'
			controlsClassName='offers-controls'
			controls={
				<>
					<SearchBar
						value={searchQuery}
						placeholder='Znajdź ofertę...'
						onChange={val => {
							setSearchQuery(val)
							resetToFirstPage(true)
						}}
						onClear={() => {
							setSearchQuery('')
							resetToFirstPage(true)
						}}
					/>

					{/* Filtr statusu — dokładnie taki sam markup/klasy jak w TrainingsDirectory */}
					<select
						value={filterStatus}
						onChange={e => {
							setFilterStatus(e.target.value)
							resetToFirstPage(true)
						}}
						className='training-filter-select'
						title='Filtr statusu'
						aria-label='Filtr statusu'>
						<option value='wszystkie'>Wszystkie</option>
						{STATUS_DEFS.map(s => (
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

					{/* Summary NA SAMYM DOLE */}
					<ListSummary ariaLabel='Podsumowanie listy ofert' items={statusSummaryItems} />
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
				ariaLabel='Tabela ofert'
				actionsForRow={offer => [
					{
						type: 'link',
						label: 'Formularz',
						href: `/sprzedaz/oferty/${encodeURIComponent(offer.id)}/formularz`,
						title: 'Przejdź do formularza oferty',
						icon: 'form', // FileText via TYPE_ICON_MAP w RowActions
					},
				]}
				actionsSticky
			/>
		</ListLayout>
	)
}

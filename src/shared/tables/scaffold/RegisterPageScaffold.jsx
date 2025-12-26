// src/shared/tables/scaffold/RegisterPageScaffold.jsx
import React from 'react'
import { ListLayout, Pagination, ListSummary } from '../index.js' // beczka lists

export default function RegisterPageScaffold({
	rootClassName,
	controlsClassName,
	toolbar, // JSX – zwykle <ListToolbar bare .../> lub lokalny toolbar
	table, // JSX – zwykle <DataTableWithActions bare .../> lub Twoja tabela
	page, // { pageCount, currentPage, onPageChange }
	exportBtn, // JSX – np. przycisk eksportu CSV
	summaryLabel, // np. 'Próbki', 'Klienci'
	total, // liczba rekordów do wyświetlenia w podsumowaniu
}) {
	// Jeśli exportBtn nie ma klasy 'download-btn--primary', dajemy cienki wrapper,
	// żeby zadziałał layout grida: grid-column: 3
	const exportSlot = exportBtn ? (
		exportBtn?.props?.className?.includes?.('download-btn--primary') ? (
			exportBtn
		) : (
			<div className='download-btn--primary'>{exportBtn}</div>
		)
	) : null

	const hasPagination = page && Number.isFinite(page?.pageCount) && page?.pageCount > 0

	return (
		<ListLayout
			rootClassName={rootClassName}
			controlsClassName={controlsClassName}
			controls={toolbar}
			footer={
				<>
					<div className='table-actions table-actions--inline'>
						{hasPagination && (
							<Pagination currentPage={page.currentPage} pageCount={page.pageCount} onPageChange={page.onPageChange} />
						)}
						{exportSlot}
					</div>

					<div className='list-summary' role='status' aria-label={`Podsumowanie listy ${summaryLabel || ''}`}>
						<span className='label'>{summaryLabel}:</span>
						<span className='value'>{total ?? 0}</span>
					</div>
				</>
			}>
			{table}
		</ListLayout>
	)
}

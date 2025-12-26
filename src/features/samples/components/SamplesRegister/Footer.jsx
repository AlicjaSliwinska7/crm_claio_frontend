import React from 'react'
import Pagination from '../../../../shared/tables/components/Pagination'
import { downloadCsv } from '../../../../shared/tables/utils/csv'

export default function Footer({
	currentPage,
	pageCount,
	onPageChange,
	rowsForExport, // pełny, przefiltrowany i posortowany zbiór
	csvColumns,
}) {
	const exportCSV = () => {
		downloadCsv({
			filename: 'rejestr_probek.csv',
			columns: csvColumns,
			rows: rowsForExport,
			delimiter: ';',
			includeHeader: true,
			addBOM: true,
		})
	}

	return (
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
	)
}

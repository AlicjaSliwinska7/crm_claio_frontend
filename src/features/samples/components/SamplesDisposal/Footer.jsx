import React from 'react'
import Pagination from '../../../../shared/tables/components/Pagination'

export default function Footer({ currentPage, pageCount, onPageChange, onExportCSV }) {
	return (
		<div className='table-actions table-actions--inline'>
			<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
			<button
				className='download-btn download-btn--primary'
				onClick={onExportCSV}
				title='Eksportuj CSV'
				aria-label='Eksportuj CSV'>
				<i className='fa-solid fa-file-export' />
			</button>
		</div>
	)
}

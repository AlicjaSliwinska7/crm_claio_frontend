import React from 'react'

export default function PaginationBar({
	page,
	setPage,
	pageSize,
	setPageSize,
	pageSizeOptions = [10, 20, 30, 50, 100],
	total,
	start,
	end,
	totalPages,
}) {
	// UWAGA: zgodnie z prośbą — brak informacji "Wiersze X–Y z Z".
	return (
		<div className='csx-bar csx-bar--center'>
			<div className='csx-pager csx-pager--center'>
				<button className='csx-btn' onClick={() => setPage(1)} disabled={page <= 1} aria-label='Pierwsza'>
					«
				</button>
				<button
					className='csx-btn'
					onClick={() => setPage(p => Math.max(1, p - 1))}
					disabled={page <= 1}
					aria-label='Poprzednia'>
					‹
				</button>
				<span className='csx-indicator'>
					{page} / {totalPages}
				</span>
				<button
					className='csx-btn'
					onClick={() => setPage(p => Math.min(totalPages, p + 1))}
					disabled={page >= totalPages}
					aria-label='Następna'>
					›
				</button>
				<button
					className='csx-btn'
					onClick={() => setPage(totalPages)}
					disabled={page >= totalPages}
					aria-label='Ostatnia'>
					»
				</button>
			</div>
		</div>
	)
}

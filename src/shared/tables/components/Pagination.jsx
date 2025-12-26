// src/shared/tables/components/Pagination.jsx
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

function clamp(n, min, max) {
	return Math.min(Math.max(n, min), max)
}

/**
 * Wspólna paginacja dla list opartych o List.css
 *
 * Props:
 * - currentPage: number (1-indexed)
 * - pageCount: number (>= 1)
 * - onPageChange: (newPage:number) => void
 * - className?: string
 * - ariaLabel?: string
 * - window?: number
 */
const Pagination = React.memo(function Pagination({
	currentPage = 1,
	pageCount = 1,
	onPageChange,
	className = 'pagination pagination--inline',
	ariaLabel = 'Paginacja',
	window = 2,
}) {
	const total = Math.max(1, pageCount || 1)
	const page = clamp(currentPage || 1, 1, total)

	const { hasPrev, hasNext, items } = useMemo(() => {
		const hasPrev = page > 1
		const hasNext = page < total

		const items = []
		const start = Math.max(2, page - window)
		const end = Math.min(total - 1, page + window)

		items.push(1)
		if (start > 2) items.push('…l')
		for (let n = start; n <= end; n++) items.push(n)
		if (end < total - 1) items.push('…r')
		if (total > 1) items.push(total)

		return { hasPrev, hasNext, items }
	}, [page, total, window])

	const go = p => onPageChange?.(clamp(p, 1, total))

	return (
		<nav className={className} role='navigation' aria-label={ariaLabel}>
			<button type='button' className='page-btn icon' onClick={() => go(1)} disabled={!hasPrev} title='Pierwsza'>
				<i className='fas fa-angle-double-left' aria-hidden />
			</button>
			<button
				type='button'
				className='page-btn icon'
				onClick={() => go(page - 1)}
				disabled={!hasPrev}
				title='Poprzednia'>
				<i className='fas fa-angle-left' aria-hidden />
			</button>

			<ul className='page-list' aria-label='Numery stron'>
				{items.map((it, idx) =>
					typeof it === 'number' ? (
						<li key={it}>
							<button
								type='button'
								className={`page-btn num ${it === page ? 'active' : ''}`.trim()}
								onClick={() => go(it)}
								aria-current={it === page ? 'page' : undefined}
								title={`Strona ${it}`}>
								{it}
							</button>
						</li>
					) : (
						<li key={`${it}-${idx}`} className='page-ellipsis' aria-hidden='true'>
							…
						</li>
					)
				)}
			</ul>

			<button type='button' className='page-btn icon' onClick={() => go(page + 1)} disabled={!hasNext} title='Następna'>
				<i className='fas fa-angle-right' aria-hidden />
			</button>
			<button type='button' className='page-btn icon' onClick={() => go(total)} disabled={!hasNext} title='Ostatnia'>
				<i className='fas fa-angle-double-right' aria-hidden />
			</button>
		</nav>
	)
})

Pagination.propTypes = {
	currentPage: PropTypes.number,
	pageCount: PropTypes.number,
	onPageChange: PropTypes.func,
	className: PropTypes.string,
	ariaLabel: PropTypes.string,
	window: PropTypes.number,
}

export default Pagination

// src/features/board/components/BoardPreview/BoardFlatTable.jsx
import React, { useMemo, useState, useCallback } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { pl } from 'date-fns/locale'

import { sortRows, nextDirection, sortIndicator, sortAria } from '../../../../shared/tables/utils/sorters'

function toDateSafe(d) {
	if (!d) return null
	if (d instanceof Date) return isValid(d) ? d : null
	try {
		const dt = parseISO(String(d))
		return isValid(dt) ? dt : null
	} catch {
		return null
	}
}

function getTypeClass(type) {
	return type === 'task' ? 'type-task' : 'type-post'
}

function getPriorityClass(priority) {
	switch (priority) {
		case 'wysoki':
			return 'priority-wysoki'
		case 'normalny':
			return 'priority-normalny'
		case 'niski':
			return 'priority-niski'
		default:
			return 'priority-blank'
	}
}

/**
 * BoardFlatTable
 * - sortuje po "dacie dodania" (p.date) = createdAt
 * - wyświetla "dzień wpisu" (targetDate) w kolumnie Data
 */
export default function BoardFlatTable({ rows, onRowClick }) {
	const data = Array.isArray(rows) ? rows : []
	const rowClickable = typeof onRowClick === 'function'

	// ✅ znormalizowane wiersze (przechowujemy original)
	const normalized = useMemo(() => {
		return data.map(p => {
			const createdAt = toDateSafe(p?.date) || null // do sortowania
			const dayDisplay = toDateSafe(p?.targetDate ?? p?.date) // do wyświetlania

			return {
				id: p?.id ?? `${p?.author ?? 'row'}-${p?.title ?? '—'}`,
				original: p,

				createdAt,
				dayText: dayDisplay ? format(dayDisplay, 'dd.MM.yyyy', { locale: pl }) : '—',

				title: p?.title || `Pozycja ${p?.id ?? ''}`.trim(),
				author: p?.author || '—',
				type: p?.type || 'post',
				priority: p?.priority || '—',
				tags: Array.isArray(p?.tags) ? p.tags.filter(Boolean) : [],
			}
		})
	}, [data])

	// domyślnie: sortowanie po createdAt (najnowsze na górze)
	const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })

	const handleSort = key => {
		setSortConfig(prev => {
			if (!prev || prev.key !== key) return { key, direction: 'asc' }
			return { key, direction: nextDirection(prev.direction) }
		})
	}

	// ✅ sortRows z shared
	const sorted = useMemo(() => {
		return sortRows(
			normalized,
			sortConfig,
			{
				createdAt: { type: 'date', accessor: r => r.createdAt },
				title: { type: 'text', accessor: r => r.title },
				author: { type: 'text', accessor: r => r.author },
				type: { type: 'text', accessor: r => r.type },
				priority: { type: 'text', accessor: r => r.priority },
				tags: { type: 'text', accessor: r => (r.tags || []).join(', ') },
			},
			{ locale: 'pl', nulls: 'last' }
		)
	}, [normalized, sortConfig])

	// ✅ nie otwieraj edycji, gdy klik w chip/tag
	const shouldIgnoreRowClick = useCallback(e => {
		const el = e?.target
		if (!(el instanceof Element)) return false
		return Boolean(el.closest('.tag-chip,.type-chip,.priority-chip,a,button,[role="button"]'))
	}, [])

	return (
		<div className='board-flat-table-wrapper'>
			<table className='board-flat-table' role='table'>
				<thead>
					<tr>
						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('createdAt')}
							aria-sort={sortAria(sortConfig, 'createdAt')}
							title='Sortuj po dacie dodania'>
							Data {sortIndicator(sortConfig, 'createdAt', { asc: '▲', desc: '▼', idle: '' })}
						</th>

						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('title')}
							aria-sort={sortAria(sortConfig, 'title')}>
							Tytuł {sortIndicator(sortConfig, 'title', { asc: '▲', desc: '▼', idle: '' })}
						</th>

						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('author')}
							aria-sort={sortAria(sortConfig, 'author')}>
							Autor {sortIndicator(sortConfig, 'author', { asc: '▲', desc: '▼', idle: '' })}
						</th>

						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('type')}
							aria-sort={sortAria(sortConfig, 'type')}>
							Typ {sortIndicator(sortConfig, 'type', { asc: '▲', desc: '▼', idle: '' })}
						</th>

						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('priority')}
							aria-sort={sortAria(sortConfig, 'priority')}>
							Priorytet {sortIndicator(sortConfig, 'priority', { asc: '▲', desc: '▼', idle: '' })}
						</th>

						<th
							scope='col'
							className='sortable'
							onClick={() => handleSort('tags')}
							aria-sort={sortAria(sortConfig, 'tags')}>
							Tagi {sortIndicator(sortConfig, 'tags', { asc: '▲', desc: '▼', idle: '' })}
						</th>
					</tr>
				</thead>

				<tbody>
					{sorted.length === 0 ? (
						<tr>
							<td className='empty-state' colSpan={6}>
								Brak wpisów w tym zakresie.
							</td>
						</tr>
					) : (
						sorted.map(r => (
							<tr
								key={r.id}
								onClick={
									rowClickable
										? e => {
												if (shouldIgnoreRowClick(e)) return
												onRowClick(r.original)
										  }
										: undefined
								}
								tabIndex={rowClickable ? 0 : undefined}
								onKeyDown={
									rowClickable
										? e => {
												if (e.key === 'Enter' || e.key === ' ') onRowClick(r.original)
										  }
										: undefined
								}
								style={rowClickable ? { cursor: 'pointer' } : undefined}>
								{/* wyświetlasz "dzień wpisu" (target) */}
								<td data-label='Data'>{r.dayText}</td>
								<td data-label='Tytuł'>{r.title}</td>
								<td data-label='Autor'>{r.author}</td>

								<td data-label='Typ'>
									<span className={`type-chip ${getTypeClass(r.type)}`}>{r.type}</span>
								</td>

								<td data-label='Priorytet'>
									<span className={`priority-chip ${getPriorityClass(r.priority)}`}>
										{r.priority && r.priority !== '' ? r.priority : '—'}
									</span>
								</td>

								<td data-label='Tagi' className='tags'>
									{r.tags.length
										? r.tags.map(t => (
												<span key={t} className='tag-chip'>
													{t}
												</span>
										  ))
										: '—'}
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

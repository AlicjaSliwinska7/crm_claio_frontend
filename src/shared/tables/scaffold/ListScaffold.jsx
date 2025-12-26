// src/shared/tables/scaffold/RegisterPageScaffold.jsx
import React from 'react'
import DeleteDialog from '../../modals/dialogs/DeleteDialog'

/**
 * Uniwersalny szkielet listy:
 * - Pasek sterowania: search + filters + extraActions + (opcjonalny) przycisk Dodaj
 * - Podsumowanie (summaryItems)
 * - Tabela (props.table lub children)
 * - Paginacja
 * - Modale: formModal (dowolny ReactNode) + deleteModal (obiekt)
 *
 * Props:
 *  rootClassName, controlsClassName,
 *  search, onSearch, onClear,
 *  filters, extraActions,
 *  summaryItems,
 *  table,
 *  pagination: { pageCount, currentPage, onPageChange, render? },
 *  formModal,
 *  deleteModal: { open, label, message, onConfirm, onClose, confirmLabel?, cancelLabel? },
 *  onAdd
 */
function ListScaffold({
	rootClassName,
	controlsClassName,
	search,
	onSearch,
	onClear,
	filters = [],
	extraActions = null,
	summaryItems = [],
	table = null,
	pagination = null,
	formModal = null,
	deleteModal = null,
	onAdd = null,
	children,
}) {
	const handleSearchChange = e => {
		if (onSearch) onSearch(e.target.value)
	}

	return (
		<div className={rootClassName ?? ''}>
			{/* Controls / Toolbar */}
			<div className={controlsClassName ?? 'list-controls'}>
				{/* Search */}
				{(onSearch || onClear) && (
					<div className='controls__search'>
						<input
							type='search'
							value={search ?? ''}
							onChange={handleSearchChange}
							placeholder='Szukaj…'
							aria-label='Szukaj'
						/>
						{onClear && (
							<button type='button' className='btn btn--secondary' onClick={onClear} aria-label='Wyczyść wyszukiwanie'>
								Wyczyść
							</button>
						)}
					</div>
				)}

				{/* Filters */}
				{Array.isArray(filters) && filters.length > 0 && (
					<div className='controls__filters'>
						{filters.map(f => {
							const { key, label, value, onChange, options = [] } = f || {}
							return (
								<label key={key} className='controls__filter'>
									<span>{label}</span>
									<select value={value ?? ''} onChange={e => onChange && onChange(e.target.value)}>
										{options.map(opt => (
											<option key={String(opt.value ?? opt)} value={opt.value ?? opt}>
												{opt.label ?? String(opt)}
											</option>
										))}
									</select>
								</label>
							)
						})}
					</div>
				)}

				{/* Actions (left) */}
				<div className='controls__actions'>{extraActions}</div>

				{/* Add button (right) */}
				{onAdd && (
					<div className='controls__add'>
						<button type='button' className='btn btn--primary' onClick={onAdd} aria-label='Dodaj'>
							Dodaj
						</button>
					</div>
				)}
			</div>

			{/* Summary */}
			{Array.isArray(summaryItems) && summaryItems.length > 0 && (
				<div className='list-summary' role='status'>
					{summaryItems.map(([label, value], i) => (
						<span key={i}>
							{label}: {value}
						</span>
					))}
				</div>
			)}

			{/* Table/content */}
			<div className='table-container'>{table ?? children}</div>

			{/* Pagination */}
			{pagination && (
				<div className='table-actions table-actions--inline'>
					{/* Jeśli podasz gotowy element w pagination.render, użyjemy go; inaczej fallback */}
					{'render' in pagination && pagination.render}
					{!('render' in pagination) && (
						<nav className='pagination' aria-label='Paginacja'>
							<button
								type='button'
								className='page-btn icon'
								disabled={pagination.currentPage <= 1}
								onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
								aria-label='Poprzednia strona'
								title='Poprzednia'>
								←
							</button>
							<ul className='page-list' aria-hidden='true'>
								<li className='page-ellipsis'>
									{pagination.currentPage} / {pagination.pageCount}
								</li>
							</ul>
							<button
								type='button'
								className='page-btn icon'
								disabled={pagination.currentPage >= pagination.pageCount}
								onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
								aria-label='Następna strona'
								title='Następna'>
								→
							</button>
						</nav>
					)}
				</div>
			)}

			{/* Modals */}
			{formModal || null}
			{deleteModal && (
				<DeleteDialog
					open={!!deleteModal.open}
					label={deleteModal.label}
					message={deleteModal.message}
					onConfirm={deleteModal.onConfirm}
					onClose={deleteModal.onClose}
					confirmLabel={deleteModal.confirmLabel ?? 'Usuń'}
					cancelLabel={deleteModal.cancelLabel ?? 'Anuluj'}
				/>
			)}
		</div>
	)
}

export default ListScaffold

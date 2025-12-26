// src/shared/tables/components/DataTableWithActions.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ActionsHeader from './ActionsHeader'
import ActionsCell from './cells/ActionsCell'

/**
 * DataTableWithActions – zwykła tabela z wbudowaną kolumną akcji (ostatnia).
 *
 * Użycie:
 *  - columns: definicje kolumn (HEADER_COLS z configu)
 *  - rows: przefiltrowane + spaginowane dane
 *  - sortConfig / setSortConfig / onAfterSort: obsługa sortowania
 *  - actionsForRow(row): zwraca tablicę akcji do ActionsCell
 *  - rowProps(row): (opcjonalnie) dodatkowe propsy dla <tr> (className, title, itp.)
 *  - onRowClick(row): (opcjonalnie) kliknięcie w wiersz
 */
function DataTableWithActions({
	columns = [],
	rows = [],
	sortConfig,
	setSortConfig,
	onAfterSort,
	actionsForRow, // (row) => Action[]
	rowProps, // (row) => extra props for <tr>
	onRowClick, // (row) => void
	bare = false,
	ariaLabel = 'Tabela',
	actionsWidth = 3, // 2 | 3 | 4 – szerokość kolumny akcji
	actionsSticky = false, // czy przyklejamy ostatnią kolumnę
}) {
	const onSort = key => {
		if (!setSortConfig || !key) return
		const dir = sortConfig?.key === key ? (sortConfig.direction === 'asc' ? 'desc' : 'asc') : 'asc'
		setSortConfig({ key, direction: dir })
		onAfterSort?.()
	}

	const onThKeyDown = (e, key, isSortable) => {
		if (!isSortable) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onSort(key)
		}
	}

	const asCssWidth = w => (w == null ? undefined : typeof w === 'number' ? `${w}px` : w)

	// jedna klasa dla całej kolumny akcji
	const actionsColClass = [
		'actions-col',
		actionsSticky ? 'sticky' : '',
		actionsWidth === 2 ? 'w-2' : actionsWidth === 4 ? 'w-4' : 'w-3',
	]
		.filter(Boolean)
		.join(' ')

	const tableClass = ['data-table', bare ? 'data-table--bare' : ''].filter(Boolean).join(' ')
	const containerClass = ['table-container', bare ? 'table-container--bare' : ''].filter(Boolean).join(' ')

	return (
		<div className={containerClass}>
			<table className={tableClass} aria-label={ariaLabel}>
				<colgroup>
					{columns.map(c => (
						<col key={c.key || c.label} style={{ width: asCssWidth(c.width) }} />
					))}
					{actionsForRow ? <col className='col-actions' /> : null}
				</colgroup>

				<thead>
					<tr>
						{columns.map((col, i) => {
							const isSortable = col.sortable !== false && !!col.key
							const isActive = isSortable && sortConfig?.key === col.key
							const dir = isActive ? sortConfig.direction : undefined

							const classes = [
								col.align ? `align-${col.align}` : '',
								isSortable ? 'sortable' : '',
								isActive ? `sorted-${dir}` : '',
							]
								.filter(Boolean)
								.join(' ')

							const style = {}
							const width = asCssWidth(col.width)
							if (width) style.width = width

							return (
								<th
									key={col.key ?? i}
									className={classes}
									style={style}
									onClick={isSortable ? () => onSort(col.key) : undefined}
									onKeyDown={e => onThKeyDown(e, col.key, isSortable)}
									tabIndex={isSortable ? 0 : undefined}
									aria-sort={
										isSortable ? (isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined
									}
									scope='col'>
									<span className='th-label'>{col.label}</span>
									{isSortable && <span className='th-sort-caret' aria-hidden />}
								</th>
							)
						})}

						{actionsForRow ? (
							<ActionsHeader className={actionsColClass} title='Akcje' width={actionsWidth} sticky={actionsSticky} />
						) : null}
					</tr>
				</thead>

				<tbody>
					{rows.map((row, ri) => {
						// props z zewnątrz
						const baseRowProps = typeof rowProps === 'function' ? rowProps(row) || {} : {}

						// domyślnie nie nadpisujemy istniejącego onClick z rowProps
						const finalRowProps = { ...baseRowProps }
						if (onRowClick && !finalRowProps.onClick) {
							finalRowProps.onClick = () => onRowClick(row)
						}

						return (
							<tr key={row.id ?? ri} {...finalRowProps}>
								{columns.map((col, ci) => {
									const val = row[col.key]
									const tdClass = col.align ? `align-${col.align}` : undefined
									const tdDataAlign = col.align ? { 'data-align': col.align } : {}
									return (
										<td
											key={col.key ?? ci}
											className={tdClass}
											{...tdDataAlign}
											title={col.titleAccessor ? col.titleAccessor(row) : undefined}>
											{col.render ? col.render(val, row) : val ?? '—'}
										</td>
									)
								})}

								{actionsForRow ? (
									<ActionsCell className={actionsColClass} actions={actionsForRow(row)} sticky={actionsSticky} />
								) : null}
							</tr>
						)
					})}

					{!rows || rows.length === 0 ? (
						<tr>
							<td colSpan={columns.length + (actionsForRow ? 1 : 0)} className='empty-cell'>
								Brak danych
							</td>
						</tr>
					) : null}
				</tbody>
			</table>
		</div>
	)
}

DataTableWithActions.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string,
			label: PropTypes.string.isRequired,
			render: PropTypes.func,
			sortable: PropTypes.bool,
			width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			align: PropTypes.oneOf(['left', 'center', 'right']),
			titleAccessor: PropTypes.func,
		})
	),
	rows: PropTypes.array,
	sortConfig: PropTypes.shape({
		key: PropTypes.string,
		direction: PropTypes.oneOf(['asc', 'desc']),
	}),
	setSortConfig: PropTypes.func,
	onAfterSort: PropTypes.func,
	actionsForRow: PropTypes.func,
	rowProps: PropTypes.func,
	onRowClick: PropTypes.func,
	bare: PropTypes.bool,
	ariaLabel: PropTypes.string,
	actionsWidth: PropTypes.oneOf([2, 3, 4]),
	actionsSticky: PropTypes.bool,
}

export default memo(DataTableWithActions)

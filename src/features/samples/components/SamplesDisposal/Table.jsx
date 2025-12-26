import React from 'react'
import SortableTh from '../../../../shared/tables/components/SortableTh'
import EmptyStateRow from '../../../../shared/tables/components/EmptyStateRow'

export default function Table({ COLS, visible, sortConfig, setSortConfig, resetToFirstPage, toStr }) {
	return (
		<table className='data-table'>
			<colgroup>
				{COLS.map(col => (
					<col key={col.key} />
				))}
			</colgroup>

			<thead>
				<tr>
					{COLS.map(col =>
						col.sortable ? (
							<SortableTh
								key={col.key}
								columnKey={col.key}
								label={col.label}
								sortConfig={sortConfig}
								setSortConfig={setSortConfig}
								onAfterSort={() => resetToFirstPage(true)}
							/>
						) : (
							<th key={col.key}>{col.label}</th>
						)
					)}
				</tr>
			</thead>

			<tbody>
				{visible.map(row => (
					<tr key={row.id}>
						{COLS.map(col => (
							<td key={col.key}>{col.render ? col.render(row) : toStr(row[col.key] ?? '—')}</td>
						))}
					</tr>
				))}

				{visible.length === 0 && <EmptyStateRow colSpan={COLS.length} />}
			</tbody>
		</table>
	)
}

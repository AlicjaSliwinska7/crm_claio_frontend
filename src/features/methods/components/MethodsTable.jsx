import React from 'react'
import { Link } from 'react-router-dom'
import SortableTh from '../../../shared/tables/components/SortableTh'
import EmptyStateRow from '../../../shared/tables/components/EmptyStateRow'
import ActionsHeader from '../../../shared/tables/components/ActionsHeader'
import ActionsCell from '../../../shared/tables/components/cells/ActionsCell'
import { HEADER_COLS } from './constants'
import AccreditedBadge from './AccreditedBadge'

export default function MethodsTable({ visibleGroups, sortConfig, setSortConfig, resetToFirstPage, onEdit, onDelete }) {
	return (
		<table className='data-table'>
			<colgroup>
				{HEADER_COLS.map(c => (
					<col key={c.key} />
				))}
				<col className='col-actions' />
			</colgroup>

			<thead>
				<tr>
					{HEADER_COLS.map(col => (
						<SortableTh
							key={col.key}
							columnKey={col.key}
							label={col.label}
							sortConfig={sortConfig}
							setSortConfig={setSortConfig}
							onAfterSort={() => resetToFirstPage(true)}
						/>
					))}
					<ActionsHeader className='actions-col'>Akcje</ActionsHeader>
				</tr>
			</thead>

			<tbody>
				{visibleGroups.length === 0 ? (
					<EmptyStateRow colSpan={HEADER_COLS.length + 1} />
				) : (
					visibleGroups.flatMap(group => {
						const { standardNo, title, rows } = group
						return rows.map((row, idx) => (
							<tr key={`${row.standardNo}-${row.methodNo}`}>
								{idx === 0 && (
									<>
										<td rowSpan={rows.length} style={{ verticalAlign: 'top' }}>
											{standardNo}
										</td>
										<td rowSpan={rows.length} style={{ verticalAlign: 'top' }}>
											{title}
										</td>
									</>
								)}

								<td>
									<Link
										to={encodeURIComponent(row.methodNo)}
										state={{ method: row }}
										title={`Szczegóły metody ${row.methodNo}`}
										onClick={e => e.stopPropagation()}>
										{row.methodNo}
									</Link>
								</td>

								<td>
									<AccreditedBadge ok={row.accredited} />
								</td>

								<td>
									<Link
										to={encodeURIComponent(row.methodNo)}
										state={{ method: row }}
										title={`Szczegóły metody ${row.methodNo}`}
										onClick={e => e.stopPropagation()}>
										{row.methodName}
									</Link>
								</td>

								<ActionsCell
									actions={[
										{ type: 'edit', label: 'Edytuj', onClick: () => onEdit(row) },
										{ type: 'delete', label: 'Usuń', onClick: () => onDelete(row) },
									]}
								/>
							</tr>
						))
					})
				)}
			</tbody>
		</table>
	)
}

import React from 'react'
import SortableTh from '../../../../shared/tables/components/SortableTh'
import ActionsHeader from '../../../../shared/tables/components/ActionsHeader'
import ActionsCell from '../../../../shared/tables/components/cells/ActionsCell'
import EmptyStateRow from '../../../../shared/tables/components/EmptyStateRow'
import { FileText } from 'lucide-react'
import { HEADER_COLS } from './config'
import { toStr } from './helpers'

export default function Table({
	rows, // już przycięte (visible)
	sortConfig,
	setSortConfig,
	onAfterSort,
}) {
	return (
		<table className='data-table'>
			<colgroup>
				{HEADER_COLS.map(col => (
					<col key={col.key} />
				))}
				<col className='col-actions' />
			</colgroup>

			<thead>
				<tr>
					{HEADER_COLS.map(col =>
						col.sortable ? (
							<SortableTh
								key={col.key}
								columnKey={col.key}
								label={col.label}
								sortConfig={sortConfig}
								setSortConfig={setSortConfig}
								onAfterSort={onAfterSort}
							/>
						) : (
							<th key={col.key}>{col.label}</th>
						)
					)}
					<ActionsHeader className='actions-col' />
				</tr>
			</thead>

			<tbody>
				{rows.map(row => (
					<tr key={row.id}>
						{HEADER_COLS.map(col => (
							<td key={col.key}>{col.render ? col.render(row) : toStr(row[col.key] ?? '—')}</td>
						))}

						<ActionsCell
							actions={[
								{
									type: 'link',
									label: 'Formularz próbki',
									href: `/probki/rejestr-probek/${encodeURIComponent(row.id)}/formularz`,
									icon: FileText,
									title: 'Formularz próbki',
								},
							]}
						/>
					</tr>
				))}

				{rows.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
			</tbody>
		</table>
	)
}

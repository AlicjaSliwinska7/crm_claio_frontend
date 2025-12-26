import React from 'react'
import SortableTh from '../../../../shared/tables/components/SortableTh'
import EmptyStateRow from '../../../../shared/tables/components/EmptyStateRow'
import ActionsHeader from '../../../../shared/tables/components/ActionsHeader'
import ActionsCell from '../../../../shared/tables/components/ActionsCell'

const toStr = v => (v ?? '').toString()

export const HEADER_COLS = [
	{ key: 'name', label: 'Nazwa', sortable: true, type: 'string' },
	{ key: 'city', label: 'Miasto', sortable: true, type: 'string' },
	{ key: 'address', label: 'Adres', sortable: false },
	{ key: 'contactPerson', label: 'Osoba kontaktowa', sortable: false },
	{
		key: 'email',
		label: 'E-mail',
		sortable: false,
		render: l => (
			<a href={`mailto:${l.email}`} title={l.email}>
				{l.email}
			</a>
		),
	},
	{ key: 'phone', label: 'Telefon', sortable: false },
	{
		key: 'services',
		label: 'Usługi',
		sortable: false,
		render: l => (Array.isArray(l.services) ? l.services.join(', ') : '—'),
	},
]

export default function CalibrationLabsTable({ rows, sort, onSort, onEdit, onDelete }) {
	return (
		<table className='data-table'>
			<thead>
				<tr>
					{HEADER_COLS.map(col => (
						<SortableTh key={col.key} col={col} sort={sort} onSort={onSort} />
					))}
					<ActionsHeader />
				</tr>
			</thead>
			<tbody>
				{rows.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} label='Brak laboratoriów' />}
				{rows.map(l => (
					<tr key={l.id}>
						{HEADER_COLS.map(col => (
							<td key={col.key}>{col.render ? col.render(l) : toStr(l[col.key] ?? '—')}</td>
						))}
						<ActionsCell
							actions={[
								{ type: 'edit', label: 'Edytuj', onClick: () => onEdit(l) },
								{ type: 'delete', label: 'Usuń', onClick: () => onDelete(l) },
							]}
						/>
					</tr>
				))}
			</tbody>
		</table>
	)
}

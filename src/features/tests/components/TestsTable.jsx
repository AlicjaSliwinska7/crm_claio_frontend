// src/features/tests/components/TestsTable.jsx
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import EmptyStateRow from '../../../shared/tables/components/EmptyStateRow'
import SortableTh from '../../../shared/tables/components/SortableTh'
import ActionsHeader from '../../../shared/tables/components/ActionsHeader'
import ActionsCell from '../../../shared/tables/components/ActionsCell'
import { FileText } from '../../../shared/modals/ui/icons/icons'
import { statusBadgeClass, toStr, fmtDate } from './constants'

// Upewnij się, że styles są wczytane (jeden z wariantów):
// 1) globalnie w: src/shared/tables/styles/directories_lists_registers/index.css -> @import './registers-table.css'
// 2) lub lokalnie odkomentuj linię poniżej:
// import '../../../shared/tables/styles/directories_lists_registers/registers-table.css';

/**
 * Tabela – tylko render (kolumny + wiersze).
 * Props:
 *  - rows: rekordy do wyświetlenia (już po paginacji)
 *  - sortConfig, setSortConfig
 *  - onRowOpen: (row) => void
 */
export default function TestsTable({ rows, sortConfig, setSortConfig, onRowOpen }) {
	const HEADER_COLS = useMemo(
		() => [
			{ key: 'id', label: 'ID', sortable: true, type: 'string' },
			{
				key: 'orderNo',
				label: 'Nr zlecenia',
				sortable: true,
				type: 'string',
				render: r =>
					r.orderNo ? (
						<Link
							to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(r.orderNo)}`}
							onClick={e => e.stopPropagation()}>
							{r.orderNo}
						</Link>
					) : (
						'—'
					),
			},
			{
				key: 'samples',
				label: 'Nr próbek',
				sortable: false,
				render: r =>
					(r.samples || []).length > 0
						? r.samples.map((s, i) => (
								<React.Fragment key={s}>
									<Link
										to={`/probki/rejestr-probek?sample=${encodeURIComponent(s)}`}
										onClick={e => e.stopPropagation()}>
										{s}
									</Link>
									{i < r.samples.length - 1 ? ', ' : ''}
								</React.Fragment>
						  ))
						: '—',
			},
			{
				key: 'samplesCount',
				label: 'Ilość',
				sortable: true,
				type: 'number',
				render: r => r.samplesCount ?? r.samples?.length ?? '—',
			},
			{
				key: 'client',
				label: 'Klient',
				sortable: true,
				type: 'string',
				render: r =>
					r.client ? (
						<Link to={`/sprzedaz/klienci/${encodeURIComponent(r.client)}`} onClick={e => e.stopPropagation()}>
							{r.client}
						</Link>
					) : (
						'—'
					),
			},
			{
				key: 'status',
				label: 'Status',
				sortable: true,
				type: 'string',
				// nowy wariant 'status' – konturowy
				render: r => <span className={statusBadgeClass(r.status, 'status')}>{r.status || '—'}</span>,
			},
			{
				key: 'subject',
				label: 'Przedmiot badawczy',
				sortable: true,
				type: 'string',
				align: 'left', // dłuższy tekst wyrównamy do lewej
				render: r => <span title={r.subject}>{r.subject || '—'}</span>,
			},
			{
				key: 'standard',
				label: 'Norma/Dokument',
				sortable: true,
				type: 'string',
				render: r =>
					r.standard ? (
						<Link to={`/dokumentacja/normy?norma=${encodeURIComponent(r.standard)}`} onClick={e => e.stopPropagation()}>
							{r.standard}
						</Link>
					) : (
						'—'
					),
			},
			{
				key: 'method',
				label: 'Metoda',
				sortable: true,
				type: 'string',
				render: r =>
					r.method ? (
						<Link to={`/dokumentacja/metody?code=${encodeURIComponent(r.method)}`} onClick={e => e.stopPropagation()}>
							{r.method}
						</Link>
					) : (
						'—'
					),
			},
			{ key: 'methodPoint', label: 'Punkt', sortable: true, type: 'string', render: r => r.methodPoint || '—' },
			{ key: 'startDate', label: 'Start', sortable: true, type: 'date', render: r => fmtDate(r.startDate) },
			{ key: 'endDate', label: 'Koniec', sortable: true, type: 'date', render: r => fmtDate(r.endDate) },
			{
				key: 'outcome',
				label: 'Wynik',
				sortable: true,
				type: 'string',
				// nowy wariant 'outcome' – solid/kontrastowy
				render: r => <span className={statusBadgeClass(r.outcome, 'outcome')}>{r.outcome || '—'}</span>,
			},
		],
		[]
	)

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
								className={col.align === 'left' ? 'align-left' : undefined}
								scope='col'
							/>
						) : (
							<th key={col.key} className={col.align === 'left' ? 'align-left' : undefined} scope='col'>
								{col.label}
							</th>
						)
					)}
					<ActionsHeader className='actions-col' />
				</tr>
			</thead>

			<tbody>
				{rows.map(r => (
					<tr
						key={r.id}
						className='row-clickable'
						onClick={() => onRowOpen(r)}
						onKeyDown={e => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								onRowOpen(r)
							}
						}}
						tabIndex={0}
						role='button'
						aria-label={`Przejdź do Programu Badań dla ${r.orderNo || r.id}`}
						title='Kliknij, aby przejść do Programu Badań'>
						{HEADER_COLS.map(col => (
							<td key={col.key} className={col.align === 'left' ? 'align-left' : undefined}>
								{col.render ? col.render(r) : toStr(r[col.key] ?? '—')}
							</td>
						))}

						<ActionsCell
							actions={[
								{
									type: 'link',
									label: 'Program badań',
									href: `/badania/rejestr-badan/PB/${encodeURIComponent(r.orderNo || r.id)}`,
									title: 'Przejdź do Programu Badań',
									icon: FileText,
								},
							]}
							onActionClick={e => e.stopPropagation()}
						/>
					</tr>
				))}

				{rows.length === 0 && <EmptyStateRow colSpan={HEADER_COLS.length + 1} />}
			</tbody>
		</table>
	)
}

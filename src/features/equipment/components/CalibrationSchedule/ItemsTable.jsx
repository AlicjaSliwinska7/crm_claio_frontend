// src/features/equipment/components/CalibrationSchedule/ItemsTable.jsx
import React from 'react'

// Jeden punkt prawdy:
import { STATUS, STATUS_LABEL, STATUS_COLOR } from '../../utils/utils'

export default function ItemsTable({
	rows,
	sortKey,
	sortDir,
	onSort, // onSort('field')
	fmt,
	toDate,
	// historycznie mogłaś podawać własne etykiety; preferujemy utils,
	STATUS_LABEL: STATUS_LABEL_FROM_PARENT,
}) {
	const Th = ({ k, children, align = 'left' }) => (
		<th
			className={`csx-th ${align === 'center' ? 'csx-th--center' : ''}`}
			onClick={() => onSort(k)}
			title='Kliknij, aby sortować'>
			<span className='csx-th__label'>
				{children} {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : ''}
			</span>
		</th>
	)

	// 1) Normalizacja kluczy statusów do formy z utils
	const normalizeStatusKey = key => {
		if (!key) return ''
		const k = String(key)
		// szybkie wyjścia jeśli już w formacie utils
		if (k === STATUS.DUE_SOON || k === STATUS.OVERDUE || k === STATUS.IN_PROGRESS) return k
		// akceptuj różne warianty pisowni
		switch (k) {
			case 'dueSoon':
			case 'due-soon':
			case 'DUE_SOON':
				return STATUS.DUE_SOON
			case 'overdue':
			case 'OVERDUE':
				return STATUS.OVERDUE
			case 'inProgress':
			case 'in-progress':
			case 'progress':
			case 'IN_PROGRESS':
				return STATUS.IN_PROGRESS
			default:
				return ''
		}
	}

	// preferuj etykiety z utils; fallback na to, co przyjdzie z rodzica
	const labels = STATUS_LABEL || STATUS_LABEL_FROM_PARENT || {}

	// 2) Kolor zawsze z utils → dokładnie taki jak w mapie
	const getStatusAccent = key => (key ? STATUS_COLOR?.[key] : undefined)

	return (
		<table className='csx-table-inner'>
			<thead>
				<tr>
					<Th k='codes' align='center'>
						Kody wyposażenia
					</Th>
					<Th k='name'>Nazwa</Th>
					<Th k='type' align='center'>
						Rodzaj
					</Th>
					<Th k='lastCalibration' align='center'>
						Ostatnia kalibracja
					</Th>
					<Th k='nextCalibration' align='center'>
						Następna kalibracja
					</Th>
					<Th k='plannedSend' align='center'>
						Plan wysyłki
					</Th>
					<Th k='plannedReturn' align='center'>
						Plan zwrotu
					</Th>
					<Th k='shippingPlace' align='center'>
						Miejsce wzorcowania
					</Th>
					<Th k='_status' align='center'>
						Status
					</Th>
				</tr>
			</thead>

			<tbody>
				{rows.length === 0 ? (
					<tr>
						<td className='csx-td csx-td--empty' colSpan={9}>
							Brak rekordów.
						</td>
					</tr>
				) : (
					rows.map(r => {
						const codes = Array.isArray(r.codes) ? r.codes : []

						// normalizacja statusu
						const normKey = normalizeStatusKey(r._status)
						const statusLabel = labels?.[normKey] || '—'
						const statusClass = normKey ? `is-${normKey.replaceAll('_', '-')}` : ''
						const statusAccent = getStatusAccent(normKey)

						return (
							<tr key={r.id}>
								<td className='csx-td csx-td--center'>
									{codes.length ? (
										<div className='csx-codes'>
											{codes.map(c => (
												<span key={c} className='csx-code'>
													{c}
												</span>
											))}
										</div>
									) : (
										'—'
									)}
								</td>

								<td className='csx-td csx-td--clip'>{r.name}</td>
								<td className='csx-td csx-td--center'>{r.type || '—'}</td>

								<td className='csx-td csx-td--center'>
									{r.lastCalibration ? fmt(toDate(r.lastCalibration), 'dd.MM.yyyy') : '—'}
								</td>

								<td className='csx-td csx-td--center'>
									{r.nextCalibration ? fmt(toDate(r.nextCalibration), 'dd.MM.yyyy') : '—'}
								</td>

								<td className='csx-td csx-td--center'>
									{r.plannedSend ? fmt(toDate(r.plannedSend), 'dd.MM.yyyy') : '—'}
								</td>

								<td className='csx-td csx-td--center'>
									{r.plannedReturn ? fmt(toDate(r.plannedReturn), 'dd.MM.yyyy') : '—'}
								</td>

								<td className='csx-td csx-td--center'>{r.shippingPlace || '—'}</td>

								<td className='csx-td csx-td--center'>
									{/* wymuszamy zgodność z utils: kolor = STATUS_COLOR[normKey] */}
									<span
										className={`csx-status ${statusClass}`}
										style={statusAccent ? { color: statusAccent, ['--status-accent']: statusAccent } : undefined}
										title={statusLabel}
										aria-label={statusLabel}>
										{statusLabel}
									</span>
								</td>
							</tr>
						)
					})
				)}
			</tbody>
		</table>
	)
}

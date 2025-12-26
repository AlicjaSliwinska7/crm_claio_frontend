import React from 'react'

export default function FiltersBar({
	pageSize,
	setPageSize,
	pageSizeOptions = [10, 20, 30, 50, 100],
	statusFilter,
	setStatusFilter,
	soonPreset,
	setSoonPreset,
	customFrom,
	setCustomFrom,
	customTo,
	setCustomTo,
	STATUS,
	STATUS_LABEL,
	exportCSV,
	onExportCSV,
}) {
	const handleExport = onExportCSV || exportCSV || (() => {})

	return (
		<div className='csx-controls'>
			<div className='csx-row'>
				{/* Na stronę */}
				<div className='csx-pagesize csx-pagesize--top'>
					<label htmlFor='csx-size-top' className='csx-muted'>
						Na stronę:
					</label>
					<select
						id='csx-size-top'
						className='csx-select'
						value={pageSize}
						onChange={e => setPageSize(Number(e.target.value) || pageSize)}
						aria-label='Liczba wierszy na stronę'>
						{pageSizeOptions.map(n => (
							<option key={n} value={n}>
								{n}
							</option>
						))}
					</select>
				</div>

				{/* Filtry */}
				<select
					className='csx-select'
					value={statusFilter}
					onChange={e => setStatusFilter(e.target.value)}
					aria-label='Filtr statusu'>
					<option value='all'>Status: wszystkie</option>
					<option value={STATUS.DUE_SOON}>{STATUS_LABEL[STATUS.DUE_SOON]}</option>
					<option value={STATUS.OVERDUE}>{STATUS_LABEL[STATUS.OVERDUE]}</option>
					<option value={STATUS.IN_PROGRESS}>{STATUS_LABEL[STATUS.IN_PROGRESS]}</option>
				</select>

				<select
					className='csx-select'
					value={soonPreset}
					onChange={e => setSoonPreset(e.target.value)}
					aria-label='Filtr zbliżającego się terminu'>
					<option value='all'>Zbliżający się termin: wszystkie</option>
					<option value='7'>W ciągu tygodnia</option>
					<option value='30'>W ciągu miesiąca</option>
					<option value='90'>W ciągu kwartału</option>
					<option value='custom'>Zakres niestandardowy…</option>
				</select>

				{soonPreset === 'custom' && (
					<>
						<input
							type='date'
							className='csx-select'
							value={customFrom}
							onChange={e => setCustomFrom(e.target.value)}
							aria-label='Filtr od daty'
						/>
						<input
							type='date'
							className='csx-select'
							value={customTo}
							onChange={e => setCustomTo(e.target.value)}
							aria-label='Filtr do daty'
						/>
					</>
				)}

				{/* Eksport – ikona po prawej */}
				<div className='csx-export'>
					<button
						className='csx-export-btn'
						onClick={() => handleExport('visible')}
						title='Eksportuj do CSV (tylko aktualna strona)'
						aria-label='Eksportuj do CSV (tylko aktualna strona)'>
						<i className='fa-solid fa-file-export' />
					</button>
				</div>
			</div>
		</div>
	)
}

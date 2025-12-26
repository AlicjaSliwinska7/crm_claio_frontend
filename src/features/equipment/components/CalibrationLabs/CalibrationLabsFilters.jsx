import React from 'react'
import SearchBar from '../../../../shared/tables/components/SearchBar'
import { Plus } from 'lucide-react'

export default function CalibrationLabsFilters({
	searchQuery,
	onSearchChange,
	onSearchClear,
	serviceFilter,
	onServiceFilterChange,
	allServices,
	onAdd,
	onExport,
}) {
	return (
		<>
			<div className='csx-controls'>
				<div className='csx-search'>
					<SearchBar
						placeholder='Szukaj laboratoriów...'
						value={searchQuery}
						onChange={onSearchChange}
						onClear={onSearchClear}
						ariaLabel='Szukaj laboratoriów'
					/>
				</div>

				<label className='csx-label'>
					Usługa
					<select className='csx-select' value={serviceFilter} onChange={e => onServiceFilterChange(e.target.value)}>
						<option value='all'>Wszystkie</option>
						{allServices.map(s => (
							<option value={s} key={s}>
								{s}
							</option>
						))}
					</select>
				</label>

				<button className='csx-add-btn' onClick={onAdd} title='Dodaj laboratorium' aria-label='Dodaj'>
					<Plus size={16} />
				</button>

				<button
					className='download-btn download-btn--primary'
					onClick={onExport}
					title='Eksportuj CSV'
					aria-label='Eksportuj CSV'>
					<i className='fa-solid fa-file-export' />
				</button>
			</div>
		</>
	)
}

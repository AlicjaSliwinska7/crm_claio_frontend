import React from 'react'
import { Plus } from 'lucide-react'
import SearchBar from '../../../shared/tables/components/SearchBar'

export default function Controls({
	query,
	setQuery,
	accFilter, // 'all' | 'acc' | 'non'
	setAccFilter,
	onAdd,
	resetToFirstPage,
}) {
	return (
		<>
			<SearchBar
				value={query}
				placeholder='Znajdź metodę…'
				onChange={val => {
					setQuery(val)
					resetToFirstPage(true)
				}}
				onClear={() => {
					setQuery('')
					resetToFirstPage(true)
				}}
			/>

			{/* Filtr akredytacji (spójny z lists UI) */}
			<select
				className='training-filter-select'
				value={accFilter}
				onChange={e => {
					setAccFilter(e.target.value)
					resetToFirstPage(true)
				}}
				title='Filtr akredytacji'
				style={{ minWidth: 190 }}>
				<option value='all'>Wszystkie</option>
				<option value='acc'>Akredytowane</option>
				<option value='non'>Nieakredytowane</option>
			</select>

			<button className='add-client-btn' onClick={onAdd} title='Dodaj metodę' aria-label='Dodaj metodę'>
				<Plus size={16} />
			</button>
		</>
	)
}

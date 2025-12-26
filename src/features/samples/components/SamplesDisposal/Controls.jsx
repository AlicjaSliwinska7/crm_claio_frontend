import React from 'react'
import SearchBar from '../../../../shared/tables/components/SearchBar'

export default function Controls({
	filter,
	setFilter,
	view,
	setView,
	resetToFirstPage,
	setSortConfig,
	VIEW_ACTIVE,
	VIEW_ARCHIVE,
}) {
	return (
		<>
			<SearchBar
				value={filter}
				placeholder='Znajdź wpis...'
				onChange={val => {
					setFilter(val)
					resetToFirstPage(true)
				}}
				onClear={() => {
					setFilter('')
					resetToFirstPage(true)
				}}
			/>

			<select
				className='training-filter-select'
				value={view}
				onChange={e => {
					const nextView = e.target.value
					setView(nextView)
					// domyślne sortowanie po zmianie widoku (jak w oryginale)
					const nextSort =
						nextView === VIEW_ACTIVE ? { key: 'sampleNo', direction: 'asc' } : { key: 'disposedAt', direction: 'desc' }
					setSortConfig(nextSort)
					resetToFirstPage(true)
				}}
				title='Widok'>
				<option value={VIEW_ACTIVE}>Do utylizacji</option>
				<option value={VIEW_ARCHIVE}>Archiwum: zutylizowane</option>
			</select>
		</>
	)
}

import React from 'react'
import SearchBar from '../../../../shared/tables/components/SearchBar'

export default function Controls({
	filter,
	setFilter,
	view,
	setView,
	resetToFirstPage,
	setSortConfig,
	VIEW_PRE,
	VIEW_PICKUP,
	VIEW_ARCH_DELIVERED,
	VIEW_ARCH_PICKEDUP,
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
					setView(e.target.value)
					setSortConfig({ key: null, direction: 'asc' })
					resetToFirstPage(true)
				}}
				title='Widok'>
				<option value={VIEW_PRE}>Przed dostawą</option>
				<option value={VIEW_PICKUP}>Do odbioru</option>
				<option value={VIEW_ARCH_DELIVERED}>Archiwum: ostatnio dostarczone</option>
				<option value={VIEW_ARCH_PICKEDUP}>Archiwum: ostatnio odebrane</option>
			</select>
		</>
	)
}

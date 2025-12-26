import React from 'react'
import SearchBar from '../../../../shared/tables/components/SearchBar'
import { SAMPLE_STATUSES } from './config'

export default function Controls({ filter, setFilter, filterStatus, setFilterStatus, resetToFirstPage }) {
	return (
		<>
			<SearchBar
				value={filter}
				placeholder='Znajdź próbkę...'
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
				value={filterStatus}
				onChange={e => {
					setFilterStatus(e.target.value)
					resetToFirstPage(true)
				}}
				className='training-filter-select'
				title='Filtr statusu'>
				<option value='wszystkie'>Wszystkie</option>
				{SAMPLE_STATUSES.map(s => (
					<option key={s} value={s}>
						{s[0].toUpperCase() + s.slice(1)}
					</option>
				))}
			</select>
		</>
	)
}

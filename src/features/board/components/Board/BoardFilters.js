import React from 'react'
import { XCircle } from 'lucide-react'

function BoardFilters({
	filterType,
	setFilterType,
	filterAuthor,
	setFilterAuthor,
	filterMentioned,
	setFilterMentioned,
	filterPriority,
	setFilterPriority,
	filterTag,
	setFilterTag,
	gotoDate,
	setGotoDate,
	posts,
	users,
	setCurrentDay,
	onResetFilters, // <- dodane
}) {
	const handleDateChange = e => {
		const selectedDate = e.target.value
		setGotoDate(selectedDate)
		if (selectedDate) {
			setCurrentDay(new Date(selectedDate))
		}
	}

	const uniqueAuthors = Array.from(new Set(posts.map(p => p.author)))
	const allTags = [...new Set(posts.flatMap(p => p.tags || []))]

	return (
		<div className='board-filters'>
			<select value={filterType} onChange={e => setFilterType(e.target.value)}>
				<option value='all'>Wszystko</option>
				<option value='post'>Posty</option>
				<option value='task'>Zadania</option>
			</select>
			<select value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}>
				<option value=''>Autor</option>
				{uniqueAuthors.map(author => (
					<option key={author} value={author}>
						{author}
					</option>
				))}
			</select>
			<select value={filterMentioned} onChange={e => setFilterMentioned(e.target.value)}>
				<option value=''>Oznaczony</option>
				<option value='wszyscy'>wszyscy</option> {/* ✅ Dodajemy to */}
				{(users || []).map(u => (
					<option key={u} value={u}>
						{u}
					</option>
				))}
			</select>

			<select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
				<option value=''>Priorytet</option>
				<option value='wysoki'>Wysoki</option>
				<option value='normalny'>Normalny</option>
				<option value='niski'>Niski</option>
			</select>
			<select value={filterTag} onChange={e => setFilterTag(e.target.value)}>
				<option value=''>Tagi</option>
				{allTags.map(tag => (
					<option key={tag} value={tag}>
						{tag}
					</option>
				))}
			</select>
			<input type='date' value={gotoDate} onChange={handleDateChange} className='goto-date-input' />
			<button onClick={onResetFilters} title='Wyczyść filtry' className='reset-filters-button'>
				<XCircle size={20} />
			</button>
		</div>
	)
}

export default BoardFilters

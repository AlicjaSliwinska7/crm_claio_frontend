import React from 'react'
import SearchBar from '../../../shared/tables/components/SearchBar'
import { STATUS_DEFS, OUTCOME_DEFS } from './constants'
import { CircleX } from '../../../shared/modals/ui/icons/icons'

/**
 * Panel kontrolek (wyszukiwarka, selecty, daty, reset)
 * — Zachowuje klasy/wygląd z istniejących list.
 */
export default function TestsFilters({
	filter,
	setFilter,
	filterStatus,
	setFilterStatus,
	filterOutcome,
	setFilterOutcome,
	startOn,
	setStartOn,
	endOn,
	setEndOn,
	onReset,
}) {
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			{/* rząd 1: search */}
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
				<SearchBar
					value={filter}
					placeholder='Znajdź badanie...'
					onChange={val => setFilter(val)}
					onClear={() => setFilter('')}
				/>
			</div>

			{/* rząd 2: status + wynik + daty + reset */}
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
				<select
					className='training-filter-select'
					value={filterStatus}
					onChange={e => setFilterStatus(e.target.value)}
					title='Filtr statusu'
					style={{ minWidth: 180 }}>
					<option value='wszystkie'>Wszystkie statusy</option>
					{STATUS_DEFS.map(s => (
						<option key={s.key} value={s.key}>
							{s.label}
						</option>
					))}
				</select>

				<select
					className='training-filter-select'
					value={filterOutcome}
					onChange={e => setFilterOutcome(e.target.value)}
					title='Filtr wyniku'
					style={{ minWidth: 160 }}>
					<option value='wszystkie'>Wszystkie wyniki</option>
					{OUTCOME_DEFS.map(o => (
						<option key={o.key} value={o.key}>
							{o.label}
						</option>
					))}
				</select>

				<div className='ts-control' style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
					<label htmlFor='filter-startOn' className='muted' style={{ fontSize: 12 }}>
						Data rozpoczęcia
					</label>
					<input
						id='filter-startOn'
						type='date'
						className='search-bar ts-date'
						value={startOn}
						onChange={e => setStartOn(e.target.value)}
						title='Data rozpoczęcia'
						style={{ minWidth: 160 }}
					/>
				</div>

				<div className='ts-control' style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
					<label htmlFor='filter-endOn' className='muted' style={{ fontSize: 12 }}>
						Data zakończenia
					</label>
					<input
						id='filter-endOn'
						type='date'
						className='search-bar ts-date'
						value={endOn}
						onChange={e => setEndOn(e.target.value)}
						title='Data zakończenia'
						style={{ minWidth: 160 }}
					/>
				</div>

				<button
					type='button'
					className='reset-filters-button'
					onClick={onReset}
					title='Wyczyść filtry'
					aria-label='Wyczyść filtry'
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: 34,
						width: 38,
						borderRadius: 8,
					}}>
					<CircleX size={20} strokeWidth={2} />
					<span className='sr-only'>Wyczyść</span>
				</button>
			</div>
		</div>
	)
}

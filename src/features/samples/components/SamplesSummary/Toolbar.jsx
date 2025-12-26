// src/pages/components/SamplesSummary/Toolbar.jsx
import React from 'react'

export default function Toolbar({ groupBy, setGroupBy, onReset, onExportXls }) {
	return (
		<div className='smpl-toolbar'>
			<div className='smpl-toolbar__left'>
				<div className='ts-control'>
					<label className='muted small'>Grupuj według</label>
					<select className='smpl-select' value={groupBy} onChange={e => setGroupBy(e.target.value)}>
						<option value='byCode'>Kodu próbek</option>
						<option value='bySubject'>Przedmiotu badawczego</option>
						<option value='byClient'>Klienta</option>
					</select>
				</div>

				<button title='Wyczyść filtry' className='smpl-reset' onClick={onReset} aria-label='Wyczyść filtry'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						aria-hidden='true'>
						<circle cx='12' cy='12' r='10'></circle>
						<path d='m15 9-6 6'></path>
						<path d='m9 9 6 6'></path>
					</svg>
				</button>
			</div>

			<div className='smpl-toolbar__right'>
				{/* Eksport do Excela (ikona FA jak proszono) */}
				<button
					type='button'
					className='smpl-btn--icon smpl-btn--export'
					onClick={onExportXls}
					title='Eksport do Excela'
					aria-label='Eksport do Excela'>
					<i className='fa-solid fa-file-export' aria-hidden='true' />
				</button>
			</div>
		</div>
	)
}

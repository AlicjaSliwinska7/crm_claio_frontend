import React from 'react'

export default function Kpis({ kpis }) {
	return (
		<div className='es-card es-section'>
			{/* Ujednolicony nagłówek karty */}
			<div className='es-card__sectionHead'>
				<i className='fa-solid fa-gauge-high' aria-hidden='true' />
				<h3 className='es-card__sectionTitle'>Podsumowanie</h3>
			</div>

			{/* Grid KPI */}
			<div className='es-kpi-grid'>
				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.calCount}</div>
					<div className='es-kpi__label'>Wzorcowania</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.devices}</div>
					<div className='es-kpi__label'>Urządzenia</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.labs}</div>
					<div className='es-kpi__label'>Laboratoria</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.calCostFormatted}</div>
					<div className='es-kpi__label'>Koszt wzorcowań</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.calAvgDaysFormatted}</div>
					<div className='es-kpi__label'>Śr. czas [dni]</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.failCount}</div>
					<div className='es-kpi__label'>Awarii</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.downSumFormatted}</div>
					<div className='es-kpi__label'>Przestój łącznie</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.downAvgFormatted}</div>
					<div className='es-kpi__label'>Śr. przestój</div>
				</div>

				<div className='es-kpi'>
					<div className='es-kpi__value'>{kpis.repairSumFormatted}</div>
					<div className='es-kpi__label'>Koszt napraw</div>
				</div>
			</div>
		</div>
	)
}

// equipment/components/CalibrationSchedule/KPICards.jsx
import React from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

// 🔗 wspólne utils — jeden punkt prawdy dla statusów i kolorów
import { STATUS, STATUS_COLOR, COLOR_PLANNED_SEND, COLOR_PLANNED_RETURN } from '../../utils/utils'

export default function KPICards({ kpis }) {
	const from = kpis?.rangeFrom ? format(kpis.rangeFrom, 'dd.MM.yyyy', { locale: pl }) : '—'
	const to = kpis?.rangeTo ? format(kpis.rangeTo, 'dd.MM.yyyy', { locale: pl }) : '—'

	return (
		<section className='kpi-section' aria-label='Podsumowania (KPI)'>
			<div className='kpi-grid'>
				<ArticleCard label='Łącznie' value={kpis.total} />

				{/* Statusowe KPI spięte z utils */}
				<ArticleCard
					label='Do wzorcowania'
					value={kpis.dueSoon}
					tone='soon' // mapuje się do STATUS.DUE_SOON
				/>
				<ArticleCard
					label='Po terminie'
					value={kpis.overdue}
					tone='overdue' // mapuje się do STATUS.OVERDUE
				/>
				<ArticleCard
					label='W trakcie'
					value={kpis.inProgress}
					tone='progress' // mapuje się do STATUS.IN_PROGRESS
				/>
			</div>

			<div className='kpi-grid kpi-grid--secondary'>
				{/* Planowane wysyłki/zwroty — też z utils */}
				<ArticleCard
					label='Planowane wysyłki'
					value={kpis.plannedSend}
					soft
					tone='plannedSend' // COLOR_PLANNED_SEND
				/>
				<ArticleCard
					label='Planowane zwroty'
					value={kpis.plannedReturn}
					soft
					tone='plannedReturn' // COLOR_PLANNED_RETURN
				/>
				<ArticleCard label='Miejsc wzorcowania' value={kpis.places} soft />
				<ArticleCard label='Brak miejsca' value={kpis.noPlace} soft />
			</div>

			<div className='kpi-range'>
				<span className='kpi-range__label'>Zakres „Następna kalibracja”</span>
				<span className='kpi-range__chip'>
					{from} — {to}
				</span>
			</div>
		</section>
	)
}

/**
 * Mapowanie tonów na kolory – TYLKO przez utils.
 * Nic nie jest hardcodowane w komponencie.
 */
function toneToColor(tone) {
	if (!tone) return undefined
	switch (tone) {
		case 'soon':
			return STATUS_COLOR[STATUS.DUE_SOON]
		case 'overdue':
			return STATUS_COLOR[STATUS.OVERDUE]
		case 'progress':
			return STATUS_COLOR[STATUS.IN_PROGRESS]
		case 'plannedSend':
			return COLOR_PLANNED_SEND
		case 'plannedReturn':
			return COLOR_PLANNED_RETURN
		default:
			return undefined
	}
}

function ArticleCard({ label, value, tone, soft = false }) {
	const classes = ['kpi-card', soft ? 'kpi-card--soft' : '', tone ? `kpi-card--${tone}` : ''].filter(Boolean).join(' ')

	// Podajemy akcent przez CSS var — możesz to wykorzystać w obecnym CSS:
	// .kpi-card { border-color: var(--kpi-accent); }
	// .kpi-card__value { color: var(--kpi-accent); } (przykład)
	const style = {}
	const accent = toneToColor(tone)
	if (accent) style['--kpi-accent'] = accent

	return (
		<article className={classes} style={style}>
			<div className='kpi-card__value'>{value}</div>
			<div className='kpi-card__label'>{label}</div>
		</article>
	)
}

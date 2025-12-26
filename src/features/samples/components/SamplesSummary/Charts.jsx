import React from 'react'

export default function Charts({ charts, BarChartCounts, StackedBarsByMonth, LineChartByMonth }) {
	const counts = charts?.counts ?? {}
	const keys = charts?.keys ?? []
	const labels = charts?.monthLabels ?? []
	const series = charts?.monthSeries ?? {}

	// Paleta z możliwością nadpisania
	const palette =
		Array.isArray(charts?.colors) && charts.colors.length
			? charts.colors
			: ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#3b82f6']

	const labelNazwa = charts?.labelNazwa ?? 'kodu'
	const windowBadge = labels?.length ? `${labels.length} mies.` : null

	// Wspólny nagłówek tytułu wykresu
	const ChartHeader = ({
		title,
		subtitle,
		badge,
		variant = 'bar', // 'bar' | 'underline' | 'dot'
		align = 'center', // 'left' | 'center' | 'right'
		compact = false,
	}) => {
		const headerCls = [
			'smpl-chart__header',
			align === 'center' && 'smpl-chart__header--center',
			align === 'right' && 'smpl-chart__header--right',
			compact && 'smpl-chart__header--compact',
		]
			.filter(Boolean)
			.join(' ')

		const titleCls = [
			'smpl-chart__title',
			variant === 'bar' && 'smpl-chart__title--bar',
			variant === 'underline' && 'smpl-chart__title--underline',
			variant === 'dot' && 'smpl-chart__title--dot',
			compact && 'smpl-chart__title--compact',
			'smpl-chart__title--truncate',
		]
			.filter(Boolean)
			.join(' ')

		return (
			<div className={headerCls}>
				<h3 className={titleCls}>{title}</h3>
				{subtitle ? <p className='smpl-chart__subtitle'>{subtitle}</p> : null}
				{badge ? <span className='smpl-chart__badge'>{badge}</span> : null}
			</div>
		)
	}

	const Legend = () => (
		<div className='smpl-legend' style={{ marginTop: 4 }}>
			{keys.map((k, i) => (
				<span key={k} className='smpl-legend__item'>
					<span className='smpl-legend__dot' style={{ background: palette[i % palette.length] }} aria-hidden='true' />
					<span className='smpl-legend__name'>{k}</span>
				</span>
			))}
		</div>
	)

	return (
		<div className='smpl-charts'>
			{/* 1) Rozkład (pionowe słupki) */}
			<div className='smpl-chart smpl-card smpl-chart--narrow'>
				<ChartHeader
					title={`Rozkład ${labelNazwa}`}
					subtitle='Po aktualnych filtrach'
					badge={Object.values(counts).reduce((a, b) => a + (Number(b) || 0), 0) || '0'}
					variant='bar'
					align='center'
					compact
				/>
				<BarChartCounts counts={counts} keys={keys} colors={palette} showLabels />
				<Legend />
			</div>

			{/* 2) Miesięcznie: stacked + legenda pod spodem */}
			{labels.length > 0 ? (
				<>
					<div className='smpl-card smpl-chart'>
						<ChartHeader
							title={`Miesięcznie (słupki sumowane) – wg ${labelNazwa}`}
							subtitle='Sumy per miesiąc'
							badge={windowBadge}
							variant='bar'
							align='center'
						/>
						<StackedBarsByMonth series={series} labels={labels} keys={keys} colors={palette} />
						<Legend />
					</div>

					{/* 3) Trend liniowy + legenda pod spodem */}
					<div className='smpl-card smpl-chart'>
						<ChartHeader
							title={`Trend liczby próbek / miesiąc – wg ${labelNazwa}`}
							subtitle='Zmiana w czasie'
							badge={windowBadge}
							variant='bar'
							align='center'
						/>
						<LineChartByMonth series={series} labels={labels} keys={keys} colors={palette} />
						<Legend />
					</div>
				</>
			) : (
				<div className='smpl-card ta-center'>Brak danych do wykresów miesięcznych.</div>
			)}
		</div>
	)
}

// src/features/tests/components/TestsSummary/ClientTime.jsx
import React, { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts'
import { Users } from 'lucide-react'

// wspólne klocki i utilsy
import {
	Section,
	FiltersBar,
	ChartToolbar,
	ClientSelect,
	SummaryEmpty,
	useRangePreset,
	useChartControls,
	useUniqueValues,
	summaryColors, // { colorFor, NEUTRAL, ACCENT, withAlpha }
	summaryTime, // { dayISO, computePresetRangeISO, bucketKeyByGranularity }
	summaryData, // { aggregateTimeSeries, topNByKey }
} from '../../../../shared/summaries'

// stałe metryk (poza komponentem)
const METRICS = [
	{ key: 'testsCount', label: 'Liczba badań' },
	{ key: 'samplesCount', label: 'Liczba próbek' },
]

/**
 * „Wszystkie przeprowadzone badania dla wybranego klienta”
 * props:
 *  - series: [{ date, client, methodId, testsCount, samplesCount }, ...]
 *  - methodKey: (id) => string  // stabilny klucz/etykieta metody (np. PB-101)
 */
export default function ClientTime({ series = [], methodKey = id => id }) {
	const { colorFor, NEUTRAL, ACCENT, withAlpha } = summaryColors
	const { dayISO, computePresetRangeISO, bucketKeyByGranularity } = summaryTime

	// wybór klienta
	const [client, setClient] = useState('')

	// zakres + metryka
	const { preset, setPreset, from, setFrom, to, setTo } = useRangePreset('year')
	const { metric, setMetric } = useChartControls({ defaultMetric: 'testsCount' })

	// unikalne nazwy klientów (shared hook) + sort alfabetyczny PL
	const uniqueClients = useUniqueValues(series, s => s.client)
		.slice()
		.sort((a, b) => String(a || '').localeCompare(String(b || ''), 'pl'))

	// okres (fromISO/toISO/granularity)
	const period = useMemo(() => computePresetRangeISO(preset, from, to), [preset, from, to, computePresetRangeISO])

	// filtr serii dla klienta + okres
	const seriesClient = useMemo(() => {
		if (!client) return []
		const list0 = series.filter(s => s.client === client)
		const { fromISO, toISO } = period
		if (!fromISO && !toISO) return list0
		return list0.filter(s => {
			const d = dayISO(s.date)
			if (fromISO && (!d || d < fromISO)) return false
			if (toISO && (!d || d > toISO)) return false
			return true
		})
	}, [series, client, period, dayISO])

	// timeseries (do bucketów wg granularity)
	const timeSeries = useMemo(() => {
		if (!seriesClient.length) return []
		const prepared = seriesClient.map(e => ({ ...e, value: Number(e?.[metric] || 0) }))
		return summaryData.aggregateTimeSeries(prepared, {
			dateKey: 'date',
			valueKey: 'value',
			granularity: period.granularity,
			bucketKeyByGranularity,
		})
	}, [seriesClient, metric, period.granularity, bucketKeyByGranularity])

	// TOP metody klienta
	const topMethodsForClient = useMemo(() => {
		if (!seriesClient.length) return []
		const prepared = seriesClient.map(e => ({
			key: methodKey(e.methodId),
			value: Number(e?.[metric] || 0),
		}))
		return summaryData
			.topNByKey(prepared, { keyFn: x => x.key, valueKey: 'value', n: 15 })
			.map(({ key, value }) => ({ method: key, value }))
	}, [seriesClient, metric, methodKey])

	const hasClient = Boolean(client)

	return (
		<Section
			title='Wszystkie przeprowadzone badania dla wybranego klienta'
			icon={<Users className='es-headIcon' aria-hidden='true' />}>
			{/* Toolbar (wspólne klocki) */}
			<FiltersBar preset={preset} setPreset={setPreset} from={from} setFrom={setFrom} to={to} setTo={setTo}>
				<ClientSelect
					value={client}
					onChange={setClient}
					options={uniqueClients}
					datalistId='clients-list-clienttime'
					placeholder='Wybierz klienta…'
					ariaLabel='Wybierz klienta do analizy'
				/>
			</FiltersBar>

			<ChartToolbar metric={metric} setMetric={setMetric} metrics={METRICS} />

			{/* Wykres: aktywność w czasie */}
			<div className='es-chart' role='figure' aria-label='Aktywność klienta w czasie' style={{ height: 320 }}>
				{hasClient ? (
					timeSeries.length ? (
						<ResponsiveContainer>
							<BarChart data={timeSeries} margin={{ top: 20, right: 16, bottom: 10, left: 8 }}>
								<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.5)} />
								<XAxis dataKey='bucket' />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='value' name={metric === 'testsCount' ? 'Badania' : 'Próbki'} fill={ACCENT} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<SummaryEmpty message='Brak danych w wybranym zakresie dla tego klienta.' />
					)
				) : (
					<SummaryEmpty message='Wybierz klienta, aby zobaczyć jego aktywność w czasie.' />
				)}
			</div>

			{/* Wykres: najczęstsze metody */}
			<h4 className='ts-subtitle' style={{ marginTop: 8 }}>
				Najczęściej wykonywane badania dla klienta {hasClient ? <em>{client}</em> : '—'}
			</h4>
			<div className='es-chart' role='figure' aria-label='Najczęstsze metody dla klienta' style={{ height: 320 }}>
				{hasClient ? (
					topMethodsForClient.length ? (
						<ResponsiveContainer>
							<BarChart data={topMethodsForClient} margin={{ top: 20, right: 16, bottom: 10, left: 8 }}>
								<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.5)} />
								<XAxis dataKey='method' angle={-25} textAnchor='end' height={70} />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='value' name={metric === 'testsCount' ? 'Badania' : 'Próbki'} isAnimationActive={false}>
									{topMethodsForClient.map(d => (
										<Cell key={d.method} fill={colorFor(d.method)} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<SummaryEmpty message='Brak metod do wyświetlenia dla bieżących filtrów.' />
					)
				) : (
					<SummaryEmpty message='Wybierz klienta powyżej.' />
				)}
			</div>
		</Section>
	)
}

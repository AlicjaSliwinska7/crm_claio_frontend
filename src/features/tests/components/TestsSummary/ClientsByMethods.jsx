// src/features/tests/components/TestsSummary/ClientsByMethods.jsx
import React, { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Layers } from 'lucide-react'

import {
	Section,
	FiltersBar,
	ChartToolbar,
	DataTableLite,
	ExportCsvButton,
	SummaryPagination,
	SummaryEmpty,
	useRangePreset,
	useChartControls,
	usePagination,
	summaryColors,
	summaryData,
	summaryTime,
} from '../../../../shared/summaries'

const clientHref = name => (name && name !== '—' ? `/clients?name=${encodeURIComponent(name)}` : null)

const METRICS = [
	{ key: 'testsCount', label: 'Liczba badań' },
	{ key: 'samplesCount', label: 'Liczba próbek' },
]

export default function ClientsByMethods({ rows = [], methodKey = id => id }) {
	// kolory
	const NEUTRAL = summaryColors?.NEUTRAL || '#94a3b8'
	const palette = useMemo(() => {
		if (Array.isArray(summaryColors?.palette) && summaryColors.palette.length) {
			return summaryColors.palette
		}
		const vals = Object.values(summaryColors || {}).filter(v => typeof v === 'string')
		return vals.length ? vals : ['#3a628a', '#6e9cc5', '#9fbad3', '#cfd9e6']
	}, [])
	const withAlpha =
		typeof summaryColors?.withAlpha === 'function'
			? summaryColors.withAlpha
			: (_c, a) => `rgba(0,0,0,${Math.max(0, Math.min(1, Number(a)))})`
	const colorFor = (key, idx = 0) => {
		if (summaryColors && typeof summaryColors[key] === 'string') return summaryColors[key]
		return palette[idx % palette.length]
	}

	const { dayISO, computePresetRangeISO } = summaryTime
	const { preset, setPreset, from, setFrom, to, setTo } = useRangePreset('year')
	const { metric, setMetric } = useChartControls({ defaultMetric: 'testsCount' })

	const period = useMemo(() => computePresetRangeISO(preset, from, to), [preset, from, to, computePresetRangeISO])

	const filtered = useMemo(() => {
		const list = Array.isArray(rows) ? rows : []
		const { fromISO, toISO } = period
		if (!fromISO && !toISO) return list
		return list.filter(r => {
			const d = dayISO(r.date)
			if (fromISO && (!d || d < fromISO)) return false
			if (toISO && (!d || d > toISO)) return false
			return true
		})
	}, [rows, period, dayISO])

	const { chartData, methodKeys } = useMemo(() => {
		// jeśli shared ma gotową funkcję, użyjemy jej kiedyś — na razie nasza agregacja
		if (summaryData && typeof summaryData.buildClientsByMethods === 'function') {
			summaryData.buildClientsByMethods(filtered, {
				metric,
				methodKey,
				topClients: 50,
				topMethods: 5,
				otherLabel: 'Inne',
			})
		}

		const clientsMap = new Map()
		const methodsSet = new Set()

		for (const r of filtered) {
			const client = r.client || '—'
			const method = methodKey(r.methodId || '—')
			methodsSet.add(method)
			const val = Number(r?.[metric] || 0)

			const bucket = clientsMap.get(client) || { client }
			bucket[method] = (bucket[method] || 0) + val
			bucket.__total = (bucket.__total || 0) + val
			clientsMap.set(client, bucket)
		}

		const methods = [...methodsSet].sort((a, b) => String(a).localeCompare(String(b), 'pl'))
		const data = [...clientsMap.values()].sort((a, b) => (b.__total || 0) - (a.__total || 0))

		return { chartData: data, methodKeys: methods }
	}, [filtered, metric, methodKey, summaryData])

	const { pageItems, currentPage, pageCount, onPageChange } = usePagination(chartData, { pageSize: 10 })

	const csvRows = useMemo(
		() =>
			chartData.map(row => {
				const { client, __total, ...rest } = row
				return {
					klient: client,
					suma: __total,
					...rest,
				}
			}),
		[chartData]
	)

	return (
		<Section title='Klienci wg metod badań' icon={<Layers className='es-headIcon' aria-hidden='true' />}>
			<FiltersBar preset={preset} setPreset={setPreset} from={from} setFrom={setFrom} to={to} setTo={setTo}>
				<div className='es-col' style={{ minWidth: 200 }}>
					<label className='es-label' htmlFor='clients-period'>
						Okres
					</label>
					{/* sam FiltersBar dba o daty, ale label robimy tu dla spójności */}
					<input id='clients-period' type='text' className='es-input' value='wg presetów' readOnly />
				</div>

				{/* 👇 tu był drugi label „Metryka” — usuwamy, bo ChartToolbar już wyświetla swój */}
				<div className='es-col' style={{ minWidth: 180 }}>
					<ChartToolbar id='clients-metric' metric={metric} setMetric={setMetric} metrics={METRICS} compact />
				</div>
			</FiltersBar>

			<div className='es-chart' style={{ height: 320, marginTop: 8 }}>
				{chartData.length ? (
					<ResponsiveContainer>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.4)} />
							<XAxis dataKey='client' />
							<YAxis />
							<Tooltip />
							<Legend />
							{methodKeys.map((m, idx) => (
								<Bar key={m} dataKey={m} name={`Metoda ${m}`} fill={colorFor(m, idx)} />
							))}
						</BarChart>
					</ResponsiveContainer>
				) : (
					<SummaryEmpty message='Brak danych dla wybranego zakresu.' />
				)}
			</div>

			<div style={{ marginTop: 14 }}>
				{chartData.length ? (
					<>
						<DataTableLite
							columns={[
								{ key: 'client', label: 'Klient', width: '30%' },
								...methodKeys.map(m => ({
									key: m,
									label: m,
									align: 'right',
								})),
								{ key: '__total', label: 'Suma', align: 'right' },
							]}
							rows={pageItems.map(r => {
								const href = clientHref(r.client)
								return {
									...r,
									client: href ? (
										<a href={href} className='tss-link' title={`Pokaż klienta ${r.client}`}>
											{r.client}
										</a>
									) : (
										r.client
									),
								}
							})}
						/>
						<div className='table-actions table-actions--inline' style={{ marginTop: 8 }}>
							<SummaryPagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
							<ExportCsvButton rows={csvRows} filename='klienci_wg_metod' />
						</div>
					</>
				) : (
					<SummaryEmpty inset message='Brak rekordów do wyświetlenia.' />
				)}
			</div>
		</Section>
	)
}

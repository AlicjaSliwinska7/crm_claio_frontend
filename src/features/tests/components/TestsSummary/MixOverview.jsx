// src/features/tests/components/TestsSummary/MixOverview.jsx
import React, { useMemo, useState, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
	LabelList,
} from 'recharts'
import { BarChart3 } from 'lucide-react'

import {
	Section,
	FiltersBar,
	ChartToolbar,
	ClientSelect,
	SummarySelect,
	SummaryEmpty,
	ExportCsvButton,
	useRangePreset,
	useChartControls,
	useUniqueValues,
	summaryColors,
	summaryTime,
	DEFAULT_MARGINS,
	DEFAULT_MARGINS_WITH_BOTTOM_AXIS,
} from '../../../../shared/summaries'

function MixOverview({ series = [], methodKey }) {
	// kolory/fallbacki
	const NEUTRAL = summaryColors?.NEUTRAL || '#94a3b8'
	const palette = useMemo(() => {
		if (Array.isArray(summaryColors?.palette) && summaryColors.palette.length) return summaryColors.palette
		const vals = Object.values(summaryColors || {}).filter(v => typeof v === 'string')
		return vals.length ? vals : ['#3a628a', '#6e9cc5', '#9fbad3', '#cfd9e6']
	}, [])
	const withAlpha =
		typeof summaryColors?.withAlpha === 'function'
			? summaryColors.withAlpha
			: (_c, a) => `rgba(0,0,0,${Math.max(0, Math.min(1, Number(a)))})`
	const colorFor = useCallback(
		(key, idx = 0) => {
			if (summaryColors && typeof summaryColors[key] === 'string') return summaryColors[key]
			return palette[idx % palette.length]
		},
		[palette]
	)

	const { dayISO, monthKeyISO, computePresetRangeISO } = summaryTime

	const { preset, setPreset, from, setFrom, to, setTo } = useRangePreset('year')
	const { metric, setMetric } = useChartControls({ defaultMetric: 'testsCount' })
	const METRICS = [
		{ key: 'testsCount', label: 'Liczba badań' },
		{ key: 'samplesCount', label: 'Liczba próbek' },
	]

	const [chartType, setChartType] = useState('grouped')
	const [asPercent, setAsPercent] = useState(false)
	const [showTotals, setShowTotals] = useState(true)
	const [monthSort, setMonthSort] = useState('chron')

	const uniqueClients = useUniqueValues(series, s => s.client)
	const [clientFilter, setClientFilter] = useState('')

	const methodKeySafe = useCallback(id => (typeof methodKey === 'function' ? methodKey(id) : id ?? '?'), [methodKey])

	const period = useMemo(() => computePresetRangeISO(preset, from, to), [preset, from, to, computePresetRangeISO])

	const seriesFiltered = useMemo(() => {
		const list = Array.isArray(series) ? series : []
		const { fromISO, toISO } = period
		return list.filter(s => {
			if (clientFilter && String(s.client) !== clientFilter) return false
			if (!fromISO && !toISO) return true
			const d = dayISO(s.date)
			if (fromISO && (!d || d < fromISO)) return false
			if (toISO && (!d || d > toISO)) return false
			return true
		})
	}, [series, period, clientFilter, dayISO])

	const seriesByMonthAndMethod = useMemo(() => {
		const months = new Map()
		const methodKeys = new Set()

		for (const e of seriesFiltered) {
			const m = methodKeySafe(e.methodId)
			methodKeys.add(m)
			const month = monthKeyISO(e.date)
			const bucket = months.get(month) || { month }
			bucket[m] = (bucket[m] || 0) + Number(e?.[metric] || 0)
			months.set(month, bucket)
		}

		const keys = [...methodKeys].sort((a, b) => String(a).localeCompare(String(b), 'pl'))
		const data = [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
		return { data, keys }
	}, [seriesFiltered, metric, methodKeySafe, monthKeyISO])

	const chartDataMixed = useMemo(() => {
		const { data, keys } = seriesByMonthAndMethod
		return data.map(row => {
			const total = keys.reduce((s, k) => s + Number(row[k] || 0), 0)
			const out = { month: row.month, __total: total }
			keys.forEach(k => {
				const v = Number(row[k] || 0)
				out[k] = asPercent ? (total > 0 ? (v / total) * 100 : 0) : v
			})
			return out
		})
	}, [seriesByMonthAndMethod, asPercent])

	const chartDataSorted = useMemo(() => {
		const copy = [...chartDataMixed]
		if (monthSort === 'chron') return copy.sort((a, b) => a.month.localeCompare(b.month))
		if (monthSort === 'sumAsc') return copy.sort((a, b) => a.__total - b.__total)
		return copy.sort((a, b) => b.__total - a.__total)
	}, [chartDataMixed, monthSort])

	const tooltipFmt = useCallback((val, name) => [asPercent ? `${Number(val).toFixed(1)}%` : val, name], [asPercent])
	const yTickFmt = useCallback(val => (asPercent ? `${val}%` : val), [asPercent])

	// --- CSV export setup ---
	const csvColumns = useMemo(() => {
		const methodCols = seriesByMonthAndMethod.keys.map(m => ({ key: m, label: `Metoda ${m}` }))
		return [{ key: 'month', label: 'Miesiąc' }, ...methodCols, { key: '__total', label: 'Suma' }]
	}, [seriesByMonthAndMethod.keys])

	const csvRows = useMemo(() => chartDataSorted || [], [chartDataSorted])

	const actions = useMemo(
		() => (
			<ExportCsvButton
				filename='mix_overview.csv'
				columns={csvColumns}
				rows={csvRows}
				title='Eksportuj CSV (wszystkie)'
				ariaLabel='Eksportuj CSV (wszystkie)'
			/>
		),
		[csvColumns, csvRows]
	)

	return (
		<Section
			title='Wszystkie przeprowadzone badania'
			icon={<BarChart3 className='es-headIcon' aria-hidden='true' />}
			actions={actions}>
			<FiltersBar preset={preset} setPreset={setPreset} from={from} setFrom={setFrom} to={to} setTo={setTo}>
				{/* ClientSelect sam rysuje label – nie dodajemy swojego */}
				<div className='es-col' style={{ minWidth: 240 }}>
					<ClientSelect
						id='mix-client'
						value={clientFilter}
						onChange={setClientFilter}
						options={uniqueClients}
						datalistId='mix-clients-list'
					/>
				</div>

				<div className='es-col' style={{ minWidth: 180 }}>
					<label className='es-label' htmlFor='mix-chart-type'>
						Typ wykresu
					</label>
					<SummarySelect
						id='mix-chart-type'
						value={chartType}
						onChange={v => {
							const val = v?.target ? v.target.value : v
							setChartType(val)
							if (val === 'grouped') setAsPercent(false)
						}}
						options={[
							{ value: 'grouped', label: 'Słupki grupowane' },
							{ value: 'stacked', label: 'Słupki skumulowane' },
						]}
					/>
				</div>

				<div className='es-col' style={{ minWidth: 180 }}>
					<label className='es-label' htmlFor='mix-month-sort'>
						Sort miesięcy
					</label>
					<SummarySelect
						id='mix-month-sort'
						value={monthSort}
						onChange={v => setMonthSort(v?.target ? v.target.value : v)}
						options={[
							{ value: 'chron', label: 'Chronologicznie' },
							{ value: 'sumAsc', label: 'Wg sumy (rosnąco)' },
							{ value: 'sumDesc', label: 'Wg sumy (malejąco)' },
						]}
					/>
				</div>

				<div className='es-col' style={{ minWidth: 140, alignSelf: 'end' }}>
					<label className='es-label' htmlFor='mix-percent'>
						Tryb wartości
					</label>
					<span className='ts-inline' style={{ gap: 8 }}>
						<input
							id='mix-percent'
							type='checkbox'
							className='checkbox-lg'
							disabled={chartType !== 'stacked'}
							checked={asPercent}
							onChange={e => setAsPercent(e.target.checked)}
						/>
						100% (procentowo)
					</span>
				</div>

				<div className='es-col' style={{ minWidth: 140, alignSelf: 'end' }}>
					<label className='es-label' htmlFor='mix-totals'>
						Sumy
					</label>
					<span className='ts-inline' style={{ gap: 8 }}>
						<input
							id='mix-totals'
							type='checkbox'
							className='checkbox-lg'
							checked={showTotals}
							onChange={e => setShowTotals(e.target.checked)}
						/>
						Pokaż sumy
					</span>
				</div>
			</FiltersBar>

			{/* ChartToolbar ma swój label */}
			<ChartToolbar metric={metric} setMetric={setMetric} metrics={METRICS} />

			<div className='es-chart' style={{ height: 360, marginTop: 8 }}>
				{chartDataSorted.length ? (
					<ResponsiveContainer>
						<BarChart data={chartDataSorted} margin={DEFAULT_MARGINS_WITH_BOTTOM_AXIS}>
							<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.5)} />
							<XAxis dataKey='month' />
							<YAxis
								domain={asPercent ? [0, 110] : [0, dataMax => Math.ceil((Number(dataMax) || 0) * 1.12)]}
								tickFormatter={yTickFmt}
							/>
							<Tooltip formatter={tooltipFmt} />
							<Legend verticalAlign='top' height={32} wrapperStyle={{ marginBottom: 8 }} />
							{seriesByMonthAndMethod.keys.map((key, idx) => (
								<Bar
									key={key}
									dataKey={key}
									name={`Metoda ${key}`}
									fill={colorFor(key, idx)}
									stackId={chartType === 'stacked' ? '1' : undefined}
								/>
							))}
							{showTotals && (
								<Bar dataKey='__total' fill='transparent' isAnimationActive={false}>
									<LabelList
										dataKey='__total'
										position='top'
										formatter={v => `Σ ${Number(v).toFixed(0)}`}
										style={{ fontWeight: 600, fill: '#3a628a' }}
									/>
								</Bar>
							)}
						</BarChart>
					</ResponsiveContainer>
				) : (
					<SummaryEmpty message='Brak danych do wyświetlenia w bieżącym zakresie.' />
				)}
			</div>

			<div className='es-chart' style={{ height: 160, marginTop: 14 }}>
				{chartDataSorted.length ? (
					<ResponsiveContainer>
						<LineChart data={chartDataSorted} margin={DEFAULT_MARGINS}>
							<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.3)} />
							<XAxis dataKey='month' />
							<YAxis />
							<Tooltip />
							<Line type='monotone' dataKey='__total' name='Suma' dot={false} />
						</LineChart>
					</ResponsiveContainer>
				) : (
					<SummaryEmpty inset message='Brak trendu do pokazania.' />
				)}
			</div>
		</Section>
	)
}

MixOverview.propTypes = {
	series: PropTypes.array,
	methodKey: PropTypes.func,
}

export default memo(MixOverview)

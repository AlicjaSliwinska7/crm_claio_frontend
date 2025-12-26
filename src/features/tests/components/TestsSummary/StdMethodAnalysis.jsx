// src/features/tests/components/TestsSummary/StdMethodAnalysis.jsx
import React, { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { BookOpenCheck } from 'lucide-react'

import {
	Section,
	FiltersBar,
	ChartToolbar,
	ExportCsvButton,
	SummaryPagination,
	SummaryEmpty,
	usePagination,
	summaryColors, // może NIE mieć withAlpha
	summaryTime, // { dayISO, computePresetRangeISO, bucketKeyByGranularity }
} from '../../../../shared/summaries'

const clientHref = name => (name && name !== '—' ? `/clients?name=${encodeURIComponent(name)}` : null)

const METRICS = [
	{ key: 'testsCount', label: 'Liczba badań' },
	{ key: 'samplesCount', label: 'Liczba próbek' },
]

export default function StdMethodAnalysis({ series = [], rows = [], methodById = new Map() }) {
	// ── bezpieczne kolory / funkcje z beczki
	const NEUTRAL = summaryColors?.NEUTRAL || '#94a3b8'
	const ACCENT = summaryColors?.ACCENT || '#3a628a'
	const withAlpha =
		typeof summaryColors?.withAlpha === 'function'
			? summaryColors.withAlpha
			: (_color, a) => `rgba(0,0,0,${Math.max(0, Math.min(1, Number(a)))})`

	const { dayISO, computePresetRangeISO, bucketKeyByGranularity } = summaryTime

	// ==== local state ====
	const [stdInput, setStdInput] = useState('')
	const [methodInput, setMethodInput] = useState('')
	const [periodPreset, setPeriodPreset] = useState('all') // all | year | quarter | month | custom
	const [customFrom, setCustomFrom] = useState('')
	const [customTo, setCustomTo] = useState('')
	const [metric, setMetric] = useState('testsCount')

	// ==== safeguards ====
	const safeRows = Array.isArray(rows) ? rows : []
	const safeSeries = Array.isArray(series) ? series : []

	// ==== datalists ====
	const uniqueStandards = useMemo(
		() => Array.from(new Set(safeRows.map(r => r.standard).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl')),
		[safeRows]
	)

	const uniqueMethodsForStd = useMemo(() => {
		const scope = stdInput ? safeRows.filter(r => r.standard === stdInput) : safeRows
		return Array.from(new Set(scope.map(r => r.methodNo).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl'))
	}, [safeRows, stdInput])

	// ==== time range ====
	const { fromISO, toISO, granularity } = useMemo(() => {
		if (periodPreset === 'all') return { fromISO: null, toISO: null, granularity: 'month' }

		if (periodPreset === 'custom' && customFrom && customTo) {
			const f = dayISO(customFrom)
			const t = dayISO(customTo)
			const days = Math.max(1, (new Date(t).getTime() - new Date(f).getTime()) / 86400000)
			const g = days <= 40 ? 'day' : days <= 120 ? 'week' : 'month'
			return { fromISO: f, toISO: t, granularity: g }
		}

		// używamy tego, co daje shared – zakładamy, że zwróci { fromISO, toISO, granularity }
		return computePresetRangeISO(periodPreset)
	}, [periodPreset, customFrom, customTo, dayISO, computePresetRangeISO])

	// ==== filter series ====
	const seriesStdFiltered = useMemo(() => {
		const base = safeSeries.filter(e => {
			const meta = methodById.get(e.methodId)
			if (!meta) return false
			if (stdInput && meta.standard !== stdInput) return false
			if (methodInput && meta.methodNo !== methodInput) return false
			return true
		})

		if (!fromISO && !toISO) return base

		return base.filter(e => {
			const d = dayISO(e.date)
			if (fromISO && (!d || d < fromISO)) return false
			if (toISO && (!d || d > toISO)) return false
			return true
		})
	}, [safeSeries, methodById, stdInput, methodInput, fromISO, toISO, dayISO])

	// ==== timeseries buckets ====
	const stdTimeSeries = useMemo(() => {
		const map = new Map()
		for (const e of seriesStdFiltered) {
			const key = bucketKeyByGranularity(e.date, granularity)
			map.set(key, (map.get(key) || 0) + Number(e?.[metric] || 0))
		}
		return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([bucket, value]) => ({ bucket, value }))
	}, [seriesStdFiltered, granularity, metric, bucketKeyByGranularity])

	// ==== clients table ====
	const stdClientsTable = useMemo(() => {
		const m = new Map()
		for (const e of seriesStdFiltered) {
			const c = e.client || '—'
			const cur = m.get(c) || { client: c, tests: 0, samples: 0 }
			cur.tests += Number(e.testsCount || 0)
			cur.samples += Number(e.samplesCount || 0)
			m.set(c, cur)
		}
		return [...m.values()].sort((a, b) => b.tests - a.tests)
	}, [seriesStdFiltered])

	// ==== pagination (shared) ====
	const { page, setPage, pageSize, setPageSize, totalPages, rangeLabel } = usePagination(stdClientsTable.length, 10)

	// reset strony, gdy zmieniają się filtry
	useEffect(() => {
		setPage(1)
	}, [stdInput, methodInput, periodPreset, customFrom, customTo, metric, setPage])

	const sStart = (page - 1) * pageSize
	const sEnd = Math.min(stdClientsTable.length, sStart + pageSize)
	const sVisible = stdClientsTable.slice(sStart, sEnd)

	// ==== CSV columns ====
	const csvColumns = useMemo(
		() => [
			{ key: 'client', label: 'Klient' },
			{ key: 'tests', label: 'Badania' },
			{ key: 'samples', label: 'Próbki' },
		],
		[]
	)

	// ==== actions (export in header) ====
	const actions = useMemo(
		() => (
			<ExportCsvButton
				filename='klienci_dla_normy_metody.csv'
				columns={csvColumns}
				rows={stdClientsTable}
				title='Eksportuj CSV (wszystkie)'
				ariaLabel='Eksportuj CSV (wszystkie)'
			/>
		),
		[csvColumns, stdClientsTable]
	)

	return (
		<Section
			title='Analiza wg normy / metody badawczej'
			icon={<BookOpenCheck className='es-headIcon' aria-hidden='true' />}
			actions={actions}>
			{/* wyrównanie labeli z FiltersBar do es-label */}
			<style>
				{`
          .filters-bar label,
          .filtersbar label {
            color: #5b6f84;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.2;
          }
        `}
			</style>

			<FiltersBar>
				<div className='es-col' style={{ minWidth: 240 }}>
					<label className='es-label' htmlFor='std-std'>
						Norma
					</label>
					<input
						id='std-std'
						type='text'
						list='std-list'
						placeholder='np. ISO 527-1:2019'
						value={stdInput}
						onChange={e => {
							setStdInput(e.target.value)
							if (!e.target.value) setMethodInput('')
						}}
						className='es-input'
						title='Wpisz lub wybierz normę'
					/>
					<datalist id='std-list'>
						{uniqueStandards.map(s => (
							<option key={s} value={s} />
						))}
					</datalist>
				</div>

				<div className='es-col' style={{ minWidth: 200 }}>
					<label className='es-label' htmlFor='std-method'>
						Metoda badawcza
					</label>
					<input
						id='std-method'
						type='text'
						list='method-list'
						placeholder='np. PB-101'
						value={methodInput}
						onChange={e => setMethodInput(e.target.value)}
						className='es-input'
						title='Wpisz lub wybierz metodę'
					/>
					<datalist id='method-list'>
						{uniqueMethodsForStd.map(m => (
							<option key={m} value={m} />
						))}
					</datalist>
				</div>

				{/* tu bez dodatkowego labela, żeby nie było „Metryka” x 2 */}
				<div className='es-col' style={{ minWidth: 180 }}>
					<ChartToolbar id='std-metric' metric={metric} setMetric={setMetric} metrics={METRICS} compact />
				</div>

				<div className='es-col' style={{ minWidth: 180 }}>
					<label className='es-label' htmlFor='std-period'>
						Okres
					</label>
					<select
						id='std-period'
						className='es-select'
						value={periodPreset}
						onChange={e => setPeriodPreset(e.target.value)}>
						<option value='all'>Wszystko</option>
						<option value='year'>Rok</option>
						<option value='quarter'>Kwartał</option>
						<option value='month'>Miesiąc</option>
						<option value='custom'>Niestandardowy</option>
					</select>
				</div>

				{periodPreset === 'custom' && (
					<>
						<div className='es-col es-col--date'>
							<label className='es-label' htmlFor='std-from'>
								Od
							</label>
							<input
								id='std-from'
								type='date'
								value={customFrom}
								onChange={e => setCustomFrom(e.target.value)}
								className='es-input es-input--date'
							/>
						</div>
						<div className='es-col es-col--date'>
							<label className='es-label' htmlFor='std-to'>
								Do
							</label>
							<input
								id='std-to'
								type='date'
								value={customTo}
								onChange={e => setCustomTo(e.target.value)}
								className='es-input es-input--date'
							/>
						</div>
					</>
				)}
			</FiltersBar>

			{/* WYKRES */}
			<div className='es-chart' style={{ height: 340 }}>
				{stdTimeSeries.length ? (
					<ResponsiveContainer>
						<BarChart data={stdTimeSeries} margin={{ top: 20, right: 16, bottom: 10, left: 8 }}>
							<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.5)} />
							<XAxis dataKey='bucket' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='value' name={metric === 'testsCount' ? 'Badania' : 'Próbki'} fill={ACCENT} />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<SummaryEmpty message='Brak danych dla wybranych filtrów.' />
				)}
			</div>

			{/* TABELA + PAGINACJA */}
			<div className='tss-table-wrap' style={{ marginTop: 12 }}>
				{sVisible.length ? (
					<table className='tss-table' style={{ minWidth: '100%' }}>
						<thead>
							<tr>
								<th>Klient</th>
								<th style={{ width: '1%', whiteSpace: 'nowrap' }}>Badania</th>
								<th style={{ width: '1%', whiteSpace: 'nowrap' }}>Próbki</th>
							</tr>
						</thead>
						<tbody>
							{sVisible.map(r => {
								const href = clientHref(r.client)
								return (
									<tr key={r.client}>
										<td>
											{href ? (
												<a href={href} className='tss-link' title={`Pokaż klienta ${r.client}`}>
													{r.client}
												</a>
											) : (
												r.client
											)}
										</td>
										<td>{r.tests}</td>
										<td>{r.samples}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				) : (
					<SummaryEmpty inset message='Brak wierszy do wyświetlenia.' />
				)}

				<div className='tss-pagination'>
					<div className='tss-pagination__info'>{rangeLabel}</div>
					<SummaryPagination
						page={page}
						setPage={setPage}
						totalPages={totalPages}
						pageSize={pageSize}
						setPageSize={setPageSize}
						options={[5, 10, 20, 50]}
					/>
				</div>
			</div>
		</Section>
	)
}

StdMethodAnalysis.propTypes = {
	series: PropTypes.array,
	rows: PropTypes.array,
	methodById: PropTypes.instanceOf(Map),
}

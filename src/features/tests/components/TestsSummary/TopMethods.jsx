// src/features/tests/components/TestsSummary/TopMethods.jsx
import React, { useMemo, memo } from 'react'
import PropTypes from 'prop-types'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Microscope } from 'lucide-react'

import {
	Section,
	ExportCsvButton,
	SummaryPagination,
	SummaryEmpty,
	usePagination,
	summaryColors, // może NIE mieć withAlpha / może nie mieć wszystkich kolorów
} from '../../../../shared/summaries'

const methodHrefById = id => (id ? `/methods/${encodeURIComponent(id)}` : null)

function TopMethods({
	series = [],
	rows = [],
	methodKey, // (methodId) => np. "PB-101" (opcjonalne)
	idByMethodNo = new Map(), // Map<methodNo, methodId>
}) {
	const safeSeries = Array.isArray(series) ? series : []
	const safeRows = Array.isArray(rows) ? rows : []

	// ——————————————————————————
	// Kolory i fallbacki
	// ——————————————————————————
	const NEUTRAL = summaryColors?.NEUTRAL || '#94a3b8'
	const ACCENT = summaryColors?.ACCENT || '#3a628a'
	const SECONDARY = summaryColors?.SECONDARY || '#6e9cc5'

	const withAlpha =
		typeof summaryColors?.withAlpha === 'function'
			? summaryColors.withAlpha
			: (_c, a) => `rgba(0,0,0,${Math.max(0, Math.min(1, Number(a)))})`

	// ——————————————————————————
	// Agregacja top metod
	// ——————————————————————————
	const topMethods = useMemo(() => {
		const agg = new Map()

		// 1) z serii (daty + counts)
		for (const e of safeSeries) {
			const label = typeof methodKey === 'function' ? methodKey(e.methodId) : e.methodId || '?'
			const cur = agg.get(label) || { tests: 0, samples: 0 }
			cur.tests += Number(e.testsCount || 0)
			cur.samples += Number(e.samplesCount || 0)
			agg.set(label, cur)
		}

		// 2) nazwy metod po methodNo (z rows – np. z innej sekcji)
		const nameByMethodNo = new Map(safeRows.filter(r => r?.methodNo).map(r => [r.methodNo, r.methodName || '']))

		return [...agg.entries()]
			.map(([method, v]) => ({
				method, // np. "PB-101"
				tests: v.tests,
				samples: v.samples,
				name: nameByMethodNo.get(method) || '',
			}))
			.sort((a, b) => b.tests - a.tests)
	}, [safeSeries, safeRows, methodKey])

	// ——————————————————————————
	// Paginacja — wspólne API
	// ——————————————————————————
	const pageSizeOptions = [5, 10, 20]
	const { page, setPage, pageSize, setPageSize, totalPages, rangeLabel } = usePagination(topMethods.length, 10)

	const start = (page - 1) * pageSize
	const end = Math.min(topMethods.length, start + pageSize)
	const visible = topMethods.slice(start, end)

	// ——————————————————————————
	// CSV
	// ——————————————————————————
	const csvColumns = useMemo(
		() => [
			{ key: 'method', label: 'Nr metody' },
			{ key: 'name', label: 'Nazwa' },
			{ key: 'tests', label: 'Badania' },
			{ key: 'samples', label: 'Próbki' },
		],
		[]
	)

	return (
		<Section
			title='Najczęściej wykonywane badania'
			icon={<Microscope className='es-headIcon' aria-hidden='true' />}
			actions={
				<ExportCsvButton
					filename='top_metod.csv'
					columns={csvColumns}
					rows={topMethods}
					title='Eksportuj CSV (wszystkie)'
					ariaLabel='Eksportuj CSV (wszystkie)'
				/>
			}>
			{/* Wykres */}
			<div className='es-chart' style={{ height: 360 }}>
				{visible.length ? (
					<ResponsiveContainer>
						<BarChart data={visible} margin={{ top: 20, right: 16, bottom: 10, left: 8 }}>
							<CartesianGrid strokeDasharray='3 3' stroke={withAlpha(NEUTRAL, 0.5)} />
							<XAxis dataKey='method' angle={-30} textAnchor='end' height={70} />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='tests' name='Badania' fill={ACCENT} />
							<Bar dataKey='samples' name='Próbki' fill={SECONDARY} />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<SummaryEmpty message='Brak danych do wykresu.' />
				)}
			</div>

			{/* Tabela + paginacja */}
			<div className='tss-table-wrap' style={{ marginTop: 12 }}>
				{visible.length ? (
					<table className='tss-table' style={{ minWidth: '100%' }}>
						<thead>
							<tr>
								<th style={{ width: '1%', whiteSpace: 'nowrap' }}>Nr metody badawczej</th>
								<th>Nazwa</th>
								<th style={{ width: '1%', whiteSpace: 'nowrap' }}>Badania</th>
								<th style={{ width: '1%', whiteSpace: 'nowrap' }}>Próbki</th>
							</tr>
						</thead>
						<tbody>
							{visible.map(r => {
								const id = idByMethodNo.get(r.method) || r.method
								const href = methodHrefById(id)
								return (
									<tr key={r.method}>
										<td style={{ whiteSpace: 'nowrap' }}>
											{href ? (
												<a href={href} className='tss-link' title={`Przejdź do metody ${r.method}`}>
													{r.method}
												</a>
											) : (
												r.method
											)}
										</td>
										<td title={r.name}>
											{href ? (
												<a href={href} className='tss-link' title={`Przejdź do metody ${r.method}`}>
													{r.name || '—'}
												</a>
											) : (
												r.name || '—'
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
						options={pageSizeOptions}
					/>
				</div>
			</div>
		</Section>
	)
}

TopMethods.propTypes = {
	series: PropTypes.array,
	rows: PropTypes.array,
	methodKey: PropTypes.func,
	idByMethodNo: PropTypes.instanceOf(Map),
}

export default memo(TopMethods)

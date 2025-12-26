// src/components/pages/contents/TestsSummary.jsx
import React, { useMemo, useState, useCallback } from 'react'
import '../../../features/tests/styles/tests-summary.css'
import '../styles/tests-summary.css'

import PropTypes from 'prop-types'

// ===== sekcje =====
import KPIs from '../../../features/tests/components/TestsSummary/KPIs'
import MethodsTable from '../../../features/tests/components/TestsSummary/MethodsTable'
import MixOverview from '../../../features/tests/components/TestsSummary/MixOverview'
import ClientTime from '../../../features/tests/components/TestsSummary/ClientTime'
import ClientsByMethods from '../../../features/tests/components/TestsSummary/ClientsByMethods'
import TopMethods from '../../../features/tests/components/TestsSummary/TopMethods'
import StdMethodAnalysis from '../../../features/tests/components/TestsSummary/StdMethodAnalysis'

// ===== shared utils (z barrel-a) =====
import { summaryTime } from '../../../shared/summaries'

// ======================= DEMO (fallback bez backendu) =======================
const DEMO_METHODS = [
	{
		id: 'M-001',
		standard: 'PN-EN 1234:2020',
		methodNo: 'PB-998',
		methodName: 'Odporność na zginanie (A)',
		accredited: true,
		testsCount: 42,
		samplesCount: 120,
		lastPerformedDate: '2025-09-12',
		avgTATDays: 4.2,
		revenue: 48500,
		laborCost: 12800,
	},
	{
		id: 'M-002',
		standard: 'ISO 527-1:2019',
		methodNo: 'PB-101',
		methodName: 'Rozciąganie tworzyw sztucznych',
		accredited: true,
		testsCount: 31,
		samplesCount: 86,
		lastPerformedDate: '2025-09-15',
		avgTATDays: 3.6,
		revenue: 37200,
		laborCost: 9900,
	},
	{
		id: 'M-003',
		standard: 'PN-EN 755',
		methodNo: 'PB-055',
		methodName: 'Właściwości profili aluminiowych',
		accredited: false,
		testsCount: 12,
		samplesCount: 28,
		lastPerformedDate: '2025-08-30',
		avgTATDays: 5.1,
		revenue: 11200,
		laborCost: 4100,
	},
	{
		id: 'M-004',
		standard: 'EN ISO 13485:2016',
		methodNo: 'PB-330',
		methodName: 'Testy wytrzymałościowe narzędzi',
		accredited: false,
		testsCount: 7,
		samplesCount: 19,
		lastPerformedDate: '2025-07-18',
		avgTATDays: 6.8,
		revenue: 22300,
		laborCost: 7800,
	},
]
const DEMO_EXECUTIONS = [
	{ date: '2025-06-05', client: 'TechSolutions Sp. z o.o.', methodId: 'M-001', testsCount: 6, samplesCount: 18 },
	{ date: '2025-06-12', client: 'GreenEnergy S.A.', methodId: 'M-002', testsCount: 4, samplesCount: 12 },
	{ date: '2025-06-20', client: 'Meditech Polska', methodId: 'M-004', testsCount: 2, samplesCount: 5 },
	{ date: '2025-07-03', client: 'TechSolutions Sp. z o.o.', methodId: 'M-001', testsCount: 5, samplesCount: 14 },
	{ date: '2025-07-11', client: 'GreenEnergy S.A.', methodId: 'M-003', testsCount: 3, samplesCount: 7 },
	{ date: '2025-07-22', client: 'Meditech Polska', methodId: 'M-002', testsCount: 6, samplesCount: 16 },
	{ date: '2025-08-02', client: 'TechSolutions Sp. z o.o.', methodId: 'M-002', testsCount: 7, samplesCount: 19 },
	{ date: '2025-08-09', client: 'GreenEnergy S.A.', methodId: 'M-001', testsCount: 9, samplesCount: 26 },
	{ date: '2025-08-19', client: 'Meditech Polska', methodId: 'M-003', testsCount: 4, samplesCount: 9 },
	{ date: '2025-09-01', client: 'TechSolutions Sp. z o.o.', methodId: 'M-001', testsCount: 8, samplesCount: 23 },
	{ date: '2025-09-05', client: 'GreenEnergy S.A.', methodId: 'M-002', testsCount: 7, samplesCount: 21 },
	{ date: '2025-09-10', client: 'Meditech Polska', methodId: 'M-001', testsCount: 6, samplesCount: 18 },
	{ date: '2025-09-12', client: 'TechSolutions Sp. z o.o.', methodId: 'M-003', testsCount: 2, samplesCount: 5 },
]

// ============================ Pomocnicze lokalne ============================
const PLN_FMT = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })
const fmtPLN = n => PLN_FMT.format(Number(n || 0))

const flattenStrings = obj => {
	const out = []
	const walk = o => {
		if (o && typeof o === 'object') Object.values(o).forEach(v => walk(v))
		else if (typeof o === 'string' || typeof o === 'number') out.push(String(o))
	}
	walk(obj)
	return out
}

function TestsSummary({ methods, executions }) {
	// ---------- źródła danych (z bezpiecznym fallbackiem) ----------
	const rows = useMemo(() => (Array.isArray(methods) && methods.length ? methods : DEMO_METHODS), [methods])
	const series = useMemo(
		() => (Array.isArray(executions) && executions.length ? executions : DEMO_EXECUTIONS),
		[executions]
	)

	// ---------- mapy / helpery przekazywane do sekcji ----------
	const methodById = useMemo(() => new Map(rows.map(r => [r.id, r])), [rows])
	const idByMethodNo = useMemo(() => new Map(rows.map(r => [r.methodNo, r.id])), [rows])
	const methodKey = useCallback(id => methodById.get(id)?.methodNo || id || '?', [methodById])

	// ---------- stan tabeli metod ----------
	const [filter, setFilter] = useState('')
	const [accrFilter, setAccrFilter] = useState('wszystkie') // wszystkie | akredytowane | nieakredytowane
	const [sortField, setSortField] = useState(null)
	const [sortAsc, setSortAsc] = useState(true)
	const [mPage, setMPage] = useState(1)
	const [mPageSize, setMPageSize] = useState(10)

	// ---------- filtr tekst + akredytacja ----------
	const filteredMethods = useMemo(() => {
		const q = String(filter || '').toLowerCase()
		return rows.filter(r => {
			const matchesText = flattenStrings({ standard: r.standard, methodNo: r.methodNo, methodName: r.methodName })
				.join(' ')
				.toLowerCase()
				.includes(q)
			const matchesAccr =
				accrFilter === 'wszystkie' ? true : accrFilter === 'akredytowane' ? !!r.accredited : !r.accredited
			return matchesText && matchesAccr
		})
	}, [rows, filter, accrFilter])

	// ---------- KPI na podstawie filteredMethods ----------
	const totals = useMemo(() => {
		const methodsCount = filteredMethods.length
		const sum = k => filteredMethods.reduce((a, r) => a + (Number(r[k]) || 0), 0)
		const tests = sum('testsCount')
		const samples = sum('samplesCount')
		const revenue = sum('revenue')
		const labor = sum('laborCost')
		const accCnt = filteredMethods.reduce((a, r) => a + (r.accredited ? 1 : 0), 0)

		const tatWeighted = (() => {
			const w = sum('testsCount')
			if (!w) return 0
			return filteredMethods.reduce((a, r) => a + (Number(r.avgTATDays) || 0) * (Number(r.testsCount) || 0), 0) / w
		})()

		const lastDates = filteredMethods
			.map(r => r.lastPerformedDate)
			.filter(Boolean)
			.sort()
		const lastFrom = lastDates[0] || null
		const lastTo = lastDates[lastDates.length - 1] || null
		const months = new Set(lastDates.map(summaryTime.monthKeyISO)).size

		return {
			methods: methodsCount,
			tests,
			samples,
			revenue,
			labor,
			margin: revenue - labor,
			accCnt,
			nonAcc: methodsCount - accCnt,
			tatWeighted,
			lastFrom,
			lastTo,
			months,
		}
	}, [filteredMethods])

	return (
		<div className='tests-summary ts-page es-root'>
			<KPIs totals={totals} fmtPLN={fmtPLN} />

			<MethodsTable
				rows={rows}
				tableRows={filteredMethods}
				filter={filter}
				setFilter={setFilter}
				accrFilter={accrFilter}
				setAccrFilter={setAccrFilter}
				sortField={sortField}
				setSortField={setSortField}
				sortAsc={sortAsc}
				setSortAsc={setSortAsc}
				mPage={mPage}
				setMPage={setMPage}
				mPageSize={mPageSize}
				setMPageSize={setMPageSize}
				fmtPLN={fmtPLN}
			/>

			<MixOverview series={series} methodKey={methodKey} />
			<ClientTime series={series} methodKey={methodKey} />
			<ClientsByMethods series={series} methodKey={methodKey} />
			<TopMethods series={series} rows={rows} methodKey={methodKey} idByMethodNo={idByMethodNo} />
			<StdMethodAnalysis series={series} rows={rows} methodById={methodById} />
		</div>
	)
}

TestsSummary.propTypes = {
	methods: PropTypes.array,
	executions: PropTypes.array,
}

export default TestsSummary

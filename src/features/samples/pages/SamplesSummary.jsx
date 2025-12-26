// src/pages/SamplesSummary.jsx
import React, { useEffect, useMemo, useState } from 'react'
import '../styles/samples-summary.css'

import {
	BarChartCounts,
	StackedBarsByMonth,
	LineChartByMonth,
	buildChartData,
	getSeriesColors,
} from '../../../shared/diagrams'

// HOOKI/eksport
import { usePagination } from '../../../shared/reports/hooks/usePagination'

// KOMPONENTY LOKALNE
import Toolbar from '../components/SamplesSummary/Toolbar'
import DateRange from '../components/SamplesSummary/DateRange'
import Filters from '../components/SamplesSummary/Filters'
import Kpi from '../components/SamplesSummary/Kpi'
import Charts from '../components/SamplesSummary/Charts'
import Table from '../components/SamplesSummary/Table'

// 👇 UJEDNOLICONA PAGINACJA (globalna)
import { Pagination } from '../../../shared/tables'

// helpery
import {
	fmtDate,
	mainDate,
	monthKey,
	toLocalISO,
	withinRange,
	groupByKey,
	buildColumnsByMode,
} from '../components/SamplesSummary/helpers'

/* ====== Mock data (podmień na realne) ====== */
const seedData = [
	{
		id: 'S-AO-2025-01-001',
		code: 'AO',
		client: 'AutoMax SA',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 520,
		capacityAh: 45,
		voltageV: 12,
		currentA: 420,
		receivedDate: '2025-01-05',
		testedDate: '2025-01-10',
	},
	{
		id: 'S-AO-2025-02-001',
		code: 'AO',
		client: 'AutoMax SA',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 535,
		capacityAh: 47,
		voltageV: 12,
		currentA: 435,
		receivedDate: '2025-02-07',
		testedDate: '2025-02-12',
	},
	{
		id: 'S-AO-2025-03-001',
		code: 'AO',
		client: 'AutoMax SA',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 548,
		capacityAh: 48,
		voltageV: 12,
		currentA: 440,
		receivedDate: '2025-03-03',
		testedDate: '2025-03-11',
	},
	{
		id: 'S-AO-2025-04-001',
		code: 'AO',
		client: 'PlastForm S.C.',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 560,
		capacityAh: 50,
		voltageV: 12,
		currentA: 455,
		receivedDate: '2025-04-09',
		testedDate: '2025-04-15',
	},
	{
		id: 'S-AO-2025-05-001',
		code: 'AO',
		client: 'PlastForm S.C.',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 575,
		capacityAh: 52,
		voltageV: 12,
		currentA: 465,
		receivedDate: '2025-05-06',
		testedDate: '2025-05-13',
	},
	{
		id: 'S-AO-2025-06-001',
		code: 'AO',
		client: 'PlastForm S.C.',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 588,
		capacityAh: 53,
		voltageV: 12,
		currentA: 470,
		receivedDate: '2025-06-10',
		testedDate: '2025-06-18',
	},
	{
		id: 'S-AO-2025-07-001',
		code: 'AO',
		client: 'AutoMax SA',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 600,
		capacityAh: 55,
		voltageV: 12,
		currentA: 480,
		receivedDate: '2025-07-08',
		testedDate: '2025-07-12',
	},
	{
		id: 'S-AO-2025-08-001',
		code: 'AO',
		client: 'AutoMax SA',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 612,
		capacityAh: 56,
		voltageV: 12,
		currentA: 490,
		receivedDate: '2025-08-05',
		testedDate: '2025-08-11',
	},
	{
		id: 'S-AO-2025-09-001',
		code: 'AO',
		client: 'PlastForm S.C.',
		subject: 'Akumulator rozruchowy 12V',
		energyWh: 625,
		capacityAh: 58,
		voltageV: 12,
		currentA: 500,
		receivedDate: '2025-09-04',
		testedDate: '2025-09-10',
	},

	{
		id: 'S-AZ-2025-01-001',
		code: 'AZ',
		client: 'GreenEnergy S.A.',
		subject: 'Ogniwa niklowe',
		energyWh: 90,
		capacityAh: 10,
		voltageV: 8,
		currentA: 22,
		receivedDate: '2025-01-12',
		testedDate: '2025-01-16',
	},
	{
		id: 'S-AZ-2025-03-001',
		code: 'AZ',
		client: 'GreenEnergy S.A.',
		subject: 'Ogniwa niklowe',
		energyWh: 96,
		capacityAh: 11,
		voltageV: 8,
		currentA: 24,
		receivedDate: '2025-03-08',
		testedDate: '2025-03-14',
	},
	{
		id: 'S-AZ-2025-05-001',
		code: 'AZ',
		client: 'GreenEnergy S.A.',
		subject: 'Ogniwa niklowe',
		energyWh: 102,
		capacityAh: 12,
		voltageV: 8,
		currentA: 26,
		receivedDate: '2025-05-10',
		testedDate: '2025-05-15',
	},
	{
		id: 'S-AZ-2025-07-001',
		code: 'AZ',
		client: 'GreenEnergy S.A.',
		subject: 'Ogniwa niklowe',
		energyWh: 108,
		capacityAh: 13,
		voltageV: 8,
		currentA: 28,
		receivedDate: '2025-07-06',
		testedDate: '2025-07-10',
	},
	{
		id: 'S-AZ-2025-09-001',
		code: 'AZ',
		client: 'GreenEnergy S.A.',
		subject: 'Ogniwa niklowe',
		energyWh: 112,
		capacityAh: 14,
		voltageV: 8,
		currentA: 30,
		receivedDate: '2025-09-09',
		testedDate: '2025-09-13',
	},

	{
		id: 'S-BP-2025-02-001',
		code: 'BP',
		client: 'Meditech Polska',
		subject: 'Bateria litowa pierwotna',
		energyWh: 3.1,
		capacityAh: 2.0,
		voltageV: 1.5,
		currentA: 2.0,
		receivedDate: '2025-02-02',
		testedDate: '2025-02-06',
	},
	{
		id: 'S-BP-2025-04-001',
		code: 'BP',
		client: 'Meditech Polska',
		subject: 'Bateria litowa pierwotna',
		energyWh: 3.4,
		capacityAh: 2.2,
		voltageV: 1.5,
		currentA: 2.2,
		receivedDate: '2025-04-05',
		testedDate: '2025-04-09',
	},
	{
		id: 'S-BP-2025-06-001',
		code: 'BP',
		client: 'ElectroMax',
		subject: 'Bateria litowa pierwotna',
		energyWh: 3.6,
		capacityAh: 2.3,
		voltageV: 1.5,
		currentA: 2.3,
		receivedDate: '2025-06-03',
		testedDate: '2025-06-07',
	},
	{
		id: 'S-BP-2025-08-001',
		code: 'BP',
		client: 'ElectroMax',
		subject: 'Bateria litowa pierwotna',
		energyWh: 3.9,
		capacityAh: 2.4,
		voltageV: 1.5,
		currentA: 2.4,
		receivedDate: '2025-08-01',
		testedDate: '2025-08-06',
	},

	{
		id: 'S-BW-2025-01-001',
		code: 'BW',
		client: 'BatteryLab',
		subject: 'Projekt R&D – ogniwa',
		energyWh: 10,
		capacityAh: 3.2,
		voltageV: 3.7,
		currentA: 5,
		receivedDate: '2025-01-20',
		testedDate: '2025-01-23',
	},
	{
		id: 'S-BW-2025-03-001',
		code: 'BW',
		client: 'BatteryLab',
		subject: 'Projekt R&D – ogniwa',
		energyWh: 12,
		capacityAh: 3.5,
		voltageV: 3.7,
		currentA: 5.5,
		receivedDate: '2025-03-18',
		testedDate: '2025-03-22',
	},
	{
		id: 'S-BW-2025-05-001',
		code: 'BW',
		client: 'BatteryLab',
		subject: 'Projekt R&D – ogniwa',
		energyWh: 14,
		capacityAh: 3.7,
		voltageV: 3.7,
		currentA: 6.0,
		receivedDate: '2025-05-17',
		testedDate: '2025-05-21',
	},
	{
		id: 'S-BW-2025-07-001',
		code: 'BW',
		client: 'BatteryLab',
		subject: 'Projekt R&D – ogniwa',
		energyWh: 16,
		capacityAh: 4.0,
		voltageV: 3.7,
		currentA: 6.5,
		receivedDate: '2025-07-14',
		testedDate: '2025-07-18',
	},
	{
		id: 'S-BW-2025-09-001',
		code: 'BW',
		client: 'BatteryLab',
		subject: 'Projekt R&D – ogniwa',
		energyWh: 18,
		capacityAh: 4.2,
		voltageV: 3.7,
		currentA: 7.0,
		receivedDate: '2025-09-12',
		testedDate: '2025-09-16',
	},
]

export default function SamplesSummary() {
	const [rows] = useState(seedData)

	// sterowanie
	const [groupBy, setGroupBy] = useState('byCode') // byCode | bySubject | byClient
	const [datePreset, setDatePreset] = useState('all') // all|week|month|year|custom
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')
	const [code, setCode] = useState('all')
	const [clientQuery, setClientQuery] = useState('')
	const [paramKey, setParamKey] = useState('none') // none|energyWh|capacityAh|voltageV|currentA
	const [paramMin, setParamMin] = useState('')
	const [paramMax, setParamMax] = useState('')

	const uniqueClients = useMemo(
		() => Array.from(new Set(rows.map(s => s.client).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl')),
		[rows]
	)

	// zakres dat (efektywny)
	const effectiveRange = useMemo(() => {
		if (datePreset === 'custom') return { from: dateFrom || '', to: dateTo || '' }
		if (datePreset === 'all') return { from: '', to: '' }
		const today = new Date()
		const to = toLocalISO(today)
		const fromDate = new Date(today)
		if (datePreset === 'week') fromDate.setDate(today.getDate() - 6)
		if (datePreset === 'month') fromDate.setDate(today.getDate() - 30)
		if (datePreset === 'year') fromDate.setDate(today.getDate() - 365)
		const from = toLocalISO(fromDate)
		return { from, to }
	}, [datePreset, dateFrom, dateTo])

	// filtrowanie
	const filtered = useMemo(() => {
		const clientQ = clientQuery.trim().toLowerCase()
		return rows.filter(s => {
			if (
				clientQ &&
				!String(s.client || '')
					.toLowerCase()
					.includes(clientQ)
			)
				return false
			if (code !== 'all' && s.code !== code) return false
			const d = mainDate(s)
			if (effectiveRange.from && (!d || d.slice(0, 10) < effectiveRange.from)) return false
			if (effectiveRange.to && (!d || d.slice(0, 10) > effectiveRange.to)) return false
			if (paramKey !== 'none') {
				const val = Number(s[paramKey])
				if (!withinRange(val, paramMin, paramMax)) return false
			}
			return true
		})
	}, [rows, clientQuery, code, effectiveRange, paramKey, paramMin, paramMax])

	// KPI
	const summary = useMemo(() => {
		const list = filtered
		const countsByCode = { AO: 0, AZ: 0, BP: 0, BW: 0 }
		const clients = new Set()
		const subjects = new Set()
		const dateKeys = new Set()
		let energySum = 0,
			capSum = 0,
			voltSum = 0,
			currSum = 0

		for (const s of list) {
			if (s.code && countsByCode[s.code] != null) countsByCode[s.code] += 1
			if (s.client) clients.add(s.client)
			if (s.subject) subjects.add(s.subject)
			const d = mainDate(s)
			if (d) dateKeys.add(monthKey(d))
			energySum += Number(s.energyWh) || 0
			capSum += Number(s.capacityAh) || 0
			voltSum += Number(s.voltageV) || 0
			currSum += Number(s.currentA) || 0
		}

		const count = list.length || 0
		const monthsCount = Array.from(dateKeys).filter(Boolean).length
		const dates = list
			.map(x => mainDate(x))
			.filter(Boolean)
			.sort()
		const rangeStr = dates.length ? `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : '—'

		return {
			count,
			countsByCode,
			clientsCount: clients.size,
			subjectsCount: subjects.size,
			monthsCount,
			rangeStr,
			energySum,
			avgCap: count ? capSum / count : 0,
			avgVolt: count ? voltSum / count : 0,
			avgCurr: count ? currSum / count : 0,
		}
	}, [filtered])

	// wykresy (wspólny util) + wstrzyknięcie palety
	const charts = useMemo(() => {
		const c = buildChartData(filtered, groupBy, 6)
		const colors = c.keys?.length ? getSeriesColors(c.keys) : []
		return { ...c, colors }
	}, [filtered, groupBy])

	// dane tabel – wg trybu
	const byCodeRows = useMemo(() => {
		const m = groupByKey(filtered, s => s.code || '—')
		const arr = []
		for (const [k, list] of m) {
			const clients = new Set(list.map(x => x.client).filter(Boolean))
			const subjects = new Set(list.map(x => x.subject).filter(Boolean))
			const sumEnergy = list.reduce((a, x) => a + (Number(x.energyWh) || 0), 0)
			const avgCap = list.length ? list.reduce((a, x) => a + (Number(x.capacityAh) || 0), 0) / list.length : 0
			const avgVolt = list.length ? list.reduce((a, x) => a + (Number(x.voltageV) || 0), 0) / list.length : 0
			const avgCurr = list.length ? list.reduce((a, x) => a + (Number(x.currentA) || 0), 0) / list.length : 0
			arr.push({
				group: k,
				count: list.length,
				clientsCount: clients.size,
				subjectsCount: subjects.size,
				energySumWh: sumEnergy,
				capAvgAh: avgCap,
				voltAvgV: avgVolt,
				currAvgA: avgCurr,
			})
		}
		return arr
	}, [filtered])

	const bySubjectRows = useMemo(() => {
		const m = groupByKey(filtered, s => s.subject || '—')
		const arr = []
		for (const [k, list] of m) {
			const clients = new Set(list.map(x => x.client).filter(Boolean))
			const AO = list.filter(x => x.code === 'AO').length
			const AZ = list.filter(x => x.code === 'AZ').length
			const BP = list.filter(x => x.code === 'BP').length
			const BW = list.filter(x => x.code === 'BW').length
			arr.push({ group: k, AO, AZ, BP, BW, total: list.length, clientsCount: clients.size })
		}
		return arr
	}, [filtered])

	const byClientRows = useMemo(() => {
		const m = groupByKey(filtered, s => s.client || '—')
		const arr = []
		for (const [k, list] of m) {
			const subjects = new Set(list.map(x => x.subject).filter(Boolean))
			const AO = list.filter(x => x.code === 'AO').length
			const AZ = list.filter(x => x.code === 'AZ').length
			const BP = list.filter(x => x.code === 'BP').length
			const BW = list.filter(x => x.code === 'BW').length
			const dates = list
				.map(x => mainDate(x))
				.filter(Boolean)
				.sort()
			const period = dates.length ? `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : '—'
			arr.push({ group: k, AO, AZ, BP, BW, total: list.length, subjectsCount: subjects.size, period })
		}
		return arr
	}, [filtered])

	const columns = useMemo(() => buildColumnsByMode(groupBy), [groupBy])

	const rowsForTable = useMemo(() => {
		if (groupBy === 'byCode') return byCodeRows
		if (groupBy === 'bySubject') return bySubjectRows
		return byClientRows
	}, [groupBy, byCodeRows, bySubjectRows, byClientRows])

	// sort
	const [sortField, setSortField] = useState('group')
	const [sortAsc, setSortAsc] = useState(true)
	useEffect(() => {
		setSortField('group')
		setSortAsc(true)
	}, [groupBy])

	const sortedRows = useMemo(() => {
		const arr = [...rowsForTable]
		const dir = sortAsc ? 1 : -1
		arr.sort((a, b) => {
			const av = a[sortField],
				bv = b[sortField]
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
			return String(av ?? '').localeCompare(String(bv ?? ''), 'pl') * dir
		})
		return arr
	}, [rowsForTable, sortField, sortAsc])

	const onSort = key => {
		if (sortField === key) setSortAsc(v => !v)
		else {
			setSortField(key)
			setSortAsc(true)
		}
	}
	const sortArrow = key => (sortField === key ? (sortAsc ? ' ▲' : ' ▼') : '')

	// eksport — tylko CSV
	const exportXLSFile = () => exportXLSFile(`zestawienie_probek_${groupBy}.csv`, columns, sortedRows)

	// paginacja
	const { page, setPage, pageSize, totalPages, slice, onPageSizeChange } = usePagination(sortedRows.length, 10)
	const visibleRows = slice(sortedRows)

	// reset strony po zmianie filtrów/sortów
	useEffect(() => {
		setPage(1)
	}, [
		setPage,
		groupBy,
		datePreset,
		dateFrom,
		dateTo,
		code,
		clientQuery,
		paramKey,
		paramMin,
		paramMax,
		sortField,
		sortAsc,
	])

	const resetFilters = () => {
		setGroupBy('byCode')
		setDatePreset('all')
		setDateFrom('')
		setDateTo('')
		setCode('all')
		setClientQuery('')
		setParamKey('none')
		setParamMin('')
		setParamMax('')
	}

	return (
		<div className='samples-summary registers-skin no-bg'>
			{/* Toolbar: grupowanie + eksport CSV (ikona) */}
			<Toolbar groupBy={groupBy} setGroupBy={setGroupBy} onReset={resetFilters} onExportXls={exportXLSFile} />

			{/* Zakres dat */}
			<DateRange
				datePreset={datePreset}
				setDatePreset={setDatePreset}
				dateFrom={dateFrom}
				setDateFrom={setDateFrom}
				dateTo={dateTo}
				setDateTo={setDateTo}
			/>

			{/* Filtry (kod / klient / parametry) */}
			<Filters
				code={code}
				setCode={setCode}
				uniqueClients={uniqueClients}
				clientQuery={clientQuery}
				setClientQuery={setClientQuery}
				paramKey={paramKey}
				setParamKey={setParamKey}
				paramMin={paramMin}
				setParamMin={setParamMin}
				paramMax={paramMax}
				setParamMax={setParamMax}
			/>

			{/* KPI – wyśrodkowane */}
			<div className='smpl-section'>
				<Kpi summary={summary} centered />
			</div>

			{/* Wykresy + legendy */}
			<div className='smpl-section'>
				<Charts
					charts={charts}
					BarChartCounts={BarChartCounts}
					StackedBarsByMonth={StackedBarsByMonth}
					LineChartByMonth={LineChartByMonth}
				/>
			</div>

			{/* Tabela */}
			<div className='smpl-card'>
				<Table
					columns={columns}
					rows={visibleRows}
					sortField={sortField}
					sortAsc={sortAsc}
					onSort={onSort}
					sortArrow={sortArrow}
				/>
			</div>

			{/* Paginacja – wariant globalny */}
			<Pagination
				page={page}
				totalPages={totalPages}
				pageSize={pageSize}
				onPageSizeChange={onPageSizeChange}
				setPage={setPage}
				totalRows={sortedRows.length}
				variant='ghost' // "ghost" | "solid" | "pill"
				size='compact' // "default" | "compact"
				accent='primary' // "primary" | undefined
			/>
		</div>
	)
}

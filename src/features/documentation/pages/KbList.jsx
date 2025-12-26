import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import '../styles/documentation-orders.css'

/* 🔗 Paginate + CSV (te same utilsy co w logistyce próbek) */
import Pagination from '../../../shared/tables/components/Pagination'
import { useUrlPagination } from '../../../shared/tables/hooks/usePagination'
import { downloadCsv } from '../../../shared/tables/utils/csv'

const PAGE_SIZE = 24

/* ========= Mock loader (podmień przez props) ========= */
async function mockLoadCards() {
	const now = new Date()
	const iso = d => d.toISOString().slice(0, 16)
	const day = 86400000

	return [
		{
			id: 'kb-1001',
			number: 'KB-2025/001',
			contractNumber: 'ZL-2025/010',
			testTitle: 'Pojemność znamionowa',
			methodRef: 'PN-EN 60095-1:2018',
			methodPoint: '6.1',
			sampleIds: ['ZL-2025/010/1', 'ZL-2025/010/2'],
			preparedAt: iso(new Date(now - 3 * day)),
			updatedAt: iso(new Date(now - 1 * day)),
			result: 'pozytywny',
			url: '',
		},
		{
			id: 'kb-1002',
			number: '',
			contractNumber: 'ZL-2025/010',
			testTitle: 'Prąd rozruchu na zimno',
			methodRef: 'PN-EN 60095-1:2018',
			methodPoint: '6.2',
			sampleIds: ['ZL-2025/010/1'],
			preparedAt: '',
			updatedAt: iso(new Date(now - 2 * day)),
			result: 'w toku',
			url: '',
		},
		{
			id: 'kb-1003',
			number: 'KB-2025/003',
			contractNumber: 'ZL-2025/011',
			testTitle: 'Wytrzymałość elektryczna',
			methodRef: 'PN-EN 50395:2000',
			methodPoint: '7.4',
			sampleIds: ['ZL-2025/011/1'],
			preparedAt: iso(new Date(now - 12 * day)),
			updatedAt: iso(new Date(now - 5 * day)),
			result: 'negatywny',
			url: 'https://example.com/kb-2025-003.pdf',
		},
	]
}

/* ========= Pomocnicze ========= */
function Chip({ tone = 'neutral', title, children }) {
	const cls = tone === 'ok' ? 'chip chip--ok' : tone === 'warn' ? 'chip chip--warn' : 'chip'
	return (
		<span className={cls} title={title}>
			{children}
		</span>
	)
}
const fmtDt = v => (v ? v.replace('T', ' ') : '—')
const ci = (h, n) => (h || '').toLowerCase().includes((n || '').toLowerCase())
const missingFor = row => {
	const m = []
	if (!row.number) m.push('brak numeru')
	if (!row.preparedAt) m.push('brak daty')
	if (!row.sampleIds || !row.sampleIds.length) m.push('brak próbek')
	return m
}

export default function KBList({ loadCards = mockLoadCards, onCreateNew }) {
	const navigate = useNavigate()
	const location = useLocation()
	const [sp, setSp] = useSearchParams()

	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	// --- filtry <-> URL
	const [q, setQ] = useState(sp.get('q') || '')
	const [result, setResult] = useState(sp.get('result') || 'all') // all|pozytywny|negatywny|w toku
	const [onlyMissing, setOnlyMissing] = useState(sp.get('missing') === '1')
	const [onlyWithFile, setOnlyWithFile] = useState(sp.get('file') === '1')
	const [from, setFrom] = useState(sp.get('from') || '')
	const [to, setTo] = useState(sp.get('to') || '')

	// sync -> URL (canonicalize)
	useEffect(() => {
		const next = new URLSearchParams(sp)
		const setOrDel = (k, v) => (v ? next.set(k, v) : next.delete(k))
		setOrDel('q', q.trim())
		setOrDel('result', result !== 'all' ? result : '')
		setOrDel('missing', onlyMissing ? '1' : '')
		setOrDel('file', onlyWithFile ? '1' : '')
		setOrDel('from', from)
		setOrDel('to', to)
		const changed = next.toString() !== sp.toString()
		if (changed) setSp(next, { replace: true })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q, result, onlyMissing, onlyWithFile, from, to])

	useEffect(() => {
		let alive = true
		;(async () => {
			setLoading(true)
			try {
				const data = await loadCards()
				if (alive) setRows(Array.isArray(data) ? data : [])
			} finally {
				if (alive) setLoading(false)
			}
		})()
		return () => {
			alive = false
		}
	}, [loadCards, location.key])

	const filtered = useMemo(() => {
		let arr = rows.slice()

		if (q.trim()) {
			arr = arr.filter(
				x =>
					ci(x.number, q) ||
					ci(x.contractNumber, q) ||
					ci(x.testTitle, q) ||
					ci(x.methodRef, q) ||
					(x.sampleIds || []).some(s => ci(s, q))
			)
		}

		// case-insensitive wynik
		if (result !== 'all') {
			const norm = String(result || '').toLowerCase()
			arr = arr.filter(x => String(x.result || '').toLowerCase() === norm)
		}

		if (onlyWithFile) arr = arr.filter(x => !!x.url)
		if (onlyMissing) arr = arr.filter(x => missingFor(x).length > 0)

		if (from) arr = arr.filter(x => !x.preparedAt || x.preparedAt >= from)
		if (to) arr = arr.filter(x => !x.preparedAt || x.preparedAt <= to)

		// sort: po preparedAt, a potem updatedAt
		arr.sort(
			(a, b) =>
				String(b.preparedAt || '').localeCompare(String(a.preparedAt || '')) ||
				String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
		)
		return arr
	}, [rows, q, result, onlyWithFile, onlyMissing, from, to])

	// 📄 CSV eksport (po bieżących filtrach)
	const exportCSV = () => {
		const columns = [
			{ key: 'number', label: 'Nr KB' },
			{ key: 'contractNumber', label: 'Nr zlecenia' },
			{ key: 'testTitle', label: 'Tytuł badania' },
			{ key: 'methodRef', label: 'Metoda' },
			{ key: 'methodPoint', label: 'Punkt' },
			{ key: 'sampleIds', label: 'Nr próbek', map: r => (r.sampleIds || []).join(', ') },
			{ key: 'preparedAt', label: 'Sporządzono' },
			{ key: 'updatedAt', label: 'Zmodyfikowano' },
			{ key: 'result', label: 'Wynik' },
			{ key: 'url', label: 'URL' },
			{ key: 'id', label: 'ID' },
		]
		// mapColumns optional
		const rowsForCsv = filtered.map(r => ({
			...r,
			sampleIds: (r.sampleIds || []).join(', '),
		}))

		downloadCsv({
			filename: 'karty_badan.csv',
			columns,
			rows: rowsForCsv,
			delimiter: ';',
			includeHeader: true,
			addBOM: true,
		})
	}

	// 🔢 Paginacja (po filtrach) – stan w URL (?page=)
	const { pageCount, currentPage, visible, onPageChange, resetToFirstPage } = useUrlPagination(filtered, {
		pageSize: PAGE_SIZE,
		searchParams: sp,
		setSearchParams: setSp,
		param: 'page',
		scrollSelector: '.pppList__grid',
		canonicalize: true,
	})

	const stats = useMemo(() => {
		const total = rows.length
		let ok = 0,
			nok = 0,
			pending = 0
		rows.forEach(x => {
			const r = String(x.result || '').toLowerCase()
			if (r === 'pozytywny') ok += 1
			else if (r === 'negatywny') nok += 1
			else pending += 1
		})
		return { total, ok, nok, pending, visible: filtered.length }
	}, [rows, filtered])

	const openKB = row => navigate(`/dokumentacja/karty-badan/${row.id}`)

	const clearFilters = () => {
		setQ('')
		setResult('all')
		setOnlyMissing(false)
		setOnlyWithFile(false)
		setFrom('')
		setTo('')
		const next = new URLSearchParams(sp)
		;['q', 'result', 'missing', 'file', 'from', 'to', 'page'].forEach(k => next.delete(k))
		setSp(next, { replace: true })
		resetToFirstPage(true)
	}

	return (
		<div className='pppList'>
			<div className='kb__actions'>
				<h2 className='docOrders__h2' style={{ marginRight: 8 }}>
					Karty badań
				</h2>
				<div className='kb__spacer' />
				<div className='chips' style={{ gap: 8 }}>
					<button className='ghost' type='button' onClick={exportCSV} title='Eksport CSV'>
						Eksport CSV
					</button>
					{onCreateNew ? (
						<button className='ghost' onClick={onCreateNew}>
							+ Nowa karta badań
						</button>
					) : null}
				</div>
			</div>

			<div className='docOrders__summary'>
				<div className='summary-pill tone-blue'>
					<span>Wszystkie</span>
					<b>{stats.total}</b>
				</div>
				<div className='summary-pill tone-green'>
					<span>Pozytywne</span>
					<b>{stats.ok}</b>
				</div>
				<div className='summary-pill tone-rose'>
					<span>Negatywne</span>
					<b>{stats.nok}</b>
				</div>
				<div className='summary-pill tone-amber'>
					<span>W toku</span>
					<b>{stats.pending}</b>
				</div>
				<div className='summary-pill tone-slate'>
					<span>Widoczne</span>
					<b>{stats.visible}</b>
				</div>
			</div>

			<div className='pppList__filters card' role='region' aria-label='Filtry listy kart badań'>
				<input
					className='i'
					placeholder='Szukaj (nr KB, zlecenie, tytuł, metoda, próbka)…'
					value={q}
					onChange={e => {
						setQ(e.target.value)
						resetToFirstPage(true)
					}}
					aria-label='Pole wyszukiwania'
				/>
				<select
					className='i'
					value={result}
					onChange={e => {
						setResult(e.target.value)
						resetToFirstPage(true)
					}}
					aria-label='Filtr wyniku badania'>
					<option value='all'>Wynik: wszystkie</option>
					<option value='pozytywny'>pozytywny</option>
					<option value='negatywny'>negatywny</option>
					<option value='w toku'>w toku</option>
				</select>
				<label className='f'>
					<span className='l'>Od (data sporządzenia)</span>
					<input
						type='datetime-local'
						className='i'
						value={from}
						onChange={e => {
							setFrom(e.target.value)
							resetToFirstPage(true)
						}}
					/>
				</label>
				<label className='f'>
					<span className='l'>Do (data sporządzenia)</span>
					<input
						type='datetime-local'
						className='i'
						value={to}
						onChange={e => {
							setTo(e.target.value)
							resetToFirstPage(true)
						}}
					/>
				</label>
				<div className='pppList__filters__toggles'>
					<label className='f f--row'>
						<input
							type='checkbox'
							checked={onlyMissing}
							onChange={e => {
								setOnlyMissing(e.target.checked)
								resetToFirstPage(true)
							}}
						/>
						<span>tylko z brakami</span>
					</label>
					<label className='f f--row'>
						<input
							type='checkbox'
							checked={onlyWithFile}
							onChange={e => {
								setOnlyWithFile(e.target.checked)
								resetToFirstPage(true)
							}}
						/>
						<span>z plikiem</span>
					</label>
					<button className='ghost' type='button' onClick={clearFilters}>
						Wyczyść
					</button>
				</div>
			</div>

			{loading ? <div className='kb__empty'>Ładowanie…</div> : null}
			{!loading && visible.length === 0 ? <div className='kb__empty'>Nic nie znaleziono.</div> : null}

			<div className='pppList__grid'>
				{visible.map(row => {
					const missing = missingFor(row)
					const res = String(row.result || '').toLowerCase()
					return (
						<article key={row.id} className='pppList__item card'>
							<div className='pppList__row1'>
								<div className='pppList__title'>
									<button type='button' className='docLink pppList__linkLike' onClick={() => openKB(row)}>
										{row.number || '— bez numeru —'}
									</button>
									<div className='chips'>
										<Chip>{row.testTitle || '—'}</Chip>
										{res === 'pozytywny' && <Chip tone='ok'>wynik pozytywny</Chip>}
										{res === 'negatywny' && <Chip tone='warn'>wynik negatywny</Chip>}
										{res !== 'pozytywny' && res !== 'negatywny' && <Chip>w toku</Chip>}
										{missing.map((m, i) => (
											<Chip key={i} tone='warn'>
												{m}
											</Chip>
										))}
									</div>
								</div>
								<div className='pppList__metaRight'>
									<span className='pppList__metaLabel'>Sporz.</span> <b>{fmtDt(row.preparedAt)}</b>
									<span className='pppList__sep'>·</span>
									<span className='pppList__metaLabel'>Zmiana</span> <span>{fmtDt(row.updatedAt)}</span>
								</div>
							</div>

							<div className='pppList__row2'>
								<div className='pppList__meta'>
									<span className='pppList__metaLabel'>Zlecenie:</span> <b>{row.contractNumber || '—'}</b>
									<span className='pppList__sep'>·</span>
									<span className='pppList__metaLabel'>Metoda:</span>{' '}
									<span>
										{row.methodRef || '—'}
										{row.methodPoint ? ` p.${row.methodPoint}` : ''}
									</span>
								</div>
								<div className='pppList__codes'>
									{(row.sampleIds || []).slice(0, 3).map((c, i) => (
										<code key={i} className='pppList__code'>
											{c}
										</code>
									))}
									{row.sampleIds && row.sampleIds.length > 3 ? (
										<span className='pppList__more'>+{row.sampleIds.length - 3}</span>
									) : null}
								</div>
							</div>

							<div className='pppList__row3'>
								<div className='pppList__actions'>
									<button type='button' className='ghost' onClick={() => openKB(row)}>
										Otwórz KB ↗
									</button>
									{row.url ? (
										<a className='ghost' href={row.url} target='_blank' rel='noreferrer'>
											PDF ↗
										</a>
									) : null}
								</div>
							</div>
						</article>
					)
				})}
			</div>

			{/* Footer z paginacją */}
			<div className='kb__actions' style={{ marginTop: 16 }}>
				<div className='kb__spacer' />
				<Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={onPageChange} />
			</div>
		</div>
	)
}

import React, { useMemo, useState } from 'react'
import {
	format,
	parseISO,
	isAfter,
	isBefore,
	startOfDay,
	endOfDay,
	addDays,
	isSameDay,
	differenceInCalendarDays,
	isToday,
	isTomorrow,
	isWeekend,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import { CalendarDays, CheckSquare, MessageSquare, Users } from 'lucide-react'

import '../styles//my-schedule.css'
import '../styles/schedule-summary.css'

/**
 * Props:
 * - users:     string[] (lista pracowników)
 * - tasks:     [{id,title,dueDate|date|targetDate,assignees:[string],status}]
 * - meetings:  [{id,title,topic,date,time,participants:[string],decisions:[]}]
 * - trainings: [{id,title,type,date,participants:[string]}]
 * - posts:     [{id,title,date|targetDate,mentions:[string],tags:[]}]
 * - onGoToTask / onGoToMeeting / onGoToTraining / onGoToPost : (id) => void (opcjonalnie)
 */
export default function AllSchedulesPage({
	users = [],
	tasks = [],
	meetings = [],
	trainings = [],
	posts = [],
	onGoToTask,
	onGoToMeeting,
	onGoToTraining,
	onGoToPost,
}) {
	// fallback listy użytkowników (gdy props.users puste)
	const demoUsers = [
		'Alicja Śliwińska',
		'Jan Kowalski',
		'Anna Nowak',
		'Piotr Zieliński',
		'Ewa Dąbrowska',
		'Tomasz Wójcik',
		'Karolina Mazur',
	]
	const effectiveUsers = users && users.length ? users : demoUsers

	// ---------- zakres + filtry listy ----------
	const today = startOfDay(new Date())

	// domyślnie zostawiamy jak było: 7 dni od dziś (period ustawiamy na 'custom', żeby nic nie było podświetlone)
	const [range, setRange] = useState({ from: today, to: endOfDay(addDays(today, 7)) })
	const [period, setPeriod] = useState('custom') // 'dzis' | 'jutro' | 'tydzien' | 'miesiac' | 'custom'
	const [custom, setCustom] = useState(false)
	const [query, setQuery] = useState('')
	const [typeFilter, setTypeFilter] = useState(new Set(['task', 'meeting', 'training', 'post']))
	const [sortAsc, setSortAsc] = useState(true)
	const [onlyActive, setOnlyActive] = useState(false)

	// ustawienia presetów czasu
	const setTimePreset = p => {
		setPeriod(p)
		if (p === 'dzis') {
			const from = startOfDay(today)
			const to = endOfDay(today)
			setRange({ from, to })
			setCustom(false)
		} else if (p === 'jutro') {
			const tmr = addDays(today, 1)
			setRange({ from: startOfDay(tmr), to: endOfDay(tmr) })
			setCustom(false)
		} else if (p === 'tydzien') {
			const from = startOfWeek(today, { weekStartsOn: 1 })
			const to = endOfWeek(today, { weekStartsOn: 1 })
			setRange({ from, to })
			setCustom(false)
		} else if (p === 'miesiac') {
			const from = startOfMonth(today)
			const to = endOfMonth(today)
			setRange({ from, to })
			setCustom(false)
		} else if (p === 'custom') {
			setCustom(true)
		}
	}

	const toggleType = t => {
		setTypeFilter(prev => {
			const next = new Set(prev)
			if (next.has(t)) next.delete(t)
			else next.add(t)
			return next
		})
	}

	const parseDateSafe = d => {
		if (!d) return null
		if (d instanceof Date) return d
		try {
			return parseISO(d)
		} catch {
			return null
		}
	}

	const inRange = d => {
		if (!d) return false
		const dt = d instanceof Date ? d : parseDateSafe(d)
		if (!dt) return false
		return !isBefore(dt, range.from) && !isAfter(dt, range.to)
	}

	// Pełny zakres dat (min→max) do „Wyczyść wszystkie filtry”
	const getFullRange = () => {
		let min = null
		let max = null
		const take = raw => {
			const dt = parseDateSafe(raw)
			if (!dt) return
			if (!min || dt < min) min = dt
			if (!max || dt > max) max = dt
		}
		tasks.forEach(t => take(t.dueDate || t.date || t.targetDate))
		meetings.forEach(m => take(m.date))
		trainings.forEach(tr => take(tr.date))
		posts.forEach(p => take(p.date || p.targetDate))

		if (!min || !max) return { from: today, to: endOfDay(today) }
		return { from: startOfDay(min), to: endOfDay(max) }
	}

	// ---------- dane listy ----------
	const allItems = useMemo(() => {
		const out = []
		const q = query.trim().toLowerCase()

		for (const u of effectiveUsers) {
			// TASKS
			for (const t of tasks) {
				const date = parseDateSafe(t.dueDate || t.date || t.targetDate)
				const ass = Array.isArray(t.assignees) ? t.assignees : []
				if (!date || !inRange(date) || !ass.includes(u)) continue
				out.push({
					user: u,
					kind: 'task',
					id: t.id,
					title: t.title || t.name || `Zadanie ${t.id}`,
					subtitle: t.status ? `Status: ${t.status}` : '',
					when: date,
					onClick: () => onGoToTask?.(t.id),
					searchBlob: `${u} ${t.title ?? ''} ${t.name ?? ''} ${t.status ?? ''} ${ass.join(' ')}`.toLowerCase(),
				})
			}
			// MEETINGS
			for (const m of meetings) {
				const date = parseDateSafe(m.date)
				const ppl = Array.isArray(m.participants) ? m.participants : []
				if (!date || !inRange(date) || !ppl.includes(u)) continue
				out.push({
					user: u,
					kind: 'meeting',
					id: m.id,
					title: m.title || m.topic || `Spotkanie ${m.id}`,
					subtitle: [m.time, ppl.join(', ')].filter(Boolean).join(' • '),
					when: date,
					onClick: () => onGoToMeeting?.(m.id),
					searchBlob: `${u} ${m.title ?? ''} ${m.topic ?? ''} ${m.time ?? ''} ${ppl.join(' ')} ${(
						m.decisions || []
					).join(' ')}`.toLowerCase(),
				})
			}
			// TRAININGS
			for (const tr of trainings) {
				const date = parseDateSafe(tr.date)
				const ppl = Array.isArray(tr.participants) ? tr.participants : []
				if (!date || !inRange(date) || !ppl.includes(u)) continue
				out.push({
					user: u,
					kind: 'training',
					id: tr.id,
					title: tr.title || `Szkolenie ${tr.id}`,
					subtitle: [tr.type, ppl.join(', ')].filter(Boolean).join(' • '),
					when: date,
					onClick: () => onGoToTraining?.(tr.id),
					searchBlob: `${u} ${tr.title ?? ''} ${tr.type ?? ''} ${ppl.join(' ')}`.toLowerCase(),
				})
			}
			// POSTS
			for (const p of posts) {
				const date = parseDateSafe(p.date || p.targetDate)
				const mentions = Array.isArray(p.mentions) ? p.mentions : []
				if (!date || !inRange(date) || !mentions.includes(u)) continue
				out.push({
					user: u,
					kind: 'post',
					id: p.id,
					title: p.title || `Post ${p.id}`,
					subtitle: p.tags && p.tags.length ? `#${p.tags[0]}` : '',
					when: date,
					onClick: () => onGoToPost?.(p.id),
					searchBlob: `${u} ${p.title ?? ''} ${(p.tags || []).join(' ')} ${mentions.join(' ')}`.toLowerCase(),
				})
			}
		}

		const filtered = out
			.filter(it => typeFilter.has(it.kind))
			.filter(it => (q ? (it.title + ' ' + it.subtitle + ' ' + it.searchBlob).toLowerCase().includes(q) : true))

		filtered.sort((a, b) => {
			const av = a.when?.getTime?.() ?? 0
			const bv = b.when?.getTime?.() ?? 0
			return sortAsc ? av - bv : bv - av
		})

		return filtered
	}, [
		effectiveUsers,
		tasks,
		meetings,
		trainings,
		posts,
		range,
		query,
		typeFilter,
		sortAsc,
		onGoToTask,
		onGoToMeeting,
		onGoToTraining,
		onGoToPost,
	])

	const globalCounts = useMemo(
		() =>
			allItems.reduce(
				(acc, it) => {
					acc[it.kind] = (acc[it.kind] || 0) + 1
					return acc
				},
				{ task: 0, meeting: 0, training: 0, post: 0 }
			),
		[allItems]
	)

	const byUser = useMemo(() => {
		const map = new Map()
		for (const it of allItems) {
			if (!map.has(it.user)) map.set(it.user, [])
			map.get(it.user).push(it)
		}
		const sortedUsers = [...effectiveUsers].sort((a, b) => {
			const [al, bl] = [a.split(' ').slice(-1)[0], b.split(' ').slice(-1)[0]]
			return al.localeCompare(bl, 'pl')
		})
		return sortedUsers.map(u => [u, map.get(u) || []])
	}, [allItems, effectiveUsers])

	const spanDays = useMemo(
		() => (range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0),
		[range]
	)

	const initials = name =>
		name
			.split(' ')
			.map(p => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()

	const groupByDate = list => {
		const map = new Map()
		for (const it of list) {
			const d0 = startOfDay(it.when)
			const key = d0.toISOString()
			if (!map.has(key)) map.set(key, [])
			map.get(key).push(it)
		}
		const res = Array.from(map.entries())
			.sort(([a], [b]) => (sortAsc ? new Date(a) - new Date(b) : new Date(b) - new Date(a)))
			.map(([iso, arr]) => {
				const d = new Date(iso)
				let label = format(d, 'EEE, d MMM yyyy', { locale: pl })
				if (isToday(d)) label = 'Dziś'
				else if (isTomorrow(d)) label = 'Jutro'
				return { date: d, label, weekend: isWeekend(d), items: arr }
			})
		return res
	}

	const [collapsed, setCollapsed] = useState(() => new Set())
	const expandAll = () => setCollapsed(new Set())
	const collapseAll = () => setCollapsed(new Set(byUser.map(([u]) => u)))
	const allEmpty = byUser.every(([_, list]) => list.length === 0)

	const clearAll = () => {
		const full = getFullRange()
		setRange(full) // ← pokaż wszystko (od początku do końca)
		setPeriod('custom')
		setCustom(true) // ← aby było widać daty w polach Od/Do
		setQuery('')
		setTypeFilter(new Set(['task', 'meeting', 'training', 'post']))
		setSortAsc(true)
		setOnlyActive(false)
		setCollapsed(new Set())
	}

	const iconFor = kind => {
		switch (kind) {
			case 'task':
				return <CheckSquare size={16} />
			case 'meeting':
				return <Users size={16} />
			case 'training':
				return <CalendarDays size={16} />
			case 'post':
				return <MessageSquare size={16} />
			default:
				return null
		}
	}

	return (
		<div className='allschedules'>
			{/* ====== FILTRY I LISTA (bez wykresu) ====== */}
			<header className='myschedule__head'>
				<div className='myschedule__filters'>
					<div className='seg'>
						<button className={period === 'dzis' ? 'is-active' : ''} onClick={() => setTimePreset('dzis')}>
							Dziś
						</button>
						<button className={period === 'jutro' ? 'is-active' : ''} onClick={() => setTimePreset('jutro')}>
							Jutro
						</button>
						<button className={period === 'tydzien' ? 'is-active' : ''} onClick={() => setTimePreset('tydzien')}>
							Tydzień
						</button>
						<button className={period === 'miesiac' ? 'is-active' : ''} onClick={() => setTimePreset('miesiac')}>
							Miesiąc
						</button>
						<button
							className={period === 'custom' || custom ? 'is-active' : ''}
							onClick={() => setTimePreset('custom')}>
							Niestandardowy
						</button>
					</div>

					{custom && (
						<div className='range'>
							<label>
								Od:
								<input
									type='date'
									value={format(range.from, 'yyyy-MM-dd')}
									onChange={e => setRange(r => ({ ...r, from: startOfDay(parseISO(e.target.value)) }))}
								/>
							</label>
							<label>
								Do:
								<input
									type='date'
									value={format(range.to, 'yyyy-MM-dd')}
									onChange={e => setRange(r => ({ ...r, to: endOfDay(parseISO(e.target.value)) }))}
								/>
							</label>
						</div>
					)}

					<div className='chips'>
						<button className={`chip ${typeFilter.has('task') ? 'is-on' : ''}`} onClick={() => toggleType('task')}>
							<CheckSquare size={16} /> <span>Zadania</span> <span className='badge'>{globalCounts.task || 0}</span>
						</button>
						<button
							className={`chip ${typeFilter.has('meeting') ? 'is-on' : ''}`}
							onClick={() => toggleType('meeting')}>
							<Users size={16} /> <span>Spotkania</span> <span className='badge'>{globalCounts.meeting || 0}</span>
						</button>
						<button
							className={`chip ${typeFilter.has('training') ? 'is-on' : ''}`}
							onClick={() => toggleType('training')}>
							<CalendarDays size={16} /> <span>Szkolenia</span>{' '}
							<span className='badge'>{globalCounts.training || 0}</span>
						</button>
						<button className={`chip ${typeFilter.has('post') ? 'is-on' : ''}`} onClick={() => toggleType('post')}>
							<MessageSquare size={16} /> <span>Posty</span> <span className='badge'>{globalCounts.post || 0}</span>
						</button>
					</div>

					<div className='search'>
						<input
							type='text'
							placeholder='Szukaj po użytkownikach i tytułach…'
							value={query}
							onChange={e => setQuery(e.target.value)}
						/>
						<button className='sort' onClick={() => setSortAsc(s => !s)} title='Zmień kolejność'>
							{sortAsc ? '↑ rosnąco' : '↓ malejąco'}
						</button>

						{/* Czyści wszystkie filtry (łącznie z zakresem czasowym → pełny) */}
						<button className='btn btn--clear clearall' onClick={clearAll} title='Wyczyść wszystkie filtry'>
							Wyczyść wszystkie filtry
						</button>
					</div>

					<div className='rowtools'>
						<label className='toggle'>
							<input type='checkbox' checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} />
							<span>Pokaż tylko użytkowników z elementami</span>
						</label>
						<div className='spacer' />
						<button className='mini' onClick={expandAll}>
							Rozwiń wszystko
						</button>
						<button className='mini' onClick={collapseAll}>
							Zwiń wszystko
						</button>
					</div>
				</div>
			</header>

			<ul className='myschedule__list'>
				{byUser.map(([user, list]) => {
					const isCollapsed = collapsed.has(user)
					if (onlyActive && list.length === 0) return null

					const counts = list.reduce(
						(acc, it) => {
							acc[it.kind] = (acc[it.kind] || 0) + 1
							return acc
						},
						{ task: 0, meeting: 0, training: 0, post: 0 }
					)

					const grouped = groupByDate(list)

					return (
						<React.Fragment key={user}>
							<li className='user'>
								<button
									className='user__head'
									onClick={() =>
										setCollapsed(prev => {
											const next = new Set(prev)
											if (next.has(user)) next.delete(user)
											else next.add(user)
											return next
										})
									}>
									<span className='initials' aria-hidden='true'>
										{initials(user)}
									</span>
									<span className='user__name'>{user}</span>

									<span className='user__counts'>
										<span className='pill pill--task'>Zad: {counts.task}</span>
										<span className='pill pill--meeting'>Spot: {counts.meeting}</span>
										<span className='pill pill--training'>Szk: {counts.training}</span>
										<span className='pill pill--post'>Post: {counts.post}</span>
									</span>

									<span className='user__toggle'>{isCollapsed ? '➤' : '▼'}</span>
								</button>
							</li>

							{!isCollapsed &&
								(grouped.length === 0 ? (
									<li className='empty'>Brak elementów w wybranym zakresie.</li>
								) : (
									grouped.map(g => (
										<React.Fragment key={g.date.toISOString()}>
											<li className='group' data-weekend={g.weekend ? 'true' : 'false'}>
												<div className='group__label'>
													<CalendarDays size={16} />
													<span>{g.label}</span>
												</div>
											</li>
											{g.items.map(it => (
												<li
													key={`${user}-${it.kind}-${it.id}`}
													className='item'
													onClick={it.onClick}
													data-clickable={Boolean(it.onClick)}
													title={`${user}`}>
													<div className={`kind kind--${it.kind}`}>{iconFor(it.kind)}</div>
													<div className='meta'>
														<div className='title'>{it.title}</div>
														{it.subtitle ? <div className='sub'>{it.subtitle}</div> : null}
													</div>
													<div className='more'>Szczegóły →</div>
												</li>
											))}
										</React.Fragment>
									))
								))}
						</React.Fragment>
					)
				})}

				{allEmpty && <li className='empty'>Brak elementów w wybranym zakresie.</li>}
			</ul>
		</div>
	)
}

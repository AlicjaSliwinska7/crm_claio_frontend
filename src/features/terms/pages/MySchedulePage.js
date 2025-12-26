import React, { useMemo, useState } from 'react'
import {
	format,
	parseISO,
	isAfter,
	isBefore,
	startOfDay,
	endOfDay,
	addDays,
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
import '../styles/my-schedule.css'

/**
 * Props:
 * - currentUser: string (np. "Alicja Śliwińska")
 * - tasks:      [{id,title,dueDate|date|targetDate,assignees:[string],status,done?:boolean}]
 * - meetings:   [{id,title,topic,date,time,participants:[string],decisions:[]}]
 * - trainings:  [{id,title,type,date,participants:[string]}]
 * - posts:      [{id,title,date|targetDate,mentions:[string],tags:[]}]
 * - onGoToTask / onGoToMeeting / onGoToTraining / onGoToPost : (id) => void (opcjonalnie)
 * - onToggleTask?: (id: string, nextDone: boolean) => void (opcjonalnie)
 */
export default function MySchedulePage({
	currentUser = 'Alicja Śliwińska',
	tasks = [],
	meetings = [],
	trainings = [],
	posts = [],
	onGoToTask,
	onGoToMeeting,
	onGoToTraining,
	onGoToPost,
	onToggleTask,
}) {
	const today = startOfDay(new Date())

	// Domyślnie 7 dni (jak dotychczas), ale pasek presetów jak w "Zestawieniu"
	const [range, setRange] = useState({ from: today, to: endOfDay(addDays(today, 7)) })
	const [period, setPeriod] = useState('tydzien') // 'dzis' | 'jutro' | 'tydzien' | 'miesiac' | 'custom'
	const [custom, setCustom] = useState(false)

	const [query, setQuery] = useState('')
	const [typeFilter, setTypeFilter] = useState(new Set(['task', 'meeting', 'training', 'post']))
	const [sortAsc, setSortAsc] = useState(true)

	// lokalne nadpisania stanu „zrobione”, by UI zareagował natychmiast
	const [doneOverride, setDoneOverride] = useState(() => new Map())

	// ---------- helpers: daty ----------
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

	// Presety czasu 1:1 jak w "Zestawieniu"
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

	// Pełny zakres dat ograniczony do elementów użytkownika – dla "Wyczyść wszystkie filtry"
	const getFullRange = () => {
		let min = null,
			max = null
		const take = raw => {
			const dt = parseDateSafe(raw)
			if (!dt) return
			if (!min || dt < min) min = dt
			if (!max || dt > max) max = dt
		}

		tasks.forEach(
			t => Array.isArray(t.assignees) && t.assignees.includes(currentUser) && take(t.dueDate || t.date || t.targetDate)
		)
		meetings.forEach(m => Array.isArray(m.participants) && m.participants.includes(currentUser) && take(m.date))
		trainings.forEach(tr => Array.isArray(tr.participants) && tr.participants.includes(currentUser) && take(tr.date))
		posts.forEach(p => {
			const mentions = Array.isArray(p.mentions) ? p.mentions : []
			if (mentions.includes(currentUser)) take(p.date || p.targetDate)
		})

		if (!min || !max) return { from: today, to: endOfDay(today) }
		return { from: startOfDay(min), to: endOfDay(max) }
	}

	const clearAll = () => {
		const full = getFullRange()
		setRange(full)
		setPeriod('custom')
		setCustom(true)
		setQuery('')
		setTypeFilter(new Set(['task', 'meeting', 'training', 'post']))
		setSortAsc(true)
	}

	// ---------- helpers: typy / status ----------
	const toggleType = t => {
		setTypeFilter(prev => {
			const next = new Set(prev)
			if (next.has(t)) next.delete(t)
			else next.add(t)
			return next
		})
	}

	const isTaskDone = t => {
		if (doneOverride.has(t.id)) return doneOverride.get(t.id)
		if (typeof t.done === 'boolean') return t.done
		const s = String(t.status || '').toLowerCase()
		return ['zrobione', 'ukończone', 'completed', 'done', 'zamknięte', 'zamkniete', 'wykonane'].some(k => s.includes(k))
	}

	const toggleTaskDone = (id, current) => {
		const next = !current
		setDoneOverride(prev => {
			const m = new Map(prev)
			m.set(id, next)
			return m
		})
		onToggleTask?.(id, next)
	}

	// ---------- budowa listy ----------
	const items = useMemo(() => {
		const q = query.trim().toLowerCase()
		const mapped = []

		// TASKS — użytkownik w assignees
		for (const t of tasks) {
			const date = parseDateSafe(t.dueDate || t.date || t.targetDate)
			if (!date || !inRange(date)) continue
			if (!Array.isArray(t.assignees) || !t.assignees.includes(currentUser)) continue
			const done = isTaskDone(t)
			mapped.push({
				kind: 'task',
				id: t.id,
				title: t.title || t.name || `Zadanie ${t.id}`,
				subtitle: t.status ? `Status: ${t.status}` : '',
				when: date,
				onClick: () => onGoToTask?.(t.id),
				searchBlob: `${t.title ?? ''} ${t.name ?? ''} ${t.status ?? ''} ${(t.assignees || []).join(' ')}`,
				done,
				toggle: () => toggleTaskDone(t.id, done),
			})
		}

		// MEETINGS — user w participants
		for (const m of meetings) {
			const date = parseDateSafe(m.date)
			if (!date || !inRange(date)) continue
			if (!Array.isArray(m.participants) || !m.participants.includes(currentUser)) continue
			mapped.push({
				kind: 'meeting',
				id: m.id,
				title: m.title || m.topic || `Spotkanie ${m.id}`,
				subtitle: [m.time, (m.participants || []).join(', ')].filter(Boolean).join(' • '),
				when: date,
				onClick: () => onGoToMeeting?.(m.id),
				searchBlob: `${m.title ?? ''} ${m.topic ?? ''} ${m.time ?? ''} ${(m.participants || []).join(' ')} ${(
					m.decisions || []
				).join(' ')}`,
			})
		}

		// TRAININGS — user w participants
		for (const tr of trainings) {
			const date = parseDateSafe(tr.date)
			if (!date || !inRange(date)) continue
			if (!Array.isArray(tr.participants) || !tr.participants.includes(currentUser)) continue
			mapped.push({
				kind: 'training',
				id: tr.id,
				title: tr.title || `Szkolenie ${tr.id}`,
				subtitle: [tr.type, (tr.participants || []).join(', ')].filter(Boolean).join(' • '),
				when: date,
				onClick: () => onGoToTraining?.(tr.id),
				searchBlob: `${tr.title ?? ''} ${tr.type ?? ''} ${(tr.participants || []).join(' ')}`,
			})
		}

		// POSTS — user we wzmiankach/mentions
		for (const p of posts) {
			const date = parseDateSafe(p.date || p.targetDate)
			if (!date || !inRange(date)) continue
			const mentions = Array.isArray(p.mentions) ? p.mentions : []
			if (!mentions.includes(currentUser)) continue
			mapped.push({
				kind: 'post',
				id: p.id,
				title: p.title || `Post ${p.id}`,
				subtitle: p.tags && p.tags.length ? `#${p.tags[0]}` : '',
				when: date,
				onClick: () => onGoToPost?.(p.id),
				searchBlob: `${p.title ?? ''} ${(p.tags || []).join(' ')} ${mentions.join(' ')}`,
			})
		}

		// filtrowanie typów + tekstu
		const filtered = mapped
			.filter(it => typeFilter.has(it.kind))
			.filter(it => (q ? (it.title + ' ' + it.subtitle + ' ' + it.searchBlob).toLowerCase().includes(q) : true))

		// sort
		filtered.sort((a, b) => {
			const av = a.when?.getTime?.() ?? 0
			const bv = b.when?.getTime?.() ?? 0
			return sortAsc ? av - bv : bv - av
		})

		return filtered
	}, [tasks, meetings, trainings, posts, currentUser, range, typeFilter, query, sortAsc, doneOverride])

	// liczniki do chipów
	const counts = useMemo(() => {
		return items.reduce(
			(acc, it) => {
				acc[it.kind] = (acc[it.kind] || 0) + 1
				return acc
			},
			{ task: 0, meeting: 0, training: 0, post: 0 }
		)
	}, [items])

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

	// pomocnicze: etykieta sekcji
	const kindLabel = k =>
		k === 'task' ? 'Zadania' : k === 'meeting' ? 'Spotkania' : k === 'training' ? 'Szkolenia' : 'Posty'

	// pomocnicze: grupowanie po datach w obrębie sekcji
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

	// podział na sekcje
	const byKind = useMemo(() => {
		const out = { task: [], meeting: [], training: [], post: [] }
		for (const it of items) out[it.kind].push(it)
		return out
	}, [items])

	const sectionOrder = ['task', 'meeting', 'training', 'post']

	// czy wszystko puste (po filtrach)
	const allEmpty = sectionOrder.every(k => !typeFilter.has(k) || byKind[k].length === 0)

	const onCheckKeyDown = (e, toggle) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			toggle?.()
		}
	}

	return (
		<div className='myschedule'>
			<header className='myschedule__head'>
				<div className='myschedule__filters'>
					{/* --- Presety zakresu: jak w Terminy/Zestawienie --- */}
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

					{/* --- Chipy typów: jak w Zestawieniu --- */}
					<div className='chips'>
						<button className={`chip ${typeFilter.has('task') ? 'is-on' : ''}`} onClick={() => toggleType('task')}>
							{iconFor('task')} <span>Zadania</span> <span className='badge'>{counts.task || 0}</span>
						</button>
						<button
							className={`chip ${typeFilter.has('meeting') ? 'is-on' : ''}`}
							onClick={() => toggleType('meeting')}>
							{iconFor('meeting')} <span>Spotkania</span> <span className='badge'>{counts.meeting || 0}</span>
						</button>
						<button
							className={`chip ${typeFilter.has('training') ? 'is-on' : ''}`}
							onClick={() => toggleType('training')}>
							{iconFor('training')} <span>Szkolenia</span> <span className='badge'>{counts.training || 0}</span>
						</button>
						<button className={`chip ${typeFilter.has('post') ? 'is-on' : ''}`} onClick={() => toggleType('post')}>
							{iconFor('post')} <span>Posty</span> <span className='badge'>{counts.post || 0}</span>
						</button>
					</div>

					{/* --- Wyszukiwarka + sort + "Wyczyść wszystkie filtry" --- */}
					<div className='search'>
						<input
							type='text'
							placeholder='Szukaj w moich terminach...'
							value={query}
							onChange={e => setQuery(e.target.value)}
						/>
						<button className='sort' onClick={() => setSortAsc(s => !s)} title='Zmień kolejność'>
							{sortAsc ? '↑ rosnąco' : '↓ malejąco'}
						</button>
						<button className='btn btn--clear clearall' onClick={clearAll} title='Wyczyść wszystkie filtry'>
							Wyczyść wszystkie filtry
						</button>
					</div>
				</div>
			</header>

			<ul className='myschedule__list'>
				{allEmpty && <li className='empty'>Brak elementów w wybranym zakresie.</li>}

				{sectionOrder.map(k => {
					if (!typeFilter.has(k)) return null
					const list = byKind[k]
					if (!list.length) return null
					const grouped = groupByDate(list)

					return (
						<React.Fragment key={k}>
							{/* Nagłówek sekcji (nieprzyklejony) */}
							<li className='group' style={{ position: 'static' }}>
								<div className='group__label'>
									{iconFor(k)}
									<span>{kindLabel(k)}</span>
								</div>
							</li>

							{/* Grupy dat w obrębie sekcji */}
							{grouped.map(g => (
								<React.Fragment key={g.date.toISOString()}>
									<li className='group' data-weekend={g.weekend ? 'true' : 'false'}>
										<div className='group__label'>
											<CalendarDays size={16} />
											<span>{g.label}</span>
										</div>
									</li>
									{g.items.map(it => (
										<li
											key={`${it.kind}-${it.id}`}
											className='item'
											onClick={it.onClick}
											data-clickable={Boolean(it.onClick)}>
											{it.kind === 'task' ? (
												<button
													type='button'
													className={`check ${it.done ? 'is-checked' : ''}`}
													role='checkbox'
													aria-checked={it.done ? 'true' : 'false'}
													title={it.done ? 'Oznaczone jako wykonane' : 'Oznacz jako wykonane'}
													onClick={e => {
														e.stopPropagation()
														it.toggle?.()
													}}
													onKeyDown={e => onCheckKeyDown(e, it.toggle)}>
													<CheckSquare size={16} />
												</button>
											) : (
												<div className={`kind kind--${it.kind}`}>{iconFor(it.kind)}</div>
											)}

											<div className='meta'>
												<div className={`title ${it.done ? 'is-done' : ''}`}>{it.title}</div>
												{it.subtitle ? <div className='sub'>{it.subtitle}</div> : null}
											</div>

											<div className='more'>Szczegóły →</div>
										</li>
									))}
								</React.Fragment>
							))}
						</React.Fragment>
					)
				})}
			</ul>
		</div>
	)
}

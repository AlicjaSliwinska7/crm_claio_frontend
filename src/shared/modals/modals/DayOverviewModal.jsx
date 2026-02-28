// src/features/board/components/DayOverviewModal.jsx (albo gdzie masz ten plik)
import React, { useMemo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { format, isSameDay, isBefore, parseISO, startOfDay, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import '../styles/day-overview-modal.css'

// 🚀 „sufit” nad całym UI (nad upper/lower nav i drawerami)
const MODAL_Z = 2147483600

function getAppRoot() {
	return (
		document.getElementById('root') ||
		document.getElementById('app') ||
		document.querySelector('[data-app-root]')
	)
}

function toDate(d) {
	if (!d) return null
	if (d instanceof Date) return d
	try {
		return parseISO(d)
	} catch {
		return null
	}
}
function sameDayByAny(item, fields, selected) {
	return fields.some(f => item[f] && isSameDay(toDate(item[f]), selected))
}

export default function DayOverviewModal({
	date, // Date | null
	onClose, // () => void
	currentUser = 'Alicja Śliwińska',
	tasks = [],
	posts = [],
	trainings = [],
	samples = [],
	orders = [],
	meetings = [],
	onGoToTask,
	onGoToPost,
	onGoToTraining,
	onGoToMeeting,
	onAddTask,
	onAddPost,
	onAddTraining,
	onAddMeeting,
}) {
	// --- FILTR UCZESTNIKÓW (stan lokalny) ---
	const [selectedParticipants, setSelectedParticipants] = useState(new Set())
	const [onlyMe, setOnlyMe] = useState(false)

	const toggleParticipant = name => {
		setSelectedParticipants(prev => {
			const next = new Set(prev)
			if (next.has(name)) next.delete(name)
			else next.add(name)
			return next
		})
	}
	const clearParticipants = () => setSelectedParticipants(new Set())

	// --- LISTA DOSTĘPNYCH UCZESTNIKÓW (z ostatnich 60 dni + dziś) ---
	const participantChoices = useMemo(() => {
		const cutoff = subDays(startOfDay(date || new Date()), 60)
		const pool = new Set()
		for (const m of meetings || []) {
			const md = toDate(m.date)
			if (!md || isBefore(md, cutoff)) continue
			if (Array.isArray(m.participants)) {
				m.participants.forEach(p => p && pool.add(p))
			}
		}
		return Array.from(pool).sort((a, b) => a.localeCompare(b, 'pl'))
	}, [meetings, date])

	// --- obliczenia dzienne ---
	const {
		myTasksToday,
		allTasksToday,
		postsToday,
		trainingsToday,
		inProgressToday,
		meetingsTodayRaw,
		latestMeetingsRaw,
	} = useMemo(() => {
		if (!date) {
			return {
				myTasksToday: [],
				allTasksToday: [],
				postsToday: [],
				trainingsToday: [],
				inProgressToday: [],
				meetingsTodayRaw: [],
				latestMeetingsRaw: [],
			}
		}

		const myTasksToday = tasks.filter(
			t =>
				sameDayByAny(t, ['dueDate', 'date', 'targetDate'], date) &&
				Array.isArray(t.assignees) &&
				t.assignees.includes(currentUser)
		)
		const allTasksToday = tasks.filter(t => sameDayByAny(t, ['dueDate', 'date', 'targetDate'], date))
		const postsToday = posts.filter(p => sameDayByAny(p, ['date', 'targetDate'], date))
		const trainingsToday = trainings.filter(tr => sameDayByAny(tr, ['date'], date))

		// badania w toku
		const s = (samples || []).filter(
			smp =>
				(smp.status || '').toLowerCase() === 'w trakcie badań' &&
				(!smp.receivedDate || !isBefore(date, toDate(smp.receivedDate)))
		)
		const o = (orders || []).filter(ord => (ord.stage || '').toLowerCase() === 'w trakcie badań')
		const inProgressToday = [...s.map(x => ({ kind: 'sample', ...x })), ...o.map(x => ({ kind: 'order', ...x }))]

		// spotkania
		const meetingsTodayRaw = (meetings || []).filter(m => sameDayByAny(m, ['date'], date))
		const cutoff = subDays(startOfDay(date), 14)
		const latestMeetingsRaw = (meetings || [])
			.filter(m => {
				const d = toDate(m.date)
				return d && !isBefore(d, cutoff)
			})
			.sort((a, b) => toDate(b.date) - toDate(a.date))
			.slice(0, 12)

		return {
			myTasksToday,
			allTasksToday,
			postsToday,
			trainingsToday,
			inProgressToday,
			meetingsTodayRaw,
			latestMeetingsRaw,
		}
	}, [tasks, posts, trainings, samples, orders, meetings, date, currentUser])

	// --- zastosowanie filtra uczestników ---
	const filterByParticipants = arr => {
		if (!arr?.length) return []
		const names = selectedParticipants
		const activeFilter = onlyMe || names.size > 0
		if (!activeFilter) return arr
		return arr.filter(m => {
			const parts = Array.isArray(m.participants) ? m.participants : []
			if (onlyMe && !parts.includes(currentUser)) return false
			if (names.size > 0) {
				const hasAny = parts.some(p => names.has(p))
				if (!hasAny) return false
			}
			return true
		})
	}

	const meetingsToday = filterByParticipants(meetingsTodayRaw)
	const latestMeetings = filterByParticipants(latestMeetingsRaw)

	const dayLabel = date ? format(date, 'EEEE, d MMMM yyyy', { locale: pl }) : ''

	// --- focus/ESC/lock ---
	const closeBtnRef = useRef(null)
	const restoreFocusRef = useRef(null)

	useEffect(() => {
		if (!date) return

		// zapamiętaj focus
		restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

		// ESC
		const onKey = e => {
			if (e.key === 'Escape') onClose?.()
		}
		document.addEventListener('keydown', onKey)

		// lock scroll + kompensacja
		const body = document.body
		const docEl = document.documentElement
		const prevOverflow = body.style.overflow
		const prevPaddingRight = body.style.paddingRight

		const hadVerticalScroll = docEl.scrollHeight > docEl.clientHeight
		const scrollbarW = window.innerWidth - docEl.clientWidth
		if (hadVerticalScroll && scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
		body.style.overflow = 'hidden'

		// inert + aria-hidden na app root
		const appRoot = getAppRoot()
		const hadInert = appRoot?.hasAttribute('inert') || false
		const hadAriaHidden = appRoot?.getAttribute('aria-hidden') === 'true'

		if (appRoot) {
			appRoot.setAttribute('inert', '')
			appRoot.setAttribute('aria-hidden', 'true')
		}

		// focus na close
		queueMicrotask(() => closeBtnRef.current?.focus?.())

		return () => {
			document.removeEventListener('keydown', onKey)

			// restore body
			body.style.overflow = prevOverflow
			body.style.paddingRight = prevPaddingRight

			// restore app root
			if (appRoot) {
				if (!hadInert) appRoot.removeAttribute('inert')
				if (!hadAriaHidden) appRoot.removeAttribute('aria-hidden')
			}

			// restore focus
			try {
				restoreFocusRef.current?.focus?.()
			} catch {}
		}
	}, [date, onClose])

	if (!date) return null

	const stop = e => e.stopPropagation()

	const ui = (
		<div
			className="calmodal__overlay"
			role="presentation"
			onClick={onClose}
			// ⬇ gwarancja, że jest nad upper/lower navbar
			style={{ zIndex: MODAL_Z }}>
			<div
				className="calmodal__content day-overview-modal"
				role="dialog"
				aria-modal="true"
				aria-label={`Podgląd dnia: ${dayLabel}`}
				onClick={stop}
				style={{ maxWidth: 980, zIndex: MODAL_Z + 1 }}>
				{/* HEADER */}
				<header className="calmodal__header">
					<div className="calmodal__titlewrap">
						<h3>{dayLabel}</h3>
						<span className="calmodal__subtitle">Skrót dnia, szybkie akcje i linki do wpisów</span>
					</div>
					<button
						ref={closeBtnRef}
						className="calmodal__close"
						onClick={onClose}
						aria-label="Zamknij"
						title="Zamknij">
						×
					</button>
				</header>

				{/* QUICK LINKS */}
				<nav className="calmodal__quick">
					<a href="#moje" className="chip">
						Moje zadania <span className="badge">{myTasksToday.length}</span>
					</a>
					<a href="#wszystkie" className="chip">
						Wszystkie <span className="badge">{allTasksToday.length}</span>
					</a>
					<a href="#posty" className="chip">
						Posty <span className="badge">{postsToday.length}</span>
					</a>
					<a href="#szkolenia" className="chip">
						Szkolenia <span className="badge">{trainingsToday.length}</span>
					</a>
					<a href="#badania" className="chip">
						Badania <span className="badge">{inProgressToday.length}</span>
					</a>
					<a href="#spotkania" className="chip">
						Spotkania <span className="badge">{meetingsToday.length}</span>
					</a>
				</nav>

				{/* BODY */}
				<div className="calmodal__body">
					<section className="calmodal__sections">
						{/* MOJE ZADANIA */}
						<div id="moje" className="section">
							<div className="section__head">
								<h4>Moje zadania</h4>
								<div className="section__actions">
									<button className="btn btn--ghost" onClick={() => onAddTask?.(date)}>
										+ Dodaj zadanie
									</button>
								</div>
							</div>
							{myTasksToday.length === 0 ? (
								<p className="empty">Brak zadań przypisanych do Ciebie.</p>
							) : (
								<ul className="list">
									{myTasksToday.map(t => (
										<li key={t.id} className="list__item">
											<div className="list__main">
												<span className={`status status--${(t.status || 'default').toLowerCase()}`} />
												<button className="linklike" onClick={() => onGoToTask?.(t.id)}>
													{t.title || t.name || `Zadanie ${t.id}`}
												</button>
											</div>
											{t.status && <div className="list__meta">Status: {t.status}</div>}
										</li>
									))}
								</ul>
							)}
						</div>

						{/* WSZYSTKIE ZADANIA */}
						<div id="wszystkie" className="section">
							<div className="section__head">
								<h4>Wszystkie zadania (ten dzień)</h4>
							</div>
							{allTasksToday.length === 0 ? (
								<p className="empty">Brak zadań na wybrany dzień.</p>
							) : (
								<ul className="list">
									{allTasksToday.map(t => (
										<li key={t.id} className="list__item">
											<div className="list__main">
												<span className={`status status--${(t.status || 'default').toLowerCase()}`} />
												<button className="linklike" onClick={() => onGoToTask?.(t.id)}>
													{t.title || t.name || `Zadanie ${t.id}`}
												</button>
											</div>
											<div className="list__meta">
												{Array.isArray(t.assignees) && t.assignees.length > 0
													? `Przydzielone: ${t.assignees.join(', ')}`
													: '—'}
											</div>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* POSTY */}
						<div id="posty" className="section">
							<div className="section__head">
								<h4>Wydarzenia (posty)</h4>
								<div className="section__actions">
									<button className="btn btn--ghost" onClick={() => onAddPost?.(date)}>
										+ Dodaj post
									</button>
								</div>
							</div>
							{postsToday.length === 0 ? (
								<p className="empty">Brak postów w tym dniu.</p>
							) : (
								<ul className="list">
									{postsToday.map(p => (
										<li key={p.id} className="list__item">
											<div className="list__main">
												<span className="dot" />
												<button className="linklike" onClick={() => onGoToPost?.(p.id)}>
													{p.title || `Post ${p.id}`}
												</button>
											</div>
											{Array.isArray(p.tags) && p.tags.length > 0 && (
												<div className="list__meta">Tag: {p.tags[0]}</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>

						{/* SZKOLENIA */}
						<div id="szkolenia" className="section">
							<div className="section__head">
								<h4>Szkolenia</h4>
								<div className="section__actions">
									<button className="btn btn--ghost" onClick={() => onAddTraining?.(date)}>
										+ Dodaj szkolenie
									</button>
								</div>
							</div>
							{trainingsToday.length === 0 ? (
								<p className="empty">Brak szkoleń w tym dniu.</p>
							) : (
								<ul className="list">
									{trainingsToday.map(tr => (
										<li key={tr.id} className="list__item">
											<div className="list__main">
												<span className="badge badge--soft">SZK</span>
												<button className="linklike" onClick={() => onGoToTraining?.(tr.id)}>
													{tr.title || `Szkolenie ${tr.id}`}
												</button>
											</div>
											{Array.isArray(tr.participants) && tr.participants.length > 0 && (
												<div className="list__meta">Uczestnicy: {tr.participants.join(', ')}</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>

						{/* BADANIA */}
						<div id="badania" className="section full">
							<div className="section__head">
								<h4>Aktualnie prowadzone badania</h4>
							</div>
							{inProgressToday.length === 0 ? (
								<p className="empty">Brak aktywnych badań.</p>
							) : (
								<ul className="list">
									{inProgressToday.map((x, idx) => (
										<li key={x.id || idx} className="list__item">
											<div className="list__main">
												<span className="badge">{x.kind === 'order' ? 'Zlecenie' : 'Próbka'}</span>
												<span className="list__text">
													{(x.subject || x.orderNumber || x.id || '').toString()}
													{x.client || x.zleceniodawca || x.clientName ? (
														<span className="muted"> — {x.client || x.zleceniodawca || x.clientName}</span>
													) : null}
												</span>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* SPOTKANIA — DZISIAJ */}
						<div id="spotkania" className="section">
							<div className="section__head">
								<h4>Spotkania (dziś)</h4>
								<div className="section__actions">
									<button className="btn btn--ghost" onClick={() => onAddMeeting?.(date)}>
										+ Dodaj spotkanie
									</button>
								</div>
							</div>
							{meetingsToday.length === 0 ? (
								<p className="empty">Brak spotkań w tym dniu.</p>
							) : (
								<ul className="meetings">
									{meetingsToday.map(m => (
										<li key={m.id} className="meeting-item">
											<div className="meeting-row">
												<button className="linklike meeting-title" onClick={() => onGoToMeeting?.(m.id)}>
													{m.title || `Spotkanie ${m.id}`}
												</button>
												<div className="meeting-date">{m.date ? format(toDate(m.date), 'HH:mm', { locale: pl }) : ''}</div>
											</div>
											{Array.isArray(m.participants) && m.participants.length > 0 && (
												<div className="list__meta">Uczestnicy: {m.participants.join(', ')}</div>
											)}
											{Array.isArray(m.decisions) && m.decisions.length > 0 ? (
												<ul className="decisions">
													{m.decisions.slice(0, 3).map((d, i) => (
														<li key={i}>• {d}</li>
													))}
												</ul>
											) : (
												<div className="muted">Brak zapisanych ustaleń.</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>

						{/* USTALENIA Z OSTATNICH SPOTKAŃ */}
						<div className="section">
							<div className="section__head">
								<h4>Ustalenia z ostatnich spotkań</h4>
								<div className="section__actions">
									<button className="btn" onClick={() => onGoToMeeting?.('all')}>
										Wszystkie spotkania
									</button>
								</div>
							</div>
							{latestMeetings.length === 0 ? (
								<p className="empty">Brak spotkań w ostatnich 14 dniach.</p>
							) : (
								<ul className="meetings">
									{latestMeetings.map(m => (
										<li key={m.id} className="meeting-item">
											<div className="meeting-row">
												<button className="linklike meeting-title" onClick={() => onGoToMeeting?.(m.id)}>
													{m.title || `Spotkanie ${m.id}`}
												</button>
												<div className="meeting-date">{m.date ? format(toDate(m.date), 'd MMM yyyy', { locale: pl }) : ''}</div>
											</div>
											{Array.isArray(m.participants) && m.participants.length > 0 && (
												<div className="list__meta">Uczestnicy: {m.participants.join(', ')}</div>
											)}
											{Array.isArray(m.decisions) && m.decisions.length > 0 ? (
												<ul className="decisions">
													{m.decisions.slice(0, 3).map((d, i) => (
														<li key={i}>• {d}</li>
													))}
												</ul>
											) : (
												<div className="muted">Brak zapisanych ustaleń.</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					</section>

					{/* PRAWY ASIDE */}
					<aside className="calmodal__aside">
						<div className="asidecard">
							<div className="asidecard__head">Szybkie akcje</div>
							<div className="asidecard__content">
								<button className="btn btn--primary" onClick={() => onAddTask?.(date)}>
									+ Nowe zadanie
								</button>
								<button className="btn" onClick={() => onAddPost?.(date)}>
									+ Nowy post
								</button>
								<button className="btn" onClick={() => onAddTraining?.(date)}>
									+ Nowe szkolenie
								</button>
								<button className="btn" onClick={() => onAddMeeting?.(date)}>
									+ Nowe spotkanie
								</button>
							</div>
						</div>

						{/* FILTR UCZESTNIKÓW */}
						<div className="asidecard">
							<div className="asidecard__head">Filtr uczestników</div>
							<div className="asidecard__content filter-participants">
								<label className="toggle">
									<input type="checkbox" checked={onlyMe} onChange={e => setOnlyMe(e.target.checked)} />
									<span>Tylko moje ({currentUser})</span>
								</label>

								{participantChoices.length === 0 ? (
									<div className="muted">Brak danych o uczestnikach.</div>
								) : (
									<div className="chips">
										{participantChoices.map(name => (
											<label
												key={name}
												className={`chip chip--select ${selectedParticipants.has(name) ? 'is-selected' : ''}`}>
												<input
													type="checkbox"
													checked={selectedParticipants.has(name)}
													onChange={() => toggleParticipant(name)}
												/>
												<span>{name}</span>
											</label>
										))}
									</div>
								)}

								<div className="filter-actions">
									<button className="btn" onClick={clearParticipants}>
										Wyczyść
									</button>
								</div>

								<div className="filter-hint">
									<span className="muted">
										Filtr działa na „Spotkania (dziś)” i „Ustalenia z ostatnich spotkań”.
									</span>
								</div>
							</div>
						</div>

						<div className="asidecard">
							<div className="asidecard__head">Nawigacja sekcji</div>
							<div className="asidecard__links">
								<a href="#moje">Moje zadania</a>
								<a href="#wszystkie">Wszystkie zadania</a>
								<a href="#posty">Posty</a>
								<a href="#szkolenia">Szkolenia</a>
								<a href="#badania">Badania</a>
								<a href="#spotkania">Spotkania</a>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	)

	return createPortal(ui, document.body)
}

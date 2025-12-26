// src/components/pages/contents/MyTasks.js
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import '../styles/my-tasks.css'

// TODO: podepnij z auth/kontekstu
const loggedInUser = 'Alicja Śliwińska'

/**
 * Zadanie:
 * - workflow: 'simple' | 'verify'
 * - status: 'nieprzydzielone' | 'przydzielone' | 'w_trakcie' | 'w_weryfikacji' | 'do_poprawy' | 'zatwierdzone' | 'odrzucone'
 * - history: [{ at: ISO, by: string, what: string }]
 * - comments: [{ at: ISO, by: string, text: string }]
 * - links: [{ label, href }]
 */
const SAMPLE_TASKS = [
	{
		id: 't2',
		title: 'Dodać filtr „moje” w widoku zadań',
		author: 'Alicja Śliwińska',
		assignedTo: ['Alicja Śliwińska'],
		workflow: 'verify',
		status: 'przydzielone',
		type: 'frontend',
		createdAt: '2025-09-20',
		due: '2025-09-28',
		tags: ['frontend', 'UX'],
		priority: 'normalny',
		description: 'Widok powinien wspierać filtrowanie po terminach oraz „Tylko moje”.',
		authorNotes: 'Po wdrożeniu sprawdź, czy zakres dat nie rozjeżdża layoutu.',
		links: [
			{ label: 'Specyfikacja Figma', href: '#' },
			{ label: 'Ticket JIRA-123', href: '#' },
		],
		comments: [{ at: '2025-09-21T09:15:00.000Z', by: 'Alicja Śliwińska', text: 'Dodałam wstępny opis i zakres.' }],
	},
	{
		id: 't1',
		title: 'Utworzyć szablon zestawienia nadgodzin',
		author: 'Piotr Kowalski',
		assignedTo: ['Alicja Śliwińska', 'Anna Nowak'],
		workflow: 'verify',
		status: 'przydzielone',
		type: 'dokument',
		createdAt: '2025-09-10',
		due: '2025-09-30',
		tags: ['dokumenty', 'nadgodziny'],
		priority: 'wysoki',
		description: 'Szablon w Google Sheets z autowyliczaniem stawki i podpisem kierownika.',
		authorNotes: 'Zwróć uwagę na rounding w kolumnie C.',
		links: [{ label: 'Arkusz wzorcowy', href: '#' }],
		comments: [],
	},
	{
		id: 't3',
		title: 'Przenieść style Equipment do osobnego pliku',
		author: 'Maria Zielińska',
		assignedTo: [],
		workflow: 'simple',
		status: 'nieprzydzielone',
		type: 'refaktor',
		createdAt: '2025-09-15',
		due: '',
		tags: ['refaktor', 'css'],
		priority: 'niski',
		description: 'Porządkowanie stylów: wydzielenie do MyTasks.css-equipment i import w komponencie.',
		authorNotes: '',
		links: [],
		comments: [],
	},
]

// ===== helpers =====
const nowISO = () => new Date().toISOString()
const parseD = s => (s ? new Date(`${s}T00:00:00`) : null)
const today0 = () => {
	const d = new Date()
	d.setHours(0, 0, 0, 0)
	return d
}
const addDays = (d, n) => {
	const x = new Date(d)
	x.setDate(x.getDate() + n)
	return x
}
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0)
const weekRangePL = (base = new Date(), off = 0) => {
	const d = today0()
	const mondayDelta = (d.getDay() + 6) % 7
	const start = addDays(d, -mondayDelta + 7 * off)
	const end = addDays(start, 6)
	return [start, end]
}
const inRange = (d, a, b) => !!(d && a && b && d >= a && d <= b)
const lastHistoryDate = t => {
	const arr = t.history || []
	return arr.length ? new Date(arr[arr.length - 1].at) : null
}

const STATUS_LABEL = {
	nieprzydzielone: 'Nieprzydzielone',
	przydzielone: 'Przydzielone',
	w_trakcie: 'W trakcie realizacji',
	w_weryfikacji: 'W trakcie weryfikacji',
	do_poprawy: 'Do poprawy',
	zatwierdzone: 'Zatwierdzone',
	odrzucone: 'Odrzucone',
}
const STATUS_CLASS = {
	nieprzydzielone: 'status--unassigned',
	przydzielone: 'status--assigned',
	w_trakcie: 'status--inprogress',
	w_weryfikacji: 'status--review',
	do_poprawy: 'status--changes',
	zatwierdzone: 'status--approved',
	odrzucone: 'status--rejected',
}

// progres na pasku
function progressInfo(task) {
	const simple = ['nieprzydzielone', 'przydzielone', 'w_trakcie', 'zatwierdzone']
	const verify = ['nieprzydzielone', 'przydzielone', 'w_trakcie', 'w_weryfikacji', 'zatwierdzone']
	const order = task.workflow === 'verify' ? verify : simple

	let s = task.status
	if (s === 'do_poprawy') s = 'w_trakcie'
	if (s === 'odrzucone') s = 'przydzielone'

	const idx = Math.max(0, order.indexOf(s))
	const total = order.length - 1
	const percent = Math.round((idx / total) * 100)
	return { idx, total, percent }
}

/* ===== Popover „Przekaż” ===== */
function useClickOutside(ref, onOutside, enabled = true) {
	useEffect(() => {
		if (!enabled) return
		const onDown = e => {
			if (!ref.current) return
			if (!ref.current.contains(e.target)) onOutside?.()
		}
		const onKey = e => {
			if (e.key === 'Escape') onOutside?.()
		}
		document.addEventListener('mousedown', onDown)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDown)
			document.removeEventListener('keydown', onKey)
		}
	}, [ref, onOutside, enabled])
}

function ReassignPopover({ open, people, current, onSelect, onClose }) {
	const boxRef = useRef(null)
	useClickOutside(boxRef, onClose, open)
	const [q, setQ] = useState('')
	useEffect(() => {
		if (open) setQ('')
	}, [open])

	const list = useMemo(() => {
		const norm = s => (s || '').toLowerCase()
		const uniq = Array.from(new Set(people.filter(Boolean)))
		return uniq.filter(p => norm(p).includes(norm(q))).sort((a, b) => a.localeCompare(b))
	}, [people, q])

	if (!open) return null
	return (
		<div className='reassign-popover' ref={boxRef}>
			<div className='reassign-head'>Przekaż do</div>
			<input className='reassign-search' placeholder='Szukaj osoby…' value={q} onChange={e => setQ(e.target.value)} />
			<div className='reassign-list' role='listbox' aria-label='Wybierz pracownika'>
				{list.length === 0 ? (
					<div className='reassign-empty'>Brak wyników</div>
				) : (
					list.map(name => (
						<button
							key={name}
							type='button'
							className={`reassign-item ${current?.includes(name) ? 'is-current' : ''}`}
							onClick={() => onSelect(name)}>
							<span className='name'>{name}</span>
							{current?.includes(name) && <span className='badge-small'>obecny</span>}
						</button>
					))
				)}
			</div>
			<div className='reassign-actions'>
				<button className='btn ghost' type='button' onClick={onClose}>
					Anuluj
				</button>
			</div>
		</div>
	)
}

/* ===== Szczegóły ===== */
function TaskDetails({
	task,
	isAuthor,
	isPerformer,
	peopleList,
	onAccept,
	onReject,
	onSendReview,
	onDone,
	onApprove,
	onRequestChanges,
	onReassign,
	onAddComment,
	onEditContent,
	onBack,
}) {
	// HOOKI MUSZĄ BYĆ NAD wczesnym return
	const [openReassign, setOpenReassign] = useState(false)
	const [comment, setComment] = useState('')
	const [editMode, setEditMode] = useState(false)
	const [descDraft, setDescDraft] = useState(task?.description || '')
	const [notesDraft, setNotesDraft] = useState(task?.authorNotes || '')
	const [commentsPage, setCommentsPage] = useState(1)
	const pageSize = 5

	useEffect(() => {
		// reset draftów przy zmianie zadania
		setDescDraft(task?.description || '')
		setNotesDraft(task?.authorNotes || '')
		setEditMode(false)
		setCommentsPage(1)
	}, [task?.id])

	if (!task) {
		return (
			<div className='taskdetails'>
				<div className='td-head'>
					<button className='btn ghost back' onClick={onBack}>
						← Powrót
					</button>
				</div>
				<div className='empty'>Nie znaleziono zadania.</div>
			</div>
		)
	}

	const { percent } = progressInfo(task)
	const statusClass = STATUS_CLASS[task.status] || 'status--neutral'
	const statusLabel = STATUS_LABEL[task.status] || task.status

	const canAccept =
		isPerformer && (task.status === 'przydzielone' || task.status === 'nieprzydzielone' || task.status === 'do_poprawy')
	const canReject = isPerformer && (task.status === 'przydzielone' || task.status === 'w_trakcie')
	const canSendReview = isPerformer && task.workflow === 'verify' && task.status === 'w_trakcie'
	const canMarkDone =
		isPerformer && task.workflow === 'simple' && (task.status === 'w_trakcie' || task.status === 'przydzielone')
	const canReassign = (isPerformer || isAuthor) && !['zatwierdzone', 'odrzucone'].includes(task.status)
	const canApprove = isAuthor && task.workflow === 'verify' && task.status === 'w_weryfikacji'
	const canRequestChanges = isAuthor && task.workflow === 'verify' && task.status === 'w_weryfikacji'

	const commentsTotal = task.comments?.length || 0
	const visibleCount = Math.min(commentsTotal, commentsPage * pageSize)
	const visibleComments = (task.comments || []).slice(-visibleCount).reverse() // najnowsze u góry

	const saveDisabled = descDraft === (task.description || '') && notesDraft === (task.authorNotes || '')

	return (
		<div className='taskdetails'>
			<div className='td-head'>
				<button className='btn ghost back' onClick={onBack}>
					← Powrót do listy
				</button>
				<div className='titlewrap'>
					<h1 className='td-title'>{task.title}</h1>
					{task.type && <span className='badge-kind'>{task.type}</span>}
					{(isAuthor || isPerformer) && <span className='badge-mine'>Moje</span>}
				</div>
				<span className={`badge ${statusClass}`}>{statusLabel}</span>
			</div>

			<div
				className='progress progress--lg'
				role='progressbar'
				aria-valuenow={percent}
				aria-valuemin='0'
				aria-valuemax='100'>
				<div className='progress__bar' style={{ width: `${percent}%` }} />
			</div>

			<div className='td-grid'>
				<section className='td-card'>
					<h2>Informacje</h2>
					<div className='td-meta'>
						<div>
							<span className='label'>Autor:</span> <span className='val'>{task.author || '—'}</span>
						</div>
						<div>
							<span className='label'>Wykonujący:</span>{' '}
							<span className='val'>{task.assignedTo?.length ? task.assignedTo.join(', ') : '—'}</span>
						</div>
						<div>
							<span className='label'>Workflow:</span>{' '}
							<span className='val'>{task.workflow === 'verify' ? 'Z weryfikacją' : 'Prosty'}</span>
						</div>
						<div>
							<span className='label'>Priorytet:</span> <span className='val'>{task.priority || '—'}</span>
						</div>
						<div>
							<span className='label'>Utworzono:</span> <span className='val'>{task.createdAt || '—'}</span>
						</div>
						<div>
							<span className='label'>Termin:</span> <span className='val'>{task.due || '—'}</span>
						</div>
						{task.tags?.length ? (
							<div className='tags-row'>
								<span className='label'>Tagi:</span>{' '}
								<span className='tags'>
									{task.tags.map(t => (
										<span className='tag' key={t}>
											#{t}
										</span>
									))}
								</span>
							</div>
						) : null}
					</div>
				</section>

				<section className='td-card'>
					<div className='td-card-head'>
						<h2>Opis i notatki autora</h2>
						{isAuthor && !editMode && (
							<button className='btn ghost' onClick={() => setEditMode(true)}>
								Edytuj treść
							</button>
						)}
					</div>

					{!editMode ? (
						<>
							<h3>Opis</h3>
							<p className='td-desc'>{task.description || '—'}</p>
							{task.authorNotes ? (
								<>
									<h3>Notatki autora</h3>
									<p className='td-notes'>{task.authorNotes}</p>
								</>
							) : null}
						</>
					) : (
						<form
							className='td-edit'
							onSubmit={e => {
								e.preventDefault()
								if (!saveDisabled) {
									onEditContent({ description: descDraft, authorNotes: notesDraft })
									setEditMode(false)
								}
							}}>
							<label>
								<span>Opis</span>
								<textarea rows={5} value={descDraft} onChange={e => setDescDraft(e.target.value)} />
							</label>
							<label>
								<span>Notatki autora</span>
								<textarea rows={4} value={notesDraft} onChange={e => setNotesDraft(e.target.value)} />
							</label>
							<div className='form-actions'>
								<button className='btn primary' type='submit' disabled={saveDisabled}>
									Zapisz
								</button>
								<button
									className='btn ghost'
									type='button'
									onClick={() => {
										setEditMode(false)
										setDescDraft(task.description || '')
										setNotesDraft(task.authorNotes || '')
									}}>
									Anuluj
								</button>
							</div>
						</form>
					)}

					{task.links?.length ? (
						<>
							<h3>Linki</h3>
							<ul className='td-links'>
								{task.links.map((l, i) => (
									<li key={i}>
										<a className='extlink' href={l.href} target='_blank' rel='noreferrer'>
											{l.label}
										</a>
									</li>
								))}
							</ul>
						</>
					) : null}
				</section>

				<section className='td-card td-actions'>
					<h2>Akcje</h2>
					<div className='actor-actions'>
						{canAccept && (
							<button className='btn primary' onClick={onAccept}>
								Przyjmij
							</button>
						)}
						{canReject && (
							<button className='btn danger' onClick={onReject}>
								Odrzuć
							</button>
						)}
						{canSendReview && (
							<button className='btn warning' onClick={onSendReview}>
								Przekaż do weryfikacji
							</button>
						)}
						{canMarkDone && (
							<button className='btn primary' onClick={onDone}>
								Wykonane
							</button>
						)}

						{canReassign && (
							<div className='reassign-root'>
								<button className='btn ghost' onClick={() => setOpenReassign(v => !v)}>
									Przekaż
								</button>
								<ReassignPopover
									open={openReassign}
									people={peopleList}
									current={task.assignedTo}
									onSelect={name => {
										onReassign(name)
										setOpenReassign(false)
									}}
									onClose={() => setOpenReassign(false)}
								/>
							</div>
						)}
					</div>

					<div className='owner-actions'>
						{canApprove && (
							<button className='btn primary' onClick={onApprove}>
								Zatwierdź
							</button>
						)}
						{canRequestChanges && (
							<button className='btn warning' onClick={onRequestChanges}>
								Do poprawy
							</button>
						)}
					</div>
				</section>

				<section className='td-card'>
					<h2>Komentarze</h2>

					<div className='td-comments-wrap'>
						{visibleComments.length ? (
							<ul className='td-comments'>
								{visibleComments.map((c, i) => (
									<li key={i}>
										<div className='c-head'>
											<span className='c-by'>{c.by}</span>
											<span className='c-when'>{new Date(c.at).toLocaleString()}</span>
										</div>
										<p className='c-text'>{c.text}</p>
									</li>
								))}
							</ul>
						) : (
							<div className='muted'>Brak komentarzy.</div>
						)}
					</div>

					{visibleCount < commentsTotal && (
						<div className='form-actions'>
							<button className='btn ghost' onClick={() => setCommentsPage(p => p + 1)}>
								Pokaż starsze komentarze
							</button>
						</div>
					)}

					<form
						className='comment-form'
						onSubmit={e => {
							e.preventDefault()
							if (comment.trim()) {
								onAddComment(comment.trim())
								setComment('')
							}
						}}>
						<textarea
							value={comment}
							onChange={e => setComment(e.target.value)}
							placeholder='Dodaj komentarz…'
							rows={3}
						/>
						<div className='form-actions'>
							<button className='btn primary' type='submit' disabled={!comment.trim()}>
								Dodaj komentarz
							</button>
						</div>
					</form>
				</section>

				{task.history?.length ? (
					<section className='td-card'>
						<h2>Historia zmian</h2>
						<ul className='td-history'>
							{task.history
								.slice()
								.reverse()
								.map((h, i) => (
									<li key={i}>
										<span className='h-when'>{new Date(h.at).toLocaleString()}</span>
										<span className='h-what'>{h.what}</span>
										<span className='h-by'>({h.by})</span>
									</li>
								))}
						</ul>
					</section>
				) : null}
			</div>
		</div>
	)
}

export default function MyTasks({ initialTasks, people }) {
	// start + inicjalna historia „utworzono”
	const [tasks, setTasks] = useState(() => {
		const base = initialTasks?.length ? initialTasks : SAMPLE_TASKS
		return base.map(t => ({
			...t,
			history:
				t.history && Array.isArray(t.history)
					? t.history
					: [{ at: nowISO(), by: t.author || 'system', what: 'Utworzono zadanie' }],
			comments: Array.isArray(t.comments) ? t.comments : [],
		}))
	})

	const navigate = useNavigate()
	const { id: detailId } = useParams()

	// lista osób: props.people lub z danych
	const fallbackPeople = useMemo(() => {
		const set = new Set()
		tasks.forEach(t => {
			if (t.author) set.add(t.author)
			;(t.assignedTo || []).forEach(p => p && set.add(p))
		})
		set.add(loggedInUser)
		return Array.from(set)
	}, [tasks])
	const peopleList = people?.length ? people : fallbackPeople

	// filtry (tylko na liście)
	const [query, setQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('wszystkie')
	const [typeFilter, setTypeFilter] = useState('wszystkie')
	const [timeFilter, setTimeFilter] = useState('wszystkie')
	const [rangeFrom, setRangeFrom] = useState('')
	const [rangeTo, setRangeTo] = useState('')
	const [onlyMine, setOnlyMine] = useState(true)

	const normalize = s => (s || '').toLowerCase().trim()
	const matchesQuery = (t, q) => {
		if (!q) return true
		const hay = [t.title, t.status, t.type, ...(t.assignedTo || []), t.author, ...(t.tags || []), t.priority].join('|')
		return normalize(hay).includes(normalize(q))
	}
	const isAuthor = t => t.author === loggedInUser
	const isPerformer = t => Array.isArray(t.assignedTo) && t.assignedTo.includes(loggedInUser)

	const typeOptions = useMemo(() => {
		const set = new Set()
		tasks.forEach(t => t.type && set.add(t.type))
		return ['wszystkie', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
	}, [tasks])

	const timePredicate = t => {
		const due = parseD(t.due)
		const NOW = today0()
		switch (timeFilter) {
			case 'dzisiaj':
				return !!due && inRange(due, NOW, NOW)
			case 'jutro': {
				const j = addDays(NOW, 1)
				return !!due && inRange(due, j, j)
			}
			case 'ten_tydzien': {
				const [a, b] = weekRangePL(NOW, 0)
				return !!due && inRange(due, a, b)
			}
			case 'nastepny_tydzien': {
				const [a, b] = weekRangePL(NOW, 1)
				return !!due && inRange(due, a, b)
			}
			case 'ten_miesiac': {
				const a = startOfMonth(NOW),
					b = endOfMonth(NOW)
				return !!due && inRange(due, a, b)
			}
			case 'przeterminowane':
				return !!due && due < NOW
			case 'bez_terminu':
				return !due
			case 'zakres':
				return !rangeFrom || !rangeTo || (!!due && inRange(due, parseD(rangeFrom), parseD(rangeTo)))
			default:
				return true
		}
	}

	useEffect(() => {
		if (timeFilter !== 'zakres') return
		if (rangeFrom && rangeTo && parseD(rangeFrom) > parseD(rangeTo)) setRangeTo(rangeFrom)
	}, [timeFilter, rangeFrom, rangeTo])

	const filtered = useMemo(
		() =>
			tasks.filter(t => {
				if (statusFilter !== 'wszystkie' && t.status !== statusFilter) return false
				if (typeFilter !== 'wszystkie' && (t.type || '—') !== typeFilter) return false
				if (!timePredicate(t)) return false
				if (onlyMine && !(isPerformer(t) || isAuthor(t))) return false
				if (!matchesQuery(t, query)) return false
				return true
			}),
		[tasks, statusFilter, typeFilter, timeFilter, rangeFrom, rangeTo, onlyMine, query]
	)

	const sorted = useMemo(() => {
		const score = t => (t.status === 'przydzielone' ? 0 : 1)
		return [...filtered].sort((a, b) => {
			const s = score(a) - score(b)
			if (s) return s
			return (b.createdAt || '').localeCompare(a.createdAt || '')
		})
	}, [filtered])

	const assignedCount = useMemo(() => tasks.filter(t => t.status === 'przydzielone').length, [tasks])
	const unassignedCount = useMemo(() => tasks.filter(t => t.status === 'nieprzydzielone').length, [tasks])

	// ===== historia + zmiany =====
	const pushHistory = (task, what) => [...(task.history || []), { at: nowISO(), by: loggedInUser, what }]

	const setStatus = (id, newStatus, reason) => {
		setTasks(prev =>
			prev.map(t => {
				if (t.id !== id) return t
				return {
					...t,
					status: newStatus,
					history: pushHistory(t, `${reason || 'Zmiana statusu'} → ${STATUS_LABEL[newStatus] || newStatus}`),
				}
			})
		)
	}

	const reassignTo = (id, toPerson) => {
		setTasks(prev =>
			prev.map(t => {
				if (t.id !== id) return t
				const from = (t.assignedTo || []).join(', ') || 'brak'
				return {
					...t,
					assignedTo: [toPerson],
					history: pushHistory(t, `Przekazano: ${from} → ${toPerson}`),
				}
			})
		)
	}

	const addComment = (id, text) => {
		setTasks(prev =>
			prev.map(t => {
				if (t.id !== id) return t
				return {
					...t,
					comments: [...(t.comments || []), { at: nowISO(), by: loggedInUser, text }],
					history: pushHistory(t, `Komentarz dodany`),
				}
			})
		)
	}

	const editContent = (id, { description, authorNotes }) => {
		setTasks(prev =>
			prev.map(t => {
				if (t.id !== id) return t
				const changes = []
				if ((t.description || '') !== (description || '')) changes.push('opis')
				if ((t.authorNotes || '') !== (authorNotes || '')) changes.push('notatki')
				const what = changes.length ? `Zaktualizowano: ${changes.join(', ')}` : 'Bez zmian'
				return {
					...t,
					description,
					authorNotes,
					history: pushHistory(t, what),
				}
			})
		)
	}

	// ===== akcje wykonującego =====
	const nextStatusAfterAction = (t, action) => {
		const wf = t.workflow || 'simple'
		const s = t.status
		if (action === 'accept') {
			if (s === 'przydzielone' || s === 'nieprzydzielone' || s === 'do_poprawy') return 'w_trakcie'
		}
		if (action === 'reject') {
			if (s === 'przydzielone' || s === 'w_trakcie') return 'odrzucone'
		}
		if (action === 'send_review') {
			if (wf === 'verify' && s === 'w_trakcie') return 'w_weryfikacji'
		}
		if (action === 'done') {
			if (wf === 'simple' && (s === 'w_trakcie' || s === 'przydzielone')) return 'zatwierdzone'
		}
		return s
	}

	const applyAction = (id, action) => {
		setTasks(prev =>
			prev.map(t => {
				if (t.id !== id) return t
				const ns = nextStatusAfterAction(t, action)
				if (ns === t.status) return t
				const label =
					{
						accept: 'Przyjęto do realizacji',
						reject: 'Odrzucono zadanie',
						send_review: 'Przekazano do weryfikacji',
						done: 'Oznaczono jako wykonane',
					}[action] || 'Zmiana'
				return { ...t, status: ns, history: pushHistory(t, label) }
			})
		)
	}

	// ===== akcje autora w weryfikacji =====
	const authorApprove = id => setStatus(id, 'zatwierdzone', 'Zatwierdzono')
	const authorRequestChanges = id => setStatus(id, 'do_poprawy', 'Do poprawy')

	// ===== Widok szczegółów vs lista =====
	if (detailId) {
		const task = tasks.find(t => String(t.id) === String(detailId))
		const performer = task ? isPerformer(task) : false
		const author = task ? isAuthor(task) : false
		return (
			<TaskDetails
				task={task}
				isAuthor={author}
				isPerformer={performer}
				peopleList={peopleList}
				onAccept={() => applyAction(task.id, 'accept')}
				onReject={() => applyAction(task.id, 'reject')}
				onSendReview={() => applyAction(task.id, 'send_review')}
				onDone={() => applyAction(task.id, 'done')}
				onApprove={() => authorApprove(task.id)}
				onRequestChanges={() => authorRequestChanges(task.id)}
				onReassign={to => reassignTo(task.id, to)}
				onAddComment={txt => addComment(task.id, txt)}
				onEditContent={payload => editContent(task.id, payload)}
				onBack={() => navigate('..', { relative: 'path' })}
			/>
		)
	}

	// ===== Lista =====
	return (
		<div className='mytasks'>
			{/* FILTRY */}
			<div className='toolbar' role='region' aria-label='Filtry zadań'>
				<input
					className='search'
					type='text'
					placeholder='Szukaj po tytule, tagach, osobach…'
					value={query}
					onChange={e => setQuery(e.target.value)}
				/>

				<div className='fi fi--time'>
					<span className='lbl'>Termin</span>
					<select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
						<option value='wszystkie'>Wszystkie</option>
						<option value='dzisiaj'>Dzisiaj</option>
						<option value='jutro'>Jutro</option>
						<option value='ten_tydzien'>Ten tydzień</option>
						<option value='nastepny_tydzien'>Następny tydzień</option>
						<option value='ten_miesiac'>Ten miesiąc</option>
						<option value='przeterminowane'>Przeterminowane</option>
						<option value='bez_terminu'>Bez terminu</option>
						<option value='zakres'>Zakres dat…</option>
					</select>

					{timeFilter === 'zakres' && (
						<div className='range'>
							<input type='date' value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} aria-label='Od' />
							<span className='dash'>–</span>
							<input type='date' value={rangeTo} onChange={e => setRangeTo(e.target.value)} aria-label='Do' />
						</div>
					)}
				</div>

				<div className='fi'>
					<span className='lbl'>Status</span>
					<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
						<option value='wszystkie'>Wszystkie</option>
						<option value='nieprzydzielone'>Nieprzydzielone ({unassignedCount})</option>
						<option value='przydzielone'>Przydzielone ({assignedCount})</option>
						<option value='w_trakcie'>W trakcie realizacji</option>
						<option value='w_weryfikacji'>W trakcie weryfikacji</option>
						<option value='do_poprawy'>Do poprawy</option>
						<option value='zatwierdzone'>Zatwierdzone</option>
						<option value='odrzucone'>Odrzucone</option>
					</select>
				</div>

				<div className='fi'>
					<span className='lbl'>Rodzaj</span>
					<select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
						{typeOptions.map(opt => (
							<option key={opt} value={opt}>
								{opt[0].toUpperCase() + opt.slice(1)}
							</option>
						))}
					</select>
				</div>

				<label className='fi fi--mine'>
					<input type='checkbox' checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
					<span>Tylko moje</span>
				</label>
			</div>

			{/* LISTA */}
			<div className='list'>
				{sorted.length === 0 ? (
					<div className='empty'>Brak zadań dla wybranych filtrów.</div>
				) : (
					sorted.map(t => {
						const performer = isPerformer(t)
						const author = isAuthor(t)
						const statusClass = STATUS_CLASS[t.status] || 'status--neutral'
						const statusLabel = STATUS_LABEL[t.status] || t.status
						const { percent } = progressInfo(t)
						const canAccept =
							performer && (t.status === 'przydzielone' || t.status === 'nieprzydzielone' || t.status === 'do_poprawy')
						const canReject = performer && (t.status === 'przydzielone' || t.status === 'w_trakcie')
						const canSendReview = performer && t.workflow === 'verify' && t.status === 'w_trakcie'
						const canMarkDone =
							performer && t.workflow === 'simple' && (t.status === 'w_trakcie' || t.status === 'przydzielone')
						const canReassign = (performer || author) && !['zatwierdzone', 'odrzucone'].includes(t.status)

						const lastChange = lastHistoryDate(t)

						return (
							<article className='card' key={t.id}>
								<header className='head'>
									<h3 className='title'>
										<Link className='text linklike' to={String(t.id)}>
											{t.title}
										</Link>
										{t.type && <span className='badge-kind'>{t.type}</span>}
										{(performer || author) && <span className='badge-mine'>Moje</span>}
									</h3>
									<span className={`badge ${statusClass}`}>{statusLabel}</span>
								</header>

								<div
									className='progress'
									role='progressbar'
									aria-valuenow={percent}
									aria-valuemin='0'
									aria-valuemax='100'>
									<div className='progress__bar' style={{ width: `${percent}%` }} />
								</div>

								<section className='meta'>
									<div className='col'>
										<div className='row'>
											<span className='label'>Autor:</span>
											<span className='val'>{t.author || '—'}</span>
										</div>
										<div className='row'>
											<span className='label'>Utworzono:</span>
											<span className='val'>{t.createdAt || '—'}</span>
										</div>
										<div className='row'>
											<span className='label'>Priorytet:</span>
											<span className={`val prio ${t.priority || 'normalny'}`}>{t.priority || 'normalny'}</span>
										</div>
									</div>
									<div className='col'>
										<div className='row'>
											<span className='label'>Przypisani:</span>
											<span className='val wrap'>
												{t.assignedTo?.length ? (
													t.assignedTo.map(p => (
														<span className='chip' key={p}>
															{p}
														</span>
													))
												) : (
													<span className='muted'>brak</span>
												)}
											</span>
										</div>
										<div className='row'>
											<span className='label'>Termin:</span>
											<span className='val'>{t.due || '—'}</span>
										</div>
									</div>
								</section>

								{t.tags?.length ? (
									<div className='tags'>
										{t.tags.map(tag => (
											<span key={tag} className='tag'>
												#{tag}
											</span>
										))}
									</div>
								) : null}

								<div className='stats'>
									<span className='stat'>{`Ostatnia zmiana: ${lastChange ? lastChange.toLocaleString() : '—'}`}</span>
									<span className='stat'>{`Komentarze: ${t.comments?.length || 0}`}</span>
								</div>

								<footer className='actions'>
									<div className='actor-actions'>
										{canAccept && (
											<button className='btn primary' onClick={() => applyAction(t.id, 'accept')}>
												Przyjmij
											</button>
										)}
										{canReject && (
											<button className='btn danger' onClick={() => applyAction(t.id, 'reject')}>
												Odrzuć
											</button>
										)}
										{canSendReview && (
											<button className='btn warning' onClick={() => applyAction(t.id, 'send_review')}>
												Przekaż do weryfikacji
											</button>
										)}
										{canMarkDone && (
											<button className='btn primary' onClick={() => applyAction(t.id, 'done')}>
												Wykonane
											</button>
										)}
										{canReassign && (
											<div className='reassign-root'>
												<button className='btn ghost reassign' type='button' onClick={() => navigate(String(t.id))}>
													Przekaż
												</button>
											</div>
										)}
									</div>

									<div className='owner-actions'>
										<Link className='btn ghost' to={String(t.id)}>
											Szczegóły
										</Link>
									</div>
								</footer>
							</article>
						)
					})
				)}
			</div>
		</div>
	)
}

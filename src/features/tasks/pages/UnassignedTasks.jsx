import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/unassigned-tasks.css'

/* ======================= Stałe / model ======================= */
const PRIORITIES = ['wysoki', 'normalny', 'niski']
const TYPES = ['frontend', 'backend', 'refaktor', 'dokumenty', 'inne']
const ACTIVE_STATUSES = ['przydzielone', 'w_trakcie', 'w_weryfikacji', 'do_poprawy']

const TYPE_META = {
  frontend:   { label: 'FE', cls: 't-fe'  },
  backend:    { label: 'BE', cls: 't-be'  },
  refaktor:   { label: 'RF', cls: 't-rf'  },
  dokumenty:  { label: 'DOC',cls: 't-doc' },
  inne:       { label: 'IN', cls: 't-in'  },
}

const FALLBACK_PEOPLE = [
  'Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak', 'Piotr Kowalski', 'Maria Zielińska',
  'Tomasz Wójcik', 'Ewa Dąbrowska', 'Paweł Lewandowski', 'Karolina Mazur', 'Jan Kaczmarek',
  'Aleksandra Szymańska',
]

const SAMPLE_UNASSIGNED = [
  { id: 'u-001', title: 'Przenieść style Equipment do osobnego pliku', author: 'Maria Zielińska',
    assignedTo: [], workflow: 'simple', status: 'nieprzydzielone', type: 'refaktor',
    createdAt: '2025-09-15', due: '', tags: ['refaktor', 'css'], priority: 'niski',
    description: 'Porządkowanie stylów: wydzielenie do osobnego pliku i import w komponencie.',
    estimateH: 4, history: [] },
  { id: 'u-002', title: 'Checklisty audytu – doprecyzować punkty', author: 'Piotr Kowalski',
    assignedTo: [], workflow: 'verify', status: 'nieprzydzielone', type: 'dokumenty',
    createdAt: '2025-09-19', due: '2025-09-30', tags: ['audyt', 'dokumenty','spotkanie'], priority: 'normalny',
    description: 'Uściślenie kryteriów akceptacji i checklisty kontrolnej.',
    estimateH: 6, history: [] },
  { id: 'u-003', title: 'Komponent filtrowania w MyTasks – poprawki UX', author: 'Alicja Śliwińska',
    assignedTo: [], workflow: 'verify', status: 'nieprzydzielone', type: 'frontend',
    createdAt: '2025-09-22', due: '2025-10-03', tags: ['frontend', 'UX','szkolenie'], priority: 'wysoki',
    description: 'Ulepszyć dostępność, focus ring, responsywność dropdownów.',
    estimateH: 8, history: [] },
]

/* ======================= Utils ======================= */
// Lokalny formatter YYYY-MM-DD (bez UTC)
const fmt = (d) => {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
const toMid = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
const dFromStr = (s) => (s ? toMid(new Date(`${s}T00:00:00`)) : null)

function addDays(date, n) {
  const x = toMid(date)
  x.setDate(x.getDate() + n)
  x.setHours(0,0,0,0)
  return x
}
function rangeDays(startISO, count) {
  const start = dFromStr(startISO) || toMid(new Date())
  return Array.from({length: count}, (_,i) => fmt(addDays(start, i)))
}

const isOverdue = (due) => due ? dFromStr(due) < toMid(new Date()) : false
const daysUntil = (due) => !due ? null : Math.round((dFromStr(due) - toMid(new Date())) / 86400000)
const classifyUrgency = (due) => {
  if (!due) return 'brak terminu'
  if (isOverdue(due)) return 'po terminie'
  const left = daysUntil(due)
  if (left <= 2) return 'pilne'
  if (left <= 7) return 'wkrótce'
  return `za ${left} dni`
}
const getDraggedId = (dt) =>
  dt.getData('application/x-task-id') || dt.getData('text/taskId') || dt.getData('text/plain') || ''

/* Helpers spotkań/szkoleń */
const isMeeting = (t) => {
  const txt = `${t.title} ${(t.tags||[]).join(' ')}`.toLowerCase()
  return t.type === 'inne' && (txt.includes('spotkanie') || txt.includes('meeting') || txt.includes('retro') || txt.includes('sync'))
}
const isTraining = (t) => {
  const txt = `${t.title} ${(t.tags||[]).join(' ')}`.toLowerCase()
  return t.type === 'inne' && (txt.includes('szkolenie') || txt.includes('training') || txt.includes('warsztat'))
}

/* Zmiany: pełna nazwa & numer rzymski */
const shiftFull = (s) => {
  const x = (s||'').toLowerCase()
  if (x.startsWith('por')) return 'Poranna'
  if (x.startsWith('popo') || x.startsWith('pop')) return 'Popołudniowa'
  if (x.startsWith('noc')) return 'Nocna'
  if (x.startsWith('dz') || x.startsWith('day')) return 'Dzienna'
  return 'Dzienna'
}
const shiftRoman = (s) => {
  const f = shiftFull(s)
  if (f === 'Poranna' || f === 'Dzienna') return 'I'
  if (f === 'Popołudniowa') return 'II'
  if (f === 'Nocna') return 'III'
  return 'I'
}

/* ======================= Mini Planer (osoba × dzień) ======================= */
function MiniPlanner({ people, days, tasksAll, onDropTask, onUnassignDrop, shifts }) {
  // tak dobieramy szerokość kolumn, aby 7/14 dni mieściło się w kontenerze
  const wrapperRef = useRef(null)
  const [dayColW, setDayColW] = useState(110)
  const PERSON_W = 160   // spójne z CSS: --person-col-w: 160px
  const MIN_DAY_W = 90

  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const recalc = () => {
      const total = el.clientWidth
      const count = Math.max(1, days.length)
      const available = Math.max(0, total - PERSON_W)
      let w = Math.floor(available / count)
      if (w < MIN_DAY_W) w = MIN_DAY_W
      setDayColW(w)
    }
    recalc()
    const ro = new ResizeObserver(recalc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [days.length])

  // zadania per komórka
  const cellMap = useMemo(() => {
    const map = new Map()
    const key = (p, d) => `${p}|||${d}`
    ;(tasksAll||[]).forEach(t => {
      const active = ACTIVE_STATUSES.includes(t.status)
      const due = t.due
      if (!active || !due) return
      ;(t.assignedTo || []).forEach(p => {
        if (!p) return
        const k = key(p, due)
        if (!map.has(k)) map.set(k, [])
        map.get(k).push(t)
      })
    })
    return map
  }, [tasksAll])

  // podsumowanie per osoba w oknie dni
  const personSummary = useMemo(() => {
    const daySet = new Set(days)
    const sum = new Map()
    people.forEach(p => sum.set(p, { high: 0, normal: 0, low: 0, total: 0, hours: 0, meet: 0, train: 0 }))
    ;(tasksAll || []).forEach(t => {
      if (!ACTIVE_STATUSES.includes(t.status)) return
      if (!t.due || !daySet.has(t.due)) return
      const who = t.assignedTo || []
      who.forEach(p => {
        if (!sum.has(p)) sum.set(p, { high: 0, normal: 0, low: 0, total: 0, hours: 0, meet: 0, train: 0 })
        const s = sum.get(p)
        s.total += 1
        if (t.priority === 'wysoki') s.high += 1
        else if (t.priority === 'normalny') s.normal += 1
        else if (t.priority === 'niski') s.low += 1
        if (typeof t.estimateH === 'number') s.hours += t.estimateH
        if (isMeeting(t)) s.meet += 1
        if (isTraining(t)) s.train += 1
      })
    })
    return sum
  }, [people, tasksAll, days])

  const allowDrop = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const dropTo = (e, person, dateISO) => {
    e.preventDefault()
    const id = getDraggedId(e.dataTransfer)
    if (id) onDropTask?.(id, person, dateISO)
  }
  const onEnter = (e) => e.currentTarget.classList.add('drag-over')
  const onLeave = (e) => e.currentTarget.classList.remove('drag-over')

  const dragStartPill = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.setData('application/x-task-id', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const getShiftRoman = (person, dateISO) => {
    const s = shifts && shifts[dateISO] && shifts[dateISO][person]
    return shiftRoman(s || 'Dzienna')
  }
  const getShiftFull = (person, dateISO) => {
    const s = shifts && shifts[dateISO] && shifts[dateISO][person]
    return shiftFull(s || 'Dzienna')
  }

  const cols = `var(--person-col-w) repeat(${days.length}, ${dayColW}px)`

  return (
    <div className='planner'>
      <div className='planner-hscroll' ref={wrapperRef}>
        <div className='planner-header' style={{ gridTemplateColumns: cols }}>
          <div className='ph-empty' />
          {days.map(d => (
            <div key={d} className='ph-day'>
              <div className='ph-date'>{d}</div>
            </div>
          ))}
        </div>

        <div className='planner-body'>
          {people.map(p => {
            const s = personSummary.get(p) || { high: 0, normal: 0, low: 0, hours: 0, meet: 0, train: 0 }
            return (
              <div key={p} className='pr-row' style={{ gridTemplateColumns: cols }}>
                <div className='pr-person' title={p}>
                  <div className='person-name'>{p}</div>
                  <div className='person-sub'>
                    <span className='chip h' title='Priorytet wysoki'>{s.high}</span>
                    <span className='chip n' title='Priorytet normalny'>{s.normal}</span>
                    <span className='chip l' title='Priorytet niski'>{s.low}</span>
                    <span className='chip hours' title='Suma szacunków w oknie dni'>{s.hours || 0}h</span>
                    <span className='chip meet' title='Spotkania w oknie dni'>M:{s.meet}</span>
                    <span className='chip train' title='Szkolenia w oknie dni'>S:{s.train}</span>
                  </div>
                </div>

                {days.map(d => {
                  const k = `${p}|||${d}`
                  const items = cellMap.get(k) || []
                  const counts = {
                    total: items.length,
                    H: items.filter(t => t.priority === 'wysoki').length,
                    N: items.filter(t => t.priority === 'normalny').length,
                    L: items.filter(t => t.priority === 'niski').length,
                    byType: TYPES.reduce((acc, ty) => (acc[ty] = items.filter(t => t.type === ty).length, acc), {}),
                    meet: items.filter(isMeeting).length,
                    train: items.filter(isTraining).length,
                  }
                  return (
                    <div
                      key={k}
                      className='pr-cell'
                      onDragOver={allowDrop}
                      onDragEnter={onEnter}
                      onDragLeave={onLeave}
                      onDrop={(e)=>{ onLeave(e); dropTo(e,p,d) }}
                    >
                      <div className='cell-top'>
                        <div className='count-badge' title={`Razem: ${counts.total}`}>{counts.total}</div>
                        <div className='shift-badge' title={`Zmiana: ${getShiftFull(p, d)}`}>{getShiftRoman(p, d)}</div>
                      </div>

                      <div className='cell-meta prios'>
                        {counts.H > 0 && <span className='chip h' title='wysoki'>{counts.H}</span>}
                        {counts.N > 0 && <span className='chip n' title='normalny'>{counts.N}</span>}
                        {counts.L > 0 && <span className='chip l' title='niski'>{counts.L}</span>}
                      </div>

                      <div className='cell-meta types'>
                        {TYPES.map(ty => counts.byType[ty] > 0 ? (
                          <span key={ty} className={`type-dot ${TYPE_META[ty].cls}`} title={`${ty}: ${counts.byType[ty]}`}>
                            {TYPE_META[ty].label}
                            <em>{counts.byType[ty]}</em>
                          </span>
                        ) : null)}
                      </div>

                      <div className='cell-meta signals'>
                        {counts.meet > 0 && (
                          <span className='sig meet' title={`Spotkania: ${counts.meet}`}>
                            <svg width='14' height='14' viewBox='0 0 24 24'>
                              <rect x='3' y='5' width='18' height='16' rx='2' ry='2' fill='none' stroke='currentColor' strokeWidth='2'/>
                              <path d='M16 3v4M8 3v4M3 11h18' stroke='currentColor' strokeWidth='2' />
                            </svg>
                            <em>{counts.meet}</em>
                          </span>
                        )}
                        {counts.train > 0 && (
                          <span className='sig train' title={`Szkolenia: ${counts.train}`}>
                            <svg width='14' height='14' viewBox='0 0 24 24'>
                              <path d='M3 8l9-4 9 4-9 4-9-4z' fill='none' stroke='currentColor' strokeWidth='2'/>
                              <path d='M21 10v4M3 12v4a9 4 0 0 0 18 0v-4' fill='none' stroke='currentColor' strokeWidth='2'/>
                            </svg>
                            <em>{counts.train}</em>
                          </span>
                        )}
                      </div>

                      {/* „Kropki” (drag source) */}
                      <div className='cell-pills'>
                        {items.map(t => (
                          <div
                            key={t.id}
                            className={`pill micro prio--${t.priority}`}
                            draggable
                            onDragStart={(e)=>dragStartPill(e, t.id)}
                            title={`${t.title}${t.estimateH ? ` • ${t.estimateH}h` : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className='drop-unassign'
        onDragOver={(e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='move' }}
        onDrop={(e)=>{ e.preventDefault(); const id = getDraggedId(e.dataTransfer); if (id) onUnassignDrop?.(id) }}
        title='Upuść, by zdjąć przydział i wrócić do „nieprzydzielone”'
      >
        ↩ Strefa odkładania (wróć do „nieprzydzielone”)
      </div>
    </div>
  )
}

/* ======================= Panel obciążenia ======================= */
function TeamLoadPanel({
  people, tasksAll, selectedAssignee, onPickPerson, capacity, onCapacity,
  scope = 'all', rangeStart, rangeEnd, onScopeChange
}) {
  const inRange = (due) => {
    if (!due || !rangeStart || !rangeEnd) return false
    return (due >= rangeStart && due <= rangeEnd)
  }

  const filtered = useMemo(() => {
    if (scope === 'window') {
      return (tasksAll || []).filter(t => t.due && inRange(t.due) && ACTIVE_STATUSES.includes(t.status))
    }
    return (tasksAll || []).filter(t => ACTIVE_STATUSES.includes(t.status))
  }, [tasksAll, scope, rangeStart, rangeEnd])

  const rows = useMemo(() => {
    const base = new Map(people.map(p => [p, {
      person: p, total: 0, overdue: 0, soon: 0, high: 0, normal: 0, low: 0, hours: 0
    }]))
    filtered.forEach(t => {
      const who = t.assignedTo?.length ? t.assignedTo : []
      who.forEach(p => {
        if (!base.has(p)) base.set(p, { person: p, total: 0, overdue: 0, soon: 0, high: 0, normal: 0, low: 0, hours: 0 })
        const r = base.get(p)
        r.total += 1
        if (isOverdue(t.due)) r.overdue += 1
        else if (daysUntil(t.due) !== null && daysUntil(t.due) <= 3) r.soon += 1
        if (t.priority === 'wysoki') r.high += 1
        else if (t.priority === 'normalny') r.normal += 1
        else if (t.priority === 'niski') r.low += 1
        if (typeof t.estimateH === 'number') r.hours += t.estimateH
      })
    })
    return Array.from(base.values())
  }, [people, filtered])

  return (
    <section className='panel'>
      <div className='section-title'>
        <h2>Obciążenie zespołu</h2>
        <div className='scope-toggle'>
          <button className={scope==='all' ? 'sel' : ''} onClick={()=>onScopeChange?.('all')}>Wszystkie</button>
          <button className={scope==='window' ? 'sel' : ''} onClick={()=>onScopeChange?.('window')}>W zakresie planera</button>
        </div>
      </div>

      <div className='teamload-table'>
        <div className='th row'>
          <div>Osoba</div>
          <div>Obciążenie</div>
          <div className='right'>H/N/L</div>
          <div className='right'>≤3d</div>
          <div className='right'>Po term.</div>
          <div className='right cap'>Capacity (h)</div>
        </div>

        {rows.map(r => {
          const cap = Number(capacity[r.person] ?? 40)
          const pct = Math.min(100, cap ? Math.round((r.hours / cap) * 100) : 0)
          const over = cap && r.hours > cap
          const isSel = selectedAssignee === r.person
          return (
            <div key={r.person} className={`row ${isSel ? 'selected' : ''}`} onClick={() => onPickPerson?.(r.person)} title='Ustaw jako domyślnego do przydziałów'>
              <div className='who'>
                {isSel ? <span className='sel-dot' aria-hidden /> : <span className='sel-dot ghost' aria-hidden />}
                <span>{r.person}</span>
              </div>
              <div className='bar-wrap' title={`Godziny: ${r.hours || 0}h / ${cap}h`}>
                <div className={`bar-fill ${over ? 'over' : ''}`} style={{ width: `${pct}%` }} />
                <div className='bar-text'>{(r.hours || 0)}h</div>
              </div>
              <div className='right nums prios'>
                <span className='chip h'>{r.high}</span>
                <span className='chip n'>{r.normal}</span>
                <span className='chip l'>{r.low}</span>
              </div>
              <div className='right'>{r.soon}</div>
              <div className='right'>{r.overdue}</div>
              <div className='right cap'>
                <input
                  type='number' min='0' step='1'
                  value={capacity[r.person] ?? 40}
                  onChange={(e)=>onCapacity?.(r.person, Number(e.target.value))}
                  onClick={(e)=>e.stopPropagation()}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ======================= Modal podglądu ======================= */
function TaskPreviewModal({ task, people, onClose, onAssign, onQuickDue, onDelete }) {
  if (!task) return null
  const urg = classifyUrgency(task.due)
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <div className='modal-header'>
          <h3>Podgląd zadania</h3>
          <button className='icon-btn' onClick={onClose} title='Zamknij'>
            <svg width='18' height='18' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/></svg>
          </button>
        </div>

        <div className='modal-body'>
          <div className='pv-title'>{task.title}</div>
          <div className='pv-row'>
            <span className='chip type'>{task.type}</span>
            <span className={`chip urgency u-${urg.replace(/ /g, '-')}`}>{urg}</span>
            <span className='chip'>Priorytet: {task.priority || '—'}</span>
            {task.estimateH ? <span className='chip'>Szacunek: {task.estimateH} h</span> : null}
          </div>

          <div className='pv-grid'>
            <div><span className='lbl'>Autor:</span> {task.author || '—'}</div>
            <div><span className='lbl'>Utworzone:</span> {task.createdAt || '—'}</div>
            <div><span className='lbl'>Termin:</span> {task.due || '—'}</div>
            <div><span className='lbl'>Status:</span> {task.status}</div>
            <div className='pv-tags'>
              <span className='lbl'>Tagi:</span>
              {(task.tags || []).length ? (task.tags || []).map(t => <span key={t} className='chip tag'>#{t}</span>) : '—'}
            </div>
          </div>

          {task.description ? (
            <div className='pv-desc'>
              <span className='lbl'>Opis:</span>
              <p>{task.description}</p>
            </div>
          ) : null}
        </div>

        <div className='modal-actions'>
          <div className='assign-inline'>
            <span className='lbl'>Przydziel do:</span>
            <select id='pv-assign-select' className='select'>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              className='primary'
              onClick={() => {
                const sel = document.getElementById('pv-assign-select')
                const who = sel ? sel.value : people[0]
                onAssign(task.id, who)
              }}
            >Przydziel</button>
          </div>

          <div className='due-inline'>
            <span className='lbl'>Termin:</span>
            <button className='ghost small' onClick={() => onQuickDue(task.id, 1)}>+1d</button>
            <button className='ghost small' onClick={() => onQuickDue(task.id, 3)}>+3d</button>
            <button className='ghost small' onClick={() => onQuickDue(task.id, 7)}>+7d</button>
          </div>

          <button className='danger' onClick={() => onDelete(task.id)}>Usuń</button>
        </div>
      </div>
    </div>
  )
}

/* ======================= Globalny modal potwierdzenia ======================= */
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className='modal-overlay' onClick={onCancel}>
      <div className='modal confirm' onClick={e => e.stopPropagation()}>
        <div className='modal-header'>
          <h3>Uwaga</h3>
          <button className='icon-btn' onClick={onCancel} title='Zamknij'>
            <svg width='18' height='18' viewBox='0 0 24 24'>
              <path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
            </svg>
          </button>
        </div>
        <div className='modal-body'><p>{message}</p></div>
        <div className='modal-actions'>
          <button className='ghost' onClick={onCancel}>Anuluj</button>
          <button className='primary' onClick={onConfirm}>Kontynuuj</button>
        </div>
      </div>
    </div>
  )
}

/* ======================= Widok główny ======================= */
export default function UnassignedTasks({
  initialTasks, employees, allTasks, onTaskChange, onOpenCreateModal, shifts
}) {
  // lokalne nieprzydzielone
  const [tasks, setTasks] = useState(() => {
    const base = (initialTasks || []).filter(t => t.status === 'nieprzydzielone')
    return base.length ? base : SAMPLE_UNASSIGNED
  })
  const [previewTaskId, setPreviewTaskId] = useState(null)

  const people = employees?.length ? employees : FALLBACK_PEOPLE

  // SCALENIE: props allTasks ⊕ lokalne tasks
  const all = useMemo(() => {
    const byId = new Map()
    ;(Array.isArray(allTasks) ? allTasks : []).forEach(t => byId.set(t.id, t))
    tasks.forEach(t => byId.set(t.id, t))
    return Array.from(byId.values())
  }, [allTasks, tasks])

  // Filtry / sort
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('wszystkie')
  const [typeFilter, setTypeFilter] = useState('wszystkie')
  const [urgencyFilter, setUrgencyFilter] = useState('wszystkie')
  const [sortKey, setSortKey] = useState('priority_desc')

  // ====== PAGINACJA LISTY (DODANE) ======
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Zaznaczenia / batch
  const [selectedIds, setSelectedIds] = useState([])
  const [assignTarget, setAssignTarget] = useState(people[0] || '')
  const [batchMode, setBatchMode] = useState('equal') // 'equal' | 'round_robin'
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])

  // Capacity (h) na osobę
  const [capacity, setCapacity] = useState(() => ({}))
  const handleCapacity = (person, value) => setCapacity(prev => ({ ...prev, [person]: value }))

  // Planer – zakres dni
  const [startDate, setStartDate] = useState(fmt(new Date()))
  const [windowDays, setWindowDays] = useState(7)
  const days = useMemo(() => rangeDays(startDate, windowDays), [startDate, windowDays])

  // Zakres obciążenia
  const [loadScope, setLoadScope] = useState('all')
  const rangeStart = startDate
  const rangeEnd = fmt(addDays(dFromStr(startDate) || new Date(), windowDays - 1))

  // Inline assign
  const [inlineAssignFor, setInlineAssignFor] = useState(null)
  const [inlineAssignee, setInlineAssignee] = useState(assignTarget)
  const [inlineDate, setInlineDate] = useState(startDate)
  const [inlinePrio, setInlinePrio] = useState('normalny')

  // DnD na listę (od-przydziel)
  const [isListDragOver, setIsListDragOver] = useState(false)
  const allowDropList = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleListDragEnter = (e) => { e.preventDefault(); setIsListDragOver(true) }
  const handleListDragLeave = (e) => { if (e.currentTarget === e.target) setIsListDragOver(false) }
  const handleListDrop = (e) => {
    e.preventDefault()
    setIsListDragOver(false)
    const id = getDraggedId(e.dataTransfer)
    if (id) unassignDrop(id)
  }

  // Widoczne (tylko nieprzydzielone)
  const visible = useMemo(() => {
    let list = tasks.slice().filter(t => t.status === 'nieprzydzielone')
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.tags || []).join(' ').toLowerCase().includes(q)
      )
    }
    if (priorityFilter !== 'wszystkie') list = list.filter(t => t.priority === priorityFilter)
    if (typeFilter !== 'wszystkie') list = list.filter(t => t.type === typeFilter)
    if (urgencyFilter !== 'wszystkie') list = list.filter(t => classifyUrgency(t.due) === urgencyFilter)
    const prioVal = p => ({ wysoki: 3, normalny: 2, niski: 1 }[p] || 0)
    list.sort((a,b) => {
      switch (sortKey) {
        case 'due_asc': return (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31')
        case 'created_desc': return (b.createdAt || '').localeCompare(a.createdAt || '')
        case 'title_asc': return a.title.localeCompare(b.title)
        case 'priority_desc':
        default: return prioVal(b.priority) - prioVal(a.priority)
      }
    })
    return list
  }, [tasks, query, priorityFilter, typeFilter, urgencyFilter, sortKey])

  // ====== Wyliczenia paginacji (DODANE) ======
  const totalPages = Math.max(1, Math.ceil(visible.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pagedVisible = useMemo(() => {
    const startIdx = (pageSafe - 1) * perPage
    return visible.slice(startIdx, startIdx + perPage)
  }, [visible, pageSafe, perPage])

  // Reset strony po zmianie filtrów/sortu/ilości na stronę
  useEffect(() => { setPage(1) }, [query, priorityFilter, typeFilter, urgencyFilter, sortKey, perPage])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages, page])

  /* ======= Global confirm modal (deadline) ======= */
  const [confirmState, setConfirmState] = useState({ open: false, message: '', onConfirm: null })
  const openConfirm = (message, onConfirm) => setConfirmState({ open: true, message, onConfirm })
  const closeConfirm = () => setConfirmState({ open: false, message: '', onConfirm: null })

  const checkDeadlineAnd = (base, dateISO, proceedFn) => {
    if (base?.due && dateISO) {
      const plan = dFromStr(dateISO)
      const dl = dFromStr(base.due)
      if (plan && dl && plan > dl) {
        openConfirm(
          `Wybrany termin ${dateISO} jest po deadlinie zadania (${base.due}). Czy mimo to przydzielić?`,
          () => { closeConfirm(); proceedFn() }
        )
        return
      }
    }
    proceedFn()
  }

  /* ============ Akcje ============ */
  // Przydział grupowy (equal / round_robin)
  const assignBatch = () => {
    if (!selectedIds.length || !people.length) return

    const sel = new Set(selectedIds)

    setTasks(prev => {
      let i = 0
      const start = Math.max(0, people.indexOf(assignTarget))
      const rrPick = (k) => people[(start + k) % people.length]

      return prev.map(t => {
        if (!sel.has(t.id)) return t

        const person = (batchMode === 'equal') ? people[i++ % people.length] : rrPick(i++)

        const next = {
          ...t,
          assignedTo: [person],
          status: 'przydzielone',
          history: [
            ...(t.history || []),
            { at: new Date().toISOString(), by: 'system', what: `przydzielono do ${person}` }
          ],
        }

        onTaskChange?.(next)
        return next
      })
    })

    clearSelection()
  }

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])
  const selectAllVisible = () => setSelectedIds(visible.map(t => t.id))
  const clearSelection = () => setSelectedIds([])

  const quickBumpDue = (id, days) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const base = t.due ? dFromStr(t.due) : toMid(new Date())
      const due = fmt(addDays(base, days))
      const next = { ...t, due }
      onTaskChange?.(next)
      return next
    }))
  }
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setSelectedIds(prev => prev.filter(x => x !== id))
    setPreviewTaskId(prev => (prev === id ? null : prev))
  }

  const assignOne = (taskId, person) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const next = {
        ...t,
        assignedTo: [person],
        status: 'przydzielone',
        history: [...(t.history || []), { at: new Date().toISOString(), by: 'system', what: `przydzielono do ${person}` }],
      }
      onTaskChange?.(next)
      return next
    }))
  }

  const findAnyById = (id) => {
    const local = tasks.find(t => t.id === id)
    if (local) return local
    return all.find(t => t.id === id) || null
  }
  const upsertLocal = (updated) => {
    setTasks(prev => {
      const has = prev.some(t => t.id === updated.id)
      return has ? prev.map(t => t.id === updated.id ? updated : t) : [updated, ...prev]
    })
  }

  // Inline assign (z czujnikiem deadline)
  const assignWithPriority = (taskId, person, dateISO, prio) => {
    setTasks(prev => {
      const base = prev.find(t => t.id === taskId) || all.find(t => t.id === taskId)
      if (!base) return prev
      const next = {
        ...base,
        assignedTo: [person],
        status: 'przydzielone',
        due: dateISO || base.due || fmt(new Date()),
        priority: prio || base.priority || 'normalny',
        history: [...(base.history || []), {
          at: new Date().toISOString(), by: 'system', what: `zaplanowano: ${person} na ${dateISO || '(brak)'} [prio: ${prio}]`
        }],
      }
      onTaskChange?.(next)
      return prev.map(t => t.id === taskId ? next : t)
    })
    setInlineAssignFor(null)
  }
  const guardedAssignWithPriority = (taskId, person, dateISO, prio) => {
    const base = findAnyById(taskId)
    if (!base) return
    checkDeadlineAnd(base, dateISO, () => assignWithPriority(taskId, person, dateISO, prio))
  }

  // DnD: planer
  const applyDropToPlanner = (taskId, person, dateISO) => {
    const base = findAnyById(taskId)
    if (!base) return
    const next = {
      ...base,
      assignedTo: [person],
      status: 'przydzielone',
      due: dateISO,
      history: [...(base.history || []), { at: new Date().toISOString(), by: 'system', what: `zaplanowano: ${person} na ${dateISO}` }],
    }
    upsertLocal(next)
    onTaskChange?.(next)
  }
  const dropToPlanner = (taskId, person, dateISO) => {
    const base = findAnyById(taskId)
    if (!base) return
    checkDeadlineAnd(base, dateISO, () => applyDropToPlanner(taskId, person, dateISO))
  }

  const unassignDrop = (taskId) => {
    const base = findAnyById(taskId)
    if (!base) return
    const next = { ...base, assignedTo: [], status: 'nieprzydzielone', due: '' }
    upsertLocal(next)
    onTaskChange?.(next)
  }

  const handleDragStartList = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.setData('application/x-task-id', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const openPreview = (id) => setPreviewTaskId(id)
  const closePreview = () => setPreviewTaskId(null)
  const previewTask = useMemo(() => all.find(t => t.id === previewTaskId) || null, [all, previewTaskId])

  // przesuwanie okna dat
  const shiftWindow = (daysDelta) => {
    setStartDate(prev => fmt(addDays(dFromStr(prev) || new Date(), daysDelta)))
  }

  /* ======================= UI ======================= */
  return (
    <div className='unassigned--vertical'>
      {/* GÓRNY PANEL (3 linie) */}
      <section className='panel'>
        <div className='filters-grid v4'>

          {/* 1 linia: search, termin, priorytet, typ */}
          <div className='row-1'>
            <input
              className='search'
              placeholder='Szukaj po tytule/opisie/tagach…'
              value={query}
              onChange={e=>setQuery(e.target.value)}
            />
            <select className='select' value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)}>
              <option value='wszystkie'>Termin: wszystkie</option>
              <option value='po terminie'>po terminie</option>
              <option value='pilne'>pilne</option>
              <option value='wkrótce'>wkrótce</option>
              <option value='brak terminu'>brak terminu</option>
            </select>
            <select className='select' value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}>
              <option value='wszystkie'>Priorytet: wszystkie</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className='select' value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
              <option value='wszystkie'>Typ: wszystkie</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* 2 linia: zaznacz, wyczyść, pracownik, podział, przydziel */}
          <div className='row-2'>
            <div className='row-2-left'>
              <button className='ghost' onClick={selectAllVisible}>Zaznacz widoczne</button>
              <button className='ghost' onClick={clearSelection} disabled={!selectedIds.length}>Wyczyść zazn.</button>
            </div>
            <div className='row-2-right'>
              <select className='select' value={assignTarget} onChange={e=>setAssignTarget(e.target.value)}>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className='select' value={batchMode} onChange={e=>setBatchMode(e.target.value)}>
                <option value='equal'>Równy podział</option>
                <option value='round_robin'>Round-robin od wybranego</option>
              </select>
              <button className='primary' onClick={assignBatch} disabled={!selectedIds.length}>Przydziel zaznaczone</button>
            </div>
          </div>

          {/* 3 linia: sort + nowe zadanie */}
          <div className='row-3'>
            <select className='select sort-select' value={sortKey} onChange={e=>setSortKey(e.target.value)}>
              <option value='priority_desc'>Sortuj: priorytet ⬇</option>
              <option value='due_asc'>Sortuj: termin ⬆</option>
              <option value='created_desc'>Sortuj: utworzone ⬇</option>
              <option value='title_asc'>Sortuj: tytuł ⬆</option>
            </select>

            <button className='btn-plus ghost add-btn' onClick={() => onOpenCreateModal?.()}>
              <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 5v14M5 12h14' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
              </svg>
              Nowe zadanie
            </button>
          </div>

        </div>
      </section>

      {/* LISTA: cel zrzutu z planera (zdjęcie przydziału) */}
      <section className='panel'>
        <ul
          className={`tasks ${isListDragOver ? 'drag-over' : ''}`}
          onDragOver={allowDropList}
          onDragEnter={handleListDragEnter}
          onDragLeave={handleListDragLeave}
          onDrop={handleListDrop}
          title='Upuść tutaj, aby zdjąć przydział'
        >
          {pagedVisible.map(t => (
            <li key={t.id} className={`task-card prio--${t.priority}`} title='Przeciągnij na planer, aby zaplanować'>
              <label className='checkbox'>
                <input type='checkbox' checked={selected.has(t.id)} onChange={()=>toggleSelect(t.id)} />
              </label>

              <div className='task-main'>
                <div className='title-row simple'>
                  <span
                    className='drag-handle'
                    draggable
                    onDragStart={(e)=>handleDragStartList(e, t.id)}
                    title='Przeciągaj stąd'
                  >⋮⋮</span>
                  <div className='title'>{t.title}</div>
                  <span className='chip type'>{t.type}</span>
                </div>

                {inlineAssignFor === t.id && (
                  <div className='assign-mini'>
                    <select className='select' value={inlineAssignee} onChange={e=>setInlineAssignee(e.target.value)}>
                      {people.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input type='date' value={inlineDate} onChange={e=>setInlineDate(e.target.value)} />
                    <select className='select' value={inlinePrio} onChange={e=>setInlinePrio(e.target.value)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button className='primary' onClick={()=>guardedAssignWithPriority(t.id, inlineAssignee, inlineDate, inlinePrio)}>OK</button>
                    <button className='ghost' onClick={()=>setInlineAssignFor(null)}>Anuluj</button>
                  </div>
                )}
              </div>

              <div className='task-actions compact'>
                <button className='icon-btn' onClick={()=>openPreview(t.id)} title='Podgląd'>
                  <svg width='18' height='18' viewBox='0 0 24 24'>
                    <path d='M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                  </svg>
                </button>
                <button
                  className='icon-btn'
                  title='Przydziel'
                  onClick={() => {
                    setInlineAssignFor(t.id)
                    setInlineAssignee(assignTarget)
                    setInlineDate(startDate)
                    setInlinePrio(t.priority || 'normalny')
                  }}
                >
                  <svg width='18' height='18' viewBox='0 0 24 24'>
                    <path d='M12 5v14M5 12h14' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
          {!pagedVisible.length && <li className='empty'>Brak zadań do wyświetlenia.</li>}
        </ul>

        {/* ===== PAGINACJA (DODANE) ===== */}
        {visible.length > 0 && (
          <div className='ua__pagination'>
            <div className='ua__pager-left'>
              <span className='ua__label'>Na stronę:</span>
              <select
                className='ua__select'
                value={perPage}
                onChange={(e)=> setPerPage(Number(e.target.value))}
              >
                {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className='ua__pager-center'>
              <button
                className='ua__btn'
                onClick={()=> setPage(1)}
                disabled={pageSafe === 1}
                title='Pierwsza'
              >«</button>
              <button
                className='ua__btn'
                onClick={()=> setPage(p => Math.max(1, p-1))}
                disabled={pageSafe === 1}
                title='Poprzednia'
              >‹</button>

              <span className='ua__info'>
                {((pageSafe - 1) * perPage) + 1}
                –
                {Math.min(pageSafe * perPage, visible.length)}
                {' '}z{' '}
                {visible.length}
              </span>

              <button
                className='ua__btn'
                onClick={()=> setPage(p => Math.min(totalPages, p+1))}
                disabled={pageSafe === totalPages}
                title='Następna'
              >›</button>
              <button
                className='ua__btn'
                onClick={()=> setPage(totalPages)}
                disabled={pageSafe === totalPages}
                title='Ostatnia'
              >»</button>
            </div>

            <div className='ua__pager-right'>
              <span className='ua__page'>Strona {pageSafe}/{totalPages}</span>
            </div>
          </div>
        )}
      </section>

      {/* PLANER */}
      <section className='panel'>
        <div className='section-title'>
          <h2>Planer (osoba × dzień)</h2>
        <div className='planner-controls'>
            <button className='ghost' onClick={()=>shiftWindow(-1)}>‹ dzień</button>
            <button className='ghost' onClick={()=>setStartDate(fmt(new Date()))}>Dziś</button>
            <button className='ghost' onClick={()=>shiftWindow(+1)}>dzień ›</button>
            <select className='select' value={windowDays} onChange={e=>setWindowDays(Number(e.target.value))}>
              <option value={7}>Zakres: 7 dni</option>
              <option value={14}>Zakres: 14 dni</option>
            </select>
          </div>
        </div>

        <MiniPlanner
          people={people}
          days={days}
          tasksAll={all}
          shifts={shifts}
          onDropTask={dropToPlanner}
          onUnassignDrop={unassignDrop}
        />
      </section>

      {/* OBCIĄŻENIE */}
      <TeamLoadPanel
        people={people}
        tasksAll={all}
        selectedAssignee={assignTarget}
        onPickPerson={(p)=>setAssignTarget(p)}
        capacity={capacity}
        onCapacity={handleCapacity}
        scope={loadScope}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onScopeChange={setLoadScope}
      />

      {/* MODALE */}
      <TaskPreviewModal
        task={previewTask}
        people={people}
        onClose={closePreview}
        onAssign={(id, who) => assignOne(id, who)}
        onQuickDue={(id, d) => quickBumpDue(id, d)}
        onDelete={(id) => deleteTask(id)}
      />
      <ConfirmModal
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm || (() => {})}
        onCancel={closeConfirm}
      />
    </div>
  )
}

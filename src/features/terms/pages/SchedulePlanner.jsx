// SchedulePlanner.jsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { addDays, startOfDay, startOfWeek, isSameDay, format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarSearch,
  Search,
  LayoutGrid,
  Trash2,
  Users,
  Bell,
  MessageSquare,
  CheckSquare,
  PencilLine,
  X,
  CornerUpLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useModal } from '../../../app/providers/GlobalModalProvider'
import '../styles/schedule-planner.css'

/* =================== STAŁE =================== */

const SLOT_META = [
  { key: 'morning',   label: 'Rano',       emoji: '☀️' },
  { key: 'afternoon', label: 'Popołudnie', emoji: '🌤️' },
  { key: 'evening',   label: 'Wieczór',    emoji: '🌙' },
  { key: 'night',     label: 'Noc',        emoji: '🟣' },
]

// ile „kółek” pokazujemy w komórce, reszta => +n
const MAX_BADGES_PER_SLOT = 6

// którym filtrem wypełniamy TŁO kółek w slocie (ring = status)
const BADGE_COLOR_MODE = 'type' // 'type' | 'status' | 'priority' | 'difficulty'

const TYPE_LABELS   = { admin: 'Administracyjne', client: 'Klient', tech: 'Techniczne', other: 'Inne' }
const STATUS_LABELS = { assigned: 'Przydzielone', progress: 'W trakcie', blocked: 'Zablokowane', done: 'Zakończone' }
const DIFF_LABELS   = { easy: 'Łatwe', medium: 'Średnie', hard: 'Trudne' }
const PRIO_LABELS   = { high: 'Wysoki priorytet', normal: 'Normalny priorytet', low: 'Niski priorytet' }

const today = () => startOfDay(new Date())
const iso   = d => format(d, 'yyyy-MM-dd')
const fmt   = (d, pat = 'EEE d MMM', loc = pl) => format(d, pat, { locale: loc })

/* ===== Shift meta (3 zmiany) ===== */
const SHIFT_META = {
  morning:   { short: 'I',   label: 'Zmiana I (rano)',        bg: 'var(--c-diff-easy)'   },
  afternoon: { short: 'II',  label: 'Zmiana II (popołudnie)', bg: 'var(--c-diff-medium)' },
  evening:   { short: 'III', label: 'Zmiana III (wieczór)',   bg: 'var(--c-type-other)'  },
  night:     { short: 'III', label: 'Zmiana III (noc)',       bg: 'var(--c-type-other)'  },
}

/* ===== Drag&Drop: task ===== */
const setDataId = (e, id) => {
  try { e.dataTransfer.setData('text/task', String(id)) } catch {}
  try { e.dataTransfer.setData('text/plain', String(id)) } catch {}
  try { e.dataTransfer.effectAllowed = 'move' } catch {}
}
const getDataId = (e, fallback = null) => {
  try { const a = e.dataTransfer.getData('text/task'); if (a) return a } catch {}
  try {
    const b = e.dataTransfer.getData('text/plain')
    if (b && !b.startsWith('GROUP|')) return b
  } catch {}
  return fallback
}

/* ===== Drag&Drop: grupa (kółko) ===== */
const GROUP_MIME = 'text/slotgroup'
const encodeGroup = ({ dayISO, slotKey, type }) => `GROUP|${dayISO}|${slotKey}|${type}`
const decodeGroup = (txt) => {
  if (!txt || !txt.startsWith('GROUP|')) return null
  const [, dayISO, slotKey, type] = txt.split('|')
  return { dayISO, slotKey, type }
}
const setGroupDrag = (e, info) => {
  const enc = encodeGroup(info)
  try { e.dataTransfer.setData(GROUP_MIME, enc) } catch {}
  try { e.dataTransfer.setData('text/plain', enc) } catch {}
  try { e.dataTransfer.effectAllowed = 'move' } catch {}
}
const getGroupDrag = (e) => {
  try { const a = e.dataTransfer.getData(GROUP_MIME); if (a) return decodeGroup(a) } catch {}
  try { const b = e.dataTransfer.getData('text/plain'); if (b) return decodeGroup(b) } catch {}
  return null
}

/* =================== MOCKI (opcjonalne) =================== */

const MOCK_TASKS = [
  { id: 'T-001', title: 'Raport – wrzesień', assignees: ['Alicja'], priority: 'normal', deadline: iso(addDays(today(), 10)), type:'admin',  status:'assigned', difficulty:'medium' },
  { id: 'T-002', title: 'Audyt wewnętrzny – checklisty', assignees: ['Alicja'], priority: 'high',   deadline: iso(addDays(today(), 2)),  type:'client', status:'progress', difficulty:'hard' },
  { id: 'T-003', title: 'Wysyłka sprawozdania', assignees: ['Jan'], priority: 'low', deadline: iso(addDays(today(), 14)), type:'tech', status:'assigned', difficulty:'easy' },
  { id: 'T-004', title: 'Spotkanie z klientem X (zadanie)', assignees: ['Alicja','Jan'], priority: 'normal', deadline: iso(addDays(today(), 6)), type:'other', status:'blocked', difficulty:'medium' },
]

const MOCK_MEETINGS = [{ id: 'M-01', dateISO: iso(today()), title: 'Daily z zespołem', time: '09:00' }]
const MOCK_ALERTS   = [{ id: 'N-01', dateISO: iso(today()), title: 'Przypomnienie: RODO szkolenie', time: '12:00' }]
const MOCK_OTHER    = [{ id: 'O-01', dateISO: iso(today()), title: 'Delegacja – podpisy', time: '15:30' }]

/* >>> MOCKOWE ZMIANY NA BIEŻĄCY TYDZIEŃ (WIDOCZNE OD RAZU) <<< */
const _WEEK0 = startOfWeek(today(), { weekStartsOn: 1 })
const MOCK_SHIFTS = {
  [iso(_WEEK0)]:                 'morning',   // pon
  [iso(addDays(_WEEK0, 1))]:     'afternoon', // wt
  [iso(addDays(_WEEK0, 2))]:     'evening',   // śr
  [iso(addDays(_WEEK0, 3))]:     'morning',   // czw
  [iso(addDays(_WEEK0, 4))]:     'afternoon', // pt
  [iso(addDays(_WEEK0, 5))]:     'evening',   // sob
  [iso(addDays(_WEEK0, 6))]:     'morning',   // nd
}

/* =================== KOMPONENT =================== */

export default function SchedulePlanner({
  initialTasks    = MOCK_TASKS,
  initialMeetings = MOCK_MEETINGS,
  initialAlerts   = MOCK_ALERTS,
  initialOther    = MOCK_OTHER,
  userShifts      = MOCK_SHIFTS, // <= domyślnie pokazujemy zmiany z mocków
  onTaskOpenRoute = (task) => { window.location.href = `/zadania/${encodeURIComponent(task.id)}` },
}) {
  const modal = useModal()

  // zakres 7 dni od poniedziałku
  const [start, setStart] = useState(() => startOfWeek(today(), { weekStartsOn: 1 }))
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start])

  // zadania
  const [listTasks, setListTasks] = useState(() =>
    initialTasks.map(t => ({
      ...t,
      dateISO: t.dateISO ?? null,
      slot: t.slot ?? null,
      type: t.type ?? 'other',
      status: t.status ?? 'assigned',
      difficulty: t.difficulty ?? 'medium',
      deadline: t.deadline ?? iso(addDays(today(), 7)),
      priority: t.priority ?? 'normal',
      _createdAt: Date.now(),
    }))
  )

  // filtry + szukaj
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    type:       { admin:true, client:true, tech:true, other:true },
    status:     { assigned:true, progress:true, blocked:true, done:true },
    difficulty: { easy:true, medium:true, hard:true },
    priority:   { high:true, normal:true, low:true },
  })

  // ===== PAGINACJA BACKLOGU (DODANE) =====
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // DnD highlight
  const [dragKey, setDragKey] = useState(null)

  // szczegóły dnia
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(today()))

  // edytor slotu
  const [editor, setEditor] = useState(null) // { dayISO, slotKey }

  // „idź do daty”
  const hiddenDateInput = useRef(null)
  const jumpToDate = () => hiddenDateInput.current?.showPicker?.()
  const onPickDate = (e) => {
    try {
      const d = startOfWeek(startOfDay(parseISO(e.target.value)), { weekStartsOn: 1 })
      setStart(d)
    } catch {}
  }

  /* ====== selektory ====== */

  const tasksByDaySlot = useMemo(() => {
    const map = new Map()
    for (const d of days) {
      const dk = iso(d)
      for (const s of SLOT_META) map.set(`${dk}:${s.key}`, [])
    }
    for (const t of listTasks) {
      if (t.dateISO && t.slot) {
        const key = `${t.dateISO}:${t.slot}`
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(t)
      }
    }
    return map
  }, [days, listTasks])

  const prioOrder = { high:0, normal:1, low:2 }
  const filteredBacklog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listTasks
      .filter(t => !t.dateISO && !t.slot)
      .filter(t => filters.type[t.type ?? 'other'])
      .filter(t => filters.status[t.status ?? 'assigned'])
      .filter(t => filters.difficulty[t.difficulty ?? 'medium'])
      .filter(t => filters.priority[t.priority ?? 'normal'])
      .filter(t => !q || t.title?.toLowerCase().includes(q) || String(t.id).toLowerCase().includes(q))
      .sort((a,b) => {
        const da = +new Date(a.deadline || 0), db = +new Date(b.deadline || 0)
        if (da !== db) return da - db
        return (prioOrder[a.priority||'normal'] ?? 9) - (prioOrder[b.priority||'normal'] ?? 9)
      })
  }, [listTasks, query, filters])

  // DODANE: wyliczenia paginacji i reset strony
  const totalPages = Math.max(1, Math.ceil(filteredBacklog.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const pagedBacklog = useMemo(() => {
    const startIdx = (pageSafe - 1) * perPage
    return filteredBacklog.slice(startIdx, startIdx + perPage)
  }, [filteredBacklog, pageSafe, perPage])

  useEffect(() => { setPage(1) }, [query, filters, perPage])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages]) // dopasuj gdy ubyło elementów

  const dayMeetings = useMemo(() => (d) => (initialMeetings || []).filter(m => m.dateISO === iso(d)), [initialMeetings])
  const dayAlerts   = useMemo(() => (d) => (initialAlerts || []).filter(n => n.dateISO === iso(d)), [initialAlerts])
  const dayOther    = useMemo(() => (d) => (initialOther || []).filter(o => o.dateISO === iso(d)), [initialOther])

  /* ====== helpers ====== */
  const majorityOf = (arr, key, order=[]) => {
    const cnt = arr.reduce((m,x)=>{ const v=x[key]||'unknown'; m[v]=(m[v]||0)+1; return m }, {})
    return Object.keys(cnt).sort((a,b)=> (order.indexOf(a)-order.indexOf(b)) || (cnt[b]-cnt[a]))[0]
  }
  const dominantStatus     = (arr)=> majorityOf(arr,'status',['blocked','progress','assigned','done'])
  const dominantPriority   = (arr)=> majorityOf(arr,'priority',['high','normal','low'])
  const dominantDifficulty = (arr)=> majorityOf(arr,'difficulty',['hard','medium','easy'])

  /* ====== akcje ====== */

  const setTaskDateAndSlot = useCallback((id, dateISOValue, slotValue) => {
    setListTasks(prev => prev.map(t =>
      String(t.id) === String(id) ? { ...t, dateISO: dateISOValue, slot: slotValue } : t
    ))
  }, [])

  // Guard: planowanie po własnym deadlinie -> globalny modal confirm
  const assignWithDeadlineCheck = useCallback(async (id, dateISOValue, slotValue) => {
    const t = listTasks.find(x => String(x.id) === String(id))
    if (!t) return
    if (dateISOValue && t.deadline) {
      const tgt = startOfDay(parseISO(dateISOValue))
      const dl  = startOfDay(parseISO(t.deadline))
      if (tgt > dl) {
        const ok = await modal.confirm({
          tone: 'warn',
          title: 'Plan po deadlinie',
          message:
            `Zadanie „${t.title}” ma deadline ${fmt(dl,'dd LLL',pl)}.\n` +
            `Zaplanować na później (${fmt(tgt,'dd LLL',pl)})?`,
          confirmText: 'Zaplanuj',
          cancelText: 'Anuluj'
        })
        if (!ok) return
      }
    }
    setTaskDateAndSlot(id, dateISOValue, slotValue)
  }, [listTasks, modal, setTaskDateAndSlot])

  // Przenoszenie całej grupy (kółka) z potwierdzeniem po-deadline — globalny modal
  const moveGroupTo = useCallback(async (src, dest) => {
    const toMove = listTasks.filter(
      t => t.dateISO === src.dayISO && t.slot === src.slotKey && (t.type || 'other') === src.type
    )
    const tgt = dest.dateISO ? startOfDay(parseISO(dest.dateISO)) : null
    let after = 0
    if (tgt) {
      after = toMove.filter(t => t.deadline && tgt > startOfDay(parseISO(t.deadline))).length
    }
    if (after > 0) {
      const ok = await modal.confirm({
        tone: 'warn',
        title: 'Uwaga na deadline',
        message: `Przeniesienie grupy „${src.type}” spowoduje zaplanowanie ${after} zadań PO ich deadlinie. Kontynuować?`,
        confirmText: 'Przenieś',
        cancelText: 'Anuluj'
      })
      if (!ok) return
    }
    setListTasks(prev => prev.map(t => {
      const match = t.dateISO === src.dayISO && t.slot === src.slotKey && (t.type || 'other') === src.type
      return match ? { ...t, dateISO: dest.dateISO, slot: dest.slotKey } : t
    }))
  }, [listTasks, modal])

  const removeTaskPlacement = useCallback((id) => {
    setTaskDateAndSlot(id, null, null)
  }, [setTaskDateAndSlot])

  const selectDay = (d) => setSelectedDay(startOfDay(d))

  // nawigacja
  const goPrevDay  = () => setStart(s => addDays(s, -1))
  const goNextDay  = () => setStart(s => addDays(s, +1))
  const goPrevWeek = () => setStart(s => addDays(s, -7))
  const goNextWeek = () => setStart(s => addDays(s, +7))
  const goToday    = () => setStart(startOfWeek(today(), { weekStartsOn: 1 }))

  /* ====== DnD ====== */
  const allow = (e, key) => {
    e.preventDefault()
    e.stopPropagation()
    if (key) setDragKey(key)
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  }
  const dropTo = (handler) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    handler(e)
    setDragKey(null)
  }

  // nie planujemy do tyłu
  const isPastDay = (d) => startOfDay(d) < today()

  // backlog drop (task lub grupa)
  const onDropBacklog = (e) => {
    const group = getGroupDrag(e)
    if (group) { moveGroupTo(group, { dateISO: null, slotKey: null }); return }
    const id = getDataId(e, null)
    if (id) setTaskDateAndSlot(id, null, null)
  }

  // slot drop (task lub grupa) z blokadą przeszłości i ostrzeżeniem po-deadline
  const onDropSlot = (e, day, slotKey) => {
    if (isPastDay(day)) return
    const group = getGroupDrag(e)
    if (group) { moveGroupTo(group, { dateISO: iso(day), slotKey }); return }
    const id = getDataId(e, null)
    if (id) assignWithDeadlineCheck(id, iso(day), slotKey)
  }

  /* ====== badge’y w slocie ====== */

  const typeToBadgeClass = (type) =>
    type === 'admin' ? 'count-badge--type-admin'
    : type === 'client' ? 'count-badge--type-client'
    : type === 'tech' ? 'count-badge--type-tech'
    : 'count-badge--type-other'

  const badgeFillClassForGroup = (g) => {
    switch (BADGE_COLOR_MODE) {
      case 'status':     return `count-badge--status-${g.ringStatus}`
      case 'priority':   return `count-badge--prio-${g.topPriority}`
      case 'difficulty': return `count-badge--diff-${g.topDifficulty}`
      case 'type':
      default:           return typeToBadgeClass(g.type)
    }
  }

  const badgesForSlot = (items) => {
    const byType = new Map()
    items.forEach(t => {
      const k = t.type || 'other'
      if (!byType.has(k)) byType.set(k, [])
      byType.get(k).push(t)
    })
    const groups = Array.from(byType.entries()).map(([type, arr]) => ({
      type,
      count: arr.length,
      ringStatus:     majorityOf(arr,'status',['blocked','progress','assigned','done']),
      topPriority:    majorityOf(arr,'priority',['high','normal','low']),
      topDifficulty:  majorityOf(arr,'difficulty',['hard','medium','easy']),
      list: arr.map(t => t.title),
    }))
    const sorted  = groups.sort((a,b)=> b.count - a.count)
    const visible = sorted.slice(0, MAX_BADGES_PER_SLOT)
    const extra   = Math.max(0, sorted.length - visible.length)
    return { visible, extra }
  }

  // deadline indicators per day (na ramkę dnia w siatce)
  const dayDeadlineFlags = useMemo(() => {
    const map = new Map()
    for (const d of days) {
      const dk = iso(d)
      const all = SLOT_META.flatMap(s => tasksByDaySlot.get(`${dk}:${s.key}`) || [])
      const hasTodayDeadline = all.some(t => t.deadline && iso(new Date(t.deadline)) === dk)
      const hasOverdue       = all.some(t => t.deadline && startOfDay(new Date(t.deadline)) < today())
      map.set(dk, { hasTodayDeadline, hasOverdue })
    }
    return map
  }, [days, tasksByDaySlot])

  /* =================== RENDER =================== */

  return (
    <div className='sp-planner'>
      {/* SZCZEGÓŁY DNIA */}
      <section className='daydetails daydetails--bar'>
        <div className='daydetails__head'>
          <div className='daydetails__date'>
            {fmt(selectedDay, 'EEEE, d MMM yyyy', pl)}
            {userShifts[iso(selectedDay)] && (
              <span className='daydetails__meta' style={{ marginLeft: 8 }}>
                • Zmiana: {SHIFT_META[userShifts[iso(selectedDay)]]?.label || userShifts[iso(selectedDay)]}
              </span>
            )}
          </div>
          <div className='daydetails__meta'>Szczegóły dnia</div>
        </div>

        <div className='daydetails__body daydetails__body--bar'>
          {/* Spotkania */}
          <section className='detail-section detail--meetings'>
            <div className='detail-section__head'>
              <span><Users size={14} style={{ marginRight:6 }}/> Spotkania</span>
              <button className='addbtn' title='Dodaj spotkanie'>+</button>
            </div>
            {(() => {
              const arr = dayMeetings(selectedDay)
              return arr.length
                ? arr.map(m => (
                    <div key={m.id} className='detail-item'>
                      <span className='chip__deadline'>{m.time}</span>
                      <span>{m.title}</span>
                    </div>
                  ))
                : <div className='detail-empty'>Brak</div>
            })()}
          </section>

          {/* Powiadomienia */}
          <section className='detail-section detail--alerts'>
            <div className='detail-section__head'>
              <span><Bell size={14} style={{ marginRight:6 }}/> Powiadomienia</span>
              <button className='addbtn' title='Dodaj powiadomienie'>+</button>
            </div>
            {(() => {
              const arr = dayAlerts(selectedDay)
              return arr.length
                ? arr.map(n => (
                    <div key={n.id} className='detail-item'>
                      <span className='chip__deadline'>{n.time}</span>
                      <span>{n.title}</span>
                    </div>
                  ))
                : <div className='detail-empty'>Brak</div>
            })()}
          </section>

          {/* Inne */}
          <section className='detail-section detail--other'>
            <div className='detail-section__head'>
              <span><MessageSquare size={14} style={{ marginRight:6 }}/> Inne</span>
              <button className='addbtn' title='Dodaj inne'>+</button>
            </div>
            {(() => {
              const arr = dayOther(selectedDay)
              return arr.length
                ? arr.map(o => (
                    <div key={o.id} className='detail-item'>
                      <span className='chip__deadline'>{o.time}</span>
                      <span>{o.title}</span>
                    </div>
                  ))
                : <div className='detail-empty'>Brak</div>
            })()}
          </section>

          {/* Zadania — pełna szerokość, z podziałem na pory dnia */}
          <section className='detail-section detail--tasks'>
            <div className='detail-section__head'>
              <span><CheckSquare size={14} style={{ marginRight:6 }}/> Zadania</span>
            </div>
            {SLOT_META.map(k => {
              const kKey = `${iso(selectedDay)}:${k.key}`
              const items = tasksByDaySlot.get(kKey) || []
              return (
                <div key={k.key} className='detail-subslot'>
                  <div className='detail-subslot__title'>{k.label}</div>
                  {items.length
                    ? items.map(t => (
                        <div key={`${k.key}-${t.id}`} className='detail-item'>
                          <span className='chip__deadline'>{t.deadline ? fmt(new Date(t.deadline), 'dd LLL') : '—'}</span>
                          <span>{t.title}</span>
                        </div>
                      ))
                    : <div className='detail-empty'>Brak</div>
                  }
                </div>
              )
            })}
          </section>
        </div>
      </section>

      {/* BACKLOG + KALENDARZ */}
      <section className='planner__dock'>
        {/* BACKLOG */}
        <aside
          className={`plan-zone zone--backlog ${dragKey === 'BACKLOG' ? 'is-over' : ''}`}
          onDragEnter={(e) => allow(e, 'BACKLOG')}
          onDragOver={(e) => allow(e, 'BACKLOG')}
          onDrop={dropTo(onDropBacklog)}
        >
          <div className='zone__head'>
            <LayoutGrid size={16}/> Do zaplanowania
          </div>

          <div className='zone__filters'>
            {/* Szukaj */}
            <div className='input-with-icon'>
              <Search size={14}/>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Szukaj zadań po tytule/ID'
              />
            </div>

            {/* Legendy/Filtry (rozwijane) */}
            <div className='legend-filters'>
              <details className='legend-group' open>
                <summary>Rodzaj zadania <span className='chev'>▾</span></summary>
                <div className='legend-group__chips'>
                  {['admin','client','tech','other'].map(t => (
                    <span
                      key={t}
                      className={`legend-chip ${filters.type[t] ? 'is-on' : ''}`}
                      onClick={() => setFilters(f => ({...f, type:{...f.type, [t]: !f.type[t]}}))}
                    >
                      <span
                        className='legend-dot'
                        style={{
                          background:
                            t==='admin' ? 'var(--c-type-admin)' :
                            t==='client'? 'var(--c-type-client)' :
                            t==='tech'  ? 'var(--c-type-tech)' :
                                          'var(--c-type-other)',
                        }}
                      />
                      {t}
                    </span>
                  ))}
                </div>
              </details>

              <details className='legend-group'>
                <summary>Status zadania <span className='chev'>▾</span></summary>
                <div className='legend-group__chips'>
                  {['assigned','progress','blocked','done'].map(s => (
                    <span
                      key={s}
                      className={`legend-chip ${filters.status[s] ? 'is-on' : ''}`}
                      onClick={() => setFilters(f => ({...f, status:{...f.status, [s]: !f.status[s]}}))}
                    >
                      <span
                        className='legend-dot'
                        style={{
                          background:
                            s==='assigned' ? 'var(--c-status-assigned)' :
                            s==='progress' ? 'var(--c-status-progress)' :
                            s==='blocked'  ? 'var(--c-status-blocked)'  :
                                             'var(--c-status-done)',
                        }}
                      />
                      {s}
                    </span>
                  ))}
                </div>
              </details>

              <details className='legend-group'>
                <summary>Trudność zadania <span className='chev'>▾</span></summary>
                <div className='legend-group__chips'>
                  {['easy','medium','hard'].map(dif => (
                    <span
                      key={dif}
                      className={`legend-chip ${filters.difficulty[dif] ? 'is-on' : ''}`}
                      onClick={() =>
                        setFilters(f => ({...f, difficulty:{...f.difficulty, [dif]: !f.difficulty[dif]}}))
                      }
                    >
                      <span
                        className='legend-dot'
                        style={{
                          background:
                            dif==='easy'   ? 'var(--c-diff-easy)' :
                            dif==='medium' ? 'var(--c-diff-medium)' :
                                             'var(--c-diff-hard)',
                        }}
                      />
                      {dif}
                    </span>
                  ))}
                </div>
              </details>

              <details className='legend-group'>
                <summary>Priorytet zadania <span className='chev'>▾</span></summary>
                <div className='legend-group__chips'>
                  {['high','normal','low'].map(p => (
                    <span
                      key={p}
                      className={`legend-chip ${filters.priority[p] ? 'is-on' : ''}`}
                      onClick={() => setFilters(f => ({...f, priority:{...f.priority, [p]: !f.priority[p]}}))}
                    >
                      <span
                        className='legend-dot'
                        style={{
                          background:
                            p==='high'   ? 'var(--c-prio-high)' :
                            p==='normal' ? 'var(--c-prio-normal)' :
                                           'var(--c-prio-low)',
                        }}
                      />
                      {p}
                    </span>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Lista backlogu */}
          <div className='zone__list'>
            {filteredBacklog.length === 0 && (
              <div className='empty'>Brak zadań do zaplanowania</div>
            )}

            {pagedBacklog.map(t => (
              <button
                key={t.id}
                className={`chip chip--${t.priority || 'normal'}`}
                draggable
                onDragStart={(e) => setDataId(e, t.id)}
                onClick={() => onTaskOpenRoute(t)}
                title={`Otwórz szczegóły • ${t.title}`}
              >
                <span className='chip__dots' onClickCapture={(e)=> e.stopPropagation()}>
                  <span className={`dot dot--type-${t.type || 'other'} has-card`} title={`Rodzaj: ${TYPE_LABELS[t.type || 'other']}`}>
                    <span className='tipcard tipcard--mini' style={{ top:'calc(100% + 8px)', bottom:'auto' }}>
                      <div className='tipcard__head'><b>Rodzaj</b></div>
                      <div className='tipcard__body'>{TYPE_LABELS[t.type || 'other']}</div>
                    </span>
                  </span>
                  <span className={`dot dot--status-${t.status || 'assigned'} has-card`} title={`Status: ${STATUS_LABELS[t.status || 'assigned']}`}>
                    <span className='tipcard tipcard--mini' style={{ top:'calc(100% + 8px)', bottom:'auto' }}>
                      <div className='tipcard__head'><b>Status</b></div>
                      <div className='tipcard__body'>{STATUS_LABELS[t.status || 'assigned']}</div>
                    </span>
                  </span>
                  <span className={`dot dot--diff-${t.difficulty || 'medium'} has-card`} title={`Trudność: ${DIFF_LABELS[t.difficulty || 'medium']}`}>
                    <span className='tipcard tipcard--mini' style={{ top:'calc(100% + 8px)', bottom:'auto' }}>
                      <div className='tipcard__head'><b>Trudność</b></div>
                      <div className='tipcard__body'>{DIFF_LABELS[t.difficulty || 'medium']}</div>
                    </span>
                  </span>
                  <span className={`dot dot--prio-${t.priority || 'normal'} has-card`} title={`Priorytet: ${PRIO_LABELS[t.priority || 'normal']}`}>
                    <span className='tipcard tipcard--mini' style={{ top:'calc(100% + 8px)', bottom:'auto' }}>
                      <div className='tipcard__head'><b>Priorytet</b></div>
                      <div className='tipcard__body'>{PRIO_LABELS[t.priority || 'normal']}</div>
                    </span>
                  </span>
                </span>

                <span className='chip__deadline'>{t.deadline ? fmt(new Date(t.deadline), 'dd LLL') : '—'}</span>
                <span className='chip__title'>{t.title}</span>
              </button>
            ))}
          </div>

          {/* ===== PAGINACJA (DODANE) ===== */}
          {filteredBacklog.length > 0 && (
            <div className='zone__pagination'>
              <div className='pager__left'>
                <span className='pager__label'>Na stronę:</span>
                <select
                  className='pager__select'
                  value={perPage}
                  onChange={(e)=> setPerPage(Number(e.target.value))}
                >
                  {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className='pager__center'>
                <button
                  className='pager__btn'
                  onClick={()=> setPage(1)}
                  disabled={pageSafe === 1}
                  title='Pierwsza'
                >
                  <ChevronsLeft size={14}/>
                </button>
                <button
                  className='pager__btn'
                  onClick={()=> setPage(p => Math.max(1, p-1))}
                  disabled={pageSafe === 1}
                  title='Poprzednia'
                >
                  <ChevronLeft size={14}/>
                </button>

                <span className='pager__info'>
                  {((pageSafe - 1) * perPage) + 1}
                  –
                  {Math.min(pageSafe * perPage, filteredBacklog.length)}
                  {' '}z{' '}
                  {filteredBacklog.length}
                </span>

                <button
                  className='pager__btn'
                  onClick={()=> setPage(p => Math.min(totalPages, p+1))}
                  disabled={pageSafe === totalPages}
                  title='Następna'
                >
                  <ChevronRight size={14}/>
                </button>
                <button
                  className='pager__btn'
                  onClick={()=> setPage(totalPages)}
                  disabled={pageSafe === totalPages}
                  title='Ostatnia'
                >
                  <ChevronsRight size={14}/>
                </button>
              </div>

              <div className='pager__right'>
                <span className='pager__page'>Strona {pageSafe}/{totalPages}</span>
              </div>
            </div>
          )}
        </aside>

        {/* KALENDARZ */}
        <div className='planner__calendar-col'>
          <header className='planner__toolbar planner__toolbar--inline toolbar--centered'>
            <div className='toolbar__centered'>
              <button className='ghost' onClick={goPrevWeek} title='– 7 dni'><ChevronLeft size={18}/></button>
              <button className='ghost' onClick={goPrevDay}  title='– 1 dzień'><ChevronLeft size={18}/></button>
              <button className='primary' onClick={goToday}  title='Dziś'><CalendarDays size={16}/> Dziś</button>
              <button className='ghost' onClick={goNextDay}  title='+ 1 dzień'><ChevronRight size={18}/></button>
              <button className='ghost' onClick={goNextWeek} title='+ 7 dni'><ChevronRight size={18}/></button>

              <span className='toolbar__range'>
                <CalendarSearch size={16} style={{cursor:'pointer'}} onClick={jumpToDate}/>
                <span className='range-label'>
                  {fmt(days[0], 'd MMM yyyy')} – {fmt(days[days.length - 1], 'd MMM yyyy')}
                </span>
                <input ref={hiddenDateInput} className='datejump-input' type='date' onChange={onPickDate} />
              </span>
            </div>
          </header>

          <div className='plan-grid'>
            <div className='grid__header'>
              <div className='grid__corner'>Dzień / Slot</div>
              {SLOT_META.map(s => (
                <div key={s.key} className='grid__slothead' role='columnheader' title={s.label}>
                  <span className='sloticon' aria-hidden='true'>{s.emoji}</span>
                  <span className='sr-only'>{s.label}</span>
                </div>
              ))}
            </div>

            <div className='grid__body'>
              {days.map((d) => {
                const dayISO = iso(d)
                const meets  = dayMeetings(d)
                const alerts = dayAlerts(d)
                const other  = dayOther(d)
                const { hasTodayDeadline, hasOverdue } = dayDeadlineFlags.get(dayISO) || {}

                const shiftKey  = userShifts[dayISO]
                const shiftMeta = shiftKey ? SHIFT_META[shiftKey] : null

                return (
                  <div className='grid__row' key={dayISO}>
                    <div
                      className={[
                        'grid__day',
                        isSameDay(d, today()) ? 'is-today' : '',
                        hasOverdue ? 'is-overdue' : (hasTodayDeadline ? 'has-deadline' : '')
                      ].join(' ').trim()}
                      onClick={() => selectDay(d)}
                      title='Pokaż szczegóły dnia'
                    >
                      <div className='day__name'>{fmt(d, 'EEEE', pl)}</div>
                      <div className='day__date'>{fmt(d, 'd MMM')}</div>

                      <div className='day__badges'>
                        {shiftMeta && (
                          <span
                            className='daybadge daybadge--shift'
                            title={shiftMeta.label}
                            style={{ background: shiftMeta.bg }}
                          >
                            {shiftMeta.short}
                          </span>
                        )}

                        {meets.length > 0 && (
                          <span className='daybadge daybadge--meeting has-card' title='Spotkania'>
                            📅<span className='daybadge__count'>{meets.length}</span>
                            <span className='tipcard tipcard--mini'>
                              <div className='tipcard__head'><b>Spotkania</b></div>
                              <div className='tipcard__body'>
                                {meets.slice(0,5).map(m => (
                                  <div key={m.id} className='tip-line'>{m.time} — {m.title}</div>
                                ))}
                                {meets.length > 5 && <div className='tip-more'>+{meets.length - 5} więcej…</div>}
                              </div>
                            </span>
                          </span>
                        )}
                        {alerts.length > 0 && (
                          <span className='daybadge daybadge--alert has-card' title='Powiadomienia'>
                            🔔<span className='daybadge__count'>{alerts.length}</span>
                            <span className='tipcard tipcard--mini'>
                              <div className='tipcard__head'><b>Powiadomienia</b></div>
                              <div className='tipcard__body'>
                                {alerts.slice(0,5).map(n => (
                                  <div key={n.id} className='tip-line'>{n.time} — {n.title}</div>
                                ))}
                                {alerts.length > 5 && <div className='tip-more'>+{alerts.length - 5} więcej…</div>}
                              </div>
                            </span>
                          </span>
                        )}
                        {other.length > 0 && (
                          <span className='daybadge daybadge--other has-card' title='Inne'>
                            💬<span className='daybadge__count'>{other.length}</span>
                            <span className='tipcard tipcard--mini'>
                              <div className='tipcard__head'><b>Inne</b></div>
                              <div className='tipcard__body'>
                                {other.slice(0,5).map(o => (
                                  <div key={o.id} className='tip-line'>{o.time} — {o.title}</div>
                                ))}
                                {other.length > 5 && <div className='tip-more'>+{other.length - 5} więcej…</div>}
                              </div>
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {SLOT_META.map(s => {
                      const key = `${dayISO}:${s.key}`
                      const items = tasksByDaySlot.get(key) || []
                      const over = dragKey === key
                      const { visible, extra } = badgesForSlot(items)

                      const allowHere = (e) => { if (!isPastDay(d)) allow(e, key) }
                      const dropHere  = (e) => onDropSlot(e, d, s.key)

                      return (
                        <div
                          key={s.key}
                          className={`grid__cell ${over ? 'is-over' : ''} ${isPastDay(d) ? 'is-disabled' : ''}`}
                          onDragEnter={allowHere}
                          onDragOver={allowHere}
                          onDrop={dropTo(dropHere)}
                          title={isPastDay(d) ? 'Planowanie w przeszłości jest zablokowane' : undefined}
                        >
                          <div className='slot__items'>
                            {items.length === 0 && (
                              <div className='slot__placeholder'>
                                {isPastDay(d) ? 'Przeszłość' : 'Upuść tutaj'}
                              </div>
                            )}

                            {items.length > 0 && (
                              <div className='slot__summary'>
                                {visible.map((g, idx) => {
                                  const tipList = g.list.slice(0,4)
                                  const more = Math.max(0, g.list.length - tipList.length)
                                  return (
                                    <span
                                      key={`${g.type}-${idx}`}
                                      className={`count-badge ${badgeFillClassForGroup(g)} ring--status-${g.ringStatus} has-card`}
                                      draggable={!isPastDay(d)}
                                      onDragStart={(e)=> !isPastDay(d) && setGroupDrag(e, { dayISO, slotKey: s.key, type: g.type })}
                                      title={`${g.type} • ${g.count}`}
                                    >
                                      {g.count}
                                      <span className='tipcard'>
                                        <div className='tipcard__head'>
                                          <span className={`tip-dot ${typeToBadgeClass(g.type)}`}></span>
                                          <b>{g.type}</b>
                                          <span className={`tip-status tip-${g.ringStatus}`}>{g.ringStatus}</span>
                                        </div>
                                        <div className='tipcard__body'>
                                          {tipList.map((txt, i) => <div key={i} className='tip-line'>• {txt}</div>)}
                                          {more > 0 && <div className='tip-more'>+{more} więcej…</div>}
                                        </div>
                                      </span>
                                    </span>
                                  )
                                })}
                                {extra > 0 && (
                                  <span className='count-badge has-card' title={`+${extra}`}>
                                    +{extra}
                                    <span className='tipcard'>
                                      <div className='tipcard__head'><b>Inne rodzaje</b></div>
                                      <div className='tipcard__body'>Przenieś/otwórz, aby zobaczyć szczegóły.</div>
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}

                            <button
                              className='slot__editbtn'
                              title='Edytuj slot'
                              onClick={() => setEditor({ dayISO, slotKey: s.key })}
                            >
                              <PencilLine size={14}/>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======= MODAL EDYCJI SLOTU ======= */}
      {editor && (() => {
        const key   = `${editor.dayISO}:${editor.slotKey}`
        const items = tasksByDaySlot.get(key) || []
        const close = () => setEditor(null)
        const moveAllToBacklog = () => { items.forEach(t => removeTaskPlacement(t.id)); close() }

        const handleChangeDate = async (taskId, newISO) => {
          const dt = parseISO(newISO)
          if (startOfDay(dt) < today()) {
            await modal.alert({ tone:'warn', title:'Nie można zaplanować wstecz', message:'Nie planujemy w przeszłość.' })
            return
          }
          await assignWithDeadlineCheck(taskId, newISO, editor.slotKey)
        }
        const handleChangeSlot = async (taskId, newSlot) => {
          await assignWithDeadlineCheck(taskId, editor.dayISO, newSlot)
        }

        return (
          <div className='sloteditor__backdrop' onClick={close}>
            <div className='sloteditor__panel' onClick={(e)=>e.stopPropagation()}>
              <div className='sloteditor__head'>
                <div>
                  <b>{fmt(parseISO(editor.dayISO), 'EEEE, d MMM yyyy', pl)}</b>
                  <span className='sloteditor__sub'> • {SLOT_META.find(s=>s.key===editor.slotKey)?.label}</span>
                </div>
                <div className='sloteditor__actions'>
                  <button className='ghost' onClick={moveAllToBacklog} title='Wszystko do backlogu'>
                    <CornerUpLeft size={14}/> Do backlogu
                  </button>
                  <button className='ghost' onClick={close} title='Zamknij'>
                    <X size={14}/>
                  </button>
                </div>
              </div>

              <div className='sloteditor__body'>
                {items.length === 0 && <div className='empty'>Brak zadań w tym slocie</div>}
                {items.map(t => (
                  <div className='se-item' key={t.id}>
                    <div className='se-title' onClick={()=>onTaskOpenRoute(t)} title='Otwórz szczegóły'>
                      <span className='chip__deadline'>{t.deadline ? fmt(new Date(t.deadline),'dd LLL') : '—'}</span>
                      <span className='se-title__txt'>{t.title}</span>
                    </div>
                    <div className='se-controls'>
                      <select
                        value={editor.slotKey}
                        onChange={e => handleChangeSlot(t.id, e.target.value)}
                        title='Przenieś do innego slotu'
                      >
                        {SLOT_META.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                      <input
                        type='date'
                        value={editor.dayISO}
                        onChange={e => handleChangeDate(t.id, e.target.value)}
                        title='Zmień dzień'
                      />
                      <button className='chip__remove' onClick={() => removeTaskPlacement(t.id)} title='Usuń z dnia/slotu'>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
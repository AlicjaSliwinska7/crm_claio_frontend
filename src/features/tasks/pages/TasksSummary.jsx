import React, { useMemo, useState, useEffect, useRef } from 'react'
import {
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
} from 'date-fns'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts'
import '../styles/tasks-summary.css'

/* ======================= DANE (mock) ======================= */
const TASKS = [
  { id: 'T-001', title: 'Raport – wrzesień',            dueDate: '2025-09-22', assignees: ['Alicja Śliwińska', 'Jan Kowalski'], status: 'w toku' },
  { id: 'T-002', title: 'Audyt wewnętrzny – checklisty', date: '2025-09-23',   assignees: ['Alicja Śliwińska'],                 status: 'przydzielone' },
  { id: 'T-003', title: 'Kalibracja wagosuszarki',       targetDate: '2025-09-24', assignees: ['Alicja Śliwińska', 'Anna Nowak'], status: 'do zrobienia' },
  { id: 'T-004', title: 'Oferty IX/2025',                dueDate: '2025-09-27', assignees: ['Alicja Śliwińska'],                status: 'w toku' },
  { id: 'T-005', title: 'Próbki A123 do badań',          date: '2025-09-29',   assignees: ['Alicja Śliwińska', 'Piotr Kowalski'], status: 'do zrobienia' },
  { id: 'T-006', title: 'Instrukcja przyjęcia próbek',   targetDate: '2025-10-02', assignees: ['Alicja Śliwińska'],               status: 'w toku' },
  { id: 'T-007', title: 'Zgłoszenie klienta – follow-up',dueDate: '2025-09-25', assignees: ['Jan Kowalski'],                     status: 'w toku' },
  { id: 'T-008', title: 'Raport – październik',          dueDate: '2025-10-03', assignees: ['Ewa Dąbrowska'],                    status: 'przydzielone' },
  { id: 'T-009', title: 'Dokumentacja – aktualizacja',   dueDate: '2025-09-28', assignees: ['Maria Zielińska'],                  status: 'w toku' },
  { id: 'T-010', title: 'Kalibracja – stanowisko 2',     dueDate: '2025-09-30', assignees: ['Tomasz Wójcik'],                    status: 'do zrobienia' },
  { id: 'T-011', title: 'Oferta – GE/2025/09',           date: '2025-09-26',   assignees: ['Paweł Lewandowski'],                 status: 'przydzielone' },
  { id: 'T-012', title: 'Audyt – plan',                  date: '2025-09-24',   assignees: ['Karolina Mazur'],                    status: 'w toku' },
  { id: 'T-013', title: 'Dokumentacja – wersja 1.2',     date: '2025-09-23',   assignees: ['Jan Kaczmarek'],                     status: 'do zrobienia' },
  { id: 'T-014', title: 'Raport – weryfikacja',          date: '2025-09-22',   assignees: ['Aleksandra Szymańska'],              status: 'w toku' },
]

/* ======================= HELPERS ======================= */
const getTaskDate = t => t.dueDate || t.date || t.targetDate || t.deadline || t.scheduledAt || t.start
const parseDateSafe = d => (d instanceof Date ? d : d ? parseISO(d) : null)
const lastName = s => String(s || '').trim().split(/\s+/).slice(-1)[0]

const taskTypeOf = t => {
  if (t.type) return String(t.type).trim()
  const s = (t.title || '').toLowerCase()
  if (s.includes('audyt')) return 'Audyt'
  if (s.includes('raport')) return 'Raport'
  if (s.includes('kalibr')) return 'Kalibracja'
  if (s.includes('ofert')) return 'Oferta'
  if (s.includes('próbk') || s.includes('probk')) return 'Próbki'
  if (s.includes('instrukcj') || s.includes('dokumentac')) return 'Dokumentacja'
  return 'Inne'
}

/* ======================= KOMPONENT ======================= */
export default function TasksSummary() {
  /* sticky toolbar */
  const sentinelRef = useRef(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { threshold: 1 })
    if (sentinelRef.current) obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [])

  /* ——— Normalizacja danych raz ——— */
  const NORM = useMemo(() => {
    return TASKS.map(t => {
      const d = parseDateSafe(getTaskDate(t))
      const dateTs = d ? startOfDay(d).getTime() : null
      const statusNorm = (t.status || 'brak statusu').toString().trim()
      const typeNorm = taskTypeOf(t)
      const assigneesNorm = (t.assignees || []).map(a => String(a).trim()).filter(Boolean)
      return { ...t, dateTs, statusNorm, typeNorm, assigneesNorm }
    })
  }, [])

  /* ——— Kolejności preferowane ——— */
  const PREFERRED_STATUS_ORDER = ['w toku', 'przydzielone', 'do zrobienia']
  const PREFERRED_TYPE_ORDER = ['Raport', 'Audyt', 'Kalibracja', 'Oferta', 'Próbki', 'Dokumentacja', 'Inne']

  /* ——— Zbiory (posortowane) ——— */
  const ALL_EMPLOYEES = useMemo(() => {
    const set = new Set()
    for (const t of NORM) for (const a of t.assigneesNorm) set.add(a)
    return Array.from(set).sort((a, b) => lastName(a).localeCompare(lastName(b), 'pl'))
  }, [NORM])

  const ALL_TYPES = useMemo(() => {
    const s = new Set(NORM.map(t => t.typeNorm))
    const pref = PREFERRED_TYPE_ORDER.filter(x => s.has(x))
    const rest = Array.from(s).filter(x => !PREFERRED_TYPE_ORDER.includes(x)).sort((a, b) => a.localeCompare(b, 'pl'))
    return [...pref, ...rest]
  }, [NORM])

  const ALL_STATUSES = useMemo(() => {
    const s = new Set(NORM.map(t => t.statusNorm))
    const pref = PREFERRED_STATUS_ORDER.filter(x => s.has(x))
    const rest = Array.from(s).filter(x => !PREFERRED_STATUS_ORDER.includes(x)).sort((a, b) => a.localeCompare(b, 'pl'))
    return [...pref, ...rest]
  }, [NORM])

  /* ——— Inicjalny zakres z danych ——— */
  const { initialFrom, initialTo } = useMemo(() => {
    const withDate = NORM.filter(t => t.dateTs != null).map(t => t.dateTs)
    if (withDate.length === 0) {
      const today = startOfDay(new Date())
      return { initialFrom: startOfMonth(today), initialTo: endOfMonth(today) }
    }
    const min = Math.min(...withDate), max = Math.max(...withDate)
    return { initialFrom: startOfDay(new Date(min)), initialTo: endOfDay(new Date(max)) }
  }, [NORM])

  /* ——— Sterowanie zakresem ——— */
  const [period, setPeriod] = useState('miesiac')
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const fromTs = from.getTime(), toTs = to.getTime()

  const today = startOfDay(new Date())
  const todayTs = today.getTime()
  const tomorrowTs = addDays(today, 1).getTime()
  const next7EndTs = addDays(today, 6).getTime() // dziś + kolejne 6 = 7 dni łącznie

  const setTimePreset = p => {
    setPeriod(p)
    if (p === 'dzis')   { setFrom(startOfDay(today)); setTo(endOfDay(today)) }
    if (p === 'jutro')  { const t = addDays(today, 1); setFrom(startOfDay(t)); setTo(endOfDay(t)) }
    if (p === 'tydzien'){ setFrom(startOfWeek(today, { weekStartsOn: 1 })); setTo(endOfWeek(today, { weekStartsOn: 1 })) }
    if (p === 'miesiac'){ setFrom(startOfMonth(today)); setTo(endOfMonth(today)) }
  }

  const inRangeTs = ts => ts != null && ts >= fromTs && ts <= toTs

  /* ——— Filtry i grupowanie ——— */
  const [groupBy, setGroupBy] = useState('status') // 'status' | 'type'
  const [empSel, setEmpSel] = useState(() => new Set(ALL_EMPLOYEES))
  const [statusSel, setStatusSel] = useState(() => new Set(ALL_STATUSES))
  const [typeSel, setTypeSel] = useState(() => new Set(ALL_TYPES))
  const [barSort, setBarSort] = useState('total') // 'total' | 'alpha'

  const toggleChip = (setter, value) => {
    setter(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  const clearAll = () => {
    setFrom(initialFrom); setTo(initialTo); setPeriod('custom')
    setEmpSel(new Set(ALL_EMPLOYEES))
    setStatusSel(new Set(ALL_STATUSES))
    setTypeSel(new Set(ALL_TYPES))
    setBarSort('total')
  }

  /* ——— Sekcje rozwijane ——— */
  const [openEmp, setOpenEmp] = useState(false)
  const [openStatus, setOpenStatus] = useState(false)
  const [openType, setOpenType] = useState(false)

  /* ——— Dane do wykresu (zliczamy też zaległe per pracownik) ——— */
  const chartData = useMemo(() => {
    const rows = new Map()
    for (const u of ALL_EMPLOYEES) if (empSel.has(u)) rows.set(u, { employee: u, total: 0, overdue: 0 })

    for (const t of NORM) {
      if (!inRangeTs(t.dateTs)) continue
      if (!statusSel.has(t.statusNorm) || !typeSel.has(t.typeNorm)) continue
      const key = groupBy === 'status' ? t.statusNorm : t.typeNorm
      const isOverdue = t.dateTs < todayTs
      for (const emp of t.assigneesNorm) {
        const r = rows.get(emp)
        if (!r) continue
        r[key] = (r[key] || 0) + 1
        r.total = (r.total || 0) + 1
        if (isOverdue) r.overdue = (r.overdue || 0) + 1
      }
    }

    let arr = Array.from(rows.values())
    if (barSort === 'total') arr.sort((a, b) => (b.total || 0) - (a.total || 0))
    else arr.sort((a, b) => lastName(a.employee).localeCompare(lastName(b.employee), 'pl'))
    return arr
  }, [NORM, ALL_EMPLOYEES, empSel, statusSel, typeSel, groupBy, barSort, fromTs, toTs, todayTs])

  const seriesKeys = useMemo(() => {
    const s = new Set()
    for (const r of chartData) for (const k of Object.keys(r)) if (k !== 'employee' && k !== 'total' && k !== 'overdue' && (r[k] || 0) > 0) s.add(k)
    if (groupBy === 'status') {
      const rest = Array.from(s).filter(k => !PREFERRED_STATUS_ORDER.includes(k)).sort((a, b) => a.localeCompare(b, 'pl'))
      const ordered = PREFERRED_STATUS_ORDER.filter(k => s.has(k)).concat(rest)
      return ordered.length ? ordered : ['total']
    } else {
      const pref = PREFERRED_TYPE_ORDER.filter(k => s.has(k))
      const rest = Array.from(s).filter(k => !PREFERRED_TYPE_ORDER.includes(k)).sort((a, b) => a.localeCompare(b, 'pl'))
      const ordered = pref.concat(rest)
      return ordered.length ? ordered : ['total']
    }
  }, [chartData, groupBy])

  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#a855f7', '#fb7185']

  /* ——— MINI-KPI (po filtrach zakresu/statusu/typu) + klucz do animacji ——— */
  const miniKpi = useMemo(() => {
    let inRange = 0, overdue = 0, unassigned = 0
    let todayCnt = 0, tomorrowCnt = 0, next7Cnt = 0
    for (const t of NORM) {
      const passStatusType = statusSel.has(t.statusNorm) && typeSel.has(t.typeNorm)
      if (!passStatusType) continue
      if (inRangeTs(t.dateTs)) {
        inRange += 1
        if (t.assigneesNorm.length === 0) unassigned += 1
        if (t.dateTs < todayTs) overdue += 1
      }
      if (t.dateTs != null) {
        if (t.dateTs === todayTs) todayCnt += 1
        if (t.dateTs === tomorrowTs) tomorrowCnt += 1
        if (t.dateTs >= todayTs && t.dateTs <= next7EndTs) next7Cnt += 1
      }
    }
    return { inRange, overdue, unassigned, todayCnt, tomorrowCnt, next7Cnt }
  }, [NORM, statusSel, typeSel, fromTs, toTs, todayTs, tomorrowTs, next7EndTs])

  const kpiKey = useMemo(() => {
    return [
      format(from, 'yyyy-MM-dd'),
      format(to, 'yyyy-MM-dd'),
      groupBy, barSort,
      [...empSel].sort().join(','),
      [...statusSel].sort().join(','),
      [...typeSel].sort().join(',')
    ].join('|')
  }, [from, to, groupBy, barSort, empSel, statusSel, typeSel])

  /* ——— Eksport CSV (agregacja + surowe) ——— */
  const exportAggCsv = () => {
    const headerCols = ['Pracownik', ...(seriesKeys[0] === 'total' ? [] : seriesKeys), 'Suma', 'Zaległe']
    const quote = v => `"${String(v ?? '').replaceAll('"','""')}"`
    const header = headerCols.map(quote).join(';')
    const lines = chartData.map(row => {
      const vals = [
        row.employee,
        ...(seriesKeys[0] === 'total' ? [] : seriesKeys.map(k => Number(row[k] || 0))),
        Number(row.total || 0),
        Number(row.overdue || 0),
      ]
      return vals.map(quote).join(';')
    })
    const csv = [header, ...lines].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zadania_agregacja_${groupBy}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportRawCsv = () => {
    const quote = v => `"${String(v ?? '').replaceAll('"','""')}"`

    const header = [
      'ID','Tytuł','Data','Status','Typ','Przypisani','Liczba przypisanych','Czy zaległe'
    ].map(quote).join(';')

    const rows = NORM
      .filter(t => inRangeTs(t.dateTs))
      .filter(t => statusSel.has(t.statusNorm) && typeSel.has(t.typeNorm))
      .map(t => {
        const dateStr = t.dateTs ? format(new Date(t.dateTs), 'yyyy-MM-dd') : ''
        const overdue = t.dateTs != null && t.dateTs < todayTs
        return [
          t.id,
          t.title || '',
          dateStr,
          t.statusNorm,
          t.typeNorm,
          t.assigneesNorm.join(', '),
          t.assigneesNorm.length,
          overdue ? 'TAK' : 'NIE',
        ].map(quote).join(';')
      })

    const csv = [header, ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zadania_surowe_w_zakresie.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ——— skala obrysu dla „zaległych” ——— */
  const overdueStroke = n => (n >= 6 ? '#ef4444' : n >= 3 ? '#f97316' : n >= 1 ? '#f59e0b' : 'transparent')
  const overdueStrokeW = n => (n > 0 ? 2 : 0)

  /* ======================= RENDER ======================= */
  return (
    <section className='ts'>
      {/* sentinel do sticky */}
      <div ref={sentinelRef} className='ts__sticky-sentinel' aria-hidden='true' />
      <div className={`ts__toolbar ${stuck ? 'is-stuck' : ''}`}>
        {/* Presety czasu */}
        <div className='ts__toolbar-presets'>
          <div className='seg'>
            <button className={period === 'dzis' ? 'is-active' : ''} onClick={() => setTimePreset('dzis')}>Dziś</button>
            <button className={period === 'jutro' ? 'is-active' : ''} onClick={() => setTimePreset('jutro')}>Jutro</button>
            <button className={period === 'tydzien' ? 'is-active' : ''} onClick={() => setTimePreset('tydzien')}>Ten tydzień</button>
            <button className={period === 'miesiac' ? 'is-active' : ''} onClick={() => setTimePreset('miesiac')}>Ten miesiąc</button>
            <button className={period === 'custom' ? 'is-active' : ''} onClick={() => setPeriod('custom')}>Niestandardowy</button>
          </div>

          {period === 'custom' && (
            <div className='ts__range'>
              <label>
                Od:
                <input
                  type='date'
                  value={format(from, 'yyyy-MM-dd')}
                  onChange={e => setFrom(startOfDay(parseISO(e.target.value)))}
                />
              </label>
              <label>
                Do:
                <input
                  type='date'
                  value={format(to, 'yyyy-MM-dd')}
                  onChange={e => setTo(endOfDay(parseISO(e.target.value)))}
                />
              </label>
            </div>
          )}
        </div>

        <button className='btn btn--clear' onClick={clearAll}>Wyczyść wszystkie filtry</button>

        <div>
          <div className='ts__toolbar-group'>
            <div className='seg seg--group'>
              <span>Grupowanie słupków:</span>
              <button className={groupBy === 'status' ? 'is-active' : ''} onClick={() => setGroupBy('status')}>Statusy</button>
              <button className={groupBy === 'type' ? 'is-active' : ''} onClick={() => setGroupBy('type')}>Rodzaje</button>
            </div>
          </div>
          <div className='ts__toolbar-sort'>
            <div className='seg seg--sort'>
              <span>Sortuj słupki:</span>
              <button className={barSort === 'total' ? 'is-active' : ''} onClick={() => setBarSort('total')}>Suma malejąco</button>
              <button className={barSort === 'alpha' ? 'is-active' : ''} onClick={() => setBarSort('alpha')}>Alfabetycznie</button>
            </div>
          </div>
        </div>
      </div>

      {/* MINI-KPI (z animacją fade-in) */}
      <div key={kpiKey} className='ts__kpi kpi-animate'>
        <div><strong>Zakres:</strong> {format(from, 'dd.MM.yyyy')} – {format(to, 'dd.MM.yyyy')}</div>
        <div><strong>Zadań w zakresie:</strong> {miniKpi.inRange}</div>
        <div><strong>Zaległe w zakresie:</strong> {miniKpi.overdue}</div>
        <div><strong>Bez przypisania:</strong> {miniKpi.unassigned}</div>
        <div className='sep'></div>
        <div><strong>Na dziś:</strong> {miniKpi.todayCnt}</div>
        <div><strong>Na jutro:</strong> {miniKpi.tomorrowCnt}</div>
        <div><strong>Najbl. 7 dni:</strong> {miniKpi.next7Cnt}</div>
      </div>

      {/* Filtry */}
      <div className='ts__section-title'>Filtry</div>
      <div className='ts__filters'>
        {/* Pracownicy */}
        <div className='ts__group'>
          <button className={`collapsible ${openEmp ? 'is-open' : ''}`} onClick={() => setOpenEmp(v => !v)}>
            <span>Pracownicy</span>
            <span className='muted'> ({empSel.size}/{ALL_EMPLOYEES.length})</span>
          </button>
          {openEmp && (
            <div className='ts__collapse-body'>
              <div className='chips'>
                {ALL_EMPLOYEES.map(name => (
                  <label key={name} className={`chip ${empSel.has(name) ? 'is-on' : ''}`}>
                    <input type='checkbox' checked={empSel.has(name)} onChange={() => toggleChip(setEmpSel, name)} />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statusy */}
        <div className='ts__group'>
          <button className={`collapsible ${openStatus ? 'is-open' : ''}`} onClick={() => setOpenStatus(v => !v)}>
            <span>Status zadań</span>
            <span className='muted'> ({statusSel.size}/{ALL_STATUSES.length})</span>
          </button>
          {openStatus && (
            <div className='ts__collapse-body'>
              <div className='chips'>
                {ALL_STATUSES.map(s => (
                  <label key={s} className={`chip ${statusSel.has(s) ? 'is-on' : ''}`}>
                    <input type='checkbox' checked={statusSel.has(s)} onChange={() => toggleChip(setStatusSel, s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Typy */}
        <div className='ts__group'>
          <button className={`collapsible ${openType ? 'is-open' : ''}`} onClick={() => setOpenType(v => !v)}>
            <span>Rodzaj zadania</span>
            <span className='muted'> ({typeSel.size}/{ALL_TYPES.length})</span>
          </button>
          {openType && (
            <div className='ts__collapse-body'>
              <div className='chips'>
                {ALL_TYPES.map(tp => (
                  <label key={tp} className={`chip ${typeSel.has(tp) ? 'is-on' : ''}`}>
                    <input type='checkbox' checked={typeSel.has(tp)} onChange={() => toggleChip(setTypeSel, tp)} />
                    <span>{tp}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wykres + eksporty */}
      <div className='ts__chart' style={{ width: '100%', minWidth: 320 }}>
        <div className='ts__chart-head'>
          <div className='muted'>Agregacja jak na wykresie (filtry + grupowanie)</div>
          <div className='actions'>
            <button className='btn btn--export' onClick={exportAggCsv}>Eksportuj CSV (agregacja)</button>
            <button className='btn btn--export' onClick={exportRawCsv}>Eksportuj CSV (surowe w zakresie)</button>
          </div>
        </div>

        {chartData.every(r => (r.total || 0) === 0) ? (
          <div className='empty'>Brak danych do wykresu dla wybranych filtrów.</div>
        ) : (
          <ResponsiveContainer width='100%' height={380}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 56, left: 0 }} barCategoryGap='28%'>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='employee' interval={0} tickMargin={12} tick={{ fontSize: 12 }} angle={-15} height={48} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend layout='horizontal' verticalAlign='bottom' align='center' wrapperStyle={{ whiteSpace: 'normal', lineHeight: '16px' }} />
              {seriesKeys.map((k, idx) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId={seriesKeys[0] !== 'total' ? 'stack' : undefined}
                  fill={palette[idx % palette.length]}
                  barSize={18}
                  strokeLinejoin='round'
                >
                  {chartData.map((row, i) => (
                    <Cell
                      key={`${k}-${i}`}
                      stroke={overdueStroke(row.overdue || 0)}
                      strokeWidth={overdueStrokeW(row.overdue || 0)}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className='ts__legend'>
        <strong>Grupowanie:</strong>{groupBy === 'status' ? ' Statusy' : ' Rodzaje'}
        <span className='legend--overdue-scale' title='Obrys słupków = liczba zaległych zadań dla pracownika'>
          Zaległe:
          <span className='swatch swatch--low'  aria-label='1–2' />
          1–2
          <span className='swatch swatch--mid'  aria-label='3–5' />
          3–5
          <span className='swatch swatch--high' aria-label='6+' />
          6+
        </span>
      </div>
    </section>
  )
}

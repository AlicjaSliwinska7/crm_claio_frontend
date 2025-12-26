// src/components/pages/contents/TestsSchedule.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import '../styles/tests-schedule.css'

/* ===== Palety kolorów ===== */
const PALETTE_DEFAULT = [
  '#0072B2',
  '#E69F00',
  '#009E73',
  '#CC79A7',
  '#56B4E9',
  '#D55E00',
  '#F0E442',
  '#7F3C8D',
  '#11A579',
  '#3969AC',
  '#F2B701',
  '#E73F74',
]
const PALETTE_ALT = [
  '#3A628A',
  '#8C6D31',
  '#5B8A72',
  '#8E5C7A',
  '#7FA4C4',
  '#A35D3A',
  '#C3B34E',
  '#6E5A8E',
  '#3E8C77',
  '#5A6E9C',
  '#B28F3B',
  '#A34F67',
]

const STATUS = {
  planned: { label: 'Planowane', color: '#6B7280' },
  running: { label: 'W trakcie', color: '#3A628A' },
  blocked: { label: 'Wstrzymane', color: '#E54848' },
  done: { label: 'Zakończone', color: '#059669' },
}

const hashIndex = (str, modulo) => {
  let h = 0
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % modulo
}
const colorFor = (key, mode) => {
  const pal = mode === 'alt' ? PALETTE_ALT : PALETTE_DEFAULT
  return pal[hashIndex(key, pal.length)]
}

/* ===== Demo dane (możesz podmienić na backend) ===== */
const today = startOfDay(new Date())
const demoEquipment = [
  { id: 'EQ-010', name: 'Maszyna wytrzymałościowa Zwick' },
  { id: 'EQ-022', name: 'Komora klimatyczna CTS' },
  { id: 'EQ-031', name: 'Twardościomierz Rockwella' },
]
const demoItems = [
  {
    id: 'T-1001',
    title: 'Rozciąganie tworzyw (PB-101)',
    method: 'PB-101',
    status: 'running',
    orderNo: 'ZLE/2025/091',
    client: 'TechSolutions Sp. z o.o.',
    samples: ['S-0012', 'S-0013'],
    equipmentIds: ['EQ-010'],
    start: addDays(today, -2).toISOString(),
    end: addDays(today, 2).toISOString(),
  },
  {
    id: 'T-1002',
    title: 'Starzenie cieplne (PB-330)',
    method: 'PB-330',
    status: 'planned',
    orderNo: 'ZLE/2025/094',
    client: 'GreenEnergy S.A.',
    samples: ['S-0042'],
    equipmentIds: ['EQ-022'],
    start: addDays(today, 1).toISOString(),
    end: addDays(today, 5).toISOString(),
  },
  {
    id: 'T-1003',
    title: 'Twardość HRB (PB-055)',
    method: 'PB-055',
    status: 'running',
    orderNo: 'ZLE/2025/097',
    client: 'Meditech Polska',
    samples: ['S-0050', 'S-0051'],
    equipmentIds: ['EQ-031'],
    start: addDays(today, -1).toISOString(),
    end: addDays(today, 1).toISOString(),
  },
  {
    id: 'T-1004',
    title: 'Rozciąganie – seria 2 (PB-101)',
    method: 'PB-101',
    status: 'running',
    orderNo: 'ZLE/2025/098',
    client: 'TechSolutions Sp. z o.o.',
    samples: ['S-0062'],
    equipmentIds: ['EQ-010'],
    start: addDays(today, 0).toISOString(),
    end: addDays(today, 3).toISOString(),
  },
]

/* ===== Hook: prefers-reduced-motion ===== */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

/* ===== Komponent strony ===== */
export default function TestsSchedule({ equipment = demoEquipment, items = demoItems }) {
  /* --- Filtry --- */
  const [q, setQ] = useState('')
  const [eqFilter, setEqFilter] = useState('') // id sprzętu
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [onlyToday, setOnlyToday] = useState(false)
  const [orderFilter, setOrderFilter] = useState('')
  const [sampleFilter, setSampleFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  /* --- Paleta kolorów --- */
  const [paletteMode, setPaletteMode] = useState('default') // 'default' | 'alt'

  /* --- Zakres czasu --- */
  const [preset, setPreset] = useState('month') // week | month | quarter | custom
  const [fromStr, setFromStr] = useState('')
  const [toStr, setToStr] = useState('')

  /* --- Deep link: odczyt na starcie --- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const get = k => params.get(k)
    const bool = k => params.get(k) === '1'
    const val = (k, setter) => {
      const v = get(k)
      if (v !== null) setter(v)
    }
    val('q', setQ)
    val('eq', setEqFilter)
    val('method', setMethodFilter)
    val('status', setStatusFilter)
    val('preset', setPreset)
    val('from', setFromStr)
    val('to', setToStr)
    setOnlyToday(bool('today'))
    val('order', setOrderFilter)
    val('sample', setSampleFilter)
    val('client', setClientFilter)
    val('palette', setPaletteMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* --- Deep link: aktualizacja adresu --- */
  useEffect(() => {
    const params = new URLSearchParams()
    q && params.set('q', q)
    eqFilter && params.set('eq', eqFilter)
    methodFilter && params.set('method', methodFilter)
    statusFilter !== 'all' && params.set('status', statusFilter)
    preset && params.set('preset', preset)
    fromStr && params.set('from', fromStr)
    toStr && params.set('to', toStr)
    onlyToday && params.set('today', '1')
    orderFilter && params.set('order', orderFilter)
    sampleFilter && params.set('sample', sampleFilter)
    clientFilter && params.set('client', clientFilter)
    paletteMode !== 'default' && params.set('palette', paletteMode)

    const qs = params.toString()
    const url = qs ? `?${qs}` : window.location.pathname
    window.history.replaceState({}, '', url)
  }, [
    q,
    eqFilter,
    methodFilter,
    statusFilter,
    preset,
    fromStr,
    toStr,
    onlyToday,
    orderFilter,
    sampleFilter,
    clientFilter,
    paletteMode,
  ])

  /* --- Zakres czasu, skala --- */
  const baseFromTo = useMemo(() => {
    const now = today
    if (preset === 'week') {
      const from = startOfWeek(now, { weekStartsOn: 1 })
      return { from, to: endOfDay(addDays(from, 6)) }
    }
    if (preset === 'month') {
      const from = startOfMonth(now)
      return { from, to: endOfDay(addMonths(from, 1)) }
    }
    if (preset === 'quarter') {
      const from = startOfMonth(now)
      return { from, to: endOfDay(addMonths(from, 3)) }
    }
    if (preset === 'custom' && fromStr && toStr) {
      return { from: startOfDay(parseISO(fromStr)), to: endOfDay(parseISO(toStr)) }
    }
    const from = startOfMonth(now)
    return { from, to: endOfDay(addMonths(from, 1)) }
  }, [preset, fromStr, toStr])

  const { from, to } = baseFromTo
  const totalMs = Math.max(1, to - from)
  const days = Math.max(1, differenceInCalendarDays(to, from))
  const density = days > 90 ? 'month' : days > 35 ? 'week' : 'day'

  const ticks = useMemo(() => {
    const out = []
    if (density === 'day') {
      for (let d = 0; d <= days; d++) out.push(startOfDay(addDays(from, d)))
    } else if (density === 'week') {
      let cur = startOfWeek(from, { weekStartsOn: 1 })
      while (cur <= to) {
        out.push(cur)
        cur = addDays(cur, 7)
      }
    } else {
      let cur = startOfMonth(from)
      while (cur <= to) {
        out.push(cur)
        cur = addMonths(cur, 1)
      }
    }
    return out
  }, [from, to, days, density])

  /* --- Zbiory pomocnicze --- */
  const equipmentMap = useMemo(() => new Map(equipment.map(e => [e.id, e])), [equipment])
  const uniqueClients = useMemo(() => {
    const set = new Set((items || []).map(i => i.client).filter(Boolean))
    return [...set].sort((a, b) => String(a).localeCompare(String(b), 'pl'))
  }, [items])

  /* --- Filtrowanie --- */
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase()
    const orderLower = orderFilter.trim().toLowerCase()
    const sampleLower = sampleFilter.trim().toLowerCase()
    const clientLower = clientFilter.trim().toLowerCase()
    const methodLower = methodFilter.trim().toLowerCase()

    return (items || []).filter(it => {
      const itStart = parseISO(it.start)
      const itEnd = parseISO(it.end)

      const intersects = !(isAfter(itStart, to) || isBefore(itEnd, from))
      if (!intersects) return false

      if (eqFilter && !(it.equipmentIds || []).includes(eqFilter)) return false
      if (methodLower && String(it.method || '').toLowerCase() !== methodLower) return false
      if (statusFilter !== 'all' && it.status !== statusFilter) return false

      if (onlyToday) {
        const inToday = !isBefore(itEnd, today) && !isAfter(itStart, endOfDay(today))
        if (!inToday) return false
      }

      if (orderLower && !String(it.orderNo || '').toLowerCase().includes(orderLower)) return false

      if (sampleLower) {
        const samples = (it.samples || []).map(s => String(s).toLowerCase())
        if (!samples.some(s => s.includes(sampleLower))) return false
      }

      if (clientLower && !String(it.client || '').toLowerCase().includes(clientLower)) return false

      if (qLower) {
        const hay = [it.title, it.method, it.orderNo, it.client, ...(it.samples || []), ...(it.equipmentIds || [])]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(qLower)) return false
      }

      return true
    })
  }, [items, from, to, eqFilter, methodFilter, statusFilter, onlyToday, q, orderFilter, sampleFilter, clientFilter])

  /* --- Grupowanie wg sprzętu --- */
  const rows = useMemo(() => {
    const map = new Map()
    for (const it of filtered) {
      const ids = Array.isArray(it.equipmentIds) && it.equipmentIds.length ? it.equipmentIds : ['__brak__']
      for (const id of ids) {
        if (eqFilter && id !== eqFilter) continue
        const arr = map.get(id) || []
        arr.push(it)
        map.set(id, arr)
      }
    }
    const entries = [...map.entries()].sort((a, b) => {
      const ea = equipmentMap.get(a[0])?.name || 'ZZZ'
      const eb = equipmentMap.get(b[0])?.name || 'ZZZ'
      return ea.localeCompare(eb, 'pl')
    })
    return entries.map(([eqId, list]) => ({ eqId, items: list }))
  }, [filtered, eqFilter, equipmentMap])

  /* --- Kolizje na tym samym sprzęcie --- */
  const overlaps = (a, b) =>
    !(isBefore(parseISO(a.end), parseISO(b.start)) || isAfter(parseISO(a.start), parseISO(b.end)))

  const conflictsByEq = useMemo(() => {
    const out = new Map()
    for (const r of rows) {
      const list = r.items.slice().sort((a, b) => parseISO(a.start) - parseISO(b.start))
      const set = new Set()
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (overlaps(list[i], list[j])) {
            set.add(list[i].id)
            set.add(list[j].id)
          }
        }
      }
      out.set(r.eqId, set)
    }
    return out
  }, [rows])

  const conflictIdUnion = useMemo(() => {
    const s = new Set()
    for (const set of conflictsByEq.values()) for (const id of set) s.add(id)
    return s
  }, [conflictsByEq])

  /* --- Legenda metod (w zakresie i po filtrach) --- */
  const methodsInView = useMemo(() => {
    const m = new Map()
    for (const it of filtered) m.set(it.method, colorFor(it.method, paletteMode))
    return [...m.entries()]
      .map(([method, color]) => ({ method, color }))
      .sort((a, b) => a.method.localeCompare(b.method))
  }, [filtered, paletteMode])

  /* --- Scroll helpers + low motion --- */
  const viewportRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  const scrollToToday = () => {
    if (!viewportRef.current) return
    const leftPct = ((today - from) / totalMs) * 100
    const px = (leftPct / 100) * viewportRef.current.scrollWidth
    viewportRef.current.scrollTo({ left: Math.max(px - 200, 0), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  /* --- Pozycje (położenie/rozmiar w %) --- */
  const pct = date => Math.min(100, Math.max(0, ((parseISO(date) - from) / totalMs) * 100))
  const widthPct = (start, end) => Math.max(0.5, pct(end) - pct(start))

  /* === PODSUMOWANIA (KPI) === */
  const kpis = useMemo(() => {
    const total = filtered.length
    let planned = 0,
      running = 0,
      blocked = 0,
      done = 0,
      activeToday = 0
    const eqSet = new Set()
    const methodSet = new Set()
    let minStart = null
    let maxEnd = null

    for (const it of filtered) {
      if (it.status === 'planned') planned++
      else if (it.status === 'running') running++
      else if (it.status === 'blocked') blocked++
      else if (it.status === 'done') done++

      ;(it.equipmentIds || []).forEach(id => eqSet.add(id))
      if (it.method) methodSet.add(it.method)

      const s = parseISO(it.start)
      const e = parseISO(it.end)
      if (!isBefore(e, today) && !isAfter(s, endOfDay(today))) activeToday++
      if (!minStart || s < minStart) minStart = s
      if (!maxEnd || e > maxEnd) maxEnd = e
    }

    return {
      total,
      planned,
      running,
      blocked,
      done,
      activeToday,
      conflicts: conflictIdUnion.size,
      equipments: eqSet.size,
      methods: methodSet.size,
      rangeFrom: minStart,
      rangeTo: maxEnd,
    }
  }, [filtered, conflictIdUnion])

  /* === Eksport: CSV === */
  const handleExportCSV = () => {
    const cols = [
      ['ID', 'id'],
      ['Tytuł', 'title'],
      ['Metoda', 'method'],
      ['Status', 'status'],
      ['Zlecenie', 'orderNo'],
      ['Klient', 'client'],
      ['Próbki', 'samples'],
      ['Sprzęt', 'equipment'],
      ['Start', 'start'],
      ['Koniec', 'end'],
      ['Konflikt', 'conflict'],
    ]
    const equipmentName = id => equipmentMap.get(id)?.name || id
    const rowsCsv = filtered.map(it => {
      const conflict = conflictIdUnion.has(it.id) ? 'Tak' : 'Nie'
      const equip = (it.equipmentIds || []).map(equipmentName).join(', ')
      const samples = (it.samples || []).join(', ')
      return {
        id: it.id,
        title: it.title,
        method: it.method,
        status: STATUS[it.status]?.label || it.status,
        orderNo: it.orderNo || '',
        client: it.client || '',
        samples,
        equipment: equip,
        start: format(parseISO(it.start), 'yyyy-MM-dd HH:mm'),
        end: format(parseISO(it.end), 'yyyy-MM-dd HH:mm'),
        conflict,
      }
    })
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = cols.map(([label]) => esc(label)).join(';')
    const lines = rowsCsv.map(r => cols.map(([, key]) => esc(r[key])).join(';'))
    const csv = [header, ...lines].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'harmonogram_badania.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* === Eksport: ICS (per sprzęt) === */
  const [icsEqId, setIcsEqId] = useState('')
  const handleExportICS = () => {
    const TZID = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw'
    const fmtICS = d => {
      // 20250118T093000 (lokalnie; TZID w nagłówku)
      const pad = n => String(n).padStart(2, '0')
      const dt = parseISO(d)
      const Y = dt.getFullYear()
      const M = pad(dt.getMonth() + 1)
      const D = pad(dt.getDate())
      const h = pad(dt.getHours())
      const m = pad(dt.getMinutes())
      const s = pad(dt.getSeconds())
      return `${Y}${M}${D}T${h}${m}${s}`
    }
    const equipmentName = id => equipmentMap.get(id)?.name || id
    const selectedRows = rows.filter(r => !icsEqId || r.eqId === icsEqId)
    const events = []
    for (const r of selectedRows) {
      for (const it of r.items) {
        events.push(
          [
            'BEGIN:VEVENT',
            `UID:${it.id}@tests-schedule`,
            `DTSTART;TZID=${TZID}:${fmtICS(it.start)}`,
            `DTEND;TZID=${TZID}:${fmtICS(it.end)}`,
            `SUMMARY:${(it.title || '').replace(/\r?\n/g, ' ')}`,
            `DESCRIPTION:Metoda ${it.method}\\nZlecenie: ${it.orderNo || '-'}\\nKlient: ${it.client || '-'}\\nPróbki: ${
              (it.samples || []).join(', ') || '-'
            }`,
            `LOCATION:${equipmentName(r.eqId)}`,
            'END:VEVENT',
          ].join('\r\n')
        )
      }
    }
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TestsSchedule//EN',
      `X-WR-TIMEZONE:${TZID}`,
      ...events,
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `harmonogram_${icsEqId ? icsEqId : 'wszystkie'}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* === Druk / PDF === */
  const handlePrint = () => window.print()

  /* === Link do widoku === */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Skopiowano link do widoku.')
    } catch {
      // fallback
      // eslint-disable-next-line no-alert
      prompt('Skopiuj link:', window.location.href)
    }
  }

  return (
    <div className='sched-page'>
      <header className='sched-head'>
        <div className='sched-sub'>{format(today, 'EEEE, d MMMM yyyy', { locale: pl })}</div>
      </header>

      {/* === Toolbar filtrów === */}
      <section className='sched-toolbar'>
        <div className='ctl'>
          <label>Szukaj</label>
          <input
            className='inp'
            placeholder='tytuł, metoda, zlecenie, próbka, klient…'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className='ctl'>
          <label>Wyposażenie</label>
          <input
            className='inp'
            list='eq-list'
            placeholder='Wybierz…'
            value={eqFilter ? equipmentMap.get(eqFilter)?.name || eqFilter : ''}
            onChange={e => {
              const v = e.target.value
              const found = [...equipmentMap.values()].find(x => x.name === v)
              setEqFilter(found?.id || '')
            }}
          />
          <datalist id='eq-list'>
            {equipment.map(e => (
              <option key={e.id} value={e.name} />
            ))}
          </datalist>
        </div>

        <div className='ctl'>
          <label>Metoda/badanie</label>
          <input
            className='inp'
            placeholder='np. PB-101'
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
          />
        </div>

        <div className='ctl'>
          <label>Status</label>
          <select className='inp' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value='all'>Wszystkie</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className='ctl'>
          <label>Zakres</label>
          <select className='inp' value={preset} onChange={e => setPreset(e.target.value)}>
            <option value='week'>Tydzień</option>
            <option value='month'>Miesiąc</option>
            <option value='quarter'>Kwartał</option>
            <option value='custom'>Niestandardowy</option>
          </select>
        </div>

        {preset === 'custom' && (
          <>
            <div className='ctl'>
              <label>Od</label>
              <input type='date' className='inp' value={fromStr} onChange={e => setFromStr(e.target.value)} />
            </div>
            <div className='ctl'>
              <label>Do</label>
              <input type='date' className='inp' value={toStr} onChange={e => setToStr(e.target.value)} />
            </div>
          </>
        )}

        <div className='ctl'>
          <label>Zlecenie</label>
          <input
            className='inp'
            placeholder='np. ZLE/2025/091'
            value={orderFilter}
            onChange={e => setOrderFilter(e.target.value)}
          />
        </div>

        <div className='ctl'>
          <label>Nr próbki</label>
          <input
            className='inp'
            placeholder='np. S-0012'
            value={sampleFilter}
            onChange={e => setSampleFilter(e.target.value)}
          />
        </div>

        <div className='ctl'>
          <label>Klient</label>
          <input
            className='inp'
            list='clients-list'
            placeholder='np. TechSolutions…'
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
          />
          <datalist id='clients-list'>
            {uniqueClients.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className='ctl'>
          <label>Paleta</label>
          <select className='inp' value={paletteMode} onChange={e => setPaletteMode(e.target.value)}>
            <option value='default'>Domyślna</option>
            <option value='alt'>Alternatywna</option>
          </select>
        </div>

        <div className='ctl ctl--inline'>
          <label className='chk'>
            <input type='checkbox' checked={onlyToday} onChange={e => setOnlyToday(e.target.checked)} />
            Tylko trwające dziś
          </label>
          <button className='btn' onClick={scrollToToday}>
            Skocz do dziś
          </button>
        </div>
      </section>

      {/* === Akcje / eksporty === */}
      <section className='sched-actions'>
        <div className='actions-left'>
 
          <button className='btn' onClick={handlePrint}>
            Drukuj / PDF
          </button>

          <div className='ics-group'>
            <select
              className='inp'
              value={icsEqId}
              onChange={e => setIcsEqId(e.target.value)}
              title='Wybierz sprzęt do eksportu ICS'>
              <option value=''>Wszystkie sprzęty</option>
              {equipment.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <button className='btn' onClick={handleExportICS}>
              Pobierz ICS
            </button>
          </div>
        </div>

        <div className='actions-right'>
          <button className='btn btn--ghost' onClick={handleCopyLink}>
            Kopiuj link do widoku
          </button>
        </div>
      </section>

      {/* === Legenda metod === */}
      <div className='legend'>
        <span className='legend-label'>Metody:</span>
        <div className='legend-list'>
          {methodsInView.map(m => (
            <span key={m.method} className='legend-chip'>
              <span className='chip-dot' style={{ background: m.color }} />
              {m.method}
            </span>
          ))}
        </div>
      </div>

      {/* === GANTT === */}
      <section className='gantt'>
        {/* Nagłówek osi */}
        <div className='gantt-header'>
          <div className='gantt-scale'>
            {ticks.map((t, idx) => {
              const left = ((t - from) / totalMs) * 100
              const label =
                density === 'day'
                  ? format(t, 'dd.MM', { locale: pl })
                  : density === 'week'
                  ? `Tydz ${format(t, 'w', { locale: pl })}`
                  : format(t, 'LLL yyyy', { locale: pl })
              return (
                <div key={idx} className='tick' style={{ left: `${left}%` }}>
                  <span className='tick-label'>{label}</span>
                </div>
              )
            })}
            <div className='now-line' style={{ left: `${((today - from) / totalMs) * 100}%` }} />
          </div>
        </div>

        {/* Wiersze */}
        <div className='gantt-viewport' ref={viewportRef}>
          <div className='gantt-rows'>
            {rows.length === 0 && <div className='empty'>Brak dopasowanych badań w wybranym zakresie/filtrach.</div>}

            {rows.map(row => {
              const eqName = equipmentMap.get(row.eqId)?.name || '— (brak przypisania)'
              const conflicts = conflictsByEq.get(row.eqId) || new Set()

              return (
                <div key={row.eqId} className='gantt-row'>
                  <div className='lane-label' title={eqName}>
                    <div className='lane-title'>{eqName}</div>
                    {row.eqId !== '__brak__' && <button className='lane-link'>Szczegóły</button>}
                  </div>

                  <div className='lane-canvas'>
                    {ticks.map((t, idx) => {
                      const left = ((t - from) / totalMs) * 100
                      return <div key={idx} className='gridline' style={{ left: `${left}%` }} />
                    })}
                    <div className='now-line' style={{ left: `${((today - from) / totalMs) * 100}%` }} />

                    {row.items.map(it => {
                      const left = pct(it.start)
                      const w = widthPct(it.start, it.end)
                      const color = colorFor(it.method, paletteMode)
                      const st = STATUS[it.status] || STATUS.planned
                      const conflict = conflicts.has(it.id)

                      // aria: progressbar (progres wg „teraz”)
                      const start = parseISO(it.start)
                      const end = parseISO(it.end)
                      const progressNow =
                        today <= start ? 0 : today >= end ? 100 : Math.round(((today - start) / (end - start)) * 100)

                      const ariaLabel = [
                        it.title,
                        `Metoda ${it.method}`,
                        `Zlecenie ${it.orderNo || '—'}`,
                        `Klient ${it.client || '—'}`,
                        `Status ${st.label}`,
                        `Od ${format(start, 'dd.MM.yyyy HH:mm')}`,
                        `Do ${format(end, 'dd.MM.yyyy HH:mm')}`,
                        conflict ? 'Uwaga: konflikt na sprzęcie' : '',
                      ]
                        .filter(Boolean)
                        .join('. ')

                      return (
                        <div
                          key={it.id}
                          className={`gantt-item ${conflict ? 'conflict' : ''}`}
                          title={[
                            it.title,
                            `Metoda: ${it.method}`,
                            `Zlecenie: ${it.orderNo || '—'}`,
                            `Klient: ${it.client || '—'}`,
                            `Próbki: ${(it.samples || []).join(', ') || '—'}`,
                            `Sprzęt: ${(it.equipmentIds || [])
                              .map(e => equipmentMap.get(e)?.name || e)
                              .join(', ')}`,
                            `Status: ${st.label}`,
                            `Od: ${format(start, 'dd.MM.yyyy HH:mm')}`,
                            `Do: ${format(end, 'dd.MM.yyyy HH:mm')}`,
                            conflict ? '⚠ Konflikt na sprzęcie' : '',
                          ].join('\n')}
                          style={{
                            left: `${left}%`,
                            width: `${w}%`,
                            borderColor: color,
                            background: `${color}22`,
                          }}
                          role='progressbar'
                          aria-label={ariaLabel}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progressNow}
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              // podłączysz modal / nawigację
                              // eslint-disable-next-line no-console
                              console.log('open item', it)
                            }
                          }}
                          onClick={() => {
                            // podłączysz modal / nawigację
                            // eslint-disable-next-line no-console
                            console.log('open item', it)
                          }}>
                          <div className='item-bar' style={{ background: color }} />
                          <div className='item-label'>
                            <span className='item-title'>{it.title}</span>
                            <span className={`item-status item-status--${it.status}`} style={{ color: st.color }}>
                              • {st.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* === PODSUMOWANIA — NA DOLE === */}
{/* === PODSUMOWANIA === */}
<section className='sched-kpis'>
  <div className='sched-kpis-row'>
    <strong>Przegląd:</strong>
    <span>Łącznie: {kpis.total}</span>
    <span>·</span>
    <span>Trwające dziś: {kpis.activeToday}</span>
    <span>·</span>
    <span>Konflikty: {kpis.conflicts}</span>
    <span>·</span>
    <span>Sprzętów: {kpis.equipments}</span>
    <span>·</span>
    <span>Metod: {kpis.methods}</span>
  </div>

  <div className='sched-kpis-row sched-kpis-sub'>
    <strong>Statusy:</strong>
    <span>Planowane: {kpis.planned}</span>
    <span>·</span>
    <span>W trakcie: {kpis.running}</span>
    <span>·</span>
    <span>Wstrzymane: {kpis.blocked}</span>
    <span>·</span>
    <span>Zakończone: {kpis.done}</span>
  </div>

  <div className='sched-kpis-row sched-kpis-sub'>
    <strong>Okres danych:</strong>
    <span>
      {kpis.rangeFrom ? format(kpis.rangeFrom, 'dd.MM.yyyy HH:mm') : '—'} —{' '}
      {kpis.rangeTo ? format(kpis.rangeTo, 'dd.MM.yyyy HH:mm') : '—'}
    </span>
  </div>
</section>

    </div>
  )
}

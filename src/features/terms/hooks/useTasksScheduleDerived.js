import { useMemo } from 'react'
import { addDays, dFromStr, fmt, startOfWeekMon, diffDays, isWeekend, clamp, uniq } from '../utils/dates'
import { STATUS_ORDER, STATUS_CLASS } from '../utils/constants'
import { assignLanes } from '../utils/lanes'
import { typeColors } from '../utils/infer'

const LEFT_W = 280

export function useTasksScheduleDerived({
  today,
  base,
  employees,
  holidays,
  isHoliday,
  leaves,
  state,
}) {
  // święta
  const holidaySet = useMemo(
    () => new Set((holidays || []).map((d) => (typeof d === 'string' ? d : fmt(d)))),
    [holidays]
  )

  const isHolidayFn = useMemo(() => {
    if (typeof isHoliday === 'function') return (d) => !!isHoliday(d)
    return (d) => holidaySet.has(fmt(d))
  }, [isHoliday, holidaySet])

  // zakres
  const viewStart = dFromStr(state.from) || startOfWeekMon(today)
  const viewEnd = useMemo(() => addDays(viewStart, state.visibleDays - 1), [viewStart, state.visibleDays])

  const days = useMemo(
    () => Array.from({ length: state.visibleDays }, (_, i) => addDays(viewStart, i)),
    [viewStart, state.visibleDays]
  )

  // employeesList (z tasks + employees)
  const employeesList = useMemo(() => {
    const set = new Set(employees)
    base.forEach((t) => (t.assignees || []).forEach((p) => p && set.add(p)))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [base, employees])

  const kindsInBase = useMemo(() => uniq(base.map((t) => t.kind || 'zadanie')), [base])

  // filtrowanie wstępne
  const prelim = useMemo(() => {
    const norm = (s) => (s || '').toLowerCase()
    const hit = (t) =>
      norm([t.title, t.type, t.status, t.kind, ...(t.tests || []), ...(t.assignees || [])].join('|')).includes(norm(state.q))

    return base.filter((t) => {
      if (state.empF !== 'wszyscy' && !(t.assignees || []).includes(state.empF)) return false
      if (!hit(t)) return false
      if (!state.diffSet.has(t.difficulty)) return false
      if (!state.prioSet.has(t.priority)) return false
      if (state.kindSet.size && !state.kindSet.has(t.kind || 'zadanie')) return false
      return t.end >= viewStart && t.start <= viewEnd
    })
  }, [base, state.empF, state.q, state.diffSet, state.prioSet, state.kindSet, viewStart, viewEnd])

  const legendFiltered = useMemo(() => {
    return prelim.filter((t) => {
      if (state.typeQuick !== 'wszystkie' && (t.type || 'Inne') !== state.typeQuick) return false
      if (state.statusQuick.size && !state.statusQuick.has(t.status)) return false
      return true
    })
  }, [prelim, state.typeQuick, state.statusQuick])

  // heat
  const dayLoad = useMemo(() => {
    const counts = days.map((d) => {
      let c = 0
      legendFiltered.forEach((t) => {
        if (t.start <= d && t.end >= d) c++
      })
      return c
    })
    const max = Math.max(1, ...counts)
    return { counts, max }
  }, [days, legendFiltered])

  // layout day widths (chart component jeszcze nadpisze przez props)
  // tu tylko zostawiamy wyliczenia zależne od view/visibleDays (bez containerW)
  const dayW = 1
  const contentW = 1

  // rows
  const rows = useMemo(() => {
    // dayW i contentW policzymy w Chart (bo zależą od container width),
    // ale lanes + clipping (L/R) musi zostać tu -> zrobimy później w Chart na bazie raw rows.
    // Tu zwracamy “surowe” rows bez left/width.
    const map = new Map()

    legendFiltered.forEach((t) => {
      const persons = t.assignees?.length ? t.assignees : ['(nieprzypisane)']
      persons.forEach((p) => {
        if (!map.has(p)) map.set(p, [])
        map.get(p).push({ ...t })
      })
    })

    const out = []
    for (const [emp, items] of map.entries()) {
      const sorted = items.sort((a, b) => a.start - b.start || a.end - b.end)
      const withLanes = assignLanes(sorted).map((it) => ({ ...it }))
      const lanesCount = withLanes.reduce((m, it) => Math.max(m, it.lane + 1), 1)
      out.push({ emp, items: withLanes, lanesCount })
    }

    return out.sort((a, b) => b.items.length - a.items.length || a.emp.localeCompare(b.emp, 'pl'))
  }, [legendFiltered])

  const loadByEmp = useMemo(() => {
    const map = new Map()
    const workdays = days.filter((d) => !(isWeekend(d) || isHolidayFn(d))).length || 1

    rows.forEach((r) => {
      const set = new Set()
      r.items.forEach((it) => {
        const L = it.start < viewStart ? viewStart : it.start
        const R = it.end > viewEnd ? viewEnd : it.end
        for (let dd = L; dd <= R; dd = addDays(dd, 1)) {
          if (!(isWeekend(dd) || isHolidayFn(dd))) set.add(fmt(dd))
        }
      })
      map.set(r.emp, { busy: set.size, workdays })
    })

    return map
  }, [rows, days, viewStart, viewEnd, isHolidayFn])

  const summaryByEmp = useMemo(() => {
    const map = new Map()
    rows.forEach((r) => {
      const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]))
      r.items.forEach((it) => {
        const s = it.status
        if (byStatus[s] == null) byStatus[s] = 0
        byStatus[s]++
      })
      map.set(r.emp, { total: r.items.length, byStatus })
    })
    return map
  }, [rows])

  const occDotStyle = (ratio) => {
    let bg = 'var(--ts-ok)'
    if (ratio >= 0.67) bg = 'var(--ts-error)'
    else if (ratio >= 0.34) bg = 'var(--ts-warn)'
    return { display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: bg, marginRight: 6 }
  }

  const typesInScope = useMemo(() => {
    const m = new Map()
    prelim.forEach((t) => {
      const tp = t.type || 'Inne'
      m.set(tp, (m.get(tp) || 0) + 1)
    })
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [prelim])

  const kindsInScope = useMemo(() => {
    const m = new Map()
    prelim.forEach((t) => {
      const kd = t.kind || 'zadanie'
      m.set(kd, (m.get(kd) || 0) + 1)
    })
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [prelim])

  return {
    LEFT_W,
    STATUS_CLASS,

    isHolidayFn,
    holidaySet,

    viewStart,
    viewEnd,
    days,

    employeesList,
    kindsInBase,

    prelim,
    legendFiltered,

    dayLoad,

    rows, // surowe (bez left/width)
    loadByEmp,
    summaryByEmp,
    occDotStyle,

    typesInScope,
    kindsInScope,

    // placeholdery (Chart policzy realne)
    dayW,
    contentW,
  }
}
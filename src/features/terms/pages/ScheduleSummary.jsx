import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { normalizeTasks } from '../utils/normalize'
import { toMid, fmt, startOfWeekMon, dFromStr, addDays } from '../utils/dates'

import { useTasksScheduleState } from '../hooks/useTasksScheduleState'
import { useTasksScheduleDerived } from '../hooks/useTasksScheduleDerived'
import { useTasksTooltip } from '../hooks/useTasksTooltip'

import TasksScheduleToolbar from '../components/SchedulePlanner/TasksScheduleToolbar'
import TasksScheduleLegend from '../components/SchedulePlanner/TasksScheduleLegend'
import TasksScheduleChart from '../components/SchedulePlanner/TasksScheduleChart'
import TasksScheduleTooltip from '../components/SchedulePlanner/TasksScheduleTooltip'

export default function TasksSchedule({
  tasks = [],
  employees = [],
  holidays = [],
  isHoliday,
  leaves = [],
  compact = true,
  flat = false,
}) {
  const navigate = useNavigate()
  const today = toMid(new Date())

  const base = useMemo(() => normalizeTasks(tasks), [tasks])

  // ===== UI state =====
  const state = useTasksScheduleState({
    today,
    base,
    employees,
  })

  // ===== derived data (filtrowanie, wiersze, heatmapa, itd.) =====
  const derived = useTasksScheduleDerived({
    today,
    base,
    employees,
    holidays,
    isHoliday,
    leaves,
    state,
  })

  // ===== tooltip + highlight (Portal) =====
  const tooltip = useTasksTooltip()

  const rootClass = `tasksschedule${compact ? ' theme-compact' : ''}${flat ? ' theme-flat' : ''}${
    tooltip.hl ? ' hl-mode' : ''
  }`

  const gotoTask = (id) => navigate(`/zadania/moje/${id}`)

  // ===== layout measurements (ResizeObserver + wheel) =====
  const wrapRef = useRef(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const ro = new ResizeObserver((es) => {
      for (const e of es) setContainerW(Math.max(0, Math.floor(e.contentRect?.width ?? 0)))
    })
    ro.observe(el)

    const onWheel = (e) => {
      // ctrl/meta + scroll => zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 1 : -1
        state.zoomBy(delta)
        return
      }
      // pionowy scroll => poziomy
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener('wheel', onWheel)
    }
  }, [state])

  return (
    <div className={rootClass} style={{ ['--ts-left-w']: `${derived.LEFT_W}px` }}>
      {/* TOP BAR */}
      <TasksScheduleToolbar
        q={state.q}
        setQ={state.setQ}
        rangeMode={state.rangeMode}
        setRangeMode={state.setRangeMode}
        gotoDate={state.gotoDate}
        setGotoDate={state.setGotoDate}
        empF={state.empF}
        setEmpF={state.setEmpF}
        employeesList={derived.employeesList}
        visibleDays={state.visibleDays}
        zoomBy={state.zoomBy}
        clearAllFilters={() => {
          state.clearAllFilters(derived.kindsInBase)
          tooltip.hideTip()
        }}
      />

      {/* LEGENDA */}
      <TasksScheduleLegend
        hl={tooltip.hl}
        setHl={tooltip.setHl}
        typesInScope={derived.typesInScope}
        kindsInScope={derived.kindsInScope}
        typeQuick={state.typeQuick}
        setTypeQuick={state.setTypeQuick}
        statusQuick={state.statusQuick}
        setStatusQuick={state.setStatusQuick}
        diffSet={state.diffSet}
        setDiffSet={state.setDiffSet}
        prioSet={state.prioSet}
        setPrioSet={state.setPrioSet}
        kindSet={state.kindSet}
        setKindSet={state.setKindSet}
      />

      {/* WYKRES */}
      <TasksScheduleChart
        ref={wrapRef}
        today={today}
        viewStart={derived.viewStart}
        viewEnd={derived.viewEnd}
        dayW={derived.dayW}
        contentW={derived.contentW}
        days={derived.days}
        dayLoad={derived.dayLoad}
        rows={derived.rows}
        leaves={leaves}
        isHolidayFn={derived.isHolidayFn}
        occDotStyle={derived.occDotStyle}
        loadByEmp={derived.loadByEmp}
        summaryByEmp={derived.summaryByEmp}
        gotoTask={gotoTask}
        showTip={(e, it, emp) => tooltip.showTip(e, it, emp)}
        hideTip={() => tooltip.hideTip()}
        LEFT_W={derived.LEFT_W}
      />

      {/* TOOLTIP (PORTAL) */}
      <TasksScheduleTooltip tip={tooltip.tip} />

      {/* NAV pod wykresem */}
      <div className="ts-nav">
        <div className="controls">
          <button type="button" className="nav-btn pill" onClick={() => state.shiftWindowBy(-7)} title="Wstecz o tydzień">
            « 7
          </button>

          <button type="button" className="nav-btn round icon" onClick={() => state.shiftWindowBy(-1)} aria-label="Poprzedni dzień">
            ‹
          </button>

          <button type="button" className="nav-btn primary" onClick={state.gotoTodayWeek}>
            Dziś (tydz.)
          </button>

          <button type="button" className="nav-btn round icon" onClick={() => state.shiftWindowBy(1)} aria-label="Następny dzień">
            ›
          </button>

          <button type="button" className="nav-btn pill" onClick={() => state.shiftWindowBy(7)} title="Naprzód o tydzień">
            7 »
          </button>
        </div>
      </div>
    </div>
  )
}
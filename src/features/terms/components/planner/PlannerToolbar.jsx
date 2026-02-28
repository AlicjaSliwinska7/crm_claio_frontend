// src/features/terms/components/planner/PlannerToolbar.jsx
import React from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarSearch } from 'lucide-react'
import { fmt } from '../../hooks/useSchedulePlanner'

export default function PlannerToolbar({
  days,
  goPrevWeek,
  goPrevDay,
  goToday,
  goNextDay,
  goNextWeek,
  jumpToDate,
  hiddenDateInput,
  onPickDate,
}) {
  return (
    <header className="planner__toolbar planner__toolbar--inline toolbar--centered">
      <div className="toolbar__centered">
        <button className="ghost" onClick={goPrevWeek} title="– 7 dni">
          <ChevronLeft size={18} />
        </button>
        <button className="ghost" onClick={goPrevDay} title="– 1 dzień">
          <ChevronLeft size={18} />
        </button>
        <button className="primary" onClick={goToday} title="Dziś">
          <CalendarDays size={16} /> Dziś
        </button>
        <button className="ghost" onClick={goNextDay} title="+ 1 dzień">
          <ChevronRight size={18} />
        </button>
        <button className="ghost" onClick={goNextWeek} title="+ 7 dni">
          <ChevronRight size={18} />
        </button>

        <span className="toolbar__range">
          <CalendarSearch size={16} style={{ cursor: 'pointer' }} onClick={jumpToDate} />
          <span className="range-label">
            {fmt(days[0], 'd MMM yyyy')} – {fmt(days[days.length - 1], 'd MMM yyyy')}
          </span>
          <input ref={hiddenDateInput} className="datejump-input" type="date" onChange={onPickDate} />
        </span>
      </div>
    </header>
  )
}
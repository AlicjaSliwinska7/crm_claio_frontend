import React, { forwardRef, useMemo } from 'react'
import { fmt, diffDays, addDays, isWeekend, monthName } from '../../utils/dates'
import { typeColors } from '../../utils/infer'
import { STATUS_CLASS } from '../../utils/constants'

const ICON_SIZE = 16

const TasksScheduleChart = forwardRef(function TasksScheduleChart(
  {
    today,
    viewStart,
    viewEnd,
    dayW,
    contentW,
    days,
    dayLoad,
    rows,
    leaves,
    isHolidayFn,
    occDotStyle,
    loadByEmp,
    summaryByEmp,
    gotoTask,
    showTip,
    hideTip,
    LEFT_W,
  },
  ref
) {
  // UWAGA: dayW/contentW przychodzą jako propsy w Twojej starej wersji,
  // ale u nas liczymy je tu na bazie szerokości kontenera.
  // Żeby nie komplikować: liczymy lokalnie “realDayW” na podstawie ref->offsetWidth
  // (a wrapper w parent robi ResizeObserver i podaje szerokość przez CSS/props).
  // Tu przyjmujemy: contentW/dayW będą już policzone w parent.
  // Jeśli chcesz to przenieść tu — daj znać, dopnę 1:1.
  const realDayW = dayW
  const realContentW = contentW

  const computedRows = useMemo(() => {
    // Przelicz left/width teraz (zależne od realDayW i view range)
    return rows.map((r) => {
      const items = (r.items || []).map((it) => {
        const L = it.start < viewStart ? viewStart : it.start
        const R = it.end > viewEnd ? viewEnd : it.end
        const left = Math.max(0, diffDays(viewStart, L) * realDayW)
        const width = Math.max((diffDays(L, R) + 1) * realDayW - 6, realDayW - 6)
        return { ...it, left, width }
      })
      return { ...r, items }
    })
  }, [rows, viewStart, viewEnd, realDayW])

  return (
    <div className="ts-wrap" ref={ref}>
      <div className="ts-headrow">
        <div className="ts-corner" style={{ width: LEFT_W }}>
          <div className="c-month">
            {days[0] && monthName(days[0])}
            {days[0] && monthName(days[0]) !== monthName(days[days.length - 1]) ? ` / ${monthName(days[days.length - 1])}` : ''}
          </div>
          <div className="c-range">
            {fmt(viewStart)} – {fmt(viewEnd)}
          </div>
        </div>

        <div className="ts-headcells" style={{ width: realContentW }}>
          <div className="ts-heat">
            {days.map((day, idx) => {
              const val = dayLoad.counts[idx]
              const pct = Math.round((val / dayLoad.max) * 100)
              const isW = isWeekend(day)
              const isH = isHolidayFn(day)

              return (
                <div
                  key={`h-${fmt(day)}`}
                  className={`heat-cell ${isW ? 'is-weekend' : ''} ${isH ? 'is-holiday' : ''}`}
                  style={{ width: realDayW }}
                  title={`Zadań: ${val}`}
                >
                  <span className="heat-count">{val}</span>
                  <div className="heat-bar wide" style={{ height: `${pct}%` }} />
                </div>
              )
            })}
          </div>

          <div className="ts-headerline">
            {days.map((day) => (
              <div
                key={fmt(day)}
                className={`ts-col ${isWeekend(day) ? 'is-weekend' : ''} ${isHolidayFn(day) ? 'is-holiday' : ''}`}
                style={{ width: realDayW }}
              >
                <div className="ts-col-day">{String(day.getDate()).padStart(2, '0')}</div>
                <div className="ts-col-dow">{day.toLocaleDateString('pl-PL', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ts-rows">
        {computedRows.map((row) => {
          const load = loadByEmp.get(row.emp) || { busy: 0, workdays: 1 }
          const ratio = load.workdays ? load.busy / load.workdays : 0
          const loadPct = Math.round(ratio * 100)
          const sum = summaryByEmp.get(row.emp) || { total: 0, byStatus: {} }

          return (
            <div className="ts-row" key={row.emp}>
              <div className="ts-name">
                <span style={occDotStyle(ratio)} />
                <div className="name">{row.emp}</div>

                <div className="emp-summary" title={`${sum.total} zadań`}>
                  <span className="pill total">∑ {sum.total}</span>
                  {Object.entries(sum.byStatus || {})
                    .filter(([, v]) => v > 0)
                    .map(([s, v]) => (
                      <span key={s} className={`pill status-pill ${STATUS_CLASS[s] || ''}`}>
                        {v}
                      </span>
                    ))}
                </div>

                <div className="flex-spacer" />
                <div className="load" title={`Obciążenie: ${load.busy}/${load.workdays} (${loadPct}%)`}>
                  <div className="loadbar" style={{ width: `${loadPct}%` }} />
                </div>
              </div>

              <div className="ts-lane" style={{ width: realContentW, height: Math.max(48, row.lanesCount * 48) }}>
                {days.map((day) => (
                  <div
                    key={`g-${row.emp}-${fmt(day)}`}
                    className={`ts-gridcell ${isWeekend(day) ? 'is-weekend' : ''} ${isHolidayFn(day) ? 'is-holiday' : ''}`}
                    style={{ width: realDayW }}
                  />
                ))}

                {(leaves || [])
                  .filter((l) => (l.person || l.employee || l.assignee) === row.emp)
                  .map((l, i) => {
                    const s = l.from ? new Date(l.from) : null
                    const e = l.to ? new Date(l.to) : null
                    if (!s || !e) return null
                    if (e < viewStart || s > viewEnd) return null

                    const L = s < viewStart ? viewStart : s
                    const R = e > viewEnd ? viewEnd : e
                    const left = diffDays(viewStart, L) * realDayW
                    const width = (diffDays(L, R) + 1) * realDayW - 6

                    return (
                      <div key={`${row.emp}-leave-${i}`} className="ts-leave" style={{ left, width: Math.max(8, width) }}>
                        <span className="ts-leave-label">{l.type || 'Urlop'}</span>
                      </div>
                    )
                  })}

                {row.items.map((it) => {
                  const sClass = STATUS_CLASS[it.status] || 'status--assigned'
                  const col = typeColors(it.type || it.kind || '')
                  return (
                    <button
                      key={`${row.emp}-${it.id}-${it.lane}`}
                      className={`ts-bar ${sClass} diff-${it.difficulty} prio-${it.priority}`}
                      style={{ left: it.left, width: it.width, top: 6 + it.lane * 48, '--chip-dot': col.dot }}
                      onClick={() => gotoTask(it.id)}
                      onMouseEnter={(e) => showTip(e, it, row.emp)}
                      onMouseLeave={hideTip}
                      type="button"
                      aria-label={it.title}
                      title={`${it.title} (${fmt(it.start)}–${fmt(it.end)})`}
                    >
                      <div className="bar-label">
                        <span className="title">{it.title}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* dzisiejsza linia */}
      {today >= viewStart && today <= viewEnd && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: LEFT_W + diffDays(viewStart, today) * realDayW,
            width: 1,
            background: 'var(--ts-error)',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
})

export default TasksScheduleChart
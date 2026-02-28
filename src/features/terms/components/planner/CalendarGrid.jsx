// src/features/terms/components/planner/CalendarGrid.jsx
import React from 'react'
import { isSameDay } from 'date-fns'
import { PencilLine } from 'lucide-react'
import { pl } from 'date-fns/locale'

import {
  SLOT_META,
  SHIFT_META,
  fmt,
  iso,
  setGroupDrag,
} from '../../hooks/useSchedulePlanner'

export default function CalendarGrid({
  days,
  dayMeetings,
  dayAlerts,
  dayOther,
  dayDeadlineFlags,

  userShifts,

  selectDay,

  tasksByDaySlot,
  badgesForSlot,
  badgeFillClassForGroup,
  typeToBadgeClass,

  dragKey,
  isPastDay,
  allow,
  dropTo,
  onDropSlot,

  setEditor,
}) {
  return (
    <div className="plan-grid">
      <div className="grid__header">
        <div className="grid__corner">Dzień / Slot</div>
        {SLOT_META.map((s) => (
          <div key={s.key} className="grid__slothead" role="columnheader" title={s.label}>
            <span className="sloticon" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="sr-only">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid__body">
        {days.map((d) => {
          const dayISO = iso(d)
          const meets = dayMeetings(d)
          const alerts = dayAlerts(d)
          const other = dayOther(d)
          const { hasTodayDeadline, hasOverdue } = dayDeadlineFlags.get(dayISO) || {}

          const shiftKey = userShifts?.[dayISO]
          const shiftMeta = shiftKey ? SHIFT_META[shiftKey] : null

          return (
            <div className="grid__row" key={dayISO}>
              <div
                className={[
                  'grid__day',
                  isSameDay(d, new Date()) ? 'is-today' : '',
                  hasOverdue ? 'is-overdue' : hasTodayDeadline ? 'has-deadline' : '',
                ]
                  .join(' ')
                  .trim()}
                onClick={() => selectDay(d)}
                title="Pokaż szczegóły dnia"
              >
                <div className="day__name">{fmt(d, 'EEEE', pl)}</div>
                <div className="day__date">{fmt(d, 'd MMM')}</div>

                <div className="day__badges">
                  {shiftMeta && (
                    <span className="daybadge daybadge--shift" title={shiftMeta.label} style={{ background: shiftMeta.bg }}>
                      {shiftMeta.short}
                    </span>
                  )}

                  {meets.length > 0 && (
                    <span className="daybadge daybadge--meeting has-card" title="Spotkania">
                      📅<span className="daybadge__count">{meets.length}</span>
                      <span className="tipcard tipcard--mini">
                        <div className="tipcard__head">
                          <b>Spotkania</b>
                        </div>
                        <div className="tipcard__body">
                          {meets.slice(0, 5).map((m) => (
                            <div key={m.id} className="tip-line">
                              {m.time} — {m.title}
                            </div>
                          ))}
                          {meets.length > 5 && <div className="tip-more">+{meets.length - 5} więcej…</div>}
                        </div>
                      </span>
                    </span>
                  )}

                  {alerts.length > 0 && (
                    <span className="daybadge daybadge--alert has-card" title="Powiadomienia">
                      🔔<span className="daybadge__count">{alerts.length}</span>
                      <span className="tipcard tipcard--mini">
                        <div className="tipcard__head">
                          <b>Powiadomienia</b>
                        </div>
                        <div className="tipcard__body">
                          {alerts.slice(0, 5).map((n) => (
                            <div key={n.id} className="tip-line">
                              {n.time} — {n.title}
                            </div>
                          ))}
                          {alerts.length > 5 && <div className="tip-more">+{alerts.length - 5} więcej…</div>}
                        </div>
                      </span>
                    </span>
                  )}

                  {other.length > 0 && (
                    <span className="daybadge daybadge--other has-card" title="Inne">
                      💬<span className="daybadge__count">{other.length}</span>
                      <span className="tipcard tipcard--mini">
                        <div className="tipcard__head">
                          <b>Inne</b>
                        </div>
                        <div className="tipcard__body">
                          {other.slice(0, 5).map((o) => (
                            <div key={o.id} className="tip-line">
                              {o.time} — {o.title}
                            </div>
                          ))}
                          {other.length > 5 && <div className="tip-more">+{other.length - 5} więcej…</div>}
                        </div>
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {SLOT_META.map((s) => {
                const key = `${dayISO}:${s.key}`
                const items = tasksByDaySlot.get(key) || []
                const over = dragKey === key
                const { visible, extra } = badgesForSlot(items)

                const allowHere = (e) => {
                  if (!isPastDay(d)) allow(e, key)
                }
                const dropHere = (e) => onDropSlot(e, d, s.key)

                return (
                  <div
                    key={s.key}
                    className={`grid__cell ${over ? 'is-over' : ''} ${isPastDay(d) ? 'is-disabled' : ''}`}
                    onDragEnter={allowHere}
                    onDragOver={allowHere}
                    onDrop={dropTo(dropHere)}
                    title={isPastDay(d) ? 'Planowanie w przeszłości jest zablokowane' : undefined}
                  >
                    <div className="slot__items">
                      {items.length === 0 && (
                        <div className="slot__placeholder">{isPastDay(d) ? 'Przeszłość' : 'Upuść tutaj'}</div>
                      )}

                      {items.length > 0 && (
                        <div className="slot__summary">
                          {visible.map((g, idx) => {
                            const tipList = g.list.slice(0, 4)
                            const more = Math.max(0, g.list.length - tipList.length)
                            return (
                              <span
                                key={`${g.type}-${idx}`}
                                className={`count-badge ${badgeFillClassForGroup(g)} ring--status-${g.ringStatus} has-card`}
                                draggable={!isPastDay(d)}
                                onDragStart={(e) => !isPastDay(d) && setGroupDrag(e, { dayISO, slotKey: s.key, type: g.type })}
                                title={`${g.type} • ${g.count}`}
                              >
                                {g.count}
                                <span className="tipcard">
                                  <div className="tipcard__head">
                                    <span className={`tip-dot ${typeToBadgeClass(g.type)}`} />
                                    <b>{g.type}</b>
                                    <span className={`tip-status tip-${g.ringStatus}`}>{g.ringStatus}</span>
                                  </div>
                                  <div className="tipcard__body">
                                    {tipList.map((txt, i) => (
                                      <div key={i} className="tip-line">
                                        • {txt}
                                      </div>
                                    ))}
                                    {more > 0 && <div className="tip-more">+{more} więcej…</div>}
                                  </div>
                                </span>
                              </span>
                            )
                          })}

                          {extra > 0 && (
                            <span className="count-badge has-card" title={`+${extra}`}>
                              +{extra}
                              <span className="tipcard">
                                <div className="tipcard__head">
                                  <b>Inne rodzaje</b>
                                </div>
                                <div className="tipcard__body">Przenieś/otwórz, aby zobaczyć szczegóły.</div>
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                      <button className="slot__editbtn" title="Edytuj slot" onClick={() => setEditor({ dayISO, slotKey: s.key })}>
                        <PencilLine size={14} />
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
  )
}
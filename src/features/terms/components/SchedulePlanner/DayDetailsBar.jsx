// src/features/terms/components/planner/DayDetailsBar.jsx
import React from 'react'
import { Users, Bell, MessageSquare, CheckSquare } from 'lucide-react'
import { pl } from 'date-fns/locale'
import { SLOT_META, SHIFT_META, fmt, iso } from '../../hooks/schedulePlanner/useSchedulePlanner'

export default function DayDetailsBar({
  selectedDay,
  userShifts,
  dayMeetings,
  dayAlerts,
  dayOther,
  tasksByDaySlot,
  onTaskOpenRoute,
}) {
  return (
    <section className="daydetails daydetails--bar">
      <div className="daydetails__head">
        <div className="daydetails__date">
          {fmt(selectedDay, 'EEEE, d MMM yyyy', pl)}
          {userShifts?.[iso(selectedDay)] && (
            <span className="daydetails__meta" style={{ marginLeft: 8 }}>
              • Zmiana: {SHIFT_META[userShifts[iso(selectedDay)]]?.label || userShifts[iso(selectedDay)]}
            </span>
          )}
        </div>
        <div className="daydetails__meta">Szczegóły dnia</div>
      </div>

      <div className="daydetails__body daydetails__body--bar">
        {/* Spotkania */}
        <section className="detail-section detail--meetings">
          <div className="detail-section__head">
            <span>
              <Users size={14} style={{ marginRight: 6 }} /> Spotkania
            </span>
            <button className="addbtn" title="Dodaj spotkanie">
              +
            </button>
          </div>
          {(() => {
            const arr = dayMeetings(selectedDay)
            return arr.length ? (
              arr.map((m) => (
                <div key={m.id} className="detail-item">
                  <span className="chip__deadline">{m.time}</span>
                  <span>{m.title}</span>
                </div>
              ))
            ) : (
              <div className="detail-empty">Brak</div>
            )
          })()}
        </section>

        {/* Powiadomienia */}
        <section className="detail-section detail--alerts">
          <div className="detail-section__head">
            <span>
              <Bell size={14} style={{ marginRight: 6 }} /> Powiadomienia
            </span>
            <button className="addbtn" title="Dodaj powiadomienie">
              +
            </button>
          </div>
          {(() => {
            const arr = dayAlerts(selectedDay)
            return arr.length ? (
              arr.map((n) => (
                <div key={n.id} className="detail-item">
                  <span className="chip__deadline">{n.time}</span>
                  <span>{n.title}</span>
                </div>
              ))
            ) : (
              <div className="detail-empty">Brak</div>
            )
          })()}
        </section>

        {/* Inne */}
        <section className="detail-section detail--other">
          <div className="detail-section__head">
            <span>
              <MessageSquare size={14} style={{ marginRight: 6 }} /> Inne
            </span>
            <button className="addbtn" title="Dodaj inne">
              +
            </button>
          </div>
          {(() => {
            const arr = dayOther(selectedDay)
            return arr.length ? (
              arr.map((o) => (
                <div key={o.id} className="detail-item">
                  <span className="chip__deadline">{o.time}</span>
                  <span>{o.title}</span>
                </div>
              ))
            ) : (
              <div className="detail-empty">Brak</div>
            )
          })()}
        </section>

        {/* Zadania — pełna szerokość, z podziałem na pory dnia */}
        <section className="detail-section detail--tasks">
          <div className="detail-section__head">
            <span>
              <CheckSquare size={14} style={{ marginRight: 6 }} /> Zadania
            </span>
          </div>

          {SLOT_META.map((k) => {
            const kKey = `${iso(selectedDay)}:${k.key}`
            const items = tasksByDaySlot.get(kKey) || []
            return (
              <div key={k.key} className="detail-subslot">
                <div className="detail-subslot__title">{k.label}</div>
                {items.length ? (
                  items.map((t) => (
                    <div key={`${k.key}-${t.id}`} className="detail-item" onClick={() => onTaskOpenRoute(t)}>
                      <span className="chip__deadline">{t.deadline ? fmt(new Date(t.deadline), 'dd LLL') : '—'}</span>
                      <span>{t.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="detail-empty">Brak</div>
                )}
              </div>
            )
          })}
        </section>
      </div>
    </section>
  )
}
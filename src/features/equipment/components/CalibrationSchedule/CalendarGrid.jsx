import React, { useMemo, useState } from 'react'
import { addMonths, subMonths, startOfMonth, isBefore, isWeekend, format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { DND_MIME, LEGEND_LABELS } from '../../config/calibration.config'

const safeFormat = (val, mask, opts) => { try { return format(val, mask, opts) } catch { return '—' } }

const normalizeStatusKey = (key) => {
  if (!key) return ''
  const k = String(key)
  if (k === 'due_soon' || k === 'overdue' || k === 'in_progress') return k
  switch (k) {
    case 'dueSoon': case 'due-soon': case 'DUE_SOON': return 'due_soon'
    case 'inProgress': case 'in-progress': case 'progress': case 'IN_PROGRESS': return 'in_progress'
    default: return k
  }
}

export default function CalendarGrid({
  cursor,
  setCursor,
  days,
  byNext,
  byPlannedSend,
  byPlannedReturn,
  onDayClick,
  onDayDrop,
  onDayAllowDrop,
  isHolidayDate,
  onOpenInspect,
  STATUS_COLOR,
  COLOR_PLANNED_SEND,
  COLOR_PLANNED_RETURN,
}) {
  const prev = () => setCursor(d => subMonths(d, 1))
  const next = () => setCursor(d => addMonths(d, 1))
  const goToday = () => setCursor(new Date())
  const todayD = new Date()

  const monthStart = startOfMonth(cursor)
  const fmtKey = d => safeFormat(d, 'yyyy-MM-dd')
  const isToday = d => fmtKey(d) === fmtKey(todayD)
  const isPast = d => {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const tt = new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate())
    return isBefore(dd, tt)
  }

  // tooltip nad kropką
  const [tip, setTip] = useState(null)
  const showTip = (evt, text) => {
    const rect = evt.currentTarget.getBoundingClientRect()
    setTip({ x: rect.left + rect.width / 2, y: rect.top - 6, text })
  }
  const hideTip = () => setTip(null)

  // blokuj klik dnia podczas DnD
  const [isDraggingDot, setIsDraggingDot] = useState(false)

  const setDotDragPayload = (e, entryId, fromDateKey) => {
    const payload = JSON.stringify({ kind: 'entry', id: entryId, fromDate: fromDateKey })
    try { e.dataTransfer.setData(DND_MIME, payload) } catch {}
    e.dataTransfer.setData('text/plain', entryId) // fallback
    e.dataTransfer.effectAllowed = 'move'
    setIsDraggingDot(true)
  }
  const setRingDragPayload = (e, entryId, type, fromDateKey) => {
    const payload = JSON.stringify({ kind: type, id: entryId, fromDate: fromDateKey })
    try { e.dataTransfer.setData(DND_MIME, payload) } catch {}
    e.dataTransfer.effectAllowed = 'move'
    setIsDraggingDot(true)
  }

  const LABELS = useMemo(() => LEGEND_LABELS, [])

  return (
    <div className='cc-cal'>
      <div className='cc-header'>
        <div className='cc-title'>{safeFormat(cursor, 'LLLL yyyy', { locale: pl })}</div>
        <div className='cc-nav'>
          <button className='cc-btn' onClick={prev} aria-label='Poprzedni miesiąc'>‹</button>
          <button className='cc-btn' onClick={goToday}>Dzisiaj</button>
          <button className='cc-btn' onClick={next} aria-label='Następny miesiąc'>›</button>
        </div>
      </div>

      <div className='cc-grid cc-grid--head'>
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
          <div key={d} className='cc-weekday'>{d}</div>
        ))}
      </div>

      <div className='cc-grid'>
        {days.map(d => {
          const dateKey = fmtKey(d)
          const entries = byNext.get(dateKey) || []
          const sends   = byPlannedSend.get(dateKey) || []
          const returns = byPlannedReturn.get(dateKey) || []

          const isOtherMonth = d.getMonth() !== monthStart.getMonth()
          const weekend = isWeekend(d)
          const holiday = isHolidayDate(d)
          const todayFlag = isToday(d)
          const disabled = isPast(d) || weekend || holiday

          const classes = [
            'cc-day',
            isOtherMonth ? 'is-muted' : '',
            todayFlag ? 'is-today' : '',
            weekend ? 'is-weekend' : '',
            holiday ? 'is-holiday' : '',
            disabled ? 'is-disabled' : '',
          ].join(' ').trim()

          const tipText = `${[isPast(d) ? 'Przeszłość' : null, weekend ? 'Weekend' : null, holiday ? 'Święto' : null].filter(Boolean).join(' / ')} — niedostępne`

          return (
            <div
              key={dateKey}
              className={classes}
              onClick={() => { if (!isDraggingDot) onDayClick(d) }}
              onDragOver={e => { e.preventDefault(); try { e.dataTransfer.dropEffect = 'move' } catch {}; onDayAllowDrop?.(e) }}
              onDrop={e => { e.preventDefault(); setIsDraggingDot(false); onDayDrop(e, d) }}
              title={disabled ? tipText : 'Kliknij, aby zaplanować wysyłkę na ten dzień'}
            >
              <div className='cc-date'>{safeFormat(d, 'd')}</div>

              <button
                type='button'
                className='inspect'
                onClick={e => { e.stopPropagation(); onOpenInspect(d) }}
                aria-label='Szczegóły dnia'
              >
                <i className='fas fa-search' />
              </button>

              <div className='cc-dots'>
                {entries.map((eItem, i) => {
                  const norm = normalizeStatusKey(eItem._status)
                  const dotColor = (norm && STATUS_COLOR && STATUS_COLOR[norm]) || '#6a7f96'
                  const hoverText = `${eItem.code || eItem.id} • ${eItem.name || ''}${eItem.shippingPlace ? ` • ${eItem.shippingPlace}` : ''}`

                  return (
                    <span
                      key={`n-${i}`}
                      role='button'
                      tabIndex={-1}
                      className='cc-dot'
                      style={{ background: dotColor }}
                      aria-label={hoverText}
                      draggable
                      onMouseDown={ev => ev.stopPropagation()}
                      onClick={ev => ev.stopPropagation()}
                      onMouseEnter={ev => showTip(ev, hoverText)}
                      onMouseLeave={hideTip}
                      onFocus={ev => showTip(ev, hoverText)}
                      onBlur={hideTip}
                      onDragStart={ev => setDotDragPayload(ev, eItem.id, dateKey)}
                      onDragEnd={() => { setIsDraggingDot(false); hideTip() }}
                      title={hoverText}
                    />
                  )
                })}

                {sends.map((eItem, i) => (
                  <span
                    key={`s-${i}`}
                    className='cc-ring'
                    style={{ borderColor: COLOR_PLANNED_SEND || '#7e57c2' }}
                    draggable
                    onMouseDown={ev => ev.stopPropagation()}
                    onClick={ev => ev.stopPropagation()}
                    onDragStart={ev => setRingDragPayload(ev, eItem.id, 'send', dateKey)}
                    onDragEnd={() => setIsDraggingDot(false)}
                    title={`${eItem.code || eItem.id} • plan wysyłki`}
                  />
                ))}

                {returns.map((eItem, i) => (
                  <span
                    key={`r-${i}`}
                    className='cc-ring'
                    style={{ borderColor: COLOR_PLANNED_RETURN || '#14b8a6' }}
                    draggable
                    onMouseDown={ev => ev.stopPropagation()}
                    onClick={ev => ev.stopPropagation()}
                    onDragStart={ev => setRingDragPayload(ev, eItem.id, 'return', dateKey)}
                    onDragEnd={() => setIsDraggingDot(false)}
                    title={`${eItem.code || eItem.id} • plan zwrotu`}
                  />
                ))}
              </div>

              {disabled && <div className='cal-tip cc-tip'>{tipText}</div>}
            </div>
          )
        })}
      </div>

      <div className='cc-legend'>
        <div className='lg'><span className='sw' style={{ background: STATUS_COLOR?.['due_soon'] }} /> {LABELS.due_soon}</div>
        <div className='lg'><span className='sw' style={{ background: STATUS_COLOR?.['overdue'] }} /> {LABELS.overdue}</div>
        <div className='lg'><span className='ring' style={{ borderColor: COLOR_PLANNED_SEND }} /> Plan wysyłki</div>
        <div className='lg'><span className='ring' style={{ borderColor: COLOR_PLANNED_RETURN }} /> Plan zwrotu</div>
      </div>

      {tip && (
        <div className='cc-hovercard' style={{ left: `${tip.x}px`, top: `${tip.y}px` }} role='tooltip'>
          {tip.text}
        </div>
      )}
    </div>
  )
}

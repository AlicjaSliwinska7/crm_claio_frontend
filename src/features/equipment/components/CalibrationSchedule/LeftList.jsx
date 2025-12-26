import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
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

export default function LeftList({
  leftPreset,
  setLeftPreset,
  leftIncludeOverdue,
  setLeftIncludeOverdue,
  toCalibrate,
  STATUS_COLOR,
  onDropToLeftList, // (payload)
}) {
  const [leftDropHot, setLeftDropHot] = useState(false)
  const LABELS = useMemo(() => LEGEND_LABELS, [])

  const statusClassName = norm =>
    norm === 'overdue' ? 'cc-row--overdue'
    : norm === 'in_progress' ? 'cc-row--in-progress'
    : norm === 'due_soon' ? 'cc-row--due-soon'
    : ''

  const onDragOverLeft = e => { e.preventDefault(); setLeftDropHot(true); try { e.dataTransfer.dropEffect = 'move' } catch {} }
  const onDragLeaveLeft = () => setLeftDropHot(false)
  const onDropLeft = e => {
    e.preventDefault(); setLeftDropHot(false)
    const typed = e.dataTransfer.getData(DND_MIME)
    if (!typed) return
    try { onDropToLeftList?.(JSON.parse(typed)) } catch {}
  }

  return (
    <aside
      className={`cc-left ${leftDropHot ? 'is-drop-hot' : ''}`}
      onDragOver={onDragOverLeft}
      onDragLeave={onDragLeaveLeft}
      onDrop={onDropLeft}
    >
      <div className='head'>
        <h4>Do wzorcowania</h4>
      </div>

      <div className='head-controls' style={{ gap: 8 }}>
        <select
          className='training-filter-select'
          style={{ flex: 1, minWidth: 0 }}
          value={leftPreset}
          onChange={e => setLeftPreset(e.target.value)}
          title='Zakres listy'
        >
          <option value='7'>Najbliższy tydzień</option>
          <option value='30'>Najbliższy miesiąc</option>
          <option value='90'>Najbliższy kwartał</option>
        </select>

        <div className='toggle-with-tip' title='Pokaż przeterminowane w lewej liście' style={{ gap: 8 }}>
          <input
            id='toggle-overdue'
            type='checkbox'
            className='toggle'
            checked={leftIncludeOverdue}
            onChange={e => setLeftIncludeOverdue(e.target.checked)}
          />
          <label htmlFor='toggle-overdue' className='toggle-ui' aria-hidden='true' />
        </div>
      </div>

      <ul className='cc-list'>
        {toCalibrate.length === 0 ? (
          <li className='cc-empty'>Brak pozycji do zaplanowania.</li>
        ) : (
          toCalibrate.map(x => {
            const norm = normalizeStatusKey(x._status)
            const color = (norm && STATUS_COLOR && STATUS_COLOR[norm]) || undefined
            const label = LABELS[norm] || '—'
            return (
              <li
                key={x.id}
                className={`cc-row ${statusClassName(norm)}`}
                style={color ? { '--cc-st': color } : undefined}
                draggable
                onDragStart={e => {
                  // drag z lewej → tylko id (kompatybilność ze starym handlem)
                  e.dataTransfer.setData('text/plain', x.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                title='Przeciągnij na dzień w kalendarzu, aby zaplanować wysyłkę'
              >
                <div className='cc-row__head'>
                  <span className='cc-code'>{x.code || x.id}</span>
                  <span className='cc-row__name' title={x.name}>{x.name}</span>
                  <span className='cc-chip' aria-hidden='true'>{label}</span>
                </div>

                <div className='cc-row__meta'>
                  <span className='cc-place' title={x.shippingPlace || '—'}>
                    {x.shippingPlace || '—'}
                  </span>
                  <span className='cc-date'>
                    {x.nextCalibration
                      ? safeFormat(new Date(x.nextCalibration), 'dd.MM.yyyy', { locale: pl })
                      : '—'}
                  </span>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </aside>
  )
}

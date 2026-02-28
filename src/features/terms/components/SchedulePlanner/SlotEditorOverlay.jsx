// src/features/terms/components/planner/SlotEditorOverlay.jsx
import React from 'react'
import { parseISO, startOfDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CornerUpLeft, Trash2, X } from 'lucide-react'
import { SLOT_META, fmt, today } from '../../hooks/schedulePlanner/useSchedulePlanner'

export default function SlotEditorOverlay({
  editor,
  setEditor,

  tasksByDaySlot,
  removeTaskPlacement,
  assignWithDeadlineCheck,
  onTaskOpenRoute,
  modalApi,
}) {
  if (!editor) return null

  const key = `${editor.dayISO}:${editor.slotKey}`
  const items = tasksByDaySlot.get(key) || []

  const close = () => setEditor(null)
  const moveAllToBacklog = () => {
    items.forEach((t) => removeTaskPlacement(t.id))
    close()
  }

  const handleChangeDate = async (taskId, newISO) => {
    const dt = parseISO(newISO)
    if (startOfDay(dt) < today()) {
      await modalApi?.alert?.({
        tone: 'warn',
        title: 'Nie można zaplanować wstecz',
        message: 'Nie planujemy w przeszłość.',
      })
      return
    }
    await assignWithDeadlineCheck(taskId, newISO, editor.slotKey)
  }

  const handleChangeSlot = async (taskId, newSlot) => {
    await assignWithDeadlineCheck(taskId, editor.dayISO, newSlot)
  }

  return (
    <div className="sloteditor__backdrop" onClick={close}>
      <div className="sloteditor__panel" onClick={(e) => e.stopPropagation()}>
        <div className="sloteditor__head">
          <div>
            <b>{fmt(parseISO(editor.dayISO), 'EEEE, d MMM yyyy', pl)}</b>
            <span className="sloteditor__sub"> • {SLOT_META.find((s) => s.key === editor.slotKey)?.label}</span>
          </div>

          <div className="sloteditor__actions">
            <button className="ghost" onClick={moveAllToBacklog} title="Wszystko do backlogu">
              <CornerUpLeft size={14} /> Do backlogu
            </button>
            <button className="ghost" onClick={close} title="Zamknij">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="sloteditor__body">
          {items.length === 0 && <div className="empty">Brak zadań w tym slocie</div>}

          {items.map((t) => (
            <div className="se-item" key={t.id}>
              <div className="se-title" onClick={() => onTaskOpenRoute(t)} title="Otwórz szczegóły">
                <span className="chip__deadline">{t.deadline ? fmt(new Date(t.deadline), 'dd LLL') : '—'}</span>
                <span className="se-title__txt">{t.title}</span>
              </div>

              <div className="se-controls">
                <select value={editor.slotKey} onChange={(e) => handleChangeSlot(t.id, e.target.value)} title="Przenieś do innego slotu">
                  {SLOT_META.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <input type="date" value={editor.dayISO} onChange={(e) => handleChangeDate(t.id, e.target.value)} title="Zmień dzień" />

                <button className="chip__remove" onClick={() => removeTaskPlacement(t.id)} title="Usuń z dnia/slotu">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
// src/features/notifications/components/AddNotificationModal.jsx
import React, { useState } from 'react'
import Modal from '../../../shared/modals/modals/Modal'
import '../../../shared/modals/styles/form-modal.css'

const todayISODate = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AddNotificationModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    date: todayISODate(),
    time: '09:00',         // ⇐ nowość
    type: 'reminder',      // ⇐ nowość
  })

  const formId = 'add-notification-form'

  const reset = () =>
    setForm({
      title: '',
      message: '',
      date: todayISODate(),
      time: '09:00',
      type: 'reminder',
    })

  const handleSubmit = (e) => {
    e?.preventDefault?.()

    const title = form.title.trim()
    const date = (form.date || '').trim()
    const time = (form.time || '09:00').trim()
    if (!title || !date) return

    onSubmit?.({
      title,
      message: form.message?.trim() || '',
      date,   // yyyy-mm-dd
      time,   // hh:mm
      type: form.type || 'reminder',
    })

    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dodaj powiadomienie"
      showClose
      className="ui-modal"
      size="md"
      ariaLabel="Dodaj powiadomienie"
    >
      <form id={formId} className="m-form" onSubmit={handleSubmit}>
        {/* tytuł */}
        <div className="m-field">
          <label className="m-label" htmlFor="nt-title">
            Tytuł (wymagany)
          </label>
          <input
            id="nt-title"
            className="m-input"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Np. Oddzwonić do klienta"
            required
          />
        </div>

        {/* opis */}
        <div className="m-field">
          <label className="m-label" htmlFor="nt-message">
            Opis (opcjonalnie)
          </label>
          <textarea
            id="nt-message"
            className="m-textarea"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Dodatkowe szczegóły…"
          />
        </div>

        {/* wiersz z datą, godziną i typem */}
        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor="nt-date">
              Dzień (wymagany)
            </label>
            <input
              id="nt-date"
              className="m-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor="nt-time">
              Godzina
            </label>
            <input
              id="nt-time"
              className="m-input"
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>
        </div>

        <div className="m-field" style={{ marginTop: 4 }}>
          <label className="m-label" htmlFor="nt-type">
            Typ powiadomienia
          </label>
          <select
            id="nt-type"
            className="m-select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="reminder">Przypomnienie</option>
            <option value="task">Zadanie</option>
            <option value="post">Post</option>
            <option value="training">Szkolenie</option>
            <option value="meeting">Spotkanie</option>
          </select>
        </div>
      </form>

      <div className="m-actions--footer">
        <button type="button" className="m-btn m-btn--secondary" onClick={onClose}>
          Anuluj
        </button>
        <button type="submit" form={formId} className="m-btn m-btn--primary">
          Zapisz
        </button>
      </div>
    </Modal>
  )
}

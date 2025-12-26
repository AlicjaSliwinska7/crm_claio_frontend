// src/components/pages/forms/AppointmentForm.jsx
import React, { useMemo } from 'react'

const EMPTY_APPOINTMENT = {
  id: '',
  topic: '',
  date: '',
  time: '',
  status: 'planowane',
  place: '',
  arrangements: '',
  members: [],
}

// Klucze i etykiety spójne z APPOINTMENT_STATUSES w appointments.config
const STATUS_OPTIONS = [
  { key: 'planowane', label: 'Planowane' },
  { key: 'wtrakcie', label: 'W trakcie' },
  { key: 'zakonczone', label: 'Zakończone' },
  { key: 'odwolane', label: 'Odwołane' },
]

function normalizeMembers(m) {
  if (Array.isArray(m)) return m
  if (typeof m === 'string') {
    return m
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

export default function AppointmentForm({
  appointment = EMPTY_APPOINTMENT,
  setAppointment = () => {},
  onSubmit = (e) => e.preventDefault(),
  onClose = () => {},
  users = [],
}) {
  // zawsze pełny, znormalizowany obiekt do pól formularza
  const appt = useMemo(() => {
    const a = appointment || {}
    return {
      id: String(a.id ?? ''),
      topic: String(a.topic ?? ''),
      date: String(a.date ?? ''),
      time: String(a.time ?? ''),
      status: String(a.status ?? 'planowane'),
      place: String(a.place ?? ''),
      arrangements: String(a.arrangements ?? ''),
      members: normalizeMembers(a.members),
    }
  }, [appointment])

  const safeSet =
    typeof setAppointment === 'function' ? setAppointment : () => {}
  const safeOnSubmit =
    typeof onSubmit === 'function' ? onSubmit : (e) => e.preventDefault()
  const safeOnClose = typeof onClose === 'function' ? onClose : () => {}
  const safeUsers = Array.isArray(users) ? users : []

  const handleInputChange = (e) => {
    const { name, value } = e.target || {}
    if (!name) return
    safeSet((prev) => {
      const p = prev && typeof prev === 'object' ? prev : EMPTY_APPOINTMENT
      return { ...p, [name]: value ?? '' }
    })
  }

  const toggleMember = (person) => {
    safeSet((prev) => {
      const p = prev && typeof prev === 'object' ? prev : EMPTY_APPOINTMENT
      const current = normalizeMembers(p.members)
      const next = current.includes(person)
        ? current.filter((x) => x !== person)
        : current.concat(person)
      return { ...p, members: next }
    })
  }

  const idFor = (name) => `appt_${name}`

  return (
    <form
      onSubmit={safeOnSubmit}
      className="m-form modal-form"
      noValidate
    >
      {/* ===== Sekcja: Szczegóły ===== */}
      <section
        className="m-section"
        aria-labelledby={idFor('section_details')}
      >
        <h6 id={idFor('section_details')} className="m-section__title">
          Szczegóły
        </h6>

        {/* Temat */}
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('topic')}>
            Temat <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('topic')}
            name="topic"
            placeholder="Temat"
            value={appt.topic}
            onChange={handleInputChange}
            required
            className="m-input"
            autoComplete="off"
          />
        </div>

        {/* Data + Godzina w jednym wierszu */}
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('date')}>
            Data i godzina <span aria-hidden="true">*</span>
          </label>
          <div className="m-row">
            <input
              id={idFor('date')}
              type="date"
              name="date"
              value={appt.date}
              onChange={handleInputChange}
              required
              className="m-input"
              autoComplete="off"
            />
            <input
              id={idFor('time')}
              type="time"
              name="time"
              value={appt.time}
              onChange={handleInputChange}
              className="m-input m-input--time"
              aria-label="Godzina"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Status spotkania */}
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('status')}>
            Status
          </label>
          <select
            id={idFor('status')}
            name="status"
            value={appt.status}
            onChange={handleInputChange}
            className="m-input"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="m-help">
            Status wpływa na kolorowe oznaczenie w rejestrze spotkań.
          </div>
        </div>

        {/* Miejsce */}
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('place')}>
            Miejsce
          </label>
          <input
            id={idFor('place')}
            name="place"
            placeholder="Sala / Online"
            value={appt.place}
            onChange={handleInputChange}
            className="m-input"
            autoComplete="off"
          />
        </div>

        {/* Ustalenia */}
        <div className="m-field">
          <label className="m-label" htmlFor={idFor('arrangements')}>
            Ustalenia
          </label>
          <textarea
            id={idFor('arrangements')}
            name="arrangements"
            rows={3}
            value={appt.arrangements}
            onChange={handleInputChange}
            className="m-textarea"
            placeholder="Punkty do omówienia, krótkie notatki…"
            autoComplete="off"
          />
        </div>
      </section>

      {/* ===== Sekcja: Uczestnicy ===== */}
      <section
        className="m-section"
        aria-labelledby={idFor('section_members')}
      >
        <h6 id={idFor('section_members')} className="m-section__title">
          Uczestnicy
        </h6>

        <fieldset className="m-field">
          <legend className="m-label">Wybierz osoby</legend>
          <div className="checkbox-group">
            {safeUsers.map((u) => (
              <label key={u} className="m-choice">
                <input
                  type="checkbox"
                  checked={appt.members.includes(u)}
                  onChange={() => toggleMember(u)}
                />
                {u}
              </label>
            ))}
          </div>
          <div className="m-help">
            Zaznacz osoby biorące udział w spotkaniu.
          </div>
        </fieldset>
      </section>

      {/* Akcje */}
      <div className="m-actions m-actions--footer">
        <button
          type="button"
          onClick={safeOnClose}
          className="m-btn m-btn--secondary"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="m-btn m-btn--primary m-btn--lg"
        >
          Zapisz
        </button>
      </div>
    </form>
  )
}

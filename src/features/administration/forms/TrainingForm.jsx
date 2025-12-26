// src/features/administration/forms/TrainingForm.jsx
import React, { useMemo, useId, useCallback } from 'react'
import { TRAINING_TYPES, TRAINING_STATUSES } from '../config/trainings.config'

function normalizeArray(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    return v
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

export default function TrainingForm({
  newTraining,
  setNewTraining,
  onSubmit,
  onClose,
  users,
  showTitle = true,
}) {
  const uid = useId()
  const idFor = useCallback((name) => `training_${name}__${uid}`, [uid])

  const data = useMemo(
    () => ({
      type: String(newTraining?.type ?? 'wewnętrzne'),
      title: String(newTraining?.title ?? ''),
      topic: String(newTraining?.topic ?? ''),
      date: String(newTraining?.date ?? ''),
      status: String(newTraining?.status ?? 'planowane'),
      note: String(newTraining?.note ?? ''),
      participants: normalizeArray(newTraining?.participants),
    }),
    [newTraining]
  )

  const safeUsers = Array.isArray(users) ? users : []
  const safeSet =
    typeof setNewTraining === 'function' ? setNewTraining : () => {}

  const handleInputChange = (e) => {
    const { name, value } = e.target || {}
    if (!name) return
    safeSet((prev) => ({ ...(prev || {}), [name]: value ?? '' }))
  }

  const handleParticipantToggle = (person) => {
    safeSet((prev) => {
      const current = normalizeArray(prev?.participants)
      const next = current.includes(person)
        ? current.filter((x) => x !== person)
        : [...current, person]
      return { ...(prev || {}), participants: next }
    })
  }

  return (
    <form onSubmit={onSubmit} className="m-form modal-form" noValidate>
      <section className="m-section" aria-labelledby={idFor('section_data')}>
        <h6 id={idFor('section_data')} className="m-section__title">
          {showTitle ? 'Dane szkolenia' : 'Dane szkolenia'}
        </h6>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('type')}>
              Typ
            </label>
            <select
              id={idFor('type')}
              name="type"
              value={data.type}
              onChange={handleInputChange}
              className="m-input"
              required
            >
              {TRAINING_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('date')}>
              Data <span aria-hidden="true">*</span>
            </label>
            <input
              id={idFor('date')}
              type="date"
              name="date"
              value={data.date}
              onChange={handleInputChange}
              className="m-input"
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('status')}>
            Status
          </label>
          <select
            id={idFor('status')}
            name="status"
            value={data.status}
            onChange={handleInputChange}
            className="m-input"
          >
            {TRAINING_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="m-help">
            Status wpływa na kolorowe oznaczenie w rejestrze szkoleń.
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('title')}>
            Tytuł szkolenia <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('title')}
            name="title"
            type="text"
            placeholder="np. Szkolenie BHP"
            value={data.title}
            onChange={handleInputChange}
            className="m-input"
            autoComplete="off"
            required
          />
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('topic')}>
            Temat <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('topic')}
            name="topic"
            type="text"
            placeholder="Czego dotyczy szkolenie?"
            value={data.topic}
            onChange={handleInputChange}
            className="m-input"
            autoComplete="off"
            required
          />
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('note')}>
            Notatka
          </label>
          <textarea
            id={idFor('note')}
            name="note"
            placeholder="Dodatkowe informacje..."
            value={data.note}
            onChange={handleInputChange}
            className="m-textarea"
            rows={3}
          />
        </div>
      </section>

      <hr className="m-divider" />

      <section
        className="m-section"
        aria-labelledby={idFor('section_participants')}
      >
        <h6 id={idFor('section_participants')} className="m-section__title">
          Uczestnicy
        </h6>

        <fieldset className="m-field">
          <legend className="m-label">Wybierz osoby</legend>
          <div className="checkbox-group">
            {safeUsers.map((u) => {
              const cid = idFor(`participant_${String(u).replace(/\s+/g, '_')}`)
              return (
                <label key={u} className="m-choice" htmlFor={cid}>
                  <input
                    id={cid}
                    type="checkbox"
                    checked={data.participants.includes(u)}
                    onChange={() => handleParticipantToggle(u)}
                  />
                  {u}
                </label>
              )
            })}
          </div>
          <div className="m-help">Zaznacz osoby biorące udział w szkoleniu.</div>
        </fieldset>
      </section>

      <div className="m-actions m-actions--footer">
        <button type="button" className="m-btn m-btn--secondary" onClick={onClose}>
          Anuluj
        </button>
        <button type="submit" className="m-btn m-btn--primary m-btn--lg">
          Zapisz
        </button>
      </div>
    </form>
  )
}

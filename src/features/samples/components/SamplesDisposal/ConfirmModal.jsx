// src/features/sales/components/SamplesDisposal/ConfirmModal.jsx
import React, { useMemo } from 'react'
import Modal from '../../../../shared/modals/modals/Modal'

export default function ConfirmModal({
  open,
  date,
  setDate,
  onConfirm,
  onClose,
  size = 'sm',
}) {
  const isValid = !!String(date || '').trim()

  const ui = useMemo(
    () => ({
      title: 'Potwierdź utylizację próbek',
      sectionTitle: 'Szczegóły utylizacji',
      label: 'Data utylizacji',
      help:
        'Wybierz datę utylizacji. Po zatwierdzeniu pozycja zostanie przeniesiona do archiwum „zutylizowane”.',
      confirmText: 'Zatwierdź utylizację',
    }),
    []
  )

  if (!open) return null

  return (
    <Modal title={ui.title} onClose={onClose} size={size}>
      <form
        className="m-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!isValid) return
          onConfirm()
        }}
      >
        <section className="m-section">
          <h4 className="m-section__title">{ui.sectionTitle}</h4>

          <div className="m-help">{ui.help}</div>

          <div className="m-help" role="alert">
            <strong>Uwaga:</strong> po zatwierdzeniu rekord zniknie z bieżącego widoku i trafi do archiwum.
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor="dispose-date">
              {ui.label} <span className="req">*</span>
            </label>

            <input
              id="dispose-date"
              type="date"
              className="m-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {!isValid ? (
              <div className="m-help" role="status">
                Wybierz datę, aby odblokować zatwierdzenie.
              </div>
            ) : (
              <div className="m-help">Format: RRRR-MM-DD</div>
            )}
          </div>
        </section>

        <div className="m-actions--footer" role="toolbar" aria-label="Akcje potwierdzenia utylizacji">
          <button type="button" className="m-btn m-btn--secondary" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="m-btn m-btn--primary" disabled={!isValid}>
            {ui.confirmText}
          </button>
        </div>
      </form>
    </Modal>
  )
}
// src/features/samples/components/SamplesDeliveryPickup/ConfirmModal.jsx
import React, { useMemo } from 'react'
import Modal from '../../../../shared/modals/modals/Modal'

export default function ConfirmModal({
  open,
  type, // 'deliver' | 'pickup'
  date,
  setDate,
  onConfirm,
  onClose,
  size = 'sm',
}) {
  const isDeliver = type === 'deliver'
  const isValid = !!String(date || '').trim()

  const ui = useMemo(() => {
    if (isDeliver) {
      return {
        title: 'Potwierdź dostawę próbek',
        sectionTitle: 'Szczegóły dostawy',
        label: 'Data dostawy',
        help:
          'Wybierz datę, w której próbki zostały dostarczone. Zapis przeniesie pozycję do archiwum „dostarczone”.',
        confirmText: 'Zatwierdź dostawę',
      }
    }
    return {
      title: 'Potwierdź odbiór próbek',
      sectionTitle: 'Szczegóły odbioru',
      label: 'Data odbioru',
      help:
        'Wybierz datę odbioru próbek. Zapis przeniesie pozycję do archiwum „odebrane”.',
      confirmText: 'Zatwierdź odbiór',
    }
  }, [isDeliver])

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
            <label className="m-label" htmlFor="confirm-date">
              {ui.label} <span className="req">*</span>
            </label>

            <input
              id="confirm-date"
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

        <div className="m-actions--footer" role="toolbar" aria-label="Akcje potwierdzenia">
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
import React from 'react'
import { Modal } from '../modals' // Twój barrel w shared/modals

export default function ConfirmDateModal({
  open, title = 'Potwierdź datę', label = 'Data',
  value, onChange, onConfirm, onClose,
}) {
  if (!open) return null
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="form-row" style={{ display: 'grid', gap: 10 }}>
        <label>
          <span>{label}</span>
          <input type="date" value={value || ''} onChange={e => onChange?.(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button className="btn btn--primary" onClick={onConfirm}>Zatwierdź</button>
          <button className="btn" onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </Modal>
  )
}

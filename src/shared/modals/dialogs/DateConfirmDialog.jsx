import React from 'react'
import Modal from '../modals/Modal'

export default function DateConfirmDialog({
  open, title = 'Potwierdź datę', message,
  date, setDate, confirmLabel = 'Potwierdź', cancelLabel = 'Anuluj',
  onConfirm, onClose,
}) {
  if (!open) return null
  return (
    <Modal title={title} onClose={onClose} size="sm">
      {message && <p style={{ marginBottom: 12 }}>{message}</p>}
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Data</span>
        <input type="date" value={date || ''} onChange={(e) => setDate?.(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn--ghost" onClick={onClose}>{cancelLabel}</button>
        <button className="btn btn--primary" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

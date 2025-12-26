// src/shared/modals/dialogs/DeleteDialog.jsx
import React from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Trash2 } from 'lucide-react'

export default function DeleteDialog({
  open,
  onConfirm,
  onClose,
  label,
  what = 'rekord',
  customMessage,
  confirmLabel, // opcjonalne – zwykle nie potrzeba, ConfirmDialog ustawi 'Usuń'
  cancelLabel,  // opcjonalne – zwykle 'Anuluj'
}) {
  const safe = (label ?? '').toString().trim() || '—'
  const message = customMessage ?? (
    <>
      Na pewno chcesz usunąć {what} <strong>{safe}</strong>?
      <br />
      <span className="muted">Tej operacji nie można cofnąć.</span>
    </>
  )

  return (
    <ConfirmDialog
      open={open}
      title="Potwierdź usunięcie"
      message={message}
      onConfirm={onConfirm}
      onClose={onClose}
      tone="danger"
      icon={Trash2}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
    />
  )
}

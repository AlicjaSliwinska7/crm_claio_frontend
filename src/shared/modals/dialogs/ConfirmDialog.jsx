// src/shared/modals/dialogs/ConfirmDialog.jsx
import React from 'react'
import Modal from '../modals/Modal' // dostosuj ścieżkę jeśli inną masz
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  open,
  title = 'Potwierdź',
  message,
  onConfirm,
  onClose,
  tone = 'neutral',
  icon,
  confirmLabel,
  cancelLabel = 'Anuluj',
  size = 'sm',
}) {
  if (!open) return null

  const toneClass =
    tone === 'danger' ? 'confirm-danger'
    : tone === 'warning' ? 'confirm-warning'
    : 'confirm-neutral'

  const finalConfirm = confirmLabel ?? (tone === 'danger' ? 'Usuń' : 'OK')

  // 🔧 FIX: bezpieczne renderowanie ikony (element vs komponent-typ)
  const renderIcon = (IconLike) => {
    if (!IconLike) return null
    if (React.isValidElement(IconLike)) return IconLike // <Trash2 />
    // ForwardRef/Memo/Fn component → utwórz element
    return React.createElement(IconLike, { size: 18, 'aria-hidden': true })
  }

  let IconNode = null
  if (icon) {
    IconNode = renderIcon(icon)
  } else if (tone === 'danger' || tone === 'warning') {
    IconNode = <AlertTriangle size={18} aria-hidden />
  }

  const confirmBtnClass = [
    'confirm-btn',
    'confirm-btn--confirm',
    tone === 'danger' ? 'is-danger' : ''
  ].filter(Boolean).join(' ')

  return (
    <Modal
      title={title}
      onClose={onClose}
      size={size}
      className={`confirm-dialog ${toneClass}`}
      modalClassName={`confirm-dialog ${toneClass}`}
    >
      <div className="confirm-dialog__content">
        <div className="confirm-dialog__icon" aria-hidden>
          {IconNode}
        </div>
        <div className="confirm-dialog__message">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>

      <div className="confirm-dialog__actions">
        <button
          type="button"
          className="confirm-btn confirm-btn--cancel"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={confirmBtnClass}
          onClick={onConfirm}
        >
          {finalConfirm}
        </button>
      </div>
    </Modal>
  )
}

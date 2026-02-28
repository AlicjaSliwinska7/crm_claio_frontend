import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../../shared/modals/styles/confirm-dialog.css'

const ConfirmCtx = createContext(null)

export function ConfirmProvider({ children }) {
  // resolve trzymamy poza state (stabilniej i bez efektów ubocznych w setState)
  const resolveRef = useRef(null)

  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Tak',
    cancelText: 'Anuluj',
  })

  const confirm = useCallback(({ title, message, confirmText = 'Tak', cancelText = 'Anuluj' } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({ open: true, title, message, confirmText, cancelText })
    })
  }, [])

  const handleClose = useCallback((answer) => {
    const r = resolveRef.current
    resolveRef.current = null
    try {
      r?.(answer)
    } finally {
      setState((prev) => ({ ...prev, open: false }))
    }
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  const dialog = state.open ? (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={() => handleClose(false)}
      onClick={() => handleClose(false)}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <h3 id="confirm-title">{state.title}</h3>
        {state.message ? <p id="confirm-message">{state.message}</p> : null}

        <div className="confirm-actions">
          <button type="button" className="btn-secondary" onClick={() => handleClose(false)}>
            {state.cancelText}
          </button>
          <button type="button" className="btn-danger" onClick={() => handleClose(true)} autoFocus>
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {typeof document !== 'undefined' ? createPortal(dialog, document.body) : null}
    </ConfirmCtx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>')
  return ctx.confirm
}
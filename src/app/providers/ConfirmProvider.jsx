import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import '../../shared/modals/styles/confirm-dialog.css'

const ConfirmCtx = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Tak',
    cancelText: 'Anuluj',
    resolve: null,
  })

  const confirm = useCallback(({ title, message, confirmText = 'Tak', cancelText = 'Anuluj' }) => {
    return new Promise(resolve => {
      setState({ open: true, title, message, confirmText, cancelText, resolve })
    })
  }, [])

  const handleClose = useCallback((answer) => {
    setState(prev => {
      prev.resolve?.(answer)
      return { ...prev, open: false, resolve: null }
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {state.open && (
        <div className="confirm-backdrop" role="presentation" onClick={() => handleClose(false)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="confirm-title">{state.title}</h3>
            <p id="confirm-message">{state.message}</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => handleClose(false)}>
                {state.cancelText}
              </button>
              <button className="btn-danger" onClick={() => handleClose(true)} autoFocus>
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>')
  return ctx.confirm
}

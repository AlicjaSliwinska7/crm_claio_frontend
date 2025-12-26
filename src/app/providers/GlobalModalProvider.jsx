import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../../shared/modals/styles/global-modal.css'

const Ctx = createContext({
  alert: async (_opts) => {},
  confirm: async (_opts) => false,
})

export const useModal = () => useContext(Ctx)

export function GlobalModalProvider({ children }) {
  const [current, setCurrent] = useState(null) // {type:'alert'|'confirm', title, message, tone, okText, confirmText, cancelText, resolve}
  const queueRef = useRef([])

  const dequeue = () => {
    const next = queueRef.current.shift()
    setCurrent(next || null)
  }

  const show = useCallback((payload) => {
    return new Promise((resolve) => {
      queueRef.current.push({ ...payload, resolve })
      if (!current) dequeue()
    })
  }, [current])

  const alert = useCallback(async (opts) => {
    const { title='Informacja', message='', tone='info', okText='OK' } = opts || {}
    return show({ type:'alert', title, message, tone, okText })
  }, [show])

  const confirm = useCallback(async (opts) => {
    const { title='Potwierdź', message='', tone='info', confirmText='OK', cancelText='Anuluj' } = opts || {}
    return show({ type:'confirm', title, message, tone, confirmText, cancelText })
  }, [show])

  const onClose = (result) => {
    if (!current) return
    // rozwiąż obietnicę
    current.resolve(current.type === 'confirm' ? !!result : undefined)
    setCurrent(null)
    // pokaż następną z kolejki
    setTimeout(dequeue, 0)
  }

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm])

  return (
    <Ctx.Provider value={value}>
      {children}
      {createPortal(
        current ? (
          <div className="gmodal__backdrop" onClick={() => onClose(false)}>
            <div className={`gmodal__panel gmodal--${current.tone}`} onClick={(e)=>e.stopPropagation()}>
              <div className="gmodal__head">{current.title}</div>
              <div className="gmodal__body">
                {String(current.message).split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="gmodal__actions">
                {current.type === 'confirm' ? (
                  <>
                    <button className="btn btn--ghost" onClick={() => onClose(false)}>
                      {current.cancelText || 'Anuluj'}
                    </button>
                    <button className="btn btn--primary" onClick={() => onClose(true)}>
                      {current.confirmText || 'OK'}
                    </button>
                  </>
                ) : (
                  <button className="btn btn--primary" onClick={() => onClose(true)}>
                    {current.okText || 'OK'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </Ctx.Provider>
  )
}

// src/shared/modals/modals/modals/CalModal.jsx
import React, { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../styles/calmodal.css'

// 🚀 “sufit” nad całym UI (nad upper/lower nav i drawerami)
// ✅ FIX: musi być wyżej niż MessagesModal (2147483605), żeby zagnieżdżone modale były widoczne
const MODAL_Z = 2147483610

function getAppRoot() {
  return (
    document.getElementById('root') ||
    document.getElementById('app') ||
    document.querySelector('[data-app-root]')
  )
}

export default function CalModal({
  open = true,
  onClose,
  title,
  subtitle,
  ariaLabel,
  maxWidth = 980,
  children,
  className = '',
  bodyClassName = '',
  bodyStyle,
}) {
  const closeBtnRef = useRef(null)
  const restoreFocusRef = useRef(null)

  const label = useMemo(() => ariaLabel || title || 'Okno dialogowe', [ariaLabel, title])

  useEffect(() => {
    if (!open) return

    // zapamiętaj focus
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    // ESC
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)

    // lock scroll + kompensacja
    const body = document.body
    const docEl = document.documentElement
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    const hadVerticalScroll = docEl.scrollHeight > docEl.clientHeight
    const scrollbarW = window.innerWidth - docEl.clientWidth
    if (hadVerticalScroll && scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
    body.style.overflow = 'hidden'

    // inert + aria-hidden na app root
    const appRoot = getAppRoot()
    const hadInert = appRoot?.hasAttribute('inert') || false
    const hadAriaHidden = appRoot?.getAttribute('aria-hidden') === 'true'

    if (appRoot) {
      appRoot.setAttribute('inert', '')
      appRoot.setAttribute('aria-hidden', 'true')
    }

    // focus na close
    queueMicrotask(() => closeBtnRef.current?.focus?.())

    return () => {
      document.removeEventListener('keydown', onKey)

      // restore body
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight

      // restore app root
      if (appRoot) {
        if (!hadInert) appRoot.removeAttribute('inert')
        if (!hadAriaHidden) appRoot.removeAttribute('aria-hidden')
      }

      // restore focus
      try {
        restoreFocusRef.current?.focus?.()
      } catch {}
    }
  }, [open, onClose])

  if (!open) return null

  const stop = (e) => e.stopPropagation()

  const ui = (
    <div
      className="calmodal__overlay"
      role="presentation"
      onClick={onClose}
      style={{ zIndex: MODAL_Z }}
    >
      <div
        className={`calmodal__content ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={stop}
        style={{ maxWidth, zIndex: MODAL_Z + 1 }}
      >
        <header className="calmodal__header">
          <div className="calmodal__titlewrap">
            <h3>{title}</h3>
            {subtitle ? <span className="calmodal__subtitle">{subtitle}</span> : null}
          </div>

          <button
            ref={closeBtnRef}
            className="calmodal__close"
            onClick={onClose}
            aria-label="Zamknij"
            title="Zamknij"
          >
            ×
          </button>
        </header>

        {/* Body: domyślnie jak w DayOverview (scroll w środku karty) */}
        <div className={`calmodal__body ${bodyClassName}`.trim()} style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(ui, document.body)
}
// src/shared/modals/modals/MessagesModal.jsx
import React, { useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import '../styles/messages-modal.css'

// “sufit” nad całym UI (nad upper/lower nav i drawerami)
const MESSAGES_MODAL_Z = 2147483605

function getAppRoot() {
  return (
    document.getElementById('root') ||
    document.getElementById('app') ||
    document.querySelector('[data-app-root]')
  )
}

function getFocusable(el) {
  if (!el) return []
  const nodes = el.querySelectorAll(
    [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')
  )
  return Array.from(nodes).filter((n) => n.offsetParent !== null)
}

export default function MessagesModal({
  open = false,
  onClose,

  // lewa strona (aplikacyjny tytuł modala)
  title = 'Wiadomości',
  subtitle,
  ariaLabel,

  // środek: kontekst aktualnej rozmowy (nazwa + uczestnicy)
  contextTitle,
  contextSubtitle,

  // prawa: toolbar (np. wyszukiwarka w rozmowie + hit nav)
  headerToolbar,

  children,
  size = 'xl', // sm | md | lg | xl | full
  className = '',
  bodyClassName = '',
  bodyStyle,
}) {
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)
  const restoreFocusRef = useRef(null)

  const label = useMemo(() => ariaLabel || title || 'Wiadomości', [ariaLabel, title])

  const maxWidth = useMemo(() => {
    switch (size) {
      case 'sm':
        return 560
      case 'md':
        return 860
      case 'lg':
        return 1040
      case 'xl':
        return 1120 // ✅ trochę wężej
      case 'full':
        return 99999
      default:
        return 1120
    }
  }, [size])

  // ✅ HOOK MUSI BYĆ ZAWSZE WYWOŁANY (przed return null)
  const onOverlayClick = useCallback(
    (e) => {
      // zamykamy tylko po kliknięciu w tło overlay (nie w content)
      if (e.target === e.currentTarget) onClose?.()
    },
    [onClose]
  )

  // stałe stopPropagation — bez hooków
  const stop = (e) => e.stopPropagation()

  useEffect(() => {
    if (!open) return

    // zapamiętaj focus
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    // lock scroll + kompensacja
    const body = document.body
    const docEl = document.documentElement
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    const hadVerticalScroll = docEl.scrollHeight > docEl.clientHeight
    const scrollbarW = window.innerWidth - docEl.clientWidth
    if (hadVerticalScroll && scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
    body.style.overflow = 'hidden'

    // aria/inert na app root (żeby screen reader nie łapał tła)
    const appRoot = getAppRoot()
    const hadInert = appRoot?.hasAttribute('inert') || false
    const hadAriaHidden = appRoot?.getAttribute('aria-hidden') === 'true'

    if (appRoot) {
      appRoot.setAttribute('inert', '')
      appRoot.setAttribute('aria-hidden', 'true')
    }

    // focus: najpierw na close
    queueMicrotask(() => closeBtnRef.current?.focus?.())

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }

      // Focus trap (Tab / Shift+Tab)
      if (e.key === 'Tab') {
        const dlg = dialogRef.current
        if (!dlg) return
        const focusables = getFocusable(dlg)
        if (!focusables.length) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (e.shiftKey) {
          if (active === first || !dlg.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)

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

  const hasContext =
    Boolean(contextTitle && String(contextTitle).trim()) ||
    Boolean(contextSubtitle && String(contextSubtitle).trim())
  const hasToolbar = !!headerToolbar

  const ui = (
    <div
      className="msgmodal__overlay"
      role="presentation"
      onClick={onOverlayClick}
      style={{ zIndex: MESSAGES_MODAL_Z }}
    >
      <div
        ref={dialogRef}
        className={`msgmodal__content ${size === 'full' ? 'is-full' : ''} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={stop}
        onMouseDown={stop}
        style={{ maxWidth, zIndex: MESSAGES_MODAL_Z + 1 }}
      >
        <header className="msgmodal__header">
          {/* LEFT: tytuł modala */}
          <div className="msgmodal__left">
            <div className="msgmodal__titlewrap">
              <h3 className="msgmodal__title">{title}</h3>
              {subtitle ? <div className="msgmodal__subtitle">{subtitle}</div> : null}
            </div>
          </div>

          {/* CENTER: kontekst rozmowy */}
          <div
            className={`msgmodal__center ${hasContext ? '' : 'msgmodal__center--empty'}`}
            aria-label="Aktualna rozmowa"
          >
            {hasContext ? (
              <>
                <div className="msgmodal__contextTitle" title={contextTitle || ''}>
                  {contextTitle || '—'}
                </div>
                {contextSubtitle ? (
                  <div className="msgmodal__contextSubtitle" title={contextSubtitle}>
                    {contextSubtitle}
                  </div>
                ) : null}
              </>
            ) : (
              <span className="msgmodal__centerHint">Wybierz rozmowę po lewej</span>
            )}
          </div>

          {/* RIGHT: toolbar + close */}
          <div className="msgmodal__right">
            {hasToolbar ? <div className="msgmodal__toolbar">{headerToolbar}</div> : null}

            <button
              ref={closeBtnRef}
              className="msgmodal__close"
              onClick={onClose}
              aria-label="Zamknij"
              title="Zamknij"
              type="button"
            >
              ×
            </button>
          </div>
        </header>

        <div className={`msgmodal__body ${bodyClassName}`.trim()} style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(ui, document.body)
}
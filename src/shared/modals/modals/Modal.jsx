// src/shared/modals/modals/Modal.jsx
import React, { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import '../styles/modal.css' // layout (overlay, grid, centrowanie/sheet)
import '../styles/form-modal.css' // wygląd (blue underline)

/**
 * Wspólny modal – pełnoekranowy overlay (portal do document.body).
 *
 * Props:
 * - title?: string
 * - onClose: () => void
 * - size?: 'sm' | 'md' | 'lg'      (domyślnie 'md')
 * - showClose?: boolean            (domyślnie true)
 * - closeOnBackdrop?: boolean      (domyślnie true)
 * - closeOnEsc?: boolean           (domyślnie true)
 * - ariaLabel?: string             (gdy brak title)
 * - className?: string             (dodatkowe klasy na kontenerze dialogu)
 * - sheet?: boolean                (domyślnie false) — layout „spod navbarów”
 * - hideHeader?: boolean           (domyślnie false) — ukrywa nagłówek (title + X)
 */

// =========================
// Globalny stan modali
// =========================
let __openModalCount = 0
let __modalStack = [] // trzymamy kolejność (ostatni = top)

let __bodyPrevOverflow = null
let __bodyPrevPaddingRight = null
let __bodyHadScrollbarComp = false

let __appRootEl = null
let __appRootHadInert = false
let __appRootHadAriaHidden = false

// 🚀 Zapasowy „sufit” – na wypadek kosmicznych z-indexów gdzieś indziej
const MODAL_Z = 2147483600

function getAppRoot() {
  return (
    document.getElementById('root') ||
    document.getElementById('app') ||
    document.querySelector('[data-app-root]')
  )
}

function isTopModal(id) {
  return __modalStack.length > 0 && __modalStack[__modalStack.length - 1] === id
}

export default function Modal({
  title,
  onClose,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  ariaLabel,
  className = '',
  sheet = false,
  hideHeader = false, // ✅ NEW (wstecznie-kompatybilne)
}) {
  const backdropRef = useRef(null)
  const dialogRef = useRef(null)
  const restoreFocusElRef = useRef(null)
  const titleId = useId()
  const modalIdRef = useRef(`m_${Math.random().toString(36).slice(2)}_${Date.now()}`)

  // 1) ESC zamyka TYLKO najwyższy modal
  useEffect(() => {
    if (!closeOnEsc) return

    const onKey = (e) => {
      if (e.key !== 'Escape') return
      // zamykamy tylko top-most modal
      if (isTopModal(modalIdRef.current)) onClose?.()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeOnEsc, onClose])

  // 2) Blokada tła (scroll-lock + inert/aria-hidden) + focus + restore
  useEffect(() => {
    const body = document.body
    const docEl = document.documentElement
    const id = modalIdRef.current

    // zapisujemy element aktywny (do przywrócenia)
    restoreFocusElRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    // stack & licznik
    __modalStack.push(id)
    __openModalCount += 1
    body.setAttribute('data-modal-open', String(__openModalCount))

    // TYLKO dla pierwszego modala: scroll-lock + kompensacja + inert
    if (__openModalCount === 1) {
      // zapamiętaj stare style body
      __bodyPrevOverflow = body.style.overflow
      __bodyPrevPaddingRight = body.style.paddingRight
      __bodyHadScrollbarComp = false

      // kompensacja szerokości scrollbara (żeby layout nie „skakał”)
      const hadVerticalScroll = docEl.scrollHeight > docEl.clientHeight
      const scrollbarW = window.innerWidth - docEl.clientWidth
      if (hadVerticalScroll && scrollbarW > 0) {
        body.style.paddingRight = `${scrollbarW}px`
        __bodyHadScrollbarComp = true
      }

      // blokada scrolla
      body.style.overflow = 'hidden'

      // blokada interakcji z aplikacją pod modalem
      __appRootEl = getAppRoot()
      if (__appRootEl) {
        __appRootHadInert = __appRootEl.hasAttribute('inert')
        __appRootHadAriaHidden = __appRootEl.getAttribute('aria-hidden') === 'true'

        __appRootEl.setAttribute('inert', '')
        __appRootEl.setAttribute('aria-hidden', 'true')
      }
    }

    // focus do środka dialogu (po otwarciu)
    const root = dialogRef.current
    const firstFocusable = root?.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (firstFocusable instanceof HTMLElement) firstFocusable.focus()
    else if (root) root.focus()

    return () => {
      // usuń z stacka
      __modalStack = __modalStack.filter((x) => x !== id)

      // licznik i atrybut body
      __openModalCount = Math.max(0, __openModalCount - 1)
      if (__openModalCount === 0) body.removeAttribute('data-modal-open')
      else body.setAttribute('data-modal-open', String(__openModalCount))

      // TYLKO gdy zamyka się ostatni modal: przywróć tło
      if (__openModalCount === 0) {
        // restore body
        if (__bodyPrevPaddingRight != null) body.style.paddingRight = __bodyPrevPaddingRight
        if (__bodyPrevOverflow != null) body.style.overflow = __bodyPrevOverflow

        __bodyPrevOverflow = null
        __bodyPrevPaddingRight = null
        __bodyHadScrollbarComp = false

        // restore app root block
        if (__appRootEl) {
          // zdejmij inert/aria-hidden tylko jeśli my je założyliśmy (a wcześniej nie było)
          if (!__appRootHadInert) __appRootEl.removeAttribute('inert')
          if (!__appRootHadAriaHidden) __appRootEl.removeAttribute('aria-hidden')

          __appRootEl = null
          __appRootHadInert = false
          __appRootHadAriaHidden = false
        }

        // przywróć focus (sensowne głównie po zamknięciu ostatniego)
        try {
          restoreFocusElRef.current?.focus?.()
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3) Focus-trap (Tab/Shift+Tab nie wychodzi poza modal)
  useEffect(() => {
    const root = dialogRef.current
    if (!root) return

    const selector = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(',')

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      // trap działa tylko dla top-most (żeby nested modale nie walczyły)
      if (!isTopModal(modalIdRef.current)) return

      const focusables = root.querySelectorAll(selector)
      const list = Array.from(focusables).filter(
        (el) => el instanceof HTMLElement && !el.hasAttribute('disabled') && el.offsetParent !== null
      )
      if (!list.length) return

      const first = list[0]
      const last = list[list.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
  }, [])

  // 4) Klik w backdrop zamyka modal (jeśli włączone) — też tylko top-most
  const handleBackdropMouseDown = (e) => {
    if (!closeOnBackdrop) return
    if (!isTopModal(modalIdRef.current)) return
    if (e.target === e.currentTarget) onClose?.()
  }

  // 5) A11y – aria-labelledby lub aria-label
  const a11yProps =
    title != null && title !== ''
      ? { 'aria-labelledby': titleId }
      : ariaLabel
        ? { 'aria-label': ariaLabel }
        : {}

  // 6) Render overlay + dialog w portalu
  const overlay = (
    <div
      className={`ui-modal__backdrop${sheet ? ' ui-modal__backdrop--sheet' : ''}`}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      ref={backdropRef}
      // „sufit bezpieczeństwa” w razie nieposłusznych warstw
      style={{ zIndex: MODAL_Z }}
    >
      <div
        className={`ui-modal ui-modal--${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        {...a11yProps}
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        // dialog minimalnie nad backdropem
        style={{ zIndex: MODAL_Z + 1 }}
      >
        {!hideHeader && (title || showClose) && (
          <div className="ui-modal__header">
            {title ? (
              <h3 id={titleId} className="ui-modal__title">
                {title}
              </h3>
            ) : (
              <span />
            )}
            {showClose && (
              <button className="ui-modal__close" onClick={onClose} aria-label="Zamknij" type="button">
                ×
              </button>
            )}
          </div>
        )}

        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
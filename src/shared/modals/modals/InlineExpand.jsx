import React, { useEffect, useRef } from 'react'

/**
 * InlineExpand — mały helper do rozwijanego panelu (np. pasek dodawania).
 * - Nie renderuje nic, gdy `open === false`.
 * - Gdy otwarty: zamyka na klik poza panelem i na Escape (konfigurowalne).
 * - Po otwarciu ustawia fokus w pierwszym fokusowalnym elemencie (UX).
 * - NIE dodaje żadnych własnych klas — domyślnie używa "form-row" (Twoje CSS).
 */
export default function InlineExpand({
  open,
  onClose,
  children,
  containerClassName = 'form-row', // ⬅️ klasa z Twojego CSS-u (zostaje 1:1)
  closeOnOutsideClick = true,
  closeOnEsc = true,
  ariaLabel = 'Panel',
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const onDocDown = e => {
      if (closeOnOutsideClick && ref.current && !ref.current.contains(e.target)) {
        onClose?.()
      }
    }
    const onKey = e => {
      if (closeOnEsc && e.key === 'Escape') onClose?.()
    }

    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)

    // fokus w pierwszym fokusowalnym
    const firstFocusable = ref.current?.querySelector(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus?.()

    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, closeOnOutsideClick, closeOnEsc, onClose])

  if (!open) return null

  return (
    <div ref={ref} className={containerClassName} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  )
}

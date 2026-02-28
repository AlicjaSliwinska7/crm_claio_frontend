// src/features/messages/pages/inbox/chat/EmojiPickerPopover.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'

// ✅ zapewnia styling niezależnie od miejsca użycia
import '../../../styles/message-inbox/_emoji-popover.css'

const EMOJI_SETS = {
  Najczęstsze: ['👍', '❤️', '😂', '😮', '🎉', '🙏', '🔥', '✅', '❗', '🤝'],
  Uśmiechy: ['😀', '😁', '😂', '🤣', '😊', '😍', '😎', '😅', '😉', '😇', '🙂', '🙃', '🥲', '🤪', '😴'],
  Gesty: ['👍', '👎', '👏', '🙌', '🙏', '🤞', '👌', '✌️', '🤙', '👊', '🤝'],
  Serca: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🤍', '🖤', '🤎', '💔'],
}

export default function EmojiPickerPopover({
  onPick,
  onClose,
  anchorSelector = '.emoji-toggle-btn',
  title = 'Emoji',
}) {
  const popRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Najczęstsze')

  // pozycja: domyślnie nad anchor (emoji button)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [drag, setDrag] = useState({ dragging: false, dx: 0, dy: 0 })
  const [hasCustomPos, setHasCustomPos] = useState(false)

  const emojis = useMemo(() => EMOJI_SETS[activeTab] || [], [activeTab])

  useEffect(() => {
    // klik poza => zamknij
    const onDown = (e) => {
      const pop = popRef.current
      if (!pop) return
      if (pop.contains(e.target)) return
      onClose?.()
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [onClose])

  useEffect(() => {
    // ESC => zamknij
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  useEffect(() => {
    // po otwarciu ustaw pozycję nad anchor, jeśli user nie przeciągał
    if (hasCustomPos) return

    const anchor = document.querySelector(anchorSelector)
    const pop = popRef.current
    if (!anchor || !pop) return

    const a = anchor.getBoundingClientRect()
    const p = pop.getBoundingClientRect()

    // nad ikoną + lekki offset
    let left = a.left + a.width / 2 - p.width / 2
    let top = a.top - p.height - 10

    // clamp w viewport
    left = Math.max(10, Math.min(left, window.innerWidth - p.width - 10))
    top = Math.max(10, top)

    setPos({ left, top })
  }, [anchorSelector, hasCustomPos])

  const onHeaderMouseDown = (e) => {
    // drag tylko po headerze
    e.preventDefault()
    const pop = popRef.current
    if (!pop) return
    const r = pop.getBoundingClientRect()
    setDrag({ dragging: true, dx: e.clientX - r.left, dy: e.clientY - r.top })
    setHasCustomPos(true)
  }

  useEffect(() => {
    if (!drag.dragging) return

    const onMove = (e) => {
      const pop = popRef.current
      if (!pop) return
      const r = pop.getBoundingClientRect()
      const w = r.width
      const h = r.height

      let left = e.clientX - drag.dx
      let top = e.clientY - drag.dy

      left = Math.max(10, Math.min(left, window.innerWidth - w - 10))
      top = Math.max(10, Math.min(top, window.innerHeight - h - 10))

      setPos({ left, top })
    }
    const onUp = () => setDrag((d) => ({ ...d, dragging: false }))

    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('mouseup', onUp, true)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('mouseup', onUp, true)
    }
  }, [drag.dragging, drag.dx, drag.dy])

  return (
    <div
      ref={popRef}
      className="emoji-popover"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
      role="dialog"
      aria-label="Wybór emoji"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="emoji-popover__header"
        onMouseDown={onHeaderMouseDown}
        title="Przeciągnij, aby przesunąć"
      >
        <div className="emoji-popover__title">{title}</div>

        <div className="emoji-popover__actions">
          <button type="button" className="emoji-popover__btn" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </div>
      </div>

      <div className="emoji-popover__tabs" role="tablist" aria-label="Kategorie emoji">
        {Object.keys(EMOJI_SETS).map((k) => (
          <button
            key={k}
            type="button"
            className={`emoji-popover__tab ${k === activeTab ? 'is-active' : ''}`}
            onClick={() => setActiveTab(k)}
            role="tab"
            aria-selected={k === activeTab}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="emoji-popover__grid" role="list" aria-label="Emoji">
        {emojis.map((e) => (
          <button
            key={e}
            type="button"
            className="emoji-popover__emoji"
            onClick={() => onPick?.(e)}
            aria-label={`Emoji ${e}`}
            title={e}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="emoji-popover__footer">
        <button type="button" className="emoji-popover__cancel" onClick={onClose}>
          Anuluj
        </button>
      </div>
    </div>
  )
}
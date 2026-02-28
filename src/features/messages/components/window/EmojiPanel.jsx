// src/features/messages/pages/inbox/chat/EmojiPanel.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clamp } from '../../utils'

const EMOJI_SETS = {
  Różne: ['😀', '😄', '😁', '😂', '😊', '😉', '😍', '😘', '😎', '🤔', '😮', '😅', '😢', '😡', '👍', '🙏', '🔥', '🎉', '❤️', '💔'],
  Reakcje: ['👍', '👎', '❤️', '🔥', '😂', '😮', '😢', '😡', '🙏', '🎉'],
  Ręce: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '✌️', '👌', '🤌', '💪'],
}

// musi być NAD MessagesModal (2147483605)
const EMOJI_Z = 2147483615

export default function EmojiPanel({ open, anchorRef, onPick, onClose, title = 'Emoji' }) {
  const popRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Najczęstsze')
  const [pos, setPos] = useState({ left: 20, top: 20 })
  const drag = useRef({ on: false, dx: 0, dy: 0 })

  const emojis = useMemo(() => EMOJI_SETS[activeTab] || [], [activeTab])

  const computePos = useCallback(() => {
    const a = anchorRef?.current
    const p = popRef.current
    if (!a || !p) return null

    const ar = a.getBoundingClientRect()
    const pr = p.getBoundingClientRect()

    // nad anchor + wyśrodkowanie
    let left = ar.left + ar.width / 2 - pr.width / 2
    let top = ar.top - pr.height - 10

    left = clamp(left, 10, window.innerWidth - pr.width - 10)
    top = clamp(top, 10, window.innerHeight - pr.height - 10)

    return { left, top }
  }, [anchorRef])

  // po otwarciu: ustaw pozycję (po pierwszym renderze znamy rozmiar)
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      const next = computePos()
      if (next) setPos(next)
    })
    return () => cancelAnimationFrame(raf)
  }, [open, computePos])

  useEffect(() => {
    if (!open) return
    const onResize = () => {
      const next = computePos()
      if (next) setPos(next)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, computePos])

  // klik poza -> close
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const pop = popRef.current
      const anchor = anchorRef?.current
      if (!pop) return
      if (pop.contains(e.target)) return
      if (anchor && anchor.contains(e.target)) return
      onClose?.()
    }
    document.addEventListener('mousedown', onDoc, true)
    return () => document.removeEventListener('mousedown', onDoc, true)
  }, [open, onClose, anchorRef])

  // ESC -> close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  const startDrag = (e) => {
    const pop = popRef.current
    if (!pop) return
    drag.current.on = true
    const rect = pop.getBoundingClientRect()
    drag.current.dx = e.clientX - rect.left
    drag.current.dy = e.clientY - rect.top
    e.preventDefault()
  }

  const onMove = useCallback((e) => {
    if (!drag.current.on) return
    const pop = popRef.current
    const w = pop?.getBoundingClientRect?.().width || 320
    const h = pop?.getBoundingClientRect?.().height || 360

    const left = clamp(e.clientX - drag.current.dx, 10, window.innerWidth - w - 10)
    const top = clamp(e.clientY - drag.current.dy, 10, window.innerHeight - h - 10)
    setPos({ left, top })
  }, [])

  const stopDrag = useCallback(() => {
    drag.current.on = false
  }, [])

  useEffect(() => {
    if (!open) return
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('mouseup', stopDrag, true)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('mouseup', stopDrag, true)
    }
  }, [open, onMove, stopDrag])

  if (!open) return null

  return (
    <div
      ref={popRef}
      className="emoji-popover"
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: EMOJI_Z,
      }}
      role="dialog"
      aria-label="Wybór emoji"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="emoji-popover__header" onMouseDown={startDrag} title="Przeciągnij, aby przesunąć">
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
    </div>
  )
}
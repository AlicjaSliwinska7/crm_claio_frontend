// src/features/messages/pages/inbox/chat/ReactionBar.jsx
import React from 'react'

export default function ReactionBar({ open, onPick, onEnter, onLeave }) {
  if (!open) return null
  return (
    <div
      className="reaction-bar"
      role="group"
      aria-label="Dodaj reakcję"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={(e) => e.preventDefault()}
    >
      {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="reaction-btn"
          onClick={() => onPick?.(emoji)}
          aria-label={`Dodaj reakcję ${emoji}`}
        >
          <span className="reaction-emoji" aria-hidden="true">
            {emoji}
          </span>
        </button>
      ))}
    </div>
  )
}
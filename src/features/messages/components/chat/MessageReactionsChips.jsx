// src/features/messages/pages/inbox/chat/MessageReactionsChips.jsx
import React, { useMemo } from 'react'

export default function MessageReactionsChips({ reactions, isOwn }) {
  const counts = useMemo(() => {
    const acc = {}
    Object.values(reactions || {}).forEach((emoji) => {
      acc[emoji] = (acc[emoji] || 0) + 1
    })
    return acc
  }, [reactions])

  if (!Object.keys(counts).length) return null

  return (
    <div className={`message-reactions ${isOwn ? 'own' : ''}`}>
      {Object.entries(counts).map(([emoji, count]) => (
        <span key={emoji} className="message-reactions__chip">
          <span className="reaction-emoji" aria-hidden="true">
            {emoji}
          </span>
          <span className="message-reactions__count">{count}</span>
        </span>
      ))}
    </div>
  )
}
// src/features/messages/components/inbox/ChatHeader.jsx
import React, { useMemo } from 'react'

export default function ChatHeader({
  title,
  membersLabel,

  // ✅ wyszukiwanie w rozmowie
  messageSearch,
  onChangeMessageSearch,
  onClearMessageSearch,
  hitsCount,
  activeHitIdx,
  onPrevHit,
  onNextHit,
}) {
  const q = (messageSearch ?? '').toString()
  const hasQuery = q.trim().length > 0

  const safeHitsCount = Number.isFinite(Number(hitsCount)) ? Number(hitsCount) : 0
  const safeActiveIdx = Number.isFinite(Number(activeHitIdx)) ? Number(activeHitIdx) : 0

  const countText = useMemo(() => {
    if (!hasQuery) return '—'
    if (!safeHitsCount) return '0/0'
    const current = Math.min(Math.max(safeActiveIdx, 0), safeHitsCount - 1) + 1
    return `${current}/${safeHitsCount}`
  }, [hasQuery, safeHitsCount, safeActiveIdx])

  return (
    <div className="chat-header">
      <div className="chat-header__left">
        <b>{title}</b>
        <div className="chat-members">{membersLabel}</div>
      </div>

      <div className="chat-header__right" aria-label="Narzędzia rozmowy">
        <div className={`chat-search ${hasQuery ? 'is-active' : ''}`}>
          <input
            value={q}
            onChange={(e) => onChangeMessageSearch?.(e.target.value)}
            placeholder="Szukaj w rozmowie…"
            aria-label="Szukaj w rozmowie"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                if (hasQuery) {
                  e.preventDefault()
                  onClearMessageSearch?.()
                }
                return
              }
              if (e.key === 'Enter') {
                if (!hasQuery) return
                e.preventDefault()
                if (e.shiftKey) onPrevHit?.()
                else onNextHit?.()
              }
            }}
          />

          {/* ✅ elementy akcji nie znikają → nie “skacze” layout */}
          <span
            className="chat-search__count"
            title={hasQuery ? 'Liczba trafień' : 'Wpisz frazę, aby szukać'}
            aria-live="polite"
          >
            {countText}
          </span>

          <button
            className="chat-search__btn"
            onClick={() => (hasQuery ? onPrevHit?.() : null)}
            aria-label="Poprzednie trafienie"
            title="Poprzednie"
            type="button"
            disabled={!hasQuery || safeHitsCount < 1}
          >
            ‹
          </button>

          <button
            className="chat-search__btn"
            onClick={() => (hasQuery ? onNextHit?.() : null)}
            aria-label="Następne trafienie"
            title="Następne"
            type="button"
            disabled={!hasQuery || safeHitsCount < 1}
          >
            ›
          </button>

          <button
            className="chat-search__btn chat-search__btn--clear"
            onClick={() => (hasQuery ? onClearMessageSearch?.() : null)}
            aria-label="Wyczyść"
            title="Wyczyść"
            type="button"
            disabled={!hasQuery}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
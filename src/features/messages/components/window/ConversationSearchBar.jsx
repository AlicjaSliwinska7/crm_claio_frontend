// src/features/messages/components/inbox/ConversationSearchBar.jsx
import React, { useMemo } from 'react'

export default function ConversationSearchBar({
  value,
  onChange,
  onClear,
  hits = [],
  activeIdx = 0,
  onPrev,
  onNext,
}) {
  const hitLabel = useMemo(() => {
    const q = String(value ?? '').trim()
    if (!q) return '—'
    if (!hits?.length) return '0/0'
    return `${Math.min(activeIdx + 1, hits.length)}/${hits.length}`
  }, [value, hits, activeIdx])

  const hasQuery = String(value ?? '').trim().length > 0
  const hasHits = Array.isArray(hits) && hits.length > 0

  return (
    <div className="convsearch" aria-label="Szukaj w rozmowie">
      <div className="convsearch__field" role="search">
        <i className="fas fa-search" aria-hidden="true" />
        <input
          className="convsearch__input"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Szukaj w rozmowie…"
          aria-label="Szukaj w rozmowie"
          autoComplete="off"
        />

        {hasQuery && (
          <button
            type="button"
            className="convsearch__clear"
            onClick={onClear}
            title="Wyczyść"
            aria-label="Wyczyść wyszukiwanie"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="convsearch__hits" aria-label="Wyniki wyszukiwania">
        <span className={`convsearch__count ${hasQuery ? '' : 'is-muted'}`}>{hitLabel}</span>

        <button
          type="button"
          className="convsearch__btn"
          onClick={onPrev}
          disabled={!hasHits}
          title="Poprzedni wynik"
          aria-label="Poprzedni wynik"
        >
          <i className="fas fa-chevron-up" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="convsearch__btn"
          onClick={onNext}
          disabled={!hasHits}
          title="Następny wynik"
          aria-label="Następny wynik"
        >
          <i className="fas fa-chevron-down" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

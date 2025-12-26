import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchSuggestions({
  id,
  open,
  items,
  activeIndex,
  onHoverIndex,
  onPickClient,
  onClose,
  inputRef,
}) {
  const listRef = useRef(null)
  const navigate = useNavigate()

  // przewijanie do aktywnej pozycji
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!open) return null

  const handlePick = it => {
    onPickClient?.(it)
    onClose?.()
    if (it?.href) {
      navigate(it.href)
    }
    inputRef?.current?.focus?.()
  }

  return (
    <ul
      id={id}
      ref={listRef}
      className={`autocomplete-dropdown ${open ? 'is-open' : ''}`}
      role="listbox"
      aria-label="Sugestie wyszukiwania"
    >
      {!items || !items.length ? (
        <li className="autocomplete-item" role="option" aria-disabled="true">
          <span className="opt-label">Brak wyników</span>
        </li>
      ) : (
        items.map((it, idx) => {
          const isActive = idx === activeIndex
          const optionId = `${id}-opt-${idx}`

          return (
            <li
              id={optionId}
              key={it.id ?? idx}
              data-idx={idx}
              className={`autocomplete-item ${isActive ? 'is-active' : ''}`}
              role="option"
              aria-selected={isActive}
              onMouseEnter={() => onHoverIndex?.(idx)}
              onClick={() => handlePick(it)}
            >
              {/* cała szerokość jest klikalna i hoverowana */}
              <div className="sug-link">
                <div className="sug-left">
                  <span className="opt-label">{it.title || '(bez tytułu)'}</span>
                  {/* jeśli kiedyś chcesz opis pod tytułem, to tutaj */}
                  {/* {it.description ? <span className="opt-meta">{it.description}</span> : null} */}
                </div>

                {it.subtitle ? (
                  <div className="sug-meta hoverable-meta">
                    {it.subtitle}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })
      )}
    </ul>
  )
}

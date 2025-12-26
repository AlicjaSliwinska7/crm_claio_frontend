// src/app/layout/core/quick-access/components/Carousel.jsx
import React, { useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Tile from './Tile'
import AddButton from './AddButton'

function Carousel({
  shortcuts,
  manage,
  onNavigate,
  onRemove,
  onAddClick,
  railRef,
  canLeft,
  canRight,
  scrollLeft,
  scrollRight,
  onReorder, // ← NOWY props
}) {
  // trzymamy indeks aktualnie przeciąganego kafelka
  const dragIndexRef = useRef(null)

  const handleDragStart = useCallback(
    (index) => (e) => {
      if (!manage || !onReorder) return
      dragIndexRef.current = index
      e.dataTransfer.effectAllowed = 'move'
      // na wszelki wypadek dla FF:
      e.dataTransfer.setData('text/plain', String(index))
    },
    [manage, onReorder]
  )

  const handleDragOver = useCallback(
    (index) => (e) => {
      if (!manage || !onReorder) return
      e.preventDefault() // pozwól upuścić
      e.dataTransfer.dropEffect = 'move'
    },
    [manage, onReorder]
  )

  const handleDrop = useCallback(
    (index) => (e) => {
      if (!manage || !onReorder) return
      e.preventDefault()
      const from =
        dragIndexRef.current != null
          ? dragIndexRef.current
          : Number(e.dataTransfer.getData('text/plain'))
      const to = index
      if (Number.isFinite(from) && Number.isFinite(to) && from !== to) {
        onReorder(from, to)
      }
      dragIndexRef.current = null
    },
    [manage, onReorder]
  )

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null
  }, [])

  return (
    <div className="quick-access-carousel">
      <button
        type="button"
        className="carousel-button left"
        aria-label="Przewiń w lewo"
        disabled={!canLeft}
        onClick={scrollLeft}
      >
        ‹
      </button>

      <div className="qa-rail-wrap" role="region" aria-label="Skróty — przewijana lista">
        <div className="quick-access-buttons" ref={railRef}>
          {shortcuts.map((it, index) => (
            <div
              key={it.id}
              /* drag tylko w trybie manage */
              draggable={manage && typeof onReorder === 'function'}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <Tile
                id={it.id}
                label={it.label}
                manage={manage}
                onRemove={onRemove}
                onClick={() => onNavigate(it.to)}
              />
            </div>
          ))}

          <AddButton onClick={onAddClick} />
        </div>
      </div>

      <button
        type="button"
        className="carousel-button right"
        aria-label="Przewiń w prawo"
        disabled={!canRight}
        onClick={scrollRight}
      >
        ›
      </button>
    </div>
  )
}

Carousel.propTypes = {
  shortcuts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })
  ).isRequired,
  manage: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  onAddClick: PropTypes.func.isRequired,
  railRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  canLeft: PropTypes.bool,
  canRight: PropTypes.bool,
  scrollLeft: PropTypes.func.isRequired,
  scrollRight: PropTypes.func.isRequired,
  onReorder: PropTypes.func, // ← NOWY
}

Carousel.defaultProps = {
  manage: false,
  onRemove: undefined,
  railRef: undefined,
  canLeft: false,
  canRight: false,
  onReorder: undefined,
}

export default React.memo(Carousel)

import React from 'react'

export default function Handle({ open, onToggle, pos }) {
  return (
    <button
      id='shift-handle'
      type='button'
      className={`shift-handle ${open ? 'open' : ''}`}
      aria-expanded={open}
      aria-controls='shift-floating-panel'
      aria-haspopup='dialog'
      aria-label={open ? 'Zwiń listę zmian' : 'Pokaż listę zmian'}
      title={open ? 'Zwiń listę zmian' : 'Pokaż listę zmian'}
      onClick={onToggle}
      onPointerDown={(e) => e.preventDefault()}
      style={{ left: `${pos.handleLeft}px`, top: `${pos.handleTop}px` }}
    >
      <svg viewBox='0 0 24 24' width='18' height='18' aria-hidden='true' focusable='false'>
        <path
          d='M6 9l6 6 6-6'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  )
}

import React from 'react'

export default function Panel({ open, pos, children, wrapClassName = 'shift-groups' }) {
  return (
    <div
      id='shift-floating-panel'
      role='dialog'
      aria-modal='false'
      aria-labelledby='shift-handle'
      className={`shift-panel ${open ? 'open' : ''}`}
      style={{
        top: `${pos.contentTop}px`,
        left: `${pos.contentLeft}px`,
        width: `${pos.contentWidth}px`,
      }}
    >
      {/* ✅ Neutralny wrapper (zgodny z CSS: .shift-panel__content) */}
      <div className='shift-panel__content'>
        {/* ✅ Domyślnie dalej shift-groups, ale można podać inny */}
        <div className={wrapClassName}>{children}</div>
      </div>
    </div>
  )
}

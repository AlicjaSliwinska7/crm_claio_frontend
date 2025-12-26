import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavDropdown({
  id,
  iconClass,
  label,
  openId,             // aktualnie otwarte menu (string | null)
  setOpenId,          // setter (string|null) => void
  items = [],         // [{ kind:'link'|'action', to?, action?, label }]
  badgeCount = 0,     // licznik do wyświetlenia na ikonie
  onAction,           // (actionName) => void
}) {
  const isOpen = openId === id

  return (
    <div className='nav-item-with-submenu'>
      <div
        className={`nav-link ${isOpen ? 'active' : ''}`}
        role='button'
        aria-expanded={isOpen}
        onClick={() => setOpenId(isOpen ? null : id)}
      >
        <div className='shimmer-group nav-icon-wrapper'>
          <span className='icon-with-badge'>
            <i className={iconClass} aria-hidden='true' />
            {badgeCount > 0 && <span className='notification-badge'>{badgeCount}</span>}
          </span>
          <span>{label}</span>
          <i className={`fas fa-caret-down caret-icon ${isOpen ? 'rotated' : ''}`} aria-hidden='true' />
        </div>
      </div>

      {isOpen && (
        <div className='submenu'>
          {items.map((it, idx) => {
            if (it.kind === 'link') {
              return (
                <NavLink key={it.to || idx} to={it.to} className='submenu-link' onClick={() => setOpenId(null)}>
                  {it.label}
                </NavLink>
              )
            }
            // action
            return (
              <span
                key={it.action || idx}
                className='submenu-link'
                onClick={() => {
                  onAction?.(it.action)
                  setOpenId(null)
                }}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onAction?.(it.action)
                    setOpenId(null)
                  }
                }}
              >
                {it.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

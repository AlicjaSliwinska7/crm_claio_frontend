import React, { useCallback } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * Sekcja sidebaru, zgodna ze stylami:
 * - rodzic = <NavLink ...> (żeby działały .sidebar-nav a {...} i .sidebar-link)
 * - z submenu: klik/Enter/Space -> preventDefault + onToggle()
 * - bez submenu: normalna nawigacja po "base"
 */
export default function SidebarSection({
  section,               // { id, base, label, iconClass, items?: [{to,label}] }
  isOpen,                // boolean
  onToggle,              // (id) => void
  isParentActive = false,
  linkClass = 'sidebar-link',
  submenuClass = 'sidebar-submenu',
  iconPosition = 'left', // 'left' | 'right'
}) {
  const hasSub = !!(section.items && section.items.length)
  const ariaId = `section-${section.id}`

  // toggle tylko dla sekcji z submenu — blokujemy nawigację
  const handleClick = useCallback((e) => {
    if (!hasSub) return
    e.preventDefault()
    e.stopPropagation()
    onToggle(section.id)
  }, [hasSub, onToggle, section?.id])

  const handleKeyDown = useCallback((e) => {
    if (!hasSub) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onToggle(section.id)
    }
  }, [hasSub, onToggle, section?.id])

  // klasa rodzica: aktywna, jeśli sekcja ma aktywne dziecko lub (bez submenu) aktywny base
  const parentClass = ({ isActive }) =>
    [
      linkClass,
      (isParentActive || (!hasSub && isActive)) ? 'active' : ''
    ].join(' ').trim()

  return (
    <>
      {/* RODZIC (ZAWSZE <a>), żeby Twoje selektory .sidebar-nav a {...} łapały */}
      <NavLink
        to={section.base || '#'}
        className={parentClass}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={hasSub ? 'button' : undefined}
        aria-expanded={hasSub ? isOpen : undefined}
        aria-controls={hasSub ? ariaId : undefined}
        tabIndex={0}
      >
        {iconPosition === 'left' && (
          section.iconClass ? <i className={section.iconClass} aria-hidden="true" /> : null
        )}
        <span>{section.label}</span>
        {iconPosition === 'right' && (
          section.iconClass ? <i className={section.iconClass} aria-hidden="true" /> : null
        )}
      </NavLink>

      {/* SUBMENU */}
      {hasSub && isOpen && (
        <div id={ariaId} className={submenuClass} data-open="true">
          {section.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${linkClass} ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}

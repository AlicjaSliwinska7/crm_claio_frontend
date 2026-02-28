// src/app/layout/bars/shared/components/SidebarSection.jsx
import React, { useCallback, useMemo } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * SidebarSection
 * - parent is NavLink to preserve existing CSS selectors
 * - sections with submenu: click/Enter/Space toggles submenu (no navigation)
 * - sections without submenu: normal navigation
 *
 * NEW:
 * - onItemSelect(item, event) -> if returns true, navigation is prevented
 */
export default function SidebarSection({
  section,
  isOpen,
  onToggle,
  isParentActive = false,
  linkClass = 'sidebar-link',
  submenuClass = 'sidebar-submenu',
  iconPosition = 'left',

  // ✅ NEW
  onItemSelect,
}) {
  const hasSub = !!(section?.items && section.items.length)
  const sectionId = section?.id || ''
  const ariaId = useMemo(() => (sectionId ? `section-${sectionId}` : undefined), [sectionId])

  const handleClick = useCallback(
    (e) => {
      if (!hasSub) return
      e.preventDefault()
      e.stopPropagation()
      if (sectionId) onToggle(sectionId)
    },
    [hasSub, onToggle, sectionId]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (!hasSub) return
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        e.stopPropagation()
        if (sectionId) onToggle(sectionId)
      }
    },
    [hasSub, onToggle, sectionId]
  )

  const parentClass = useCallback(
    ({ isActive }) => {
      const active = hasSub ? (isOpen || isParentActive) : isActive
      return [linkClass, active ? 'active' : ''].join(' ').trim()
    },
    [hasSub, isOpen, isParentActive, linkClass]
  )

  const handleItemClick = useCallback(
    (item) => (e) => {
      if (!onItemSelect) return
      const handled = onItemSelect(item, e)
      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [onItemSelect]
  )

  return (
    <>
      <NavLink
        to={section?.base || '#'}
        className={parentClass}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={hasSub ? isOpen : undefined}
        aria-controls={hasSub ? ariaId : undefined}
        aria-haspopup={hasSub ? 'menu' : undefined}
        tabIndex={0}
      >
        {iconPosition === 'left' && section?.iconClass ? (
          <i className={section.iconClass} aria-hidden="true" />
        ) : null}

        <span>{section?.label}</span>

        {iconPosition === 'right' && section?.iconClass ? (
          <i className={section.iconClass} aria-hidden="true" />
        ) : null}
      </NavLink>

      {hasSub && isOpen && (
        <div id={ariaId} className={submenuClass} data-open="true">
          {section.items.map((item) => {
            const key = item.to || item.href || item.id || item.key || item.label
            const to = item.to || item.href || '#'

            return (
              <NavLink
                key={key}
                to={to}
                className={({ isActive }) => `${linkClass} ${isActive ? 'active' : ''}`.trim()}
                onClick={handleItemClick(item)}
              >
                {item.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </>
  )
}
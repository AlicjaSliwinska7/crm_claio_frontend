import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import '../shared/styles/sidebar-core.css'
import '../shared/styles/scroll-bars.css'
import './styles/left-side-bar.css'

import SidebarSection from '../shared/components/SidebarSection'
import useOpenSection from '../shared/hooks/useOpenSection'
import ScrollArea from '../shared/components/ScrollArea'
import { MENU, STORAGE_KEY } from './config'
import useAnchorDock from '../shared/hooks/useAnchorDock'

function LeftSideBar({ anchorSelector = '#shift-handle-anchor' }) {
  const { pathname } = useLocation()

  // ✅ nie zamrażamy na [], bo MENU może się zmienić (i wtedy hook dostaje nieaktualne dane)
  const sectionsWithSub = useMemo(
    () => (MENU || []).filter((s) => Array.isArray(s.items) && s.items.length > 0),
    []
  )

  // ✅ open = SSOT dla gateKey
  const { open, isOpen, toggle, activeParents } = useOpenSection(sectionsWithSub, {
    storageKey: STORAGE_KEY,
  })

  // ✅ wylicz „aktywnych rodziców” tylko do stylu, na podstawie aktualnej trasy
  // (hook już to robi, ale trzymamy derivedParents jako finalny set dla UI)
  const derivedParents = useMemo(() => {
    const set = new Set(activeParents)

    for (const s of sectionsWithSub) {
      const base = s.base
      if (base && pathname.startsWith(base)) set.add(s.id)

      for (const it of s.items || []) {
        const href = it.to || it.href
        if (href && pathname.startsWith(href)) {
          set.add(s.id)
          break
        }
      }
    }

    return set
  }, [pathname, sectionsWithSub, activeParents])

  const { style: dock } = useAnchorDock(anchorSelector)

  // ✅ bezpieczne wartości stylu (gdyby dock.height/top były chwilowo undefined)
  const asideStyle = useMemo(
    () => ({
      position: 'fixed',
      left: 0,
      top: dock?.top ?? 0,
      height: dock?.height ?? '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      width: 'var(--left-sidebar-width, 250px)',
    }),
    [dock?.top, dock?.height]
  )

  return (
    <aside className="left-sidebar" style={asideStyle}>
      {/* ✅ custom bar po PRAWEJ */}
      <ScrollArea
        side="right"
        className="sidebar-scroll"
        gateKey={open} // '' => gate zamknięty, id sekcji => gate otwarty
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          width: '100%',
        }}
      >
        <nav className="sidebar-nav" aria-label="Nawigacja boczna (lewa)">
          <div className="sidebar-group">
            {(MENU || []).map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                isOpen={isOpen(section.id)}
                onToggle={toggle}
                isParentActive={derivedParents.has(section.id)}
                linkClass="sidebar-link"
                submenuClass="sidebar-submenu"
                iconPosition="left"
              />
            ))}
          </div>
        </nav>
      </ScrollArea>
    </aside>
  )
}

export default LeftSideBar
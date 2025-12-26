import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// wspólne style (linki/submenu)
import '../shared/styles/sidebar-core.css';
// wspólne style scrollbara
import '../shared/styles/scroll-bars.css';
// specyficzne style lewego kontenera
import './styles/left-side-bar.css';

import SidebarSection from '../shared/components/SidebarSection';
import useOpenSection from '../shared/hooks/useOpenSection';
import ScrollArea from '../shared/components/ScrollArea';
import { MENU, STORAGE_KEY } from './config';

// ⬇ ważne: hook dokujący jak shift-drawer
import useAnchorDock from '../shared/hooks/useAnchorDock';

function LeftSideBar({ anchorSelector = '#shift-handle-anchor' }) {
  
  
  const { pathname } = useLocation();

  const sectionsWithSub = useMemo(
    () => MENU.filter((s) => Array.isArray(s.items) && s.items.length > 0),
    []
  );

  const { open, toggle, activeParents } = useOpenSection(sectionsWithSub, {
    storageKey: STORAGE_KEY,
  });

  const derivedParents = useMemo(() => {
    const set = new Set(activeParents);
    for (const s of sectionsWithSub) {
      if (s.base && pathname.startsWith(s.base)) set.add(s.id);
      for (const it of s.items || []) {
        const href = it.to || it.href;
        if (href && pathname.startsWith(href)) {
          set.add(s.id);
          break;
        }
      }
    }
    return set;
  }, [pathname, sectionsWithSub, activeParents]);

  // ⬇ top/height liczone od kotwicy jak w shift-drawer
  const { style } = useAnchorDock(anchorSelector);

  return (
    <aside
      className="left-sidebar"
      /* aside jest pozycjonowany jak shift-drawer:
         - position: fixed (nadawane inline)
         - top/height z hooka (dynamiczne)
         - szerokość/wygląd trzymamy w CSS left-side-bar.css
      */
      style={{
        position: 'fixed',
        left: 0,
        top: style.top,
        height: style.height,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {/* ScrollArea = element przewijany; lewy sidebar => side="left" (thumb po prawej) */}
      <ScrollArea
        side="left"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          width: '100%',
        }}
      >
        <nav className="sidebar-nav" aria-label="Nawigacja boczna (lewa)">
          <div className="sidebar-group">
            {MENU.map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                isOpen={open === section.id}
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
  );
}

export default LeftSideBar;

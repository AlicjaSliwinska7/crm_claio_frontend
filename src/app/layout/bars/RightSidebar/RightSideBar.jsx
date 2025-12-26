import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// wspólne style linków/submenu + util .is-right
import '../shared/styles/sidebar-core.css';
// minimalistyczny scrollbar dla ScrollArea
import '../shared/styles/scroll-bars.css';
// layout kontenera prawego sidebara
import './styles/right-side-bar.css';
// kalendarz (scoped)
import './styles/day-calendar.css';

import SidebarSection from '../shared/components/SidebarSection';
import useOpenSection from '../shared/hooks/useOpenSection';
import ScrollArea from '../shared/components/ScrollArea';
import DayCalendar from './components/DayCalendar';
import { MENU, STORAGE_KEY } from './config';

// ⬇ dokowanie jak shift-drawer (ta sama kotwica)
import useAnchorDock from '../shared/hooks/useAnchorDock';

const DayOverviewModal = lazy(() =>
  import('../../../../shared/modals/modals/DayOverviewModal')
);

function RightSideBar({
  currentUser = 'Alicja Śliwińska',
  tasks = [],
  posts = [],
  trainings = [],
  samples = [],
  orders = [],
  customHolidays = [], // ['yyyy-MM-dd']
  anchorSelector = '#shift-handle-anchor',
}) {
  const navigate = useNavigate();
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

  const [selectedDate, setSelectedDate] = useState(null);

  // ⬇ top/height liczone od kotwicy jak w shift-drawer
  const { style } = useAnchorDock(anchorSelector);

  // dodatkowy odstęp od LowerNavBar (jak w lewym sidebarze)
  const GAP = 12;
  const dockTop = (style?.top ?? 145) + GAP;
  const dockHeight = Math.max(0, (style?.height ?? (window?.innerHeight || 0) - 145) - GAP);

  return (
    <aside
      className="right-sidebar"
      /* aside NIE przewija; top/height z hooka; przewijanie wewnątrz ScrollArea */
      style={{
        position: 'fixed',
        right: 0,
        top: dockTop,
        height: dockHeight,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '14rem',
      }}
    >
      {/* ScrollArea przewija i ma scrollbar po LEWEJ → side="right" */}
      <ScrollArea
        side="right"
        style={{ flex: '1 1 auto', minHeight: 0, width: '100%' }}
      >
        <div className="right-sidebar-calendar">
          <DayCalendar customHolidays={customHolidays} onSelectDay={setSelectedDate} />
        </div>

        {/* .is-right -> lustrzane wyrównania (tekst/ikonki/padding) */}
        <nav
          className="sidebar-nav is-right right-sidebar-nav"
          aria-label="Nawigacja boczna (prawa)"
        >
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
                iconPosition="right"
              />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {selectedDate && (
        <Suspense fallback={null}>
          <DayOverviewModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
            currentUser={currentUser}
            tasks={tasks}
            posts={posts}
            trainings={trainings}
            samples={samples}
            orders={orders}
            onGoToTask={(id) => navigate(`/zadania/${id}`)}
            onGoToPost={(id) => navigate(`/tablica/post/${id}`)}
            onGoToTraining={(id) => navigate(`/administracja/szkolenia/${id}`)}
            onAddTask={(d) => navigate(`/zadania/nowe?date=${d.toISOString()}`)}
            onAddPost={(d) => navigate(`/tablica/dodaj?date=${d.toISOString()}`)}
            onAddTraining={(d) => navigate(`/administracja/szkolenia?date=${d.toISOString()}`)}
          />
        </Suspense>
      )}
    </aside>
  );
}

export default RightSideBar;

// src/app/layout/bars/RightSidebar/RightSideBar.jsx
import React, { lazy, Suspense, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// wspólne style linków/submenu + util .is-right
import '../shared/styles/sidebar-core.css'
// minimalistyczny scrollbar dla ScrollArea
import '../shared/styles/scroll-bars.css'
// layout kontenera prawego sidebara
import './styles/right-side-bar.css'
// kalendarz (scoped)
import './styles/day-calendar.css'

import SidebarSection from '../shared/components/SidebarSection'
import useOpenSection from '../shared/hooks/useOpenSection'
import ScrollArea from '../shared/components/ScrollArea'
import DayCalendar from './components/DayCalendar'
import { MENU, STORAGE_KEY } from './config'

// dokowanie jak w lewym
import useAnchorDock from '../shared/hooks/useAnchorDock'

const DayOverviewModal = lazy(() => import('../../../../shared/modals/modals/DayOverviewModal'))

const toISODate = (d) => {
  try {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } catch {
    return ''
  }
}

function RightSideBar({
  currentUser = 'Alicja Śliwińska',
  tasks = [],
  posts = [],
  trainings = [],
  samples = [],
  orders = [],
  customHolidays = [],
  anchorSelector = '#shift-handle-anchor',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location

  const sectionsWithSub = useMemo(
    () => MENU.filter((s) => Array.isArray(s.items) && s.items.length > 0),
    []
  )

  // SSOT – identycznie jak w lewym
  const { open, isOpen, toggle, activeParents } = useOpenSection(sectionsWithSub, {
    storageKey: STORAGE_KEY,
  })

  const derivedParents = useMemo(() => {
    const set = new Set(activeParents)
    for (const s of sectionsWithSub) {
      if (s.base && pathname.startsWith(s.base)) set.add(s.id)
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

  const [selectedDate, setSelectedDate] = useState(null)
  const [lastPickedDate, setLastPickedDate] = useState(null)

  const { style } = useAnchorDock(anchorSelector)

  // ✅ klucz: route modalowy dla planera
  const handleItemSelect = useCallback(
    (item, e) => {
      const to = item?.to || item?.href

      if (to === '/terminy/zaplanuj-grafik') {
        e?.preventDefault?.()
        e?.stopPropagation?.()

        const date = lastPickedDate || new Date()
        const q = toISODate(date)
        const url = q ? `${to}?date=${encodeURIComponent(q)}` : to

        // background => modal nad obecną stroną
        navigate(url, { state: { background: location } })
        return true
      }

      return false
    },
    [navigate, lastPickedDate, location]
  )

  return (
    <aside
      className="right-sidebar"
      style={{
        position: 'fixed',
        right: 0,
        top: style.top,
        height: style.height,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '14rem',
        '--sidebar-dock-top': style.top,
      }}
    >
      <ScrollArea
        side="left"
        gateKey={open}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          width: '100%',
        }}
      >
        <div className="right-sidebar-calendar">
          <DayCalendar
            customHolidays={customHolidays}
            onSelectDay={(d) => {
              setSelectedDate(d)
              setLastPickedDate(d)
            }}
          />
        </div>

        <nav className="sidebar-nav is-right right-sidebar-nav" aria-label="Nawigacja boczna (prawa)">
          <div className="sidebar-group">
            {MENU.map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                isOpen={isOpen(section.id)}
                onToggle={toggle}
                isParentActive={derivedParents.has(section.id)}
                linkClass="sidebar-link"
                submenuClass="sidebar-submenu"
                iconPosition="right"
                onItemSelect={handleItemSelect}
              />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {selectedDate && (
        <Suspense fallback={<div style={{ height: 1 }} />}>
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
  )
}

export default RightSideBar
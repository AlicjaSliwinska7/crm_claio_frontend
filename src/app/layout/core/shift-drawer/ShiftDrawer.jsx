// src/app/layout/core/shift-drawer/ShiftDrawer.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import './styles/shift-drawer.css'

import useShiftPortal from './hooks/useShiftPortal'
import useShiftPosition from './hooks/useShiftPosition'

import Handle from './components/Handle'
import Panel from './components/Panel'
import GroupList from './components/GroupList'

import { useAppData } from '../../../providers/AppDataProvider.jsx'

export default function ShiftDrawer({ anchorSelector = '#shift-handle-anchor' }) {
  const [open, setOpen] = useState(false)
  const [cleaningOpen, setCleaningOpen] = useState(true)

  const { cleaningSchedule, employees } = useAppData() || {}

  const portalEl = useShiftPortal()
  const rootRef = useRef(null)

  // mrożenie pozycji po otwarciu = brak „skoku”
  const pos = useShiftPosition(anchorSelector, true, open)

  // MOCK zmian (podmień na dane z backendu)
  const groups = useMemo(
    () => [
      { id: 1, label: '1 zmiana', people: ['Alicja Śliwińska', 'Jan Kowalski'] },
      { id: 2, label: '2 zmiana', people: ['Anna Nowak', 'Piotr Zieliński'] },
      { id: 3, label: '3 zmiana', people: ['Katarzyna Wójcik', 'Michał Lewandowski'] },
    ],
    []
  )

  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  // ✅ Sprzątanie "na dziś" z grafiku (A/B/C/D)
  const cleaningTodayGroups = useMemo(() => {
    const list = Array.isArray(employees) ? employees : []
    const sched = cleaningSchedule || {}

    const buckets = { a: [], b: [], c: [], d: [] }

    for (const name of list) {
      const v = (sched?.[name]?.[todayKey] ?? '').toString().trim().toLowerCase()
      if (v === 'a' || v === 'b' || v === 'c' || v === 'd') buckets[v].push(name)
    }

    const asGroup = (key, label) => ({
      id: `clean-${key}`,
      label,
      people: buckets[key].length ? buckets[key] : ['(brak)'],
    })

    return [
      asGroup('a', 'Sprzątanie — Budynek A'),
      asGroup('b', 'Sprzątanie — Budynek B'),
      asGroup('c', 'Sprzątanie — Budynek C'),
      asGroup('d', 'Sprzątanie — Budynek D'),
    ]
  }, [employees, cleaningSchedule, todayKey])

  // zamykanie kliknięciem poza panelem + ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!portalEl) return null

  return createPortal(
    <div ref={rootRef} className="shift-drawer-root" aria-label="Zmiany — dzisiaj">
      <Handle open={open} onToggle={() => setOpen((v) => !v)} pos={pos} />

      <Panel open={open} pos={pos} wrapClassName="shift-panel__content">
        {/* ZMIANY — grid */}
        <div className="shift-groups" aria-label="Zmiany">
          <GroupList groups={groups} showDots={false} />
        </div>

        {/* SPRZĄTANIE — sekcja pod spodem, rozwijana */}
        <div className="shift-drawer__section" aria-label="Grafik sprzątania — dzisiaj">

          {cleaningOpen && (
            <div className="shift-groups shift-groups--cleaning">
              <GroupList groups={cleaningTodayGroups} showDots={false} />
            </div>
          )}
        </div>
      </Panel>
    </div>,
    portalEl
  )
}
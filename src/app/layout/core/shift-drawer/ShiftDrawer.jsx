// src/app/layout/core/shift-drawer/ShiftDrawer.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './styles/shift-drawer.css'

import useShiftPortal from './hooks/useShiftPortal'
import useShiftPosition from './hooks/useShiftPosition'

import Handle from './components/Handle'
import Panel from './components/Panel'
import GroupList from './components/GroupList'

export default function ShiftDrawer({ anchorSelector = '#shift-handle-anchor' }) {
	const [open, setOpen] = useState(false)
	const portalEl = useShiftPortal() // ⬅ bez parametru isOwner
	const rootRef = useRef(null)

	// mrożenie pozycji po otwarciu = brak „skoku”
	const pos = useShiftPosition(anchorSelector, true, open)

	// MOCK (podmień na dane z backendu)
	const groups = useMemo(
		() => [
			{ id: 1, label: '1 zmiana', people: ['Alicja Śliwińska', 'Jan Kowalski'] },
			{ id: 2, label: '2 zmiana', people: ['Anna Nowak', 'Piotr Zieliński'] },
			{ id: 3, label: '3 zmiana', people: ['Katarzyna Wójcik', 'Michał Lewandowski'] },
		],
		[]
	)

	// zamykanie kliknięciem poza panelem + ESC
	useEffect(() => {
		const onDocClick = e => {
			if (!open) return
			if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
		}
		const onKey = e => {
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
		<div ref={rootRef} className='shift-drawer-root' aria-label='Zmiany — dzisiaj'>
			<Handle open={open} onToggle={() => setOpen(v => !v)} pos={pos} />
			<Panel open={open} pos={pos}>
				<GroupList groups={groups} showDots={false} />
			</Panel>
		</div>,
		portalEl
	)
}

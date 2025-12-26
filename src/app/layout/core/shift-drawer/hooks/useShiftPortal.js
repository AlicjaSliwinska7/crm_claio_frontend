// src/app/layout/core/shift-drawer/useShiftPortal.js
import { useEffect, useState } from 'react'

const PORTAL_ID = 'shift-drawer-portal'

export default function useShiftPortal() {
	const [portalEl, setPortalEl] = useState(null)

	useEffect(() => {
		let el = document.getElementById(PORTAL_ID)

		if (!el) {
			el = document.createElement('div')
			el.id = PORTAL_ID
			// NIE ustawiamy z-index inline – kontrola przez CSS wewnątrz
			Object.assign(el.style, {
				position: 'fixed',
				inset: '0',
				pointerEvents: 'none',
			})
			document.body.appendChild(el)
		} else {
			// Jeżeli gdzieś kiedyś ustawiliśmy „kosmiczny” z-index, wyczyść
			el.style.zIndex = '' // wróć do auto
			el.style.pointerEvents = 'none'
			el.style.position = 'fixed'
			el.style.inset = '0'
		}

		setPortalEl(el)
		// Portalu nie usuwamy przy unmount – może być używany na innych podstronach
	}, [])

	return portalEl
}

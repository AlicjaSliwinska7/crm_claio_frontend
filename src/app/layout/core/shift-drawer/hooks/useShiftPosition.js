import { useEffect, useRef, useState } from 'react'

/**
 * Pozycjonowanie uchwytu i panelu względem .main-area / kotwicy.
 */
export default function useShiftPosition(
	anchorSelector = '#shift-handle-anchor, [data-shift-anchor]',
	freezeWhileOpen = false,
	isOpen = false
) {
	const [pos, setPos] = useState(() => ({
		handleTop: 100,
		handleLeft: 0,
		contentTop: 132,
		contentLeft: 16,
		contentWidth: 600,
	}))

	const rafIdRef = useRef(0)
	const mountedRef = useRef(false)

	useEffect(() => {
		const w = typeof window !== 'undefined' ? window : null
		const d = typeof document !== 'undefined' ? document : null
		if (!w || !d) return
		mountedRef.current = true

		const HANDLE_OFFSET_Y = 0
		const PANEL_GAP_Y = 10
		const HANDLE_H = 20
		const MAIN_SEL = '.main-area'

		const place = () => {
			if (!mountedRef.current) return
			const anc = d.querySelector(anchorSelector)
			const main = d.querySelector(MAIN_SEL)

			const vw = w.innerWidth
			const vh = w.innerHeight

			const mainRect = main
				? main.getBoundingClientRect()
				: {
						left: Math.max((vw - 1100) / 2, 16),
						width: Math.min(vw - 32, 1100),
						top: 84,
				  }

			const panelLeft = Math.round(mainRect.left)
			const panelWidth = Math.round(mainRect.width)
			const handleLeft = Math.round(panelLeft + panelWidth / 2)

			let handleTop = Math.round(mainRect.top) + HANDLE_OFFSET_Y
			if (anc) {
				const r = anc.getBoundingClientRect()
				handleTop = Math.round(r.top) + HANDLE_OFFSET_Y
			}

			const minTop = 6
			const maxTop = vh - 48
			handleTop = Math.max(minTop, Math.min(handleTop, maxTop))

			setPos({
				handleTop,
				handleLeft,
				contentTop: handleTop + HANDLE_H + PANEL_GAP_Y,
				contentLeft: panelLeft,
				contentWidth: panelWidth,
			})
		}

		const schedule = () => {
			if (rafIdRef.current) return
			rafIdRef.current = w.requestAnimationFrame(() => {
				rafIdRef.current = 0
				if (freezeWhileOpen && isOpen) return
				place()
			})
		}

		place()
		w.addEventListener('resize', schedule, { passive: true })
		w.addEventListener('scroll', schedule, { passive: true })
		w.addEventListener('orientationchange', schedule, { passive: true })

		const iv = w.setInterval(place, 250)
		const to = w.setTimeout(() => w.clearInterval(iv), 2000)

		let ro
		const mainForRO = d.querySelector(MAIN_SEL)
		if (mainForRO && 'ResizeObserver' in w) {
			ro = new ResizeObserver(() => {
				if (!(freezeWhileOpen && isOpen)) place()
			})
			ro.observe(mainForRO)
		}

		let mo
		if ('MutationObserver' in w) {
			mo = new MutationObserver(() => {
				if (d.querySelector(anchorSelector)) {
					if (!(freezeWhileOpen && isOpen)) place()
				}
			})
			mo.observe(d.body, { childList: true, subtree: true })
		}

		return () => {
			mountedRef.current = false
			w.clearTimeout(to)
			w.clearInterval(iv)
			w.removeEventListener('resize', schedule)
			w.removeEventListener('scroll', schedule)
			w.removeEventListener('orientationchange', schedule)
			if (rafIdRef.current) {
				w.cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = 0
			}
			if (ro) ro.disconnect()
			if (mo) mo.disconnect()
		}
	}, [anchorSelector, freezeWhileOpen, isOpen])

	return pos
}

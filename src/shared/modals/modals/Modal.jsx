// src/shared/modals/modals/Modal.jsx
import React, { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import '../styles/modal.css' // layout (overlay, grid, centrowanie/sheet)
import '../styles/form-modal.css' // wygląd (blue underline)

/**
 * Wspólny modal – pełnoekranowy overlay (portal do document.body).
 *
 * Props:
 * - title?: string
 * - onClose: () => void
 * - size?: 'sm' | 'md' | 'lg'      (domyślnie 'md')
 * - showClose?: boolean            (domyślnie true)
 * - closeOnBackdrop?: boolean      (domyślnie true)
 * - closeOnEsc?: boolean           (domyślnie true)
 * - ariaLabel?: string             (gdy brak title)
 * - className?: string             (dodatkowe klasy na kontenerze dialogu)
 * - sheet?: boolean                (domyślnie false) — layout „spod navbarów”
 */

let __openModalCount = 0 // licznik globalny otwartych modali

// 🚀 Zapasowy „sufit” – na wypadek kosmicznych z-indexów gdzieś indziej
const MODAL_Z = 2147483600

export default function Modal({
	title,
	onClose,
	children,
	size = 'md',
	showClose = true,
	closeOnBackdrop = true,
	closeOnEsc = true,
	ariaLabel,
	className = '',
	sheet = false,
}) {
	const backdropRef = useRef(null)
	const dialogRef = useRef(null)
	const restoreFocusElRef = useRef(null)
	const titleId = useId()

	// 1) ESC zamyka modal
	useEffect(() => {
		if (!closeOnEsc) return
		const onKey = e => {
			if (e.key === 'Escape') onClose?.()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [closeOnEsc, onClose])

	// 2) Blokada scrolla + kompensacja, atrybut na <body>, focus + restore
	useEffect(() => {
		const body = document.body
		const docEl = document.documentElement

		// zapamiętaj element aktywny (do przywrócenia)
		restoreFocusElRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

		// kompensacja szerokości scrollbara, aby layout nie „skakał”
		const prevPaddingRight = body.style.paddingRight
		const hadVerticalScroll = docEl.scrollHeight > docEl.clientHeight
		const scrollbarW = window.innerWidth - docEl.clientWidth
		if (hadVerticalScroll && scrollbarW > 0) {
			body.style.paddingRight = `${scrollbarW}px`
		}

		// blokada scrolla (z zachowaniem poprzedniego stanu)
		const prevOverflow = body.style.overflow
		body.style.overflow = 'hidden'

		// licznik otwartych modali → atrybut na <body> (steruje z-index shiftdrawera)
		__openModalCount += 1
		body.setAttribute('data-modal-open', String(__openModalCount))

		// ustaw focus wewnątrz dialogu
		const root = dialogRef.current
		const firstFocusable = root?.querySelector(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)
		if (firstFocusable instanceof HTMLElement) firstFocusable.focus()
		else if (root) root.focus()

		return () => {
			// przywróć padding i overflow
			body.style.paddingRight = prevPaddingRight
			body.style.overflow = prevOverflow

			// aktualizuj licznik + data-attr
			__openModalCount = Math.max(0, __openModalCount - 1)
			if (__openModalCount === 0) body.removeAttribute('data-modal-open')
			else body.setAttribute('data-modal-open', String(__openModalCount))

			// przywróć focus
			try {
				restoreFocusElRef.current?.focus?.()
			} catch {}
		}
	}, [])

	// 3) Focus-trap (Tab/Shift+Tab nie wychodzi poza modal)
	useEffect(() => {
		const root = dialogRef.current
		if (!root) return

		const onKeyDown = e => {
			if (e.key !== 'Tab') return

			const focusables = root.querySelectorAll(
				[
					'a[href]',
					'area[href]',
					'button:not([disabled])',
					'input:not([disabled])',
					'select:not([disabled])',
					'textarea:not([disabled])',
					'[tabindex]:not([tabindex="-1"])',
					'[contenteditable="true"]',
				].join(',')
			)

			const list = Array.from(focusables).filter(el => el instanceof HTMLElement && el.offsetParent !== null)
			if (!list.length) return

			const first = list[0]
			const last = list[list.length - 1]

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		}

		root.addEventListener('keydown', onKeyDown)
		return () => root.removeEventListener('keydown', onKeyDown)
	}, [])

	// 4) Klik w backdrop zamyka modal (jeśli włączone)
	const handleBackdropMouseDown = e => {
		if (!closeOnBackdrop) return
		if (e.target === e.currentTarget) onClose?.()
	}

	// 5) A11y – aria-labelledby lub aria-label
	const a11yProps =
		title != null && title !== '' ? { 'aria-labelledby': titleId } : ariaLabel ? { 'aria-label': ariaLabel } : {}

	// 6) Render overlay + dialog w portalu
	const overlay = (
		<div
			className={`ui-modal__backdrop${sheet ? ' ui-modal__backdrop--sheet' : ''}`}
			role='presentation'
			onMouseDown={handleBackdropMouseDown}
			ref={backdropRef}
			// „sufit bezpieczeństwa” w razie nieposłusznych warstw
			style={{ zIndex: MODAL_Z }}>
			<div
				className={`ui-modal ui-modal--${size} ${className}`.trim()}
				role='dialog'
				aria-modal='true'
				{...a11yProps}
				ref={dialogRef}
				tabIndex={-1}
				onMouseDown={e => e.stopPropagation()}
				// dialog minimalnie nad backdropem
				style={{ zIndex: MODAL_Z + 1 }}>
				{(title || showClose) && (
					<div className='ui-modal__header'>
						{title ? (
							<h3 id={titleId} className='ui-modal__title'>
								{title}
							</h3>
						) : (
							<span />
						)}
						{showClose && (
							<button className='ui-modal__close' onClick={onClose} aria-label='Zamknij'>
								×
							</button>
						)}
					</div>
				)}

				<div className='ui-modal__body'>{children}</div>
			</div>
		</div>
	)

	return createPortal(overlay, document.body)
}

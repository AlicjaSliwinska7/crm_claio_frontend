import React, { useEffect, useRef, useState } from 'react'

let __SHIFT_ANCHOR_OWNER__ = null // modułowy lock

export default function ShiftAnchor() {
	const tokenRef = useRef(Symbol('shift-anchor'))
	const [owned, setOwned] = useState(false)

	useEffect(() => {
		tryAcquire()
		return () => {
			if (__SHIFT_ANCHOR_OWNER__ === tokenRef.current) {
				__SHIFT_ANCHOR_OWNER__ = null
				window.dispatchEvent(new Event('shift-anchor:ownership'))
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (owned) return
		const onChange = () => tryAcquire()
		window.addEventListener('shift-anchor:ownership', onChange)
		return () => window.removeEventListener('shift-anchor:ownership', onChange)
	}, [owned])

	function tryAcquire() {
		if (__SHIFT_ANCHOR_OWNER__ === null) {
			__SHIFT_ANCHOR_OWNER__ = tokenRef.current
			setOwned(true)
			window.dispatchEvent(new Event('shift-anchor:ownership'))
		} else if (__SHIFT_ANCHOR_OWNER__ === tokenRef.current) {
			setOwned(true)
		}
	}

	if (!owned) return null

	return (
		<div className='shift-handle-buffer' aria-hidden='true'>
			<span id='shift-handle-anchor' className='shift-handle-anchor' />
		</div>
	)
}

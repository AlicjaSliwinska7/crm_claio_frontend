import { useEffect, useRef } from 'react'

// modułowy „lock” – gwarantuje jedną instancję w aplikacji
let __SHIFT_DRAWER_OWNER__ = false

export default function useShiftOwner() {
  const own = useRef(false)
  if (!own.current) {
    if (!__SHIFT_DRAWER_OWNER__) { __SHIFT_DRAWER_OWNER__ = true; own.current = true }
  }

  useEffect(() => {
    return () => { if (own.current) __SHIFT_DRAWER_OWNER__ = false }
  }, [])

  return own.current
}

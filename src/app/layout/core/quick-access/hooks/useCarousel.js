// src/app/layout/core/quick-access/hooks/useCarousel.js
import { useCallback, useEffect, useRef, useState } from 'react'

export default function useCarousel(options = {}) {
  const { blockWheel = true } = options

  const railRef = useRef(null)
  const rafRef = useRef(0)

  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const SCROLL_STEP_FRACTION = 0.85

  const getStep = useCallback(() => {
    const el = railRef.current
    if (!el) return 280
    return Math.max(220, Math.floor(el.clientWidth * SCROLL_STEP_FRACTION))
  }, [])

  const _update = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 2)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2)
  }, [])

  const updateArrows = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(_update)
  }, [_update])

  useEffect(() => {
    const el = railRef.current
    if (!el) return

    const prevent = (e) => {
      // blokuj pionowe przewijanie wewnątrz szyny, ale pozwól na h-scroll kółkiem
      if (!blockWheel) return
      // jeśli użytkownik przewija pionowo lub dotyk przesuwa page, stop
      if (Math.abs(e.deltaY || 0) > Math.abs(e.deltaX || 0)) {
        e.preventDefault()
      }
    }

    // wheel/touchmove mogą „ciągnąć” stronę — opcjonalnie blokujemy
    if (blockWheel) {
      el.addEventListener('wheel', prevent, { passive: false })
      el.addEventListener('touchmove', prevent, { passive: false })
    }

    updateArrows()
    const onScroll = () => updateArrows()
    const onResize = () => updateArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize)
    }

    return () => {
      if (blockWheel) {
        el.removeEventListener('wheel', prevent)
        el.removeEventListener('touchmove', prevent)
      }
      el.removeEventListener('scroll', onScroll)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize)
      }
      cancelAnimationFrame(rafRef.current)
    }
  }, [blockWheel, updateArrows])

  const scrollLeft = useCallback(() => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: -getStep(), behavior: 'smooth' })
  }, [getStep])

  const scrollRight = useCallback(() => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: getStep(), behavior: 'smooth' })
  }, [getStep])

  const bumpRightAfterAdd = useCallback(() => {
    requestAnimationFrame(scrollRight)
  }, [scrollRight])

  return {
    railRef,
    canLeft,
    canRight,
    scrollLeft,
    scrollRight,
    bumpRightAfterAdd,
    updateArrows,
  }
}

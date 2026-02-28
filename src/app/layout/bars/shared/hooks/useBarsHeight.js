// src/app/layout/bars/shared/hooks/useBarsHeight.js
import { useEffect, useRef, useState } from 'react'

/**
 * Mierzy łączną wysokość górnych pasków (Upper + Lower) i zwraca px.
 * Reaguje na:
 * - resize okna
 * - realne zmiany wysokości elementów (ResizeObserver)
 * - późny render / podmianę DOM (MutationObserver) — tylko do wykrycia, że paski się pojawiły/zmieniły
 *
 * Domyślne selektory:
 * - upper: .upper-navbar
 * - lower: .lower-navbar
 */
export default function useBarsHeight({
  upperSelector = '.upper-navbar',
  lowerSelector = '.lower-navbar',
  fallback = 70,
} = {}) {
  const [barsHeight, setBarsHeight] = useState(fallback)

  // stabilizacja setState
  const last = useRef(null)

  // guard: nie planuj wielu RAF-ów w tej samej klatce
  const rafPlanned = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    let rafId = 0
    let ro = null
    let mo = null

    const pick = () => ({
      upper: document.querySelector(upperSelector),
      lower: document.querySelector(lowerSelector),
    })

    const measureNow = () => {
      rafPlanned.current = false

      const { upper, lower } = pick()

      const hUpper = upper ? Math.round(upper.getBoundingClientRect().height) : 0
      const hLower = lower ? Math.round(lower.getBoundingClientRect().height) : 0

      const sum = hUpper + hLower
      const next = sum > 0 ? sum : fallback

      if (last.current !== next) {
        last.current = next
        setBarsHeight(next)
      }
    }

    const scheduleMeasure = () => {
      if (rafPlanned.current) return
      rafPlanned.current = true
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(measureNow)
    }

    // 1) podstawowe: od razu + po tickach (fonty/layout)
    scheduleMeasure()
    const t1 = setTimeout(scheduleMeasure, 50)
    const t2 = setTimeout(scheduleMeasure, 200)
    const t3 = setTimeout(scheduleMeasure, 600)

    // 2) resize okna
    window.addEventListener('resize', scheduleMeasure, { passive: true })

    // 3) ResizeObserver: realne zmiany wysokości pasków
    const attachResizeObserver = () => {
      const { upper, lower } = pick()
      if (!('ResizeObserver' in window)) return

      // odpinamy poprzedni RO, jeśli był
      if (ro) ro.disconnect()

      ro = new ResizeObserver(() => scheduleMeasure())
      if (upper) ro.observe(upper)
      if (lower) ro.observe(lower)
    }

    attachResizeObserver()

    // 4) MutationObserver: tylko do wykrycia zmian DOM (pojawienie/podmiana pasków)
    // ✅ bez attributes — bo to generuje bardzo dużo wywołań i nie jest potrzebne,
    //    skoro wysokości łapie ResizeObserver.
    if ('MutationObserver' in window) {
      mo = new MutationObserver(() => {
        attachResizeObserver()
        scheduleMeasure()
      })

      mo.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      window.removeEventListener('resize', scheduleMeasure)
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (ro) ro.disconnect()
      if (mo) mo.disconnect()
    }
  }, [upperSelector, lowerSelector, fallback])

  return barsHeight
}
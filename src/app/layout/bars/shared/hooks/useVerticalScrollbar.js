import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Custom vertical scrollbar logic (bars)
 *
 * Gate is external (enabled):
 * - enabled=false => never show scrollbar (even if overflow exists)
 * - enabled=true  => show scrollbar only if overflow is meaningful
 */
export default function useVerticalScrollbar(deps = [], { enabled = true } = {}) {
  const frameRef = useRef(null)
  const scrollerRef = useRef(null)
  const barRef = useRef(null)

  const [state, setState] = useState({
    thumbH: 0,
    thumbY: 0,
    isScrollable: false,
  })

  const MIN_THUMB = 28
  const OVERFLOW_EPS = 14 // ✅ pokaż dopiero gdy content wystaje o >= 14px

  const recalc = useCallback(() => {
    const scroller = scrollerRef.current
    const bar = barRef.current
    if (!scroller || !bar) return

    // ✅ jeśli gate zamknięty, chowamy wszystko bez dyskusji
    if (!enabled) {
      setState((s) =>
        s.isScrollable ? { thumbH: 0, thumbY: 0, isScrollable: false } : s
      )
      return
    }

    const scrollH = scroller.scrollHeight || 0
    const clientH = scroller.clientHeight || 0
    const top = scroller.scrollTop || 0

    if (scrollH <= 0 || clientH <= 0) {
      setState((s) =>
        s.isScrollable ? { thumbH: 0, thumbY: 0, isScrollable: false } : s
      )
      return
    }

    const maxScroll = Math.max(0, scrollH - clientH)

    // ✅ overflow musi być sensowny
    if (maxScroll < OVERFLOW_EPS) {
      setState((s) =>
        s.isScrollable ? { thumbH: 0, thumbY: 0, isScrollable: false } : s
      )
      return
    }

    const barH = bar.clientHeight || 0
    if (barH <= 0) {
      // track może się pojawić, thumb dorysuje się później
      setState((s) => (s.isScrollable ? s : { thumbH: 0, thumbY: 0, isScrollable: true }))
      return
    }

    const ratio = clientH / scrollH
    const thumbH = Math.max(MIN_THUMB, Math.round(barH * ratio))

    const maxThumbY = Math.max(1, barH - thumbH)
    const thumbY = Math.round((top / Math.max(1, maxScroll)) * maxThumbY)

    setState({ thumbH, thumbY, isScrollable: true })
  }, [enabled])

  useEffect(() => {
    const scroller = scrollerRef.current
    const bar = barRef.current
    if (!scroller || !bar) return

    recalc()
    const raf = requestAnimationFrame(recalc)

    const onScroll = () => recalc()
    const onResize = () => recalc()

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    const ro = new ResizeObserver(() => recalc())
    ro.observe(scroller)
    ro.observe(bar)

    const t1 = setTimeout(recalc, 30)
    const t2 = setTimeout(recalc, 180)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [recalc])

  useEffect(() => {
    recalc()
    const raf = requestAnimationFrame(recalc)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const thumbStyle = useMemo(
    () => ({
      height: state.thumbH ? `${state.thumbH}px` : undefined,
      transform: `translateY(${state.thumbY}px)`,
      display: state.thumbH ? 'block' : 'none',
    }),
    [state.thumbH, state.thumbY]
  )

  const onThumbMouseDown = (e) => {
    const scroller = scrollerRef.current
    const bar = barRef.current
    if (!scroller || !bar) return

    e.preventDefault()
    e.stopPropagation()

    const startY = e.clientY
    const startScroll = scroller.scrollTop

    const scrollH = scroller.scrollHeight || 0
    const clientH = scroller.clientHeight || 0
    const barH = bar.clientHeight || 0

    const maxScroll = Math.max(1, scrollH - clientH)
    if (barH <= 0 || clientH <= 0 || scrollH <= 0) return

    const thumbH = Math.max(MIN_THUMB, Math.round(barH * (clientH / scrollH)))
    const maxThumbY = Math.max(1, barH - thumbH)
    const pxToScroll = maxScroll / maxThumbY

    const onMove = (ev) => {
      const dy = ev.clientY - startY
      scroller.scrollTop = startScroll + dy * pxToScroll
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTrackMouseDown = (e) => {
    const scroller = scrollerRef.current
    const bar = barRef.current
    if (!scroller || !bar) return
    if (e.target?.classList?.contains('sa-vbar__thumb')) return

    const rect = bar.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const ratio = Math.min(1, Math.max(0, clickY / Math.max(1, rect.height)))

    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
    scroller.scrollTop = ratio * maxScroll
  }

  return {
    frameRef,
    scrollerRef,
    barRef,
    thumbStyle,
    isScrollable: state.isScrollable,
    recalc,
    onThumbMouseDown,
    onTrackMouseDown,
  }
}
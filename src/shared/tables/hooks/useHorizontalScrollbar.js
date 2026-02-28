// src/shared/tables/hooks/useHorizontalScrollbar.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useHorizontalScrollbar(deps = []) {
  const scrollerRef = useRef(null) // .table-scroll-wrapper
  const barRef = useRef(null) // .table-hscroll

  const [state, setState] = useState({ thumbW: 0, thumbX: 0 })

  const getInnerScroller = () => {
    const outer = scrollerRef.current
    if (!outer) return null
    return outer.querySelector('.table-xscroller')
  }

  const recalc = useCallback(() => {
    const scroller = getInnerScroller()
    const bar = barRef.current
    if (!scroller || !bar) return

    const { scrollWidth, clientWidth, scrollLeft } = scroller
    const barW = bar.clientWidth

    if (scrollWidth <= clientWidth || barW <= 0) {
      setState({ thumbW: 0, thumbX: 0 })
      return
    }

    const ratio = clientWidth / scrollWidth
    const thumbW = Math.max(32, Math.round(barW * ratio))

    const maxThumbX = Math.max(1, barW - thumbW)
    const maxScroll = Math.max(1, scrollWidth - clientWidth)

    const thumbX = Math.round((scrollLeft / maxScroll) * maxThumbX)
    setState({ thumbW, thumbX })
  }, [])

  useEffect(() => {
    const scroller = getInnerScroller()
    const bar = barRef.current
    if (!scroller || !bar) return

    recalc()
    const raf = requestAnimationFrame(recalc)

    const onResize = () => recalc()
    scroller.addEventListener('scroll', recalc, { passive: true })
    window.addEventListener('resize', onResize)

    const ro = new ResizeObserver(() => recalc())
    ro.observe(scroller)
    ro.observe(bar)

    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener('scroll', recalc)
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

  const onThumbMouseDown = e => {
    const scroller = getInnerScroller()
    const bar = barRef.current
    if (!scroller || !bar) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startScroll = scroller.scrollLeft

    const { scrollWidth, clientWidth } = scroller
    const barW = bar.clientWidth

    const maxScroll = Math.max(1, scrollWidth - clientWidth)
    const thumbW = Math.max(32, Math.round(barW * (clientWidth / scrollWidth)))
    const maxThumbX = Math.max(1, barW - thumbW)

    const pxToScroll = maxScroll / maxThumbX

    const onMove = ev => {
      const dx = ev.clientX - startX
      scroller.scrollLeft = startScroll + dx * pxToScroll
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTrackMouseDown = e => {
    const scroller = getInnerScroller()
    const bar = barRef.current
    if (!scroller || !bar) return

    if (e.target?.classList?.contains('table-hscroll__thumb')) return

    const rect = bar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const ratio = Math.min(1, Math.max(0, clickX / rect.width))

    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    scroller.scrollLeft = ratio * maxScroll
  }

  const thumbStyle = useMemo(
    () => ({
      width: `${state.thumbW}px`,
      transform: `translateX(${state.thumbX}px)`,
      display: state.thumbW ? 'block' : 'none',
    }),
    [state]
  )

  return { scrollerRef, barRef, thumbStyle, onThumbMouseDown, onTrackMouseDown }
}

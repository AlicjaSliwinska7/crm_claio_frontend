import { useLayoutEffect, useState, useCallback } from 'react'
import { clamp } from '../utils/dates'

const GAP = 10

export function useTasksTooltip() {
  const [tip, setTip] = useState(null) // {x,y,side,it, barRect}
  const [hl, setHl] = useState(null) // {type/status/diff/prio/kind}

  const showTip = useCallback((e, it, emp) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    const x = clamp(midX, 12, window.innerWidth - 12)

    setTip({
      x,
      y: rect.top - GAP,
      side: 'top',
      it: { ...it, emp },
      barRect: { top: rect.top, bottom: rect.bottom },
    })

    setHl({ type: it.type, status: it.status, diff: it.difficulty, prio: it.priority, kind: it.kind })
  }, [])

  const hideTip = useCallback(() => {
    setTip(null)
    setHl(null)
  }, [])

  useLayoutEffect(() => {
    if (!tip) return
    const el = document.querySelector('.ts-tooltip')
    if (!el) return

    const h = el.offsetHeight
    const x = clamp(tip.x, 12, window.innerWidth - 12)

    let side = 'top'
    let yTop = tip.barRect.top - h - GAP
    let y = yTop

    if (yTop < 6) {
      y = tip.barRect.bottom + GAP
      side = 'bottom'
    }

    if (x !== tip.x || y !== tip.y || side !== tip.side) {
      setTip((prev) => (prev ? { ...prev, x, y, side } : prev))
    }
  }, [tip])

  return { tip, hl, setHl, showTip, hideTip }
}
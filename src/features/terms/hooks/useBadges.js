import { useCallback } from 'react'
import { BADGE_COLOR_MODE, MAX_BADGES_PER_SLOT } from './constants'

export function useBadges({ majorityOf }) {
  const typeToBadgeClass = useCallback((type) => {
    if (type === 'admin') return 'count-badge--type-admin'
    if (type === 'client') return 'count-badge--type-client'
    if (type === 'tech') return 'count-badge--type-tech'
    return 'count-badge--type-other'
  }, [])

  const badgeFillClassForGroup = useCallback(
    (g) => {
      switch (BADGE_COLOR_MODE) {
        case 'status': return `count-badge--status-${g.ringStatus}`
        case 'priority': return `count-badge--prio-${g.topPriority}`
        case 'difficulty': return `count-badge--diff-${g.topDifficulty}`
        case 'type':
        default: return typeToBadgeClass(g.type)
      }
    },
    [typeToBadgeClass]
  )

  const badgesForSlot = useCallback(
    (items) => {
      const byType = new Map()
      items.forEach((t) => {
        const k = t.type || 'other'
        if (!byType.has(k)) byType.set(k, [])
        byType.get(k).push(t)
      })

      const groups = Array.from(byType.entries()).map(([type, arr]) => ({
        type,
        count: arr.length,
        ringStatus: majorityOf(arr, 'status', ['blocked', 'progress', 'assigned', 'done']),
        topPriority: majorityOf(arr, 'priority', ['high', 'normal', 'low']),
        topDifficulty: majorityOf(arr, 'difficulty', ['hard', 'medium', 'easy']),
        list: arr.map((t) => t.title),
      }))

      const sorted = groups.sort((a, b) => b.count - a.count)
      const visible = sorted.slice(0, MAX_BADGES_PER_SLOT)
      const extra = Math.max(0, sorted.length - visible.length)
      return { visible, extra }
    },
    [majorityOf]
  )

  return { typeToBadgeClass, badgeFillClassForGroup, badgesForSlot }
}
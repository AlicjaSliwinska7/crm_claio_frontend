// src/features/board/hooks/useBoardPreviewData.js
import { useMemo } from 'react'
import { startOfWeek, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'

/**
 * SSOT: wyliczenia danych dla BoardPreview.
 *
 * Zwraca:
 * - weeks: 3 tygodnie (-1, 0, +1) po 7 dni
 * - tableRows: przefiltrowane wpisy (dla BoardFlatTable)
 * - authors: unikalni autorzy do filtrów
 * - tags: unikalne tagi do filtrów
 */
export function useBoardPreviewData({
  currentDay,
  posts,
  filteredSelector,
  locale = pl,
  weeksSpan = 3, // 3 tygodnie: -1,0,+1
} = {}) {
  const postsArr = Array.isArray(posts) ? posts : []

  const selector = useMemo(() => {
    if (typeof filteredSelector === 'function') return filteredSelector
    if (Array.isArray(filteredSelector)) {
      const captured = filteredSelector
      return () => captured
    }
    return (arr) => (Array.isArray(arr) ? arr : [])
  }, [filteredSelector])

  const weeks = useMemo(() => {
    const day = currentDay instanceof Date ? currentDay : new Date()
    const weekStart = startOfWeek(day, { weekStartsOn: 1, locale })

    // domyślnie: [-1,0,+1]
    const offsets =
      weeksSpan === 3 ? [-1, 0, 1] : Array.from({ length: weeksSpan }, (_, i) => i - Math.floor(weeksSpan / 2))

    return offsets.map((offset) =>
      Array.from({ length: 7 }, (_, i) => addDays(weekStart, offset * 7 + i)),
    )
  }, [currentDay, locale, weeksSpan])

  const tableRows = useMemo(() => selector(postsArr), [selector, postsArr])

  const authors = useMemo(() => {
    return Array.from(new Set(postsArr.map((p) => p?.author).filter(Boolean)))
  }, [postsArr])

  const tags = useMemo(() => {
    const all = postsArr.flatMap((p) => (Array.isArray(p?.tags) ? p.tags : []))
    return Array.from(new Set(all.filter(Boolean)))
  }, [postsArr])

  return { weeks, tableRows, authors, tags, postsArr, selector }
}

export default useBoardPreviewData
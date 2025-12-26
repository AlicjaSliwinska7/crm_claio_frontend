import React, { useMemo } from 'react'

/**
 * WeekGrid — renderuje sekcje tygodni (karty dni).
 * - Board dostaje suppressTable={true} → nie rysuje listy/tabeli (jeśli jeszcze istnieje)
 * - filteredEntries zawsze leci jako funkcja (selector) — defensywnie.
 *
 * Uwaga:
 * - „lista na dole” NIE jest tu renderowana, bo w BoardPreview masz osobną tabelę (BoardFlatTable).
 *   Dzięki temu nie dublujemy UI i nie renderujemy Boarda 4 razy.
 */
export default function WeekGrid({
  weeks,
  BoardComponent,
  posts,
  filters,
  setCurrentDay,
  onDayClick,
  selectedPost,
  setSelectedPost,
  editMode,
  setEditMode,
  filteredEntries,

  // ✅ NOWE: żeby weekendy/święta działały identycznie jak w BoardPreview
  holidays = [],
  daysOff = [],
  suppressTable = true, // domyślnie w WeekGrid nie chcemy tabeli/listy
}) {
  const safeWeeks = Array.isArray(weeks) ? weeks : []
  const safePosts = Array.isArray(posts) ? posts : []

  const {
    filterType = 'all',
    filterAuthor = '',
    filterMentioned = '',
    filterPriority = '',
    filterTag = '',
  } = filters ?? {}

  // filteredEntries → zawsze funkcja
  const filteredSelector =
    typeof filteredEntries === 'function'
      ? filteredEntries
      : () => (Array.isArray(filteredEntries) ? filteredEntries : safePosts)

  const noop = () => {}
  const safeSetCurrentDay = typeof setCurrentDay === 'function' ? setCurrentDay : noop
  const safeSetSelectedPost = typeof setSelectedPost === 'function' ? setSelectedPost : noop
  const safeSetEditMode = typeof setEditMode === 'function' ? setEditMode : noop
  const safeOnDayClick = typeof onDayClick === 'function' ? onDayClick : noop

  // stabilne dni do kluczy
  const weekKeys = useMemo(() => {
    return safeWeeks.map((weekDays, idx) => {
      const arr = Array.isArray(weekDays) ? weekDays.filter(Boolean) : []
      const first = arr[0]
      const firstKey = first instanceof Date ? first.toISOString().slice(0, 10) : `idx-${idx}`
      return `week-${firstKey}-${idx}`
    })
  }, [safeWeeks])

  return (
    <>
      {safeWeeks.map((weekDays, idx) => {
        const safeWeekDays = Array.isArray(weekDays) ? weekDays.filter(Boolean) : []

        return (
          <section key={weekKeys[idx] || `week-${idx}`} className="board-week-section">
            <div className="week-days-row">
              <BoardComponent
                isPreview
                suppressTable={suppressTable} // ⬅️ w tygodniach nie chcemy listy/tabeli
                overrideDays={safeWeekDays}
                posts={safePosts}
                filterType={filterType}
                filterAuthor={filterAuthor}
                filterMentioned={filterMentioned}
                filterPriority={filterPriority}
                filterTag={filterTag}
                setCurrentDay={safeSetCurrentDay}
                onDayClick={safeOnDayClick}
                selectedPost={selectedPost}
                setSelectedPost={safeSetSelectedPost}
                editMode={editMode}
                setEditMode={safeSetEditMode}
                filteredEntries={filteredSelector}

                // ✅ przekazujemy święta/dni wolne
                holidays={holidays}
                daysOff={daysOff}
              />
            </div>
          </section>
        )
      })}
    </>
  )
}

// src/features/board/components/Board/BoardLayout.jsx
import React, { useMemo, useState } from 'react'
import { format, addDays } from 'date-fns'

import BoardCarousel from './BoardCarousel'
import BoardTable from './Table'
import { parseDayLocal } from '../../utils/boardLayout'

function BoardLayout({
  // kalendarz / board
  visibleDays,
  posts,
  filteredEntries,
  loggedInUser,
  expandedPostId,
  setExpandedPostId,
  setSelectedPost,
  setCurrentDay,
  onDayClick,
  setEditMode,

  // dni wolne
  listExtraDays = 30,
  holidays = [],
  daysOff = [],

  // opcjonalnie (np. preview)
  suppressTable = false,
}) {
  const [sortOrder, setSortOrder] = useState('desc')

  const toggleExpand = (postId) =>
    setExpandedPostId?.((prev) => (prev === postId ? null : postId))

  const safeVisibleDays = useMemo(() => {
    const arr = Array.isArray(visibleDays) ? visibleDays : []
    return arr.filter((d) => d instanceof Date && !Number.isNaN(d.getTime()))
  }, [visibleDays])

  // =========================
  // LISTA POD BOARD (sort + zakres)
  // =========================
  const listData = useMemo(() => {
    if (!safeVisibleDays.length) return []

    const safePosts = Array.isArray(posts) ? posts : []

    const minDay = new Date(Math.min(...safeVisibleDays.map((d) => d.getTime())))
    const maxDay = new Date(Math.max(...safeVisibleDays.map((d) => d.getTime())))

    const rangeStart = addDays(minDay, -Math.abs(listExtraDays))
    const rangeEnd = addDays(maxDay, Math.abs(listExtraDays))

    const inRange = safePosts.filter((p) => {
      const key = p?.targetDate || (p?.date ? format(new Date(p.date), 'yyyy-MM-dd') : null)
      if (!key) return false

      const d = parseDayLocal(key)
      if (!d) return false

      return d >= rangeStart && d <= rangeEnd
    })

    const filtered = typeof filteredEntries === 'function' ? filteredEntries(inRange) : inRange

    const safeTime = (x) => {
      try {
        return x?.date ? new Date(x.date).getTime() : 0
      } catch {
        return 0
      }
    }

    return [...filtered].sort((a, b) =>
      sortOrder === 'desc' ? safeTime(b) - safeTime(a) : safeTime(a) - safeTime(b),
    )
  }, [safeVisibleDays, posts, filteredEntries, listExtraDays, sortOrder])

  return (
    <>
      {/* =========================
          KARUZELA DNI
         ========================= */}
      <BoardCarousel
        visibleDays={safeVisibleDays}
        posts={posts}
        filteredEntries={filteredEntries}
        loggedInUser={loggedInUser}
        expandedPostId={expandedPostId}
        onToggleExpand={toggleExpand}
        onDayClick={onDayClick}
        setCurrentDay={setCurrentDay}
        setSelectedPost={setSelectedPost}
        setEditMode={setEditMode}
        holidays={holidays}
        daysOff={daysOff}
      />

      {/* =========================
          TABELA
         ========================= */}
      {!suppressTable && (
        <section className="board-list-section bl-list-section" aria-label="Wpisy z rozszerzonego zakresu">
          <div className="board-list-head">
            <h3 className="board-list-title">
              Wszystkie wpisy <span className="count-badge">{listData.length}</span>
            </h3>

          </div>

          <BoardTable
            rows={listData}
            onOpenRow={(row) => {
              setSelectedPost?.({ ...row })
              setEditMode?.(true)
            }}
          />
        </section>
      )}
    </>
  )
}

export { BoardLayout }
export default BoardLayout
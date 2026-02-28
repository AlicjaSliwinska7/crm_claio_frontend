// src/features/board/components/Board/BoardCarousel.jsx
import React from 'react'
import { pl } from 'date-fns/locale'
import { format, addDays } from 'date-fns'
import { Search } from '../../../../shared/ui'
import { isInDateList, safeFormatDateTime } from '../../utils/boardLayout'

function BoardCarousel({
  visibleDays = [],
  posts = [],
  filteredEntries,
  loggedInUser,
  expandedPostId,
  onToggleExpand,
  onDayClick,
  setCurrentDay,
  setSelectedPost,
  setEditMode,
  holidays = [],
  daysOff = [],
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const safePostsForDays = Array.isArray(posts) ? posts : []

  return (
    <div className="board-carousel">
      <button
        className="carousel-button left"
        onClick={() => setCurrentDay?.((prev) => addDays(prev, -1))}
        type="button"
      >
        ‹
      </button>

      <div className="carousel-days">
        {visibleDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd')

          const dayEntriesRaw = safePostsForDays.filter((p) => p?.targetDate === dayStr)
          const entries =
            typeof filteredEntries === 'function' ? filteredEntries(dayEntriesRaw) : dayEntriesRaw

          const isToday = dayStr === todayStr
          const isWeekend = [0, 6].includes(day.getDay())
          const isHoliday = isInDateList(day, holidays)
          const isDayOff = isInDateList(day, daysOff)

          let dayClass = 'board-day'
          if (isToday) dayClass += ' today'
          if (isWeekend) dayClass += ' weekend'
          if (isHoliday) dayClass += ' holiday'
          if (isDayOff) dayClass += ' day-off'

          return (
            <div
              key={dayStr}
              className={dayClass}
              onClick={() => onDayClick?.(day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onDayClick?.(day)
              }}
            >
              <div className="day-label">
                {format(day, 'EEEE', { locale: pl })}
                <br />
                {format(day, 'dd.MM')}
              </div>

              <div className="day-entries">
                {entries.map((entry) => {
                  const mentions = Array.isArray(entry?.mentions) ? entry.mentions : []
                  const tags = Array.isArray(entry?.tags) ? entry.tags : []

                  const isMentioned = mentions.includes(loggedInUser)
                  const isExpanded = entry.id === expandedPostId

                  const priorityClass =
                    entry.type === 'task' ? `priority-${entry.priority || 'normalny'}` : ''

                  const cardClass = `entry-card ${entry.type} ${priorityClass}${
                    isMentioned ? ' mentioned' : ''
                  }`

                  const createdStr = safeFormatDateTime(entry?.date)
                  const editedStr = entry?.lastEdited ? safeFormatDateTime(entry.lastEdited) : null

                  return (
                    <div
                      key={entry.id}
                      className={cardClass}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleExpand?.(entry.id)
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          onToggleExpand?.(entry.id)
                        }
                      }}
                    >
                      <strong>{entry.title}</strong>

                      {!!mentions.length && (
                        <div className="entry-mentions">
                          {mentions.map((name) => (
                            <span key={name} className="mention-tag">
                              @{name}
                            </span>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <>
                          <div className="entry-meta">
                            {entry.type === 'post'
                              ? `Autor: ${entry.author}`
                              : `Zadanie: ${entry.author} (${entry.priority})`}
                          </div>

                          <div className="entry-date">Dodano: {createdStr}</div>

                          {entry.lastEdited && (
                            <div className="entry-edited">Edytowano: {editedStr || '—'}</div>
                          )}

                          <p className="entry-content">{entry.content}</p>

                          {!!tags.length && (
                            <div className="entry-tags">
                              {tags.map((tag) => (
                                <span key={tag} className="entry-tag">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <button
                            className="entry-view-button"
                            title="Podgląd"
                            aria-label="Podgląd"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPost?.({ ...entry })
                              setEditMode?.(true)
                            }}
                          >
                            <Search size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        className="carousel-button right"
        onClick={() => setCurrentDay?.((prev) => addDays(prev, 1))}
        type="button"
      >
        ›
      </button>
    </div>
  )
}

export { BoardCarousel }
export default BoardCarousel
import React, { useMemo, useState } from 'react'
import { pl } from 'date-fns/locale'
import { format, addDays, parseISO, isSameDay } from 'date-fns'
import '../../styles/board-layout.css' // ⬅️ Twój styl

// bezpieczne parsowanie day-string 'yyyy-MM-dd' jako lokalne 00:00
function parseDayLocal(dayStr) {
  if (!dayStr) return null
  const d = new Date(`${dayStr}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

// bezpieczne formatowanie ISO datetime
function safeFormatDateTime(iso, pattern = 'dd.MM.yyyy HH:mm') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return format(d, pattern)
}

// pomocniczo: lista może mieć Date albo stringi (ISO datetime lub yyyy-MM-dd)
function isInDateList(day, list = []) {
  if (!Array.isArray(list) || !list.length) return false

  return list.some(item => {
    if (!item) return false

    // Date
    if (item instanceof Date) return isSameDay(item, day)

    // string
    const s = String(item)

    // yyyy-MM-dd → lokalne parsowanie
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = parseDayLocal(s)
      return d ? isSameDay(d, day) : false
    }

    // pełny ISO itp.
    try {
      const d = parseISO(s)
      return isSameDay(d, day)
    } catch {
      return false
    }
  })
}

function BoardLayout({
  visibleDays,
  posts,
  filteredEntries,
  loggedInUser,
  expandedPostId,
  setExpandedPostId,
  setSelectedPost,
  setCurrentDay,
  onDayClick,
  // zostawiam w API
  setEditMode,
  listExtraDays = 30,
  holidays = [],
  daysOff = [],
}) {
  const [sortOrder, setSortOrder] = useState('desc')

  // dziś liczymy w renderze (po północy zadziała poprawnie)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const toggleExpand = postId =>
    setExpandedPostId?.(prev => (prev === postId ? null : postId))

  // ✅ widoczne dni tylko jako poprawne Date (żeby format() nie wywalił)
  const safeVisibleDays = useMemo(() => {
    const arr = Array.isArray(visibleDays) ? visibleDays : []
    return arr.filter(d => d instanceof Date && !Number.isNaN(d.getTime()))
  }, [visibleDays])

  // === LISTA POD BOARD: przygotowanie danych ===
  const listData = useMemo(() => {
    if (safeVisibleDays.length === 0) return []

    const safePosts = Array.isArray(posts) ? posts : []

    const minDay = new Date(Math.min(...safeVisibleDays.map(d => d.getTime())))
    const maxDay = new Date(Math.max(...safeVisibleDays.map(d => d.getTime())))

    const rangeStart = addDays(minDay, -Math.abs(listExtraDays))
    const rangeEnd = addDays(maxDay, Math.abs(listExtraDays))

    const inRange = safePosts.filter(p => {
      const key =
        p?.targetDate ||
        (p?.date ? format(new Date(p.date), 'yyyy-MM-dd') : null)

      if (!key) return false

      const d = parseDayLocal(key)
      if (!d) return false

      return d >= rangeStart && d <= rangeEnd
    })

    const filtered =
      typeof filteredEntries === 'function' ? filteredEntries(inRange) : inRange

    const safeDate = x => {
      try {
        return x?.date ? new Date(x.date).getTime() : 0
      } catch {
        return 0
      }
    }

    return [...filtered].sort((a, b) =>
      sortOrder === 'desc' ? safeDate(b) - safeDate(a) : safeDate(a) - safeDate(b),
    )
  }, [safeVisibleDays, posts, filteredEntries, listExtraDays, sortOrder])

  const safePostsForDays = Array.isArray(posts) ? posts : []

  return (
    <>
      {/* === KARUZELA DNI (BOARD) === */}
      <div className="board-carousel">
        <button
          className="carousel-button left"
          onClick={() => setCurrentDay?.(prev => addDays(prev, -1))}
        >
          ‹
        </button>

        <div className="carousel-days">
          {safeVisibleDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd')

            const dayEntriesRaw = safePostsForDays.filter(p => p?.targetDate === dayStr)
            const entries =
              typeof filteredEntries === 'function'
                ? filteredEntries(dayEntriesRaw)
                : dayEntriesRaw

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
              >
                <div className="day-label">
                  {format(day, 'EEEE', { locale: pl })}
                  <br />
                  {format(day, 'dd.MM')}
                </div>

                <div className="day-entries">
                  {entries.map(entry => {
                    const mentions = Array.isArray(entry?.mentions) ? entry.mentions : []
                    const tags = Array.isArray(entry?.tags) ? entry.tags : []

                    const isMentioned = mentions.includes(loggedInUser)
                    const isExpanded = entry.id === expandedPostId
                    const priorityClass =
                      entry.type === 'task'
                        ? `priority-${entry.priority || 'normalny'}`
                        : ''
                    const cardClass = `entry-card ${entry.type} ${priorityClass}${
                      isMentioned ? ' mentioned' : ''
                    }`

                    const createdStr = safeFormatDateTime(entry?.date, 'dd.MM.yyyy HH:mm')
                    const editedStr = entry?.lastEdited
                      ? safeFormatDateTime(entry.lastEdited, 'dd.MM.yyyy HH:mm')
                      : null

                    return (
                      <div
                        key={entry.id}
                        className={cardClass}
                        onClick={e => {
                          e.stopPropagation()
                          toggleExpand(entry.id)
                        }}
                      >
                        <strong>{entry.title}</strong>

                        {mentions.length > 0 && (
                          <div className="entry-mentions">
                            {mentions.map(name => (
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
                              <div className="entry-edited">
                                Edytowano: {editedStr || '—'}
                              </div>
                            )}

                            <p className="entry-content">{entry.content}</p>

                            {tags.length > 0 && (
                              <div className="entry-tags">
                                {tags.map(tag => (
                                  <span key={tag} className="entry-tag">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* ✅ ZMIANA: "Podgląd" otwiera EDIT */}
                            <button
                              className="entry-view-button"
                              onClick={e => {
                                e.stopPropagation()
                                setSelectedPost?.({ ...entry })
                                setEditMode?.(true)
                              }}
                            >
                              Podgląd
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
          onClick={() => setCurrentDay?.(prev => addDays(prev, 1))}
        >
          ›
        </button>
      </div>

      {/* === LISTA POD BOARD — OSOBNA SEKCJA === */}
      <section
        className="board-list-section bl-list-section"
        aria-label="Wpisy z rozszerzonego zakresu"
      >
        <div className="board-list-head">
          <h3 className="board-list-title">
            Wszystkie wpisy <span className="count-badge">{listData.length}</span>
          </h3>

          <div className="board-list-actions">
            <span className="board-list-hint">Sortuj wg daty dodania:</span>
            <button
              className="btn btn--ghost"
              onClick={() => setSortOrder(o => (o === 'desc' ? 'asc' : 'desc'))}
              title="Przełącz sortowanie daty"
            >
              {sortOrder === 'desc' ? 'Najnowsze ↓' : 'Najstarsze ↑'}
            </button>
          </div>
        </div>

        <div className="table-container bl-table-container">
          <table className="board-table bl-table">
            <thead>
              <tr className="bl-thead-row">
                <th className="bl-th">Data dodania</th>
                <th className="bl-th">Dzień (target)</th>
                <th className="bl-th">Typ</th>
                <th className="bl-th">Tytuł</th>
                <th className="bl-th">Autor</th>
                <th className="bl-th">Wzmianki</th>
                <th className="bl-th">Tagi</th>
                <th className="bl-th" />
              </tr>
            </thead>

            <tbody>
              {listData.map(item => {
                const target = item?.targetDate ? parseDayLocal(item.targetDate) : null
                return (
                  <tr key={`row-${item.id}`} className="bl-row">
                    <td className="bl-td">
                      {item?.date ? safeFormatDateTime(item.date, 'dd.MM.yyyy HH:mm') : '—'}
                    </td>
                    <td className="bl-td">{target ? format(target, 'dd.MM.yyyy') : '—'}</td>
                    <td className="bl-td">{item.type === 'task' ? 'Zadanie' : 'Post'}</td>
                    <td className="bl-td bl-td--bold">{item.title}</td>
                    <td className="bl-td">{item.author || '—'}</td>
                    <td className="bl-td">{item.mentions?.length ? item.mentions.join(', ') : '—'}</td>
                    <td className="bl-td">{item.tags?.length ? item.tags.map(t => `#${t}`).join(' ') : '—'}</td>
                    <td className="bl-td bl-td--right">
                      {/* ✅ ZMIANA: "Podgląd" otwiera EDIT */}
                      <button
                        className="btn btn--ghost"
                        onClick={() => {
                          setSelectedPost?.({ ...item })
                          setEditMode?.(true)
                        }}
                      >
                        Podgląd
                      </button>
                    </td>
                  </tr>
                )
              })}

              {listData.length === 0 && (
                <tr>
                  <td className="bl-td bl-td--center" colSpan={8}>
                    Brak wpisów w tym zakresie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default BoardLayout

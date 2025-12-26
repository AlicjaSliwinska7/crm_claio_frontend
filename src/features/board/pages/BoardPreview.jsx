import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'

import '../styles/board.css'
import '../styles/board-preview.css'

import Board from './Board'
import { useBoardLogic } from '../hooks/useBoardLogic'

import BoardPreviewHeader from '../components/BoardPreview/BoardPreviewHeader'
import WeekGrid from '../components/BoardPreview/WeekGrid'
import BoardFlatTable from '../components/BoardPreview/BoardFlatTable'
import BoardAddEditModal from '../components/Board/BoardAddEditModal'

// DEMO
const users = ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']
const loggedInUser = 'Alicja Śliwińska'

const initialPosts = [
  {
    id: 1,
    author: 'Alicja Śliwińska',
    date: '2025-06-30T10:52',
    targetDate: '2025-06-30',
    title: 'Nowy grafik',
    type: 'post',
    content: 'Dostępny jest nowy grafik pracy na lipiec.',
    mentions: ['Jan Kowalski'],
    tags: ['grafik'],
  },
  {
    id: 2,
    author: 'Jan Kowalski',
    date: '2025-07-01T10:52',
    targetDate: '2025-07-01',
    title: 'Zadanie: przygotowanie sali',
    type: 'task',
    content: 'Proszę przygotować salę do audytu.',
    mentions: ['Anna Nowak'],
    priority: 'wysoki',
    tags: ['audyt'],
  },
  {
    id: 3,
    author: 'Anna Nowak',
    date: '2025-07-02T10:52',
    targetDate: '2025-07-02',
    title: 'Wiadomość dot. BHP',
    type: 'post',
    content: 'Przypominam o uzupełnieniu szkoleń BHP do końca tygodnia.',
    mentions: ['Alicja Śliwińska', 'Jan Kowalski'],
    tags: ['BHP'],
  },
]

// ─────────────────────────────────────────────────────────────
// Święta – identycznie jak w Board.jsx
// ─────────────────────────────────────────────────────────────
function getEasterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getPolishHolidays(year) {
  const easter = getEasterSunday(year)
  return [
    new Date(year, 0, 1),
    new Date(year, 0, 6),
    addDays(easter, 1),
    new Date(year, 4, 1),
    new Date(year, 4, 3),
    addDays(easter, 60),
    new Date(year, 7, 15),
    new Date(year, 10, 1),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ]
}

// ─────────────────────────────────────────────────────────────

export default function BoardPreview() {
  // tryb preview
  useEffect(() => {
    document.body.classList.add('preview-mode')
    return () => document.body.classList.remove('preview-mode')
  }, [])

  const [currentDay, setCurrentDay] = useState(new Date())

  const currentYear = currentDay.getFullYear()
  const systemHolidays = getPolishHolidays(currentYear)

  // logika tablicy
  const logic = useBoardLogic(initialPosts, loggedInUser) || {}
  const {
    posts,
    newPost,
    setNewPost,
    availableTags,
    setAvailableTags,
    customTag,
    setCustomTag,
    selectedPost,
    setSelectedPost,
    editMode,
    setEditMode,
    showModal,
    setShowModal,
    filterType,
    setFilterType,
    filterAuthor,
    setFilterAuthor,
    filterMentioned,
    setFilterMentioned,
    filterPriority,
    setFilterPriority,
    filterTag,
    setFilterTag,
    setGotoDate,
    filteredEntries,        // selector (funkcja)
    handleAddPost,
    handleEditSaveModel,    // ✅ poprawna wersja do modala
    handleDelete,
  } = logic

  const postsArr = Array.isArray(posts) ? posts : []

  // selector filtrów – JEDNO ŹRÓDŁO PRAWDY
  const filteredSelector = useMemo(() => {
    if (typeof filteredEntries === 'function') return filteredEntries
    if (Array.isArray(filteredEntries)) {
      const captured = filteredEntries
      return () => captured
    }
    return (arr) => (Array.isArray(arr) ? arr : [])
  }, [filteredEntries])

  // tygodnie do WeekGrid
  const weeks = useMemo(() => {
    const weekStart = startOfWeek(currentDay, { weekStartsOn: 1, locale: pl })
    return [-1, 0, 1].map(offset =>
      Array.from({ length: 7 }, (_, i) => addDays(weekStart, offset * 7 + i)),
    )
  }, [currentDay])

  // dane do tabeli (BEZ sortowania – robi to BoardFlatTable)
  const tableRows = useMemo(
    () => filteredSelector(postsArr),
    [filteredSelector, postsArr],
  )

  const authors = useMemo(
    () => Array.from(new Set(postsArr.map(p => p.author).filter(Boolean))),
    [postsArr],
  )

  const tags = useMemo(
    () =>
      Array.from(
        new Set(postsArr.flatMap(p => (Array.isArray(p.tags) ? p.tags : [])).filter(Boolean)),
      ),
    [postsArr],
  )

  // ADD
  const openCreate = useCallback(
    (day = new Date()) => {
      setNewPost?.({
        title: '',
        author: loggedInUser,
        targetDate: format(day, 'yyyy-MM-dd'),
        type: 'post',
        content: '',
        mentions: [],
        priority: 'normalny',
        tags: [],
        date: new Date().toISOString(),
      })
      setShowModal?.(true)
    },
    [setNewPost, setShowModal],
  )

  // EDIT z tabeli
  const openEditFromRow = useCallback(
    (row) => {
      if (!row) return
      setSelectedPost?.({ ...row })
      setEditMode?.(true)
    },
    [setSelectedPost, setEditMode],
  )

  return (
    <div className="board-preview-wrapper">
      <BoardPreviewHeader
        filterType={filterType}
        setFilterType={setFilterType}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        filterMentioned={filterMentioned}
        setFilterMentioned={setFilterMentioned}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        onOpenCreate={() => openCreate(currentDay)}
        onReset={() => {
          setFilterType?.('all')
          setFilterAuthor?.('')
          setFilterMentioned?.('')
          setFilterPriority?.('')
          setFilterTag?.('')
          setGotoDate?.('')
          setCurrentDay(new Date())
        }}
        authors={authors}
        users={users}
        tags={tags}
      />

      {/* Siatka tygodni */}
      <div className="board-grid">
        <WeekGrid
          weeks={weeks}
          BoardComponent={Board}
          posts={postsArr}
          filters={{
            filterType,
            filterAuthor,
            filterMentioned,
            filterPriority,
            filterTag,
          }}
          setCurrentDay={setCurrentDay}
          onDayClick={openCreate}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          editMode={editMode}
          setEditMode={setEditMode}
          filteredEntries={filteredSelector}
          suppressTable
          holidays={systemHolidays}
          daysOff={[]}
        />
      </div>

      {/* TABELA (sama sortuje się po nagłówkach) */}
      <BoardFlatTable rows={tableRows} onRowClick={openEditFromRow} />

      {/* ADD */}
      <BoardAddEditModal
        mode="add"
        show={!!showModal}
        onClose={() => setShowModal?.(false)}
        value={newPost}
        setValue={setNewPost}
        users={users}
        availableTags={availableTags}
        setAvailableTags={setAvailableTags}
        customTag={customTag}
        setCustomTag={setCustomTag}
        loggedInUser={loggedInUser}
        onSubmit={(model) => {
          handleAddPost?.(model)
          setShowModal?.(false)
        }}
      />

      {/* EDIT */}
      <BoardAddEditModal
        mode="edit"
        show={!!selectedPost}
        onClose={() => {
          setEditMode?.(false)
          setSelectedPost?.(null)
        }}
        value={selectedPost}
        setValue={setSelectedPost}
        users={users}
        availableTags={availableTags}
        setAvailableTags={setAvailableTags}
        customTag={customTag}
        setCustomTag={setCustomTag}
        loggedInUser={loggedInUser}
        onSubmit={(model) => {
          handleEditSaveModel?.(model)
          setEditMode?.(false)
          setSelectedPost?.(null)
        }}
        onDelete={(model) => {
          handleDelete?.(model)
          setEditMode?.(false)
          setSelectedPost?.(null)
        }}
      />
    </div>
  )
}

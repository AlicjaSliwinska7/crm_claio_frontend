// src/features/board/pages/Board.jsx
import React, { useMemo, useState } from 'react'
import '../styles/board.css'
import { addDays } from 'date-fns'
import { ExternalLink, Pin } from 'lucide-react'

import { useBoardLogic } from '../hooks/useBoardLogic'
import BoardLayout from '../components/Board/BoardLayout'
import BoardAddEditModal from '../components/Board/BoardAddEditModal'
import BoardFilters from '../components/Board/BoardFilters'

const users = ['Alicja Śliwińska', 'Jan Kowalski', 'Anna Nowak']
const loggedInUser = 'Alicja Śliwińska'

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
  const easterSunday = getEasterSunday(year)
  const easterMonday = addDays(easterSunday, 1)
  const corpusChristi = addDays(easterSunday, 60)

  return [
    new Date(year, 0, 1),
    new Date(year, 0, 6),
    easterMonday,
    new Date(year, 4, 1),
    new Date(year, 4, 3),
    corpusChristi,
    new Date(year, 7, 15),
    new Date(year, 10, 1),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ]
}

function Board({
  isPreview = false,
  overrideDays = null,

  // zewnętrzne źródło postów (preview / embed)
  posts: externalPosts,
  setPosts: externalSetPosts,

  // zewnętrzne filtry (preview)
  filterType: propFilterType,
  filterAuthor: propFilterAuthor,
  filterMentioned: propFilterMentioned,
  filterPriority: propFilterPriority,
  filterTag: propFilterTag,

  // zewnętrzna kontrola dni / klików
  setCurrentDay: externalSetCurrentDay,
  onDayClick,

  // zewnętrzna kontrola zaznaczonego posta / edycji
  selectedPost: externalSelectedPost,
  setSelectedPost: externalSetSelectedPost,
  editMode: externalEditMode,
  setEditMode: externalSetEditMode,

  // zewnętrzne filtrowanie (preview)
  filteredEntries: externalFilteredEntries,

  suppressTable = false,

  holidays = [],
  daysOff = [],
}) {
  const [currentDay, setCurrentDay] = useState(new Date())

  const currentYear = currentDay.getFullYear()
  const systemHolidays = getPolishHolidays(currentYear)
  const mergedHolidays = [...systemHolidays, ...holidays]

  const logic =
    useBoardLogic([], loggedInUser, ['grafik', 'audyt', 'BHP', 'analiza', 'próbka', 'serwer']) || {}

  const {
    posts,
    setPosts,
    newPost,
    setNewPost,
    availableTags,
    setAvailableTags,
    customTag,
    setCustomTag,
    expandedPostId,
    setExpandedPostId,
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
    gotoDate,
    setGotoDate,
    filteredEntries,
    handleAddPost, // (model)
    handleEditSaveModel, // (model)
    handleDelete, // (model)
  } = logic

  // źródło danych – preview bierze zewnętrzne
  const effectivePosts = isPreview ? externalPosts : posts
  const effectiveSetPosts = isPreview ? externalSetPosts : setPosts

  const effectiveFilterType = isPreview ? propFilterType : filterType
  const effectiveFilterAuthor = isPreview ? propFilterAuthor : filterAuthor
  const effectiveFilterMentioned = isPreview ? propFilterMentioned : filterMentioned
  const effectiveFilterPriority = isPreview ? propFilterPriority : filterPriority
  const effectiveFilterTag = isPreview ? propFilterTag : filterTag

  const effectiveSetCurrentDay = isPreview ? externalSetCurrentDay : setCurrentDay
  const effectiveOnDayClick = typeof onDayClick === 'function' ? onDayClick : () => {}

  const effectiveSetSelectedPost = isPreview ? externalSetSelectedPost : setSelectedPost
  const effectiveSelectedPost = isPreview ? externalSelectedPost : selectedPost

  const effectiveSetEditMode = isPreview ? externalSetEditMode : setEditMode
  const effectiveEditMode = isPreview ? externalEditMode : editMode

  // bezpieczne wersje
  const safePosts = Array.isArray(effectivePosts) ? effectivePosts : []
  const safeSetPosts = typeof effectiveSetPosts === 'function' ? effectiveSetPosts : () => {}
  const safeSetCurrentDay =
    typeof effectiveSetCurrentDay === 'function' ? effectiveSetCurrentDay : () => {}
  const safeSetSelectedPost =
    typeof effectiveSetSelectedPost === 'function' ? effectiveSetSelectedPost : () => {}
  const safeSetEditMode =
    typeof effectiveSetEditMode === 'function' ? effectiveSetEditMode : () => {}

  const safeHandleEditSave =
    typeof handleEditSaveModel === 'function' ? handleEditSaveModel : () => {}
  const safeHandleDelete = typeof handleDelete === 'function' ? handleDelete : () => {}

  const visibleDays = useMemo(() => {
    if (Array.isArray(overrideDays) && overrideDays.length) return overrideDays
    return Array.from({ length: 5 }, (_, i) => addDays(currentDay, i - 2))
  }, [overrideDays, currentDay])

  const filteredEntriesSelector = useMemo(() => {
    if (typeof externalFilteredEntries === 'function') return externalFilteredEntries
    if (Array.isArray(externalFilteredEntries)) {
      const captured = externalFilteredEntries
      return () => captured
    }
    if (typeof filteredEntries === 'function') return filteredEntries
    return (postsInput) => (Array.isArray(postsInput) ? postsInput : [])
  }, [externalFilteredEntries, filteredEntries])

  const effectiveSuppressTable = isPreview ? true : suppressTable

  const handleOpenPreview = () => {
    const url = `${window.location.origin}/tablica/podglad`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="board-wrapper">
      {!isPreview && (
        <div className="board-header">
          <div className="board-actions">
            <button onClick={() => setShowModal?.(true)} title="Przypnij nowy wpis">
              <Pin size={25} />
            </button>
            <button onClick={handleOpenPreview} title="Otwórz w nowym oknie">
              <ExternalLink size={25} />
            </button>
          </div>

          <BoardFilters
            filterType={effectiveFilterType}
            setFilterType={setFilterType}
            filterAuthor={effectiveFilterAuthor}
            setFilterAuthor={setFilterAuthor}
            filterMentioned={effectiveFilterMentioned}
            setFilterMentioned={setFilterMentioned}
            filterPriority={effectiveFilterPriority}
            setFilterPriority={setFilterPriority}
            filterTag={effectiveFilterTag}
            setFilterTag={setFilterTag}
            gotoDate={gotoDate}
            setGotoDate={setGotoDate}
            posts={safePosts}
            users={users}
            setCurrentDay={safeSetCurrentDay}
            onResetFilters={() => {
              setFilterType?.('all')
              setFilterAuthor?.('')
              setFilterMentioned?.('')
              setFilterPriority?.('')
              setFilterTag?.('')
              setGotoDate?.('')
              setCurrentDay(new Date())
            }}
          />
        </div>
      )}

      <BoardLayout
        visibleDays={visibleDays}
        posts={safePosts}
        filteredEntries={filteredEntriesSelector}
        loggedInUser={loggedInUser}
        expandedPostId={isPreview ? undefined : expandedPostId}
        setExpandedPostId={isPreview ? undefined : setExpandedPostId}
        setSelectedPost={safeSetSelectedPost}
        setCurrentDay={safeSetCurrentDay}
        onDayClick={effectiveOnDayClick}
        setEditMode={safeSetEditMode}
        setPosts={safeSetPosts}
        selectedPost={effectiveSelectedPost}
        suppressTable={effectiveSuppressTable}
        holidays={mergedHolidays}
        daysOff={daysOff}
      />

      {/* ADD */}
      {!isPreview && (
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
      )}

      {/* EDIT */}
      {!isPreview && (
        <BoardAddEditModal
          mode="edit"
          show={!!effectiveSelectedPost}
          onClose={() => {
            safeSetEditMode?.(false)
            safeSetSelectedPost(null)
          }}
          value={effectiveSelectedPost}
          setValue={safeSetSelectedPost}
          users={users}
          availableTags={availableTags}
          setAvailableTags={setAvailableTags}
          customTag={customTag}
          setCustomTag={setCustomTag}
          loggedInUser={loggedInUser}
          onSubmit={(model) => {
            safeHandleEditSave?.(model)
            safeSetEditMode?.(false)
            safeSetSelectedPost(null)
          }}
          onDelete={(model) => {
            safeHandleDelete?.(model)
            safeSetEditMode?.(false)
            safeSetSelectedPost(null)
          }}
        />
      )}
    </div>
  )
}

export default Board

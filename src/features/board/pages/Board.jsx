// src/features/board/pages/Board.jsx
import React, { useMemo, useState } from 'react'
import '../styles/board.css'
import { addDays } from 'date-fns'
import { ExternalLink, Pin } from 'lucide-react'

import { useBoardLogic } from '../hooks/useBoardLogic'
import useBoardRuntime from '../hooks/useBoardRuntime'
import useBoardFiltersRuntime from '../hooks/useBoardFiltersRuntime'
import useResetBoardView from '../hooks/useResetBoardView'

import BoardLayout from '../components/Board/BoardLayout'
import BoardFilters from '../components/Board/BoardFilters'
import BoardModals from '../components/Board/BoardModals'

import { getPolishHolidays } from '../utils/holidays'
import { BOARD_USERS, BOARD_LOGGED_IN_USER, BOARD_DEFAULT_TAGS } from '../mocks/board.mock'
import { safeDate } from '../utils/boardGuards'

function Board({
  isPreview = false,
  overrideDays = null,

  // EXTERNAL (preview/embed)
  posts: externalPosts,
  setPosts: externalSetPosts,

  // EXTERNAL filters (preview)
  filterType: propFilterType,
  filterAuthor: propFilterAuthor,
  filterMentioned: propFilterMentioned,
  filterPriority: propFilterPriority,
  filterTag: propFilterTag,
  gotoDate: propGotoDate,

  // optional external filter setters (jeśli kiedyś zechcesz sterować filtrami preview)
  setFilterType: propSetFilterType,
  setFilterAuthor: propSetFilterAuthor,
  setFilterMentioned: propSetFilterMentioned,
  setFilterPriority: propSetFilterPriority,
  setFilterTag: propSetFilterTag,
  setGotoDate: propSetGotoDate,

  setCurrentDay: externalSetCurrentDay,
  onDayClick,

  selectedPost: externalSelectedPost,
  setSelectedPost: externalSetSelectedPost,
  setEditMode: externalSetEditMode,

  filteredEntries: externalFilteredEntries,

  suppressTable = false,
  holidays = [],
  daysOff = [],
}) {
  const users = BOARD_USERS
  const loggedInUser = BOARD_LOGGED_IN_USER

  const [currentDay, setCurrentDay] = useState(new Date())
  const day = safeDate(currentDay)

  const currentYear = day.getFullYear()
  const systemHolidays = getPolishHolidays(currentYear)
  const mergedHolidays = [...systemHolidays, ...(Array.isArray(holidays) ? holidays : [])]

  const logic = useBoardLogic([], loggedInUser, BOARD_DEFAULT_TAGS) || {}

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
    setEditMode,

    showModal,
    setShowModal,

    // INTERNAL filters
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
    resetFilters,

    handleAddPost,
    handleEditSaveModel,
    handleDelete,
  } = logic

  // ✅ runtime: internal vs preview/external
  const runtime = useBoardRuntime({
    isPreview,

    internalPosts: posts,
    internalSetPosts: setPosts,
    internalSelectedPost: selectedPost,
    internalSetSelectedPost: setSelectedPost,
    internalSetEditMode: setEditMode,
    internalFilteredEntries: filteredEntries,

    externalPosts,
    externalSetPosts,
    externalSelectedPost,
    externalSetSelectedPost,
    externalSetEditMode,
    externalFilteredEntries,

    internalSetCurrentDay: setCurrentDay,
    externalSetCurrentDay,

    onDayClick,
  })

  // ✅ runtime: filtry – zawsze ten sam kształt dla BoardFilters
  const filtersRuntime = useBoardFiltersRuntime({
    isPreview,
    internal: {
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
    },
    external: {
      filterType: propFilterType,
      filterAuthor: propFilterAuthor,
      filterMentioned: propFilterMentioned,
      filterPriority: propFilterPriority,
      filterTag: propFilterTag,
      gotoDate: propGotoDate,
    },
    externalSetters: {
      setFilterType: propSetFilterType,
      setFilterAuthor: propSetFilterAuthor,
      setFilterMentioned: propSetFilterMentioned,
      setFilterPriority: propSetFilterPriority,
      setFilterTag: propSetFilterTag,
      setGotoDate: propSetGotoDate,
    },
  })

  // ✅ SSOT: reset widoku tablicy
  const resetBoardView = useResetBoardView({
    resetFilters,
    setCurrentDay,
  })

  const effectiveSuppressTable = isPreview ? true : suppressTable

  const visibleDays = useMemo(() => {
    if (Array.isArray(overrideDays) && overrideDays.length) return overrideDays
    return Array.from({ length: 5 }, (_, i) => addDays(day, i - 2))
  }, [overrideDays, day])

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
            filterType={filtersRuntime.filterType}
            setFilterType={filtersRuntime.setFilterType}
            filterAuthor={filtersRuntime.filterAuthor}
            setFilterAuthor={filtersRuntime.setFilterAuthor}
            filterMentioned={filtersRuntime.filterMentioned}
            setFilterMentioned={filtersRuntime.setFilterMentioned}
            filterPriority={filtersRuntime.filterPriority}
            setFilterPriority={filtersRuntime.setFilterPriority}
            filterTag={filtersRuntime.filterTag}
            setFilterTag={filtersRuntime.setFilterTag}
            gotoDate={filtersRuntime.gotoDate}
            setGotoDate={filtersRuntime.setGotoDate}
            posts={runtime.posts}
            users={users}
            setCurrentDay={runtime.setCurrentDay}
            onResetFilters={resetBoardView}
          />
        </div>
      )}

      <BoardLayout
        visibleDays={visibleDays}
        posts={runtime.posts}
        filteredEntries={runtime.filteredEntriesSelector}
        loggedInUser={loggedInUser}
        expandedPostId={isPreview ? undefined : expandedPostId}
        setExpandedPostId={isPreview ? undefined : setExpandedPostId}
        setSelectedPost={runtime.setSelectedPost}
        setCurrentDay={runtime.setCurrentDay}
        onDayClick={runtime.onDayClick}
        setEditMode={runtime.setEditMode}
        setPosts={runtime.setPosts}
        selectedPost={runtime.selectedPost}
        suppressTable={effectiveSuppressTable}
        holidays={mergedHolidays}
        daysOff={daysOff}
      />

      {!isPreview && (
        <BoardModals
          // ADD
          showAdd={!!showModal}
          setShowAdd={setShowModal}
          addValue={newPost}
          setAddValue={setNewPost}
          // EDIT
          selectedPost={runtime.selectedPost}
          setSelectedPost={runtime.setSelectedPost}
          setEditMode={runtime.setEditMode}
          // wspólne
          users={users}
          availableTags={availableTags}
          setAvailableTags={setAvailableTags}
          customTag={customTag}
          setCustomTag={setCustomTag}
          loggedInUser={loggedInUser}
          // akcje
          onAdd={handleAddPost}
          onEditSave={handleEditSaveModel}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Board
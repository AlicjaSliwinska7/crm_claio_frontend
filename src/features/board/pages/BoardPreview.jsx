// src/features/board/pages/BoardPreview.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react'

import '../styles/board.css'
import '../styles/board-preview.css'

import Board from './Board'
import { useBoardLogic } from '../hooks/useBoardLogic'
import useBoardPreviewData from '../hooks/useBoardPreviewData'
import useResetBoardView from '../hooks/useResetBoardView'

import BoardPreviewHeader from '../components/BoardPreview/BoardPreviewHeader'
import WeekGrid from '../components/BoardPreview/WeekGrid'
import Table from '../components/BoardPreview/Table'
import BoardModals from '../components/Board/BoardModals'

import { getPolishHolidays } from '../utils/holidays'
import { createDraftPost } from '../utils/postDraft'

import {
  BOARD_USERS,
  BOARD_LOGGED_IN_USER,
  BOARD_INITIAL_POSTS,
  BOARD_DEFAULT_TAGS,
} from '../mocks/board.mock'

import { resolveFilteredSelector, safeDate } from '../utils/boardGuards'

export default function BoardPreview() {
  useEffect(() => {
    document.body.classList.add('preview-mode')
    return () => document.body.classList.remove('preview-mode')
  }, [])

  const users = BOARD_USERS
  const loggedInUser = BOARD_LOGGED_IN_USER

  const [currentDay, setCurrentDay] = useState(new Date())
  const day = safeDate(currentDay)

  const currentYear = day.getFullYear()
  const systemHolidays = getPolishHolidays(currentYear)

  const logic = useBoardLogic(BOARD_INITIAL_POSTS, loggedInUser, BOARD_DEFAULT_TAGS) || {}
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
    filteredEntries,
    resetFilters,
    handleAddPost,
    handleEditSaveModel,
    handleDelete,
  } = logic

  const filteredSelector = useMemo(() => resolveFilteredSelector(filteredEntries), [filteredEntries])

  const { weeks, tableRows, authors, tags, postsArr } = useBoardPreviewData({
    currentDay: day,
    posts,
    filteredSelector,
  })

  // ✅ SSOT: reset widoku preview
  const resetBoardView = useResetBoardView({
    resetFilters,
    setCurrentDay,
  })

  const openCreate = useCallback(
    (d = new Date()) => {
      setNewPost?.(createDraftPost({ loggedInUser, day: d }))
      setShowModal?.(true)
    },
    [loggedInUser, setNewPost, setShowModal],
  )

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
        onOpenCreate={() => openCreate(day)}
        onReset={resetBoardView}
        authors={authors}
        users={users}
        tags={tags}
      />

      <div className="board-grid">
        <WeekGrid
          weeks={weeks}
          BoardComponent={Board}
          posts={postsArr}
          filters={{ filterType, filterAuthor, filterMentioned, filterPriority, filterTag }}
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

      <Table rows={tableRows} onRowClick={openEditFromRow} />

      <BoardModals
        // ADD
        showAdd={!!showModal}
        setShowAdd={setShowModal}
        addValue={newPost}
        setAddValue={setNewPost}
        // EDIT
        selectedPost={selectedPost}
        setSelectedPost={setSelectedPost}
        setEditMode={setEditMode}
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
    </div>
  )
}
// src/features/board/components/Board/BoardModals.jsx
import React, { useMemo } from 'react'
import BoardAddEditModal from './BoardAddEditModal'

/**
 * Wspólna obsługa modali ADD + EDIT dla Board i BoardPreview.
 *
 * Założenia:
 * - ADD modal otwierany przez: showAdd + setShowAdd
 * - EDIT modal oparty o: selectedPost (truthy => otwarty) + setSelectedPost + setEditMode
 * - onAdd / onEditSave / onDelete – podajesz z useBoardLogic
 */
export default function BoardModals({
  // ADD
  showAdd = false,
  setShowAdd,
  addValue,
  setAddValue,

  // EDIT
  selectedPost,
  setSelectedPost,
  setEditMode,

  // wspólne
  users = [],
  availableTags = [],
  setAvailableTags,
  customTag,
  setCustomTag,
  loggedInUser,

  // akcje
  onAdd,
  onEditSave,
  onDelete,

  // opcjonalnie: możliwość całkowitego wyłączenia
  disableAdd = false,
  disableEdit = false,
}) {
  const safeUsers = Array.isArray(users) ? users : []

  const safeSetShowAdd = typeof setShowAdd === 'function' ? setShowAdd : () => {}
  const safeSetSelectedPost = typeof setSelectedPost === 'function' ? setSelectedPost : () => {}
  const safeSetEditMode = typeof setEditMode === 'function' ? setEditMode : () => {}

  const safeOnAdd = typeof onAdd === 'function' ? onAdd : () => {}
  const safeOnEditSave = typeof onEditSave === 'function' ? onEditSave : () => {}
  const safeOnDelete = typeof onDelete === 'function' ? onDelete : () => {}

  const canAdd = !disableAdd
  const canEdit = !disableEdit

  const showEdit = !!selectedPost

  const commonProps = useMemo(
    () => ({
      users: safeUsers,
      availableTags,
      setAvailableTags,
      customTag,
      setCustomTag,
      loggedInUser,
    }),
    [safeUsers, availableTags, setAvailableTags, customTag, setCustomTag, loggedInUser],
  )

  return (
    <>
      {/* ADD */}
      {canAdd && (
        <BoardAddEditModal
          mode="add"
          show={!!showAdd}
          onClose={() => safeSetShowAdd(false)}
          value={addValue}
          setValue={setAddValue}
          {...commonProps}
          onSubmit={(model) => {
            safeOnAdd(model)
            safeSetShowAdd(false)
          }}
        />
      )}

      {/* EDIT */}
      {canEdit && (
        <BoardAddEditModal
          mode="edit"
          show={showEdit}
          onClose={() => {
            safeSetEditMode(false)
            safeSetSelectedPost(null)
          }}
          value={selectedPost}
          setValue={safeSetSelectedPost}
          {...commonProps}
          onSubmit={(model) => {
            safeOnEditSave(model)
            safeSetEditMode(false)
            safeSetSelectedPost(null)
          }}
          onDelete={(model) => {
            safeOnDelete(model)
            safeSetEditMode(false)
            safeSetSelectedPost(null)
          }}
        />
      )}
    </>
  )
}
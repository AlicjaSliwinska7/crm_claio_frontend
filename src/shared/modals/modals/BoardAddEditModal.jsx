// src/features/board/components/Board/BoardAddEditModal.jsx
import React, { useEffect, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import Modal from './Modal'
import '../styles/form-modal.css'

// ✅ poprawna ścieżka (plik jest w: features/board/components/Board/*)
import PostTaskForm from '../../../features/board/forms/PostTaskForm'

/**
 * Jeden modal dla: ADD / EDIT
 *
 * Obsługuje DWIE sygnatury propsów:
 *
 * A) "stara" (feature/board):
 *   - show, mode ('add'|'edit'), value, setValue, onSubmit, onDelete
 *
 * B) "nowa" (shared/modals / Board.jsx po refaktorze):
 *   - isOpen, editMode, selectedPost, setSelectedPost, newPost, setNewPost, onSave, onDelete
 *
 * Dzięki temu pinezka (ADD) zawsze odpali poprawny modal i formularz.
 */
export default function BoardAddEditModal(props) {
  // ====== API B (nowe) ======
  const {
    isOpen,
    editMode,
    selectedPost,
    setSelectedPost,
    newPost,
    setNewPost,
    onSave,
    // onDelete jest wspólne w obu API
  } = props

  // ====== API A (stare) ======
  const {
    mode: modeA = 'add',
    show: showA,
    value: valueA,
    setValue: setValueA,
    onSubmit: onSubmitA,
    onDelete,
    onClose,
    users = [],
    availableTags = [],
    setAvailableTags,
    customTag,
    setCustomTag,
    loggedInUser,
    titleAdd = 'Dodaj wpis',
    titleEdit = 'Edytuj wpis',
  } = props

  // ====== Złóż "źródło prawdy" niezależnie od API ======

  const resolvedShow = typeof isOpen === 'boolean' ? isOpen : !!showA
  const resolvedMode =
    typeof editMode === 'boolean' ? (editMode ? 'edit' : 'add') : modeA

  const resolvedValue =
    resolvedMode === 'edit'
      ? (selectedPost ?? valueA)
      : (newPost ?? valueA)

  const resolvedSetValue =
    resolvedMode === 'edit'
      ? (typeof setSelectedPost === 'function' ? setSelectedPost : setValueA)
      : (typeof setNewPost === 'function' ? setNewPost : setValueA)

  const resolvedOnSubmit =
    typeof onSave === 'function' ? onSave : onSubmitA

  // ====== Normalizacja modelu (ZAWSZE bezpieczna) ======
  const safeModel = useMemo(() => {
    const base = resolvedValue || {}
    return {
      id: base.id,
      type: base.type || 'post',
      title: base.title || '',
      content: base.content || '',
      author: base.author || '',
      date: base.date || '',
      lastEdited: base.lastEdited || '',
      targetDate: base.targetDate || '',
      priority: base.priority || 'normalny',
      mentions: Array.isArray(base.mentions) ? base.mentions : [],
      tags: Array.isArray(base.tags) ? base.tags : [],
    }
  }, [resolvedValue])

  // ====== Uprawnienia w EDIT (tylko autor, jeśli loggedInUser podany) ======
  const canEdit =
    resolvedMode !== 'edit' ||
    !loggedInUser ||
    (safeModel.author && safeModel.author === loggedInUser)

  /**
   * Inicjalizacja STANU przy OTWARCIU modala:
   * - ADD: ustaw author + date + targetDate fallback
   * - EDIT: nie resetujemy pól, tylko dbamy o kompletność (date)
   *
   * UWAGA: nie dodajemy safeModel do deps, żeby nie resetować w trakcie pisania.
   */
  useEffect(() => {
    if (!resolvedShow) return

    resolvedSetValue?.((prev) => {
      const p = prev || {}
      const nowIso = new Date().toISOString()

      if (resolvedMode === 'add') {
        const fallbackDay = format(new Date(), 'yyyy-MM-dd')

        return {
          ...safeModel,
          ...p,
          date: p.date || safeModel.date || nowIso,
          author: p.author || safeModel.author || loggedInUser || '',
          // ✅ targetDate nie może startować jako ''
          targetDate: p.targetDate || safeModel.targetDate || fallbackDay,
        }
      }

      return {
        ...safeModel,
        ...p,
        date: p.date || safeModel.date || nowIso,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedShow, resolvedMode, loggedInUser, resolvedSetValue])

  const handleChange = useCallback(
    (patch) => {
      if (resolvedMode === 'edit' && !canEdit) return
      resolvedSetValue?.((prev) => ({ ...(prev || {}), ...(patch || {}) }))
    },
    [resolvedSetValue, resolvedMode, canEdit]
  )

  if (!resolvedShow) return null

  // Źródło prawdy: resolvedValue (jeśli jest), a safeModel jako fallback
  const model = resolvedValue && typeof resolvedValue === 'object' ? resolvedValue : safeModel

  return (
    <Modal
      title={resolvedMode === 'edit' ? titleEdit : titleAdd}
      onClose={onClose}
      size="md"
    >
      <PostTaskForm
        value={model}
        users={users}
        availableTags={availableTags}
        setAvailableTags={setAvailableTags}
        customTag={customTag}
        setCustomTag={setCustomTag}
        disabled={resolvedMode === 'edit' && !canEdit}
        onChange={handleChange}
        onCancel={onClose}
        onSubmit={() => {
          if (!canEdit) {
            alert('Nie możesz edytować wpisu, którego nie jesteś autorem.')
            return
          }
          if (!String(model.title || '').trim()) {
            alert('Podaj tytuł.')
            return
          }
          if (!model.targetDate) {
            alert('Wybierz dzień (targetDate).')
            return
          }

          const nowIso = new Date().toISOString()

          resolvedOnSubmit?.({
            ...model,
            date: model.date || nowIso,
            lastEdited: resolvedMode === 'edit' ? nowIso : model.lastEdited || '',
          })
        }}
      />

      {/* Akcje dodatkowe tylko w EDIT */}
      {resolvedMode === 'edit' && canEdit && typeof onDelete === 'function' && (
        <div className="modal-buttons" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="form-button cancel"
            onClick={() => onDelete(model)}
          >
            Usuń
          </button>

          <button
            type="button"
            className="form-button"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      )}
    </Modal>
  )
}
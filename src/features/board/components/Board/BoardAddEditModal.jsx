// src/features/board/components/Board/BoardAddEditModal.jsx
import React, { useEffect, useMemo, useCallback } from 'react'
import Modal from '../../../../shared/modals/modals/Modal'
import '../../../../shared/modals/styles/form-modal.css'

import PostTaskForm from '../../forms/PostTaskForm'

/**
 * Jeden modal dla: ADD / EDIT
 *
 * Tryb:
 *  - mode="add"  -> tworzenie
 *  - mode="edit" -> edycja istniejącego wpisu
 */
export default function BoardAddEditModal({
  mode = 'add', // 'add' | 'edit'
  show,
  onClose,

  value,
  setValue,

  users = [],
  availableTags = [],
  setAvailableTags,
  customTag,
  setCustomTag,

  onSubmit,      // (model) => void
  onDelete,      // (model) => void  -> tylko edit
  loggedInUser,  // opcjonalnie

  titleAdd = 'Dodaj wpis',
  titleEdit = 'Edytuj wpis',
}) {
  /**
   * Normalizacja modelu – ZAWSZE bezpieczna
   * (fallback, gdy value jest puste / niekompletne)
   */
  const safeModel = useMemo(() => {
    const base = value || {}
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
  }, [value])

  /**
   * Czy wolno edytować (w edit tylko autor)
   */
  const canEdit =
    mode !== 'edit' ||
    !loggedInUser ||
    (safeModel.author && safeModel.author === loggedInUser)

  /**
   * Inicjalizacja STANU przy OTWARCIU modala:
   * - ADD: ustawiamy author + date (jeśli brak)
   * - EDIT: nie resetujemy pól, tylko dbamy o kompletność (np. date)
   *
   * Celowo NIE dodajemy safeModel do deps, żeby nie resetować w trakcie pisania.
   */
  useEffect(() => {
    if (!show) return

    setValue?.(prev => {
      const p = prev || {}
      const nowIso = new Date().toISOString()

      if (mode === 'add') {
        return {
          ...safeModel,
          ...p,
          date: p.date || safeModel.date || nowIso,
          author: p.author || safeModel.author || loggedInUser || '',
        }
      }

      return {
        ...safeModel,
        ...p,
        date: p.date || safeModel.date || nowIso,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, mode, loggedInUser, setValue])

  const handleChange = useCallback(
    (patch) => {
      if (mode === 'edit' && !canEdit) return
      setValue?.(prev => ({ ...(prev || {}), ...(patch || {}) }))
    },
    [setValue, mode, canEdit],
  )

  if (!show) return null

  // Źródło prawdy: value (jeśli jest), a safeModel jako fallback
  const model = value && typeof value === 'object' ? value : safeModel

  return (
    <Modal
      title={mode === 'edit' ? titleEdit : titleAdd}
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
        disabled={mode === 'edit' && !canEdit}
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

          onSubmit?.({
            ...model,
            date: model.date || nowIso,
            lastEdited: mode === 'edit' ? nowIso : (model.lastEdited || ''),
          })
        }}
      />

      {/* Akcje dodatkowe tylko w EDIT */}
      {mode === 'edit' && canEdit && typeof onDelete === 'function' && (
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

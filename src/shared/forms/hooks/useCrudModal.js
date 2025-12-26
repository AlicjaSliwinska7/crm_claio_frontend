// src/features/forms/hooks/useCrudModal.js
import { useState, useCallback } from 'react'
import { validateObject, firstErrorKey } from '../utils/validators'

/**
 * Uniwersalny hook do obługi modala formularza (add/edit).
 * Zarządza: open/close, trybem edycji, indeksem, draftem i błędami.
 *
 * @param {Object} options
 * @param {Object} options.empty - pusty obiekt formularza
 * @param {Object} [options.schema] - schemat walidacji (validators.js)
 * @param {Function} [options.onSubmit] - (draft, {isEditing, index}) => void
 */
export function useCrudModal({ empty, schema = {}, onSubmit } = {}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(empty)
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [index, setIndex] = useState(null)

  const openAdd = useCallback(() => {
    setDraft(empty)
    setErrors({})
    setIsEditing(false)
    setIndex(null)
    setOpen(true)
  }, [empty])

  const openEdit = useCallback((existing, i = null) => {
    setDraft(existing ?? empty)
    setErrors({})
    setIsEditing(true)
    setIndex(i)
    setOpen(true)
  }, [empty])

  const close = useCallback(() => {
    setOpen(false)
    setErrors({})
  }, [])

  // obsługa pól: działa zarówno z eventem jak i name/value
  const handleChange = useCallback((nameOrEvent, value) => {
    if (typeof nameOrEvent === 'string') {
      const name = nameOrEvent
      setDraft(prev => ({ ...prev, [name]: value }))
    } else {
      const e = nameOrEvent
      const { name, value } = e.target
      setDraft(prev => ({ ...prev, [name]: value }))
    }
  }, [])

  const submit = useCallback(() => {
    const { errors: formErrors, isValid } = validateObject(draft, schema)
    setErrors(formErrors)
    if (!isValid) {
      const key = firstErrorKey(formErrors)
      if (key) {
        try { document.querySelector(`[name="${key}"]`)?.focus() } catch {}
      }
      return { ok: false, errors: formErrors }
    }

    onSubmit?.(draft, { isEditing, index })

    // po sukcesie domyślnie zamknij i wyczyść
    setOpen(false)
    setErrors({})
    setIsEditing(false)
    setIndex(null)
    setDraft(empty)
    return { ok: true }
  }, [draft, schema, onSubmit, isEditing, index, empty])

  return {
    // state
    open, draft, errors, isEditing, index,
    // mutatory
    setDraft, setErrors,
    // api
    openAdd, openEdit, close, handleChange, submit,
  }
}

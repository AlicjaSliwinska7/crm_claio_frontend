// src/shared/modals/modals/NewConversationModal.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import ContentModal from './ContentModal'
import '../styles/new-conversation-modal.css'

// Domyślna lista (możesz podać users w propsach)
const DEFAULT_USERS = [
  { id: 'u1', name: 'Alicja Śliwińska' },
  { id: 'u2', name: 'Jan Kowalski' },
  { id: 'u3', name: 'Anna Nowak' },
  { id: 'u4', name: 'Piotr Zieliński' },
  { id: 'u5', name: 'Maria Wiśniewska' },
  { id: 'u6', name: 'Tomasz Nowak' },
  { id: 'u7', name: 'Katarzyna Lewandowska' },
  { id: 'u8', name: 'Paweł Kaczmarek' },
  { id: 'u9', name: 'Ewa Wojciechowska' },
]

function normName(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function NewConversationModal({
  /* UI */
  open = false,
  onClose,

  /* USERS */
  users = DEFAULT_USERS,
  loggedInUserId = '',

  /* MODE */
  mode = 'create', // 'create' | 'edit'
  conversation = null, // { id, name, members } для edycji

  /* CREATE */
  onCreate,

  /* EDIT */
  onSave, // payload: { id, name, members }

  /* Walidacja unikalnej nazwy */
  existingConversations = [],

  /* Błędy z hooka (SSOT) */
  error = '',
  onClearError,
}) {
  const isEdit = mode === 'edit'
  const title = isEdit ? 'Edytuj rozmowę' : 'Nowa rozmowa'

  const [name, setName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [touchedName, setTouchedName] = useState(false)

  const nameInputRef = useRef(null)

  const usersArray = useMemo(() => {
    if (Array.isArray(users)) return users
    return Object.entries(users || {}).map(([id, nm]) => ({ id, name: nm }))
  }, [users])

  const selectable = useMemo(() => {
    // w create wycinamy siebie (bo i tak jesteś implicit), w edit pokazujemy Ciebie ale zablokowanego
    if (!loggedInUserId) return usersArray
    return isEdit ? usersArray : usersArray.filter((u) => u.id !== loggedInUserId)
  }, [usersArray, loggedInUserId, isEdit])

  // init / reset
  useEffect(() => {
    if (!open) return

    onClearError?.()

    if (isEdit) {
      setName(String(conversation?.name || ''))
      setSelectedUsers(Array.isArray(conversation?.members) ? conversation.members : (loggedInUserId ? [loggedInUserId] : []))
      setTouchedName(false)
    } else {
      setName('')
      setSelectedUsers([])
      setTouchedName(false)
    }

    queueMicrotask(() => nameInputRef.current?.focus?.())
  }, [open, isEdit, conversation?.id, conversation?.name, conversation?.members, loggedInUserId, onClearError])

  // create: auto-nazwa przy 1 userze
  const disabledName = useMemo(() => {
    if (isEdit) return false
    return selectedUsers.length === 1 && !touchedName
  }, [isEdit, selectedUsers.length, touchedName])

  const computedName = useMemo(() => {
    if (!isEdit && selectedUsers.length === 1 && !touchedName) {
      return selectable.find((u) => u.id === selectedUsers[0])?.name || ''
    }
    return String(name || '').trim()
  }, [name, selectable, selectedUsers, touchedName, isEdit])

  // w edit: zawsze upewnij się, że Ty jesteś w members
  const normalizedMembers = useMemo(() => {
    const base = Array.isArray(selectedUsers) ? selectedUsers : []
    if (!loggedInUserId) return Array.from(new Set(base))
    return Array.from(new Set([...base, loggedInUserId]))
  }, [selectedUsers, loggedInUserId])

  // duplikat nazwy
  const isDuplicate = useMemo(() => {
    const n = normName(computedName)
    if (!n) return false

    // w edit: nie porównuj z samą sobą
    const selfId = conversation?.id
    return (existingConversations || []).some((c) => {
      if (isEdit && selfId && c?.id === selfId) return false
      return normName(c?.name) === n
    })
  }, [computedName, existingConversations, isEdit, conversation?.id])

  const canSubmit = useMemo(() => {
    if (!open) return false
    if (!computedName) return false
    if (isDuplicate) return false

    if (isEdit) {
      // edycja: musi być przynajmniej 1 uczestnik i musisz być Ty
      if (!normalizedMembers.length) return false
      if (loggedInUserId && !normalizedMembers.includes(loggedInUserId)) return false
      return true
    }

    // create: musi być wybrany min 1 user
    if (!selectedUsers.length) return false
    return true
  }, [open, computedName, isDuplicate, isEdit, selectedUsers.length, normalizedMembers, loggedInUserId])

  const handleToggleUser = useCallback(
    (id) => {
      if (!id) return
      onClearError?.()

      // w edit: nie pozwól odhaczyć siebie
      if (isEdit && id === loggedInUserId) return

      setSelectedUsers((prev) => {
        const has = prev.includes(id)
        const next = has ? prev.filter((x) => x !== id) : [...prev, id]

        // auto-nazwa tylko w CREATE i tylko jeśli nie dotknięto nazwy
        if (!isEdit && !touchedName) {
          if (next.length === 1) {
            const selectedUser = selectable.find((u) => u.id === next[0])
            if (selectedUser) setName(selectedUser.name)
          } else {
            setName('')
          }
        }

        return next
      })
    },
    [onClearError, isEdit, loggedInUserId, touchedName, selectable]
  )

  const submit = useCallback(() => {
    if (!canSubmit) return

    if (isEdit) {
      onSave?.({
        id: conversation?.id,
        name: computedName,
        members: normalizedMembers,
      })
      return
    }

    onCreate?.({
      id: Date.now().toString(),
      name: computedName,
      members: selectedUsers,
      messages: [],
    })
  }, [canSubmit, isEdit, onSave, onCreate, conversation?.id, computedName, normalizedMembers, selectedUsers])

  const localError = useMemo(() => {
    if (error) return error
    if (!open) return ''

    // minimalna walidacja UX
    if (touchedName || selectedUsers.length > 0 || isEdit) {
      if (!computedName) return 'Podaj nazwę rozmowy.'
      if (isDuplicate) return 'Taka konwersacja już istnieje.'
      if (!isEdit && !selectedUsers.length) return 'Wybierz przynajmniej jednego uczestnika.'
      if (isEdit && loggedInUserId && !normalizedMembers.includes(loggedInUserId)) return 'Musisz pozostać uczestnikiem rozmowy.'
      if (isEdit && !normalizedMembers.length) return 'Wybierz przynajmniej jednego uczestnika.'
    }

    return ''
  }, [error, open, touchedName, selectedUsers.length, isEdit, computedName, isDuplicate, loggedInUserId, normalizedMembers])

  return (
    <ContentModal open={open} onClose={onClose} title={title} size="md">
      <div className="new-conv-modal nc">
        {/* Nazwa */}
        <div className="nc__field">
          <div className="nc__label">Nazwa rozmowy</div>
          <input
            ref={nameInputRef}
            className={`nc__input ${localError && (!computedName || isDuplicate) ? 'is-invalid' : ''}`}
            type="text"
            placeholder={
              !isEdit && selectedUsers.length === 1 && !touchedName
                ? 'Nazwa ustawiona automatycznie'
                : 'Nazwa rozmowy'
            }
            value={name}
            onChange={(e) => {
              onClearError?.()
              setTouchedName(true)
              setName(e.target.value)
            }}
            disabled={disabledName}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (canSubmit) submit()
              }
            }}
          />
          {!isEdit && selectedUsers.length === 1 && !touchedName ? (
            <div className="nc__hint">Nazwa uzupełnia się automatycznie dla rozmowy 1:1.</div>
          ) : null}
        </div>

        {localError ? (
          <div className="nc__error" role="alert" aria-live="polite">
            {localError}
          </div>
        ) : null}

        {/* Uczestnicy */}
        <div className="nc__section">
          <div className="nc__sectionTitle">Uczestnicy</div>

          <div className="nc__list" role="group" aria-label="Wybierz uczestników rozmowy">
            {selectable.map((user) => {
              const checked = isEdit
                ? normalizedMembers.includes(user.id)
                : selectedUsers.includes(user.id)

              const isSelf = isEdit && user.id === loggedInUserId

              return (
                <label key={user.id} className={`nc__row ${isSelf ? 'is-self' : ''}`}>
                  <input
                    className="nc__check"
                    type="checkbox"
                    checked={checked}
                    disabled={isSelf}
                    onChange={() => handleToggleUser(user.id)}
                  />
                  <span className="nc__name">
                    {user.name}
                    {isSelf ? <span className="nc__badge">Ty</span> : null}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="nc__actions">
          <button
            className="nc__btn nc__btn--primary"
            onClick={submit}
            disabled={!canSubmit}
            type="button"
          >
            {isEdit ? 'Zapisz' : 'Utwórz'}
          </button>

          <button
            className="nc__btn nc__btn--cancel"
            onClick={() => {
              onClearError?.()
              onClose?.()
            }}
            type="button"
          >
            Anuluj
          </button>
        </div>
      </div>
    </ContentModal>
  )
}
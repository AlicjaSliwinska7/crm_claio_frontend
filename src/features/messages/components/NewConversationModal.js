// src/components/messages/NewConversationModal.js
import React, { useMemo, useState } from 'react'
import Modal from '../../../shared/modals/modals/Modal' // ← ścieżka z components/messages → shared/modals
import '../../../shared/modals/styles/form-modal.css'   // ← style z form-modal.css

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

function NewConversationModal({
  open = true,
  onCreate,
  onClose,
  users = DEFAULT_USERS,
  loggedInUserId = '', // opcjonalnie, by wyciąć siebie z listy
}) {
  // Hooki zawsze na górze (bez wczesnego return)
  const [name, setName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])

  // Ewentualnie bez zalogowanego
  const selectable = useMemo(
    () => (loggedInUserId ? users.filter(u => u.id !== loggedInUserId) : users),
    [users, loggedInUserId]
  )

  const handleToggleUser = id => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(uid => uid !== id)
        : [...prev, id]

      // Auto-nazwa: jeśli dokładnie 1 uczestnik, ustaw na jego imię
      if (newSelection.length === 1) {
        const selectedUser = selectable.find(user => user.id === newSelection[0])
        if (selectedUser) setName(selectedUser.name)
      } else {
        setName('')
      }

      return newSelection
    })
  }

  const handleCreate = () => {
    if (selectedUsers.length === 0) {
      alert('Wybierz co najmniej jednego uczestnika.')
      return
    }
    if (name.trim() === '') {
      alert('Podaj nazwę rozmowy.')
      return
    }

    onCreate?.({
      id: Date.now().toString(),
      name: name.trim(),
      members: selectedUsers,
      messages: [],
    })
    onClose?.()
  }

  // Render dopiero po hookach
  if (!open) return null

  return (
    <Modal isOpen={open} onClose={onClose} title="Nowa rozmowa" size="md">
      {/* ——— Zachowana kolejność jak w oryginale: tytuł → input → lista → akcje ——— */}

      {/* Pole nazwy: w stylu form-modal (blue underline) */}
      <input
        className="m-input"
        type="text"
        placeholder={
          selectedUsers.length === 1
            ? 'Nazwa ustawiona automatycznie'
            : 'Nazwa rozmowy'
        }
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={selectedUsers.length === 1}
        autoComplete="off"
        style={{ marginBottom: 12 }}
      />

      {/* Lista użytkowników: checkboxy w stylu form-modal */}
      <div className="checkbox-group user-list" style={{ marginBottom: 14 }}>
        {selectable.map(user => (
          <label key={user.id} className="m-choice">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleToggleUser(user.id)}
            />
            <span>{user.name}</span>
          </label>
        ))}
      </div>

      {/* Akcje: przyciski w stopce modala, klasy z form-modal.css */}
      <div className="m-actions--footer modal-actions">
        <button className="m-btn m-btn--primary" onClick={handleCreate}>
          Utwórz
        </button>
        <button className="m-btn m-btn--cancel" onClick={onClose}>
          Anuluj
        </button>
      </div>
    </Modal>
  )
}

export default NewConversationModal

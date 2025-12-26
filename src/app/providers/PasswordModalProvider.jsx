// src/app/providers/PasswordModalProvider.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

// Minimalny, bezpieczny kontekst + kompatybilne nazwy funkcji
const PasswordModalCtx = createContext(null)

export function PasswordModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [payload, setPayload] = useState(null) // np. { mode: 'change', userId: ... }

  const openModal = useCallback((data) => {
    setPayload(data || null)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => setIsOpen(false), [])

  // 🔁 aliasy kompatybilności:
  const openPasswordModal = openModal
  const closePasswordModal = closeModal

  const value = useMemo(
    () => ({
      // stan
      isOpen,
      payload,
      // nowe API
      openModal,
      closeModal,
      // stare/oczekiwane API
      openPasswordModal,
      closePasswordModal,
    }),
    [isOpen, payload, openModal, closeModal, openPasswordModal, closePasswordModal]
  )

  return <PasswordModalCtx.Provider value={value}>{children}</PasswordModalCtx.Provider>
}

export function usePasswordModal() {
  const ctx = useContext(PasswordModalCtx)
  if (!ctx) {
    throw new Error('usePasswordModal must be used within PasswordModalProvider')
  }
  return ctx
}

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function UserMenu({
  userName = 'Użytkownik',
  onChangePassword,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const btnRef = useRef(null)

  // klik poza -> zamknij
  useEffect(() => {
    const onDocMouseDown = e => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  // Escape -> zamknij
  useEffect(() => {
    if (!open) return
    const onKey = e => {
      if (e.key === 'Escape') {
        setOpen(false)
        setTimeout(() => btnRef.current?.focus(), 0)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => setOpen(o => !o)

  return (
    <div
      ref={rootRef}
      className={`user-section ${open ? 'is-open' : ''}`}
    >
      <div
        ref={btnRef}
        className="user-button"
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu-dropdown"
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <i className="fas fa-user" aria-hidden="true" />
        <div>{userName}</div>
        <i
          className={`fas ${open ? 'fa-caret-up' : 'fa-caret-down'}`}
          style={{ marginLeft: 5 }}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div
          id="user-menu-dropdown"
          className="user-dropdown"
          role="menu"
          aria-label="Menu użytkownika"
          onMouseDown={e => e.stopPropagation()}
        >
          <Link to="/profil" role="menuitem" tabIndex={0} onClick={() => setOpen(false)}>
            Informacje
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChangePassword?.()
              setOpen(false)
            }}
          >
            Zmień hasło
          </button>

          <Link to="/login" role="menuitem" tabIndex={0} onClick={() => setOpen(false)}>
            Wyloguj
          </Link>
        </div>
      )}
    </div>
  )
}

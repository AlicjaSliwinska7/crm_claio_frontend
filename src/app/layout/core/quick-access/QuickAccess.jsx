import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/quick-access.css'

import Header from './components/Header'
import Carousel from './components/Carousel'
import InlineExpand from '../../../../shared/modals/modals/InlineExpand'
import QuickAccessAddForm from './components/QuickAccessAddForm'
import useShortcuts from './hooks/useShortcuts'
import useCarousel from './hooks/useCarousel'

const DEFAULT_SHORTCUTS = Object.freeze([
  { id: 'samples', label: 'Rejestr próbek', to: '/probki/rejestr-probek' },
  { id: 'orders', label: 'Rejestr zleceń', to: '/sprzedaz/rejestr-zlecen' },
  { id: 'tasks', label: 'Zadania', to: '/zadania' },
  { id: 'docs', label: 'Dokumenty', to: '/administracja/dokumenty' },
])

const SUGGESTIONS = Object.freeze([
  { id: 'samples', label: 'Rejestr próbek', to: '/probki/rejestr-probek' },
  { id: 'orders', label: 'Rejestr zleceń', to: '/sprzedaz/rejestr-zlecen' },
  { id: 'tasks', label: 'Zadania', to: '/zadania' },
  { id: 'docs', label: 'Dokumenty', to: '/administracja/dokumenty' },
  { id: 'msgs', label: 'Wiadomości', to: '/wiadomosci' },
  { id: 'notifs', label: 'Powiadomienia', to: '/powiadomienia/wszystkie' },
  { id: 'board', label: 'Tablica', to: '/tablica' },
  { id: 'clients', label: 'Klienci', to: '/sprzedaz/klienci' },
])

function normalizeTo(to) {
  if (!to) return ''
  const s = String(to).trim()
  if (/^https?:\/\//i.test(s)) return s
  return `/${s.replace(/^\/+/, '')}`
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Tryby:
 * - DOMYŚLNY (niekontrolowany): używa useShortcuts() i sam zapisuje do localStorage
 * - KONTROLOWANY (ustawienia): value + onChange -> żadnego auto zapisu tutaj
 */
function QuickAccess({
  manage = false,
  alwaysOpenAdd = false,
  autoSave = true, // zachowane dla API, ale realnie działa w trybie niekontrolowanym (useShortcuts)
  value,
  onChange,
}) {
  const navigate = useNavigate()

  const isControlled = Array.isArray(value) && typeof onChange === 'function'

  // NIEKONTROLOWANY (strona główna) – zapis w hooku
  const hookApi = useShortcuts(DEFAULT_SHORTCUTS)

  const shortcuts = isControlled ? value : hookApi.shortcuts

  const setShortcuts = useCallback(
    (next) => {
      if (!Array.isArray(next)) return
      if (isControlled) onChange(next)
      else {
        // w niekontrolowanym trybie zmieniamy przez replace (żeby zachować normalizację id/to)
        hookApi.replaceShortcuts(next)
      }
    },
    [isControlled, onChange, hookApi]
  )

  const addShortcut = useCallback(
    (item) => {
      const label = String(item?.label ?? '').trim()
      const to = normalizeTo(item?.to ?? '')
      if (!label || !to) return

      if (isControlled) {
        setShortcuts((prev => prev) && shortcuts) // no-op, tylko żeby linter się nie czepiał
      }

      const next = (() => {
        const prev = shortcuts || []
        if (prev.some((s) => normalizeTo(s.to) === to)) return prev
        const id = item.id || makeId()
        return [...prev, { id, label, to }]
      })()

      setShortcuts(next)
    },
    [shortcuts, setShortcuts, isControlled]
  )

  const removeShortcut = useCallback(
    (id) => {
      const prev = shortcuts || []
      const next = prev.filter((s) => s.id !== id)
      setShortcuts(next)
    },
    [shortcuts, setShortcuts]
  )

  const moveShortcut = useCallback(
    (fromIndex, toIndex) => {
      const prev = shortcuts || []
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      setShortcuts(next)
    },
    [shortcuts, setShortcuts]
  )

  const {
    railRef,
    canLeft,
    canRight,
    scrollLeft,
    scrollRight,
    bumpRightAfterAdd,
  } = useCarousel()

  const [isAddOpen, setAddOpen] = useState(false)

  useEffect(() => {
    if (alwaysOpenAdd) setAddOpen(true)
  }, [alwaysOpenAdd])

  const onNavigate = useCallback((to) => navigate(to), [navigate])

  const handleAdd = useCallback(
    (item) => {
      addShortcut(item)
      bumpRightAfterAdd()
      if (!alwaysOpenAdd) setAddOpen(false)
    },
    [addShortcut, bumpRightAfterAdd, alwaysOpenAdd]
  )

  const suggestedLeft = useMemo(() => {
    const list = Array.isArray(shortcuts) ? shortcuts : []
    return SUGGESTIONS.filter((s) => !list.some((x) => normalizeTo(x.to) === normalizeTo(s.to)))
  }, [shortcuts])

  return (
    <div className="quick-access-panel">
      <Header title="SKRÓTY" />

      <Carousel
        shortcuts={shortcuts}
        manage={manage}
        onNavigate={onNavigate}
        onRemove={removeShortcut}
        onAddClick={() => setAddOpen(true)}
        railRef={railRef}
        canLeft={canLeft}
        canRight={canRight}
        scrollLeft={scrollLeft}
        scrollRight={scrollRight}
        onReorder={moveShortcut}
      />

      <InlineExpand
        open={isAddOpen}
        onOpenChange={alwaysOpenAdd ? undefined : setAddOpen}
        size="md"
        ariaLabel="Dodawanie skrótu do paska szybkiego dostępu"
      >
        <div className="qa-add-modal">
          {suggestedLeft.length > 0 && (
            <div className="qa-suggestions" role="group" aria-label="Proponowane skróty">
              <div className="qa-suggestions__grid">
                {suggestedLeft.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="btn qa-suggestion"
                    title={`Dodaj: ${s.label}`}
                    aria-label={`Dodaj skrót: ${s.label}`}
                    onClick={() => handleAdd(s)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="qa-sep" aria-hidden="true" />

          <QuickAccessAddForm
            onCancel={() => {
              if (!alwaysOpenAdd) setAddOpen(false)
            }}
            onSubmit={({ title, url }) => {
              handleAdd({ label: title, to: url })
            }}
            containerClassName="qa-add-form-inline"
            data-testid="qa-add-form"
            cancelLabel="Anuluj"
            wrapInPanel={alwaysOpenAdd}
          />
        </div>
      </InlineExpand>
    </div>
  )
}

export default QuickAccess

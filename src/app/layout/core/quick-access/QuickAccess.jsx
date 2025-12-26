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
  { id: 'samples', label: 'Rejestr próbek',   to: '/probki/rejestr-probek' },
  { id: 'orders',  label: 'Rejestr zleceń',   to: '/sprzedaz/rejestr-zlecen' },
  { id: 'tasks',   label: 'Zadania',          to: '/zadania' },
  { id: 'docs',    label: 'Dokumenty',        to: '/administracja/dokumenty' },
])

const SUGGESTIONS = Object.freeze([
  { id: 'samples', label: 'Rejestr próbek',   to: '/probki/rejestr-probek' },
  { id: 'orders',  label: 'Rejestr zleceń',   to: '/sprzedaz/rejestr-zlecen' },
  { id: 'tasks',   label: 'Zadania',          to: '/zadania' },
  { id: 'docs',    label: 'Dokumenty',        to: '/administracja/dokumenty' },
  { id: 'msgs',    label: 'Wiadomości',       to: '/wiadomosci' },
  { id: 'notifs',  label: 'Powiadomienia',    to: '/powiadomienia/wszystkie' },
  { id: 'board',   label: 'Tablica',          to: '/tablica' },
  { id: 'clients', label: 'Klienci',          to: '/sprzedaz/klienci' },
])

function QuickAccess({ manage = false, alwaysOpenAdd = false }) {
  const navigate = useNavigate()

  const {
    shortcuts,
    addShortcut: addRawShortcut,
    removeShortcut,
    moveShortcut,
  } = useShortcuts(DEFAULT_SHORTCUTS)

  const {
    railRef,
    canLeft,
    canRight,
    scrollLeft,
    scrollRight,
    bumpRightAfterAdd,
  } = useCarousel()

  const [isAddOpen, setAddOpen] = useState(alwaysOpenAdd)

  useEffect(() => {
    if (alwaysOpenAdd) setAddOpen(true)
  }, [alwaysOpenAdd])

  const onNavigate = useCallback((to) => navigate(to), [navigate])

  const addShortcut = useCallback((item) => {
    addRawShortcut(item)
    bumpRightAfterAdd()
    if (!alwaysOpenAdd) {
      setAddOpen(false)
    }
  }, [addRawShortcut, bumpRightAfterAdd, alwaysOpenAdd])

  const suggestedLeft = useMemo(
    () => SUGGESTIONS.filter(s => !shortcuts.some(x => x.to === s.to)),
    [shortcuts]
  )

  return (
    <div className='quick-access-panel'>
      <Header title='SKRÓTY' />

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
                {suggestedLeft.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className="btn qa-suggestion"
                    title={`Dodaj: ${s.label}`}
                    aria-label={`Dodaj skrót: ${s.label}`}
                    onClick={() => addShortcut(s)}
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
              if (alwaysOpenAdd) {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              } else {
                setAddOpen(false)
              }
            }}
            onSubmit={({ title, url }) => {
              addShortcut({ label: title, to: url })
            }}
            containerClassName="qa-add-form-inline"
            data-testid="qa-add-form"
            cancelLabel={alwaysOpenAdd ? 'Odśwież' : 'Anuluj'}
            wrapInPanel={alwaysOpenAdd}  
          />
        </div>
      </InlineExpand>
    </div>
  )
}

export default QuickAccess

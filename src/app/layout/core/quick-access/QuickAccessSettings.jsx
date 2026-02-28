import React, { useCallback, useEffect, useMemo, useState } from 'react'
import QuickAccess from './QuickAccess'
import './styles/quick-access-settings.css'

const STORAGE_KEY = 'qa.shortcuts'
const STORAGE_VERSION = 1

function loadShortcuts(fallback = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed && parsed.v === STORAGE_VERSION && Array.isArray(parsed.items)) return parsed.items
    return fallback
  } catch {
    return fallback
  }
}

function saveShortcuts(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, items }))
  } catch {
    /* ignore */
  }
}

export default function QuickAccessSettings() {
  const [draft, setDraft] = useState(() => loadShortcuts([]))
  const [savedAt, setSavedAt] = useState(null)

  // jeśli zmieni się localStorage w innej karcie/komponencie – zaktualizuj draft
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      setDraft(loadShortcuts([]))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

const handleSave = useCallback(() => {
  saveShortcuts(draft)

  // (opcjonalnie – raczej zbędne przy reloadzie, ale nie szkodzi)
  setSavedAt(Date.now())

  // ✅ pełne odświeżenie strony
  window.location.reload()
}, [draft])


  const subtitle = useMemo(
    () =>
      'Dodawaj, usuwaj i ustawiaj kolejność kafelków widocznych na stronie głównej. Zmiany zapiszesz przyciskiem „Zapisz”.',
    []
  )

  return (
    <div className="qa-settings-page">
      <div className="qa-settings-header">
        <p className="qa-settings-subtitle">{subtitle}</p>

        <div className="qa-settings-actions">
          <button type="button" className="qa-settings-save" onClick={handleSave}>
            Zapisz
          </button>

          {savedAt && (
            <span className="qa-settings-saved-hint" aria-live="polite">
              Zapisano
            </span>
          )}
        </div>
      </div>

      <div className="qa-settings-card">
        <QuickAccess
          manage
          alwaysOpenAdd={false}   /* ✅ dodawanie jak w pasku skrótów */
          autoSave={false}        /* ✅ w ustawieniach nie zapisujemy automatycznie */
          value={draft}           /* ✅ draft */
          onChange={setDraft}     /* ✅ aktualizacja draft */
        />
      </div>
    </div>
  )
}

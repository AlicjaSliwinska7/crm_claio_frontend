import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * useOpenSection — lewy sidebar (accordion)
 *
 * Wymagania:
 * - domyślnie WSZYSTKO zwinięte (nawet jeśli URL jest "w środku")
 * - rozwija się dopiero po kliknięciu
 * - rozwinięcie jednej sekcji zwija pozostałe (single-open accordion)
 * - aktywność rodzica (activeParents) liczymy TYLKO do stylu (np. klasa "active"),
 *   ale NIE wpływa to na otwieranie submenu
 */
export default function useOpenSection(
  sections = [],
  { storageKey = 'bars.sidebar.open' } = {}
) {
  const { pathname } = useLocation()
  const storage = typeof window !== 'undefined' ? window.sessionStorage : null

  // ✅ default: nic nieotwarte
  const [open, setOpen] = useState(() => {
    try {
      return storage?.getItem(storageKey) || ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      storage?.setItem(storageKey, open)
    } catch {}
  }, [open, storageKey, storage])

  // ✅ aktywni rodzice TYLKO do stylu (nie do otwierania)
  const activeParents = useMemo(() => {
    const set = new Set()

    const walk = (arr, parentId = null) => {
      for (const x of arr || []) {
        const href = x.to || x.href || x.base
        if (href && pathname.startsWith(href)) {
          if (parentId) set.add(parentId)
        }

        if (x.items?.length) {
          walk(x.items, x.id || parentId)
        }
      }
    }

    const normalized = (sections || []).map((s) => ({ ...s, items: s.items || [] }))
    walk(normalized, null)

    // dodatkowo: jeśli sekcja ma base i pasuje, to też rodzic aktywny
    for (const s of normalized) {
      if (s.base && pathname.startsWith(s.base)) set.add(s.id)
      for (const it of s.items || []) {
        const href = it.to || it.href
        if (href && pathname.startsWith(href)) {
          set.add(s.id)
          break
        }
      }
    }

    return set
  }, [pathname, sections])

  // ✅ SSOT: otwarte jest tylko to, co user kliknął
  const isOpen = useCallback((id) => open === id, [open])

  // ✅ single-open accordion
  const toggle = useCallback((id) => {
    setOpen((prev) => (prev === id ? '' : id))
  }, [])

  return { open, isOpen, toggle, activeParents }
}


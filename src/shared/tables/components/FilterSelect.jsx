// src/shared/tables/components/FilterSelect.jsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

/**
 * FilterSelect (CUSTOM / headless)
 * Spójny dropdown do pasków filtrów (ListToolbar).
 * - Zachowuje wrappery: .rg-field / .rg-label / .rg-input
 * - Własna lista opcji (pełne stylowanie)
 * - Wyszukiwanie w opcjach
 * - Zamyka się po wyborze
 * - Kompatybilny z dotychczasowym użyciem: onChange(e) i e.target.value
 *
 * Ikony:
 * - Font Awesome Free: używamy fa-solid chevron-down/up.
 * - Stary "chevron" był rysowany przez CSS na .rg-select__chev — usunięty z JSX.
 */
function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  className,
  id,
  name,
  title,
  ariaLabel,
  includeAll = false,
  allValue = 'all',
  allLabel = 'Wszystkie',
  disabled = false,
}) {
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const normalizedOptions = useMemo(() => {
    const base = Array.isArray(options) ? options : []
    const mapped = base.map((opt) => {
      if (typeof opt === 'string') {
        return { key: opt, value: opt, label: opt, searchText: String(opt).toLowerCase() }
      }
      const v = opt?.value ?? opt?.key
      const lbl = opt?.label ?? opt?.text ?? opt?.value ?? opt?.key
      const labelText =
        typeof lbl === 'string' || typeof lbl === 'number'
          ? String(lbl)
          : String(opt?.text ?? opt?.value ?? opt?.key ?? '')
      return {
        key: v ?? labelText,
        value: v,
        label: lbl,
        searchText: String(labelText).toLowerCase(),
      }
    })

    const withAll = includeAll
      ? [
          {
            key: `__all__${String(allValue)}`,
            value: allValue,
            label: allLabel,
            searchText: String(allLabel).toLowerCase(),
          },
          ...mapped,
        ]
      : mapped

    // filtrujemy null/undefined value (dla bezpieczeństwa)
    return withAll.filter((x) => x && x.value !== undefined && x.value !== null)
  }, [options, includeAll, allValue, allLabel])

  const selected = useMemo(
    () => normalizedOptions.find((o) => String(o.value) === String(value)),
    [normalizedOptions, value]
  )

  const filteredOptions = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase()
    if (!qq) return normalizedOptions
    return normalizedOptions.filter((o) => o.searchText.includes(qq))
  }, [normalizedOptions, q])

  const emitChange = useCallback(
    (nextVal) => {
      // kompatybilność z dotychczasowym: onChange(e) i e.target.value
      const syntheticEvent = {
        target: {
          value: nextVal,
          name,
          id,
        },
      }
      onChange?.(syntheticEvent)
    },
    [onChange, name, id]
  )

  const close = useCallback(() => {
    setOpen(false)
    setQ('')
    setActiveIndex(-1)
  }, [])

  const openDropdown = useCallback(() => {
    if (disabled) return
    setOpen(true)
    // aktywny indeks: aktualnie zaznaczony (albo pierwszy)
    const idx = filteredOptions.findIndex((o) => String(o.value) === String(value))
    setActiveIndex(idx >= 0 ? idx : 0)
  }, [disabled, filteredOptions, value])

  const toggle = useCallback(() => {
    if (disabled) return
    setOpen((v) => !v)
  }, [disabled])

  // focus search po otwarciu
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      searchRef.current?.focus?.()
      // scroll do zaznaczonego
      const idx = filteredOptions.findIndex((o) => String(o.value) === String(value))
      if (idx >= 0) {
        const el = listRef.current?.querySelector?.(`[data-opt-index="${idx}"]`)
        el?.scrollIntoView?.({ block: 'nearest' })
        setActiveIndex(idx)
      } else {
        setActiveIndex(filteredOptions.length ? 0 : -1)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [open, filteredOptions, value])

  // click outside
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [open, close])

  // ESC / arrows / enter
  const onKeyDownTrigger = useCallback(
    (e) => {
      if (disabled) return
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!open) openDropdown()
      }
    },
    [disabled, open, openDropdown]
  )

  const onKeyDownSearch = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => {
          const next = Math.min((i < 0 ? 0 : i) + 1, filteredOptions.length - 1)
          const el = listRef.current?.querySelector?.(`[data-opt-index="${next}"]`)
          el?.scrollIntoView?.({ block: 'nearest' })
          return next
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => {
          const next = Math.max((i < 0 ? 0 : i) - 1, 0)
          const el = listRef.current?.querySelector?.(`[data-opt-index="${next}"]`)
          el?.scrollIntoView?.({ block: 'nearest' })
          return next
        })
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          const opt = filteredOptions[activeIndex]
          emitChange(opt.value)
          close()
        }
      }
    },
    [activeIndex, filteredOptions, emitChange, close]
  )

  const onPick = useCallback(
    (opt) => {
      emitChange(opt.value)
      close()
    },
    [emitChange, close]
  )

  // gdy filtr zmieni listę (q) — reset activeIndex
  useEffect(() => {
    if (!open) return
    if (!filteredOptions.length) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex((i) => {
      const bounded = Math.max(0, Math.min(i < 0 ? 0 : i, filteredOptions.length - 1))
      return bounded
    })
  }, [q, filteredOptions.length, open])

  const shownLabel = selected ? selected.label : value ?? ''

  return (
    <label ref={rootRef} className={`rg-field ${className || ''}`.trim()}>
      {label && <span className="rg-label">{label}</span>}

      <div className={`rg-selectbox ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`.trim()}>
        <button
          type="button"
          id={id}
          name={name}
          className="rg-input rg-select rg-select__trigger"
          onClick={toggle}
          onKeyDown={onKeyDownTrigger}
          title={title || label}
          aria-label={ariaLabel || label}
          aria-haspopup="listbox"
          aria-expanded={open ? 'true' : 'false'}
          disabled={disabled}
        >
          <span className={`rg-select__value ${shownLabel ? '' : 'is-placeholder'}`.trim()}>
            {shownLabel || '—'}
          </span>

          {/* ✅ Font Awesome Free (SOLID) — down przed rozwinięciem, up po rozwinięciu */}
          <span className="rg-select__faChev" aria-hidden="true">
            {open ? (
              <i className="fa-solid fa-chevron-up" />
            ) : (
              <i className="fa-solid fa-chevron-down" />
            )}
          </span>
        </button>

        {open && (
          <div className="rg-select__popover" role="listbox" aria-label={ariaLabel || label || 'Wybierz'}>
            <div className="rg-select__search">
              <input
                ref={searchRef}
                className="rg-select__searchInput"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDownSearch}
                placeholder="Szukaj..."
                aria-label="Szukaj w opcjach"
              />
            </div>

            <div ref={listRef} className="rg-select__list">
              {filteredOptions.length === 0 ? (
                <div className="rg-select__empty">Brak wyników</div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value)
                  const isActive = idx === activeIndex
                  return (
                    <button
                      key={opt.key ?? `${opt.value}-${idx}`}
                      type="button"
                      className={`rg-select__option ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`.trim()}
                      onClick={() => onPick(opt)}
                      data-opt-index={idx}
                      role="option"
                      aria-selected={isSelected ? 'true' : 'false'}
                    >
                      <span className="rg-select__optionLabel">{opt.label}</span>
                      {isSelected && (
                        <span className="rg-select__check" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </label>
  )
}

FilterSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.node,
        text: PropTypes.node,
      }),
    ])
  ),
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  includeAll: PropTypes.bool,
  allValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allLabel: PropTypes.node,
  disabled: PropTypes.bool,
}

export default memo(FilterSelect)
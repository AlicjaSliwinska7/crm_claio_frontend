// src/components/pages/contents/DeptSuggest.jsx
import React, { useEffect, useMemo, useRef, useState, useId } from 'react';

/**
 * DeptSuggest — lekki combobox (lista podpowiedzi) pod pole "Dział".
 * - Sterowany: value/onChange.
 * - Filtrowanie case-insensitive + bez ogonków.
 * - Strzałki ↑/↓, Enter, Escape; przewijanie aktywnej opcji do widoku.
 * - Zachowuje focus w inpucie (lepszy UX w modalu).
 * - ARIA: role="combobox" + role="listbox"/"option".
 *
 * Props:
 *  - value: string
 *  - onChange: (val: string) => void
 *  - options: string[] — pełna lista działów
 *  - placeholder: string
 *  - maxItems: number — ile pozycji maks. w dropdownie (default 50)
 */
export default function DeptSuggest({
  value = '',
  onChange,
  options = [],
  placeholder = 'Dział',
  maxItems = 50,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [active, setActive] = useState(0);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const activeRef = useRef(null);

  const uid = useId();
  const listboxId = `dept-suggest-listbox-${uid}`;

  // Gdy value z zewnątrz się zmienia, zsynchronizuj query
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Normalizacja do porównań (bez ogonków, lowercase)
  const norm = (s) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      // \p{Diacritic} bywa niewspierane w bardzo starych silnikach — fallback:
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[\u0300-\u036f]/g, '');

  const list = useMemo(() => {
    const q = norm(query).trim();
    const uniq = Array.from(new Set(options.filter(Boolean).map(String)));
    const out = q
      ? uniq.filter((x) => norm(x).includes(q))
      : uniq;
    return out.slice(0, Math.max(1, maxItems));
  }, [options, query, maxItems]);

  // Zamykaj kliknięciem poza komponentem
  useEffect(() => {
    const onDocDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  // Po zmianie aktywnej opcji przewiń ją do widoku
  useEffect(() => {
    if (!open) return;
    const el = activeRef.current;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [active, open]);

  const commit = (val) => {
    onChange?.(val);
    setQuery(val);
    setOpen(false);
    setActive(0);

    // Przyjemny UX: zostaw focus na polu
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, list.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = list[active];
      if (pick != null) commit(pick);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="dept-suggest" ref={wrapRef}>
      <input
        ref={inputRef}
        className="dept-suggest-input"
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && list.length > 0 ? `${listboxId}-opt-${active}` : undefined
        }
      />

      {open && list.length > 0 && (
        <ul
          id={listboxId}
          className="dept-suggest-menu"
          role="listbox"
          ref={listRef}
        >
          {list.map((opt, i) => {
            const s = String(opt);
            const nq = norm(query);
            const ns = norm(s);
            const idx = nq ? ns.indexOf(nq) : -1;

            // Wylicz przed/środek/po do podświetlenia trafienia
            const before = idx >= 0 ? s.slice(0, idx) : s;
            const hit = idx >= 0 ? s.slice(idx, idx + (query || '').length) : '';
            const after = idx >= 0 ? s.slice(idx + (query || '').length) : '';

            const isActive = i === active;

            return (
              <li
                key={`${s}-${i}`}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={isActive}
                className={`dept-suggest-item ${isActive ? 'is-active' : ''}`}
                ref={isActive ? activeRef : null}
                // mousedown żeby klik nie zabrał focusu z inputa (i nie zamknął za wcześnie)
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(s)}
                onMouseEnter={() => setActive(i)}
              >
                {idx >= 0 ? (
                  <>
                    {before}
                    <span className="dept-suggest-hl">{hit}</span>
                    {after}
                  </>
                ) : (
                  s
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// src/features/administration/components/LabSchedule/ScheduleGridSelect.jsx
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import GridCellSelect from './GridCellSelect';

export default function ScheduleGridSelect({
  employees,
  daysInMonth,
  schedule,
  isHoliday,
  isInSelectionRange,      // zewnętrzne podświetlanie (opcjonalne) – nasze wewnętrzne ma priorytet
  onToggleHoliday,
  onCellClick,
  onChange,                // (name, dateKey, value) – zapisz zmianę pojedynczej komórki
  initialActive,
  skipHolidaysInNav = false,
}) {
  const dateKeys = useMemo(
    () => daysInMonth.map((d) => format(d, 'yyyy-MM-dd')),
    [daysInMonth]
  );

  // mapy indeksów
  const nameToRow = useMemo(() => new Map(employees.map((n, i) => [n, i])), [employees]);
  const dateToCol = useMemo(() => new Map(dateKeys.map((d, i) => [d, i])), [dateKeys]);

  // aktywna komórka
  const [active, setActive] = useState(() => {
    if (initialActive?.name && initialActive?.dateKey) return initialActive;
    return employees.length && dateKeys.length
      ? { name: employees[0], dateKey: dateKeys[0] }
      : null;
  });

  // anchor – stały narożnik zakresu (punkt zaczepienia dla Shift)
  const [anchor, setAnchor] = useState(null); // { name, dateKey } lub null

  // zakres prostokątny
  const [rect, setRect] = useState(null);     // { r1,c1,r2,c2 } lub null

  // refs/fokus – KLUCZ: fokus i nasłuch na TABLE, nie na wrapperze
  const tableRef = useRef(null);
  const focusTable = useCallback(() => {
    const el = tableRef.current;
    if (el && document.activeElement !== el) el.focus({ preventScroll: true });
  }, []);

  useEffect(() => { focusTable(); }, [focusTable]);

  // Po zmianie danych – upewnij się, że active/anchor istnieją, skoryguj zakres
  useEffect(() => {
    setActive(prev => {
      if (prev && nameToRow.has(prev.name) && dateToCol.has(prev.dateKey)) return prev;
      return employees.length && dateKeys.length ? { name: employees[0], dateKey: dateKeys[0] } : null;
    });
    setAnchor(prev => (prev && nameToRow.has(prev.name) && dateToCol.has(prev.dateKey)) ? prev : null);
    setRect(prev => {
      if (!prev) return null;
      const maxR = employees.length - 1;
      const maxC = dateKeys.length - 1;
      const r1 = Math.max(0, Math.min(prev.r1, maxR));
      const r2 = Math.max(0, Math.min(prev.r2, maxR));
      const c1 = Math.max(0, Math.min(prev.c1, maxC));
      const c2 = Math.max(0, Math.min(prev.c2, maxC));
      if (r1 > r2 || c1 > c2) return null;
      return { r1, r2, c1, c2 };
    });
    const id = requestAnimationFrame(focusTable);
    return () => cancelAnimationFrame(id);
  }, [employees, dateKeys, nameToRow, dateToCol, focusTable]);

  // helpery
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const nextIndex = (idx, delta, max) => clamp(idx + delta, 0, max);

  const isColDisabled = useCallback((colIdx) => {
    if (!skipHolidaysInNav) return false;
    const d = daysInMonth[colIdx];
    return !!isHoliday?.(d);
  }, [daysInMonth, isHoliday, skipHolidaysInNav]);

  const findNextCol = useCallback((currentCol, delta) => {
    let tries = 0;
    let col = currentCol;
    const max = dateKeys.length - 1;
    while (tries <= dateKeys.length) {
      col = nextIndex(col, delta, max);
      if (!isColDisabled(col)) return col;
      tries += 1;
      if (col === 0 || col === max) break; // brak wrapu
    }
    return currentCol;
  }, [dateKeys.length, isColDisabled]);

  const cellToRC = useCallback((cell) => {
    if (!cell) return [null, null];
    return [nameToRow.get(cell.name), dateToCol.get(cell.dateKey)];
  }, [nameToRow, dateToCol]);

  const rcToCell = useCallback((r, c) => {
    const name = employees[r];
    const dateKey = dateKeys[c];
    return { name, dateKey };
  }, [employees, dateKeys]);

  const ensureActive = useCallback((fallbackDir) => {
    if (active && nameToRow.has(active.name) && dateToCol.has(active.dateKey)) return active;

    if (employees.length && dateKeys.length) {
      const base = { name: employees[0], dateKey: dateKeys[0] };
      setActive(base);
      if (fallbackDir) {
        const r = 0, c = 0;
        let nr = r, nc = c;
        if (fallbackDir === 'down') nr = Math.min(employees.length - 1, r + 1);
        if (fallbackDir === 'right') nc = findNextCol(c, +1);
        requestAnimationFrame(() => setActive({ name: employees[nr], dateKey: dateKeys[nc] }));
      }
      requestAnimationFrame(focusTable);
      return base;
    }
    return null;
  }, [active, employees, dateKeys, nameToRow, dateToCol, findNextCol, focusTable]);

  // ustawienie aktywnej + opcjonalne zarządzanie anchor/rect
  const setActiveAndMaybeRect = useCallback((next, withShift) => {
    setActive(next);
    if (withShift) {
      setAnchor(prev => prev ?? next); // jeśli nie było anchor – ustaw
      setRect(prevRect => {
        const [ar, ac] = cellToRC(anchor ?? next);
        const [nr, nc] = cellToRC(next);
        if (ar == null || ac == null || nr == null || nc == null) return null;
        return { r1: Math.min(ar, nr), r2: Math.max(ar, nr), c1: Math.min(ac, nc), c2: Math.max(ac, nc) };
      });
    } else {
      setAnchor(null);
      setRect(null);
    }
  }, [anchor, cellToRC]);

  // ruch aktywnej lub rozszerzanie zakresu
  const moveActive = useCallback((dir, withShift = false) => {
    const a = ensureActive(dir);
    if (!a) return;
    const r = nameToRow.get(a.name);
    const c = dateToCol.get(a.dateKey);
    if (r == null || c == null) return;

    const rMax = employees.length - 1;
    let nr = r, nc = c;
    if (dir === 'up') nr = nextIndex(r, -1, rMax);
    if (dir === 'down') nr = nextIndex(r, +1, rMax);
    if (dir === 'left') nc = findNextCol(c, -1);
    if (dir === 'right') nc = findNextCol(c, +1);

    setActiveAndMaybeRect(rcToCell(nr, nc), withShift);
    requestAnimationFrame(focusTable);
  }, [ensureActive, nameToRow, dateToCol, employees.length, findNextCol, rcToCell, setActiveAndMaybeRect, focusTable]);

  // zaznaczanie myszą: klik/shift+klik
  const handleCellClick = useCallback((name, dateKey, evt) => {
    const next = { name, dateKey };
    const withShift = !!evt?.shiftKey;
    setActiveAndMaybeRect(next, withShift);
    onCellClick?.(name, dateKey, evt);
    requestAnimationFrame(focusTable);
  }, [setActiveAndMaybeRect, onCellClick, focusTable]);

  // --- COPY / PASTE jako TSV ---
  const getSelectionRect = useCallback(() => {
    if (rect) return rect;
    const [r, c] = cellToRC(active);
    if (r == null || c == null) return null;
    return { r1: r, r2: r, c1: c, c2: c };
  }, [rect, active, cellToRC]);

  const readValue = useCallback((r, c) => {
    const { name, dateKey } = rcToCell(r, c);
    return (schedule[name]?.[dateKey] ?? '').toString();
  }, [schedule, rcToCell]);

  const writeValue = useCallback((r, c, val) => {
    const { name, dateKey } = rcToCell(r, c);
    onChange?.(name, dateKey, val);
  }, [rcToCell, onChange]);

  const serializeSelectionToTSV = useCallback(() => {
    const R = getSelectionRect();
    if (!R) return '';
    const rows = [];
    for (let r = R.r1; r <= R.r2; r++) {
      const line = [];
      for (let c = R.c1; c <= R.c2; c++) {
        line.push(readValue(r, c));
      }
      rows.push(line.join('\t'));
    }
    return rows.join('\n');
  }, [getSelectionRect, readValue]);

  const parseTSV = (text) => {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    return lines.map(line => line.split('\t'));
  };

  const copySelection = useCallback(async () => {
    const tsv = serializeSelectionToTSV();
    if (!tsv) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tsv);
      } else {
        // fallback (synchroniczny)
        const ta = document.createElement('textarea');
        ta.value = tsv;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      // ignoruj – brak uprawnień itp.
    }
  }, [serializeSelectionToTSV]);

  const pasteFromText = useCallback((text) => {
    if (!text) return;
    const a = ensureActive(); // start od aktywnej
    if (!a) return;

    const [sr, sc] = cellToRC(a);
    if (sr == null || sc == null) return;

    const grid = parseTSV(text);
    const maxR = employees.length - 1;
    const maxC = dateKeys.length - 1;

    let lastR = sr, lastC = sc;

    for (let i = 0; i < grid.length; i++) {
      const r = clamp(sr + i, 0, maxR);
      for (let j = 0; j < grid[i].length; j++) {
        let c = clamp(sc + j, 0, maxC);
        // Jeżeli chcesz omijać święta przy wklejaniu – odkomentuj:
        // while (skipHolidaysInNav && isColDisabled(c) && c < maxC) c++;
        const valRaw = (grid[i][j] ?? '').trim();
        const val = valRaw.toLowerCase();
        // akceptujemy: '', '1','2','3','u','l'
        if (val === '' || ['1','2','3','u','l'].includes(val)) {
          writeValue(r, c, val);
          lastR = r; lastC = c;
        }
      }
    }

    // ustaw aktywną na ostatniej wklejonej komórce i wyczyść zakres
    const next = rcToCell(lastR, lastC);
    setActive(next);
    setAnchor(null);
    setRect(null);
    requestAnimationFrame(focusTable);
  }, [ensureActive, cellToRC, employees.length, dateKeys.length, writeValue, rcToCell, focusTable /*, skipHolidaysInNav, isColDisabled */]);

  // Obsługa klawiatury (nawigacja + Copy/Paste)
  const handleKeyDown = useCallback(async (e) => {
    const k = e.key;

    // wycisz dalej
    e.stopPropagation();

    // COPY (Ctrl/Cmd + C)
    if ((e.ctrlKey || e.metaKey) && (k === 'c' || k === 'C')) {
      e.preventDefault();
      await copySelection();
      return;
    }

    // PASTE (Ctrl/Cmd + V)
    if ((e.ctrlKey || e.metaKey) && (k === 'v' || k === 'V')) {
      e.preventDefault();
      // preferuj Clipboard API
      try {
        const text = await navigator.clipboard.readText();
        pasteFromText(text);
      } catch {
        // brak Clipboard API – nic nie zrobimy tutaj (zwykłe onPaste zadziała, jeśli będzie)
      }
      return;
    }

    // Nawigacja
    if (k.startsWith('Arrow')) {
      e.preventDefault();
      const dir = k.replace('Arrow', '').toLowerCase(); // 'up'|'down'|'left'|'right'
      moveActive(dir, e.shiftKey);
      return;
    }

    // Wpisywanie pojedynczej wartości (tylko aktywna komórka)
    const ACCEPT = new Set(['1', '2', '3', 'u', 'U', 'l', 'L']);
    if (ACCEPT.has(k)) {
      e.preventDefault();
      const a = ensureActive('right');
      if (!a) return;

      // jeśli jest zakres – wypełnij cały zakres
      const R = getSelectionRect();
      if (R) {
        const val = k.toLowerCase();
        for (let r = R.r1; r <= R.r2; r++) {
          for (let c = R.c1; c <= R.c2; c++) {
            // tu ewentualnie omijanie świąt w zapisie (zostawiłem domyślnie: zapisuj wszędzie)
            writeValue(r, c, val);
          }
        }
        // po wypełnieniu – przesuń w prawo tylko aktywną
        moveActive('right', false);
      } else {
        onChange?.(a.name, a.dateKey, k.toLowerCase());
        moveActive('right', false);
      }
      return;
    }

    // Kasowanie – czyść zakres lub pojedynczą
    if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      const R = getSelectionRect();
      if (R) {
        for (let r = R.r1; r <= R.r2; r++) {
          for (let c = R.c1; c <= R.c2; c++) writeValue(r, c, '');
        }
      } else {
        const a = ensureActive();
        if (a) onChange?.(a.name, a.dateKey, '');
      }
      return;
    }

    // Home/End – skok w wierszu (z zachowaniem/bez zachowania zakresu)
    if (k === 'Home' || k === 'End') {
      e.preventDefault();
      const a = ensureActive();
      if (!a) return;
      const [r] = cellToRC(a);
      const nc = (k === 'Home') ? 0 : dateKeys.length - 1;
      setActiveAndMaybeRect(rcToCell(r, nc), e.shiftKey);
      requestAnimationFrame(focusTable);
      return;
    }

    // PageUp/PageDown – skok o tydzień
    if (k === 'PageUp' || k === 'PageDown') {
      e.preventDefault();
      const a = ensureActive();
      if (!a) return;
      const [r, c] = cellToRC(a);
      const delta = (k === 'PageUp') ? -7 : +7;
      const nc = clamp(c + delta, 0, dateKeys.length - 1);
      setActiveAndMaybeRect(rcToCell(r, nc), e.shiftKey);
      requestAnimationFrame(focusTable);
      return;
    }

    // Esc – wyczyść zaznaczenie
    if (k === 'Escape') {
      setAnchor(null);
      setRect(null);
      return;
    }
  }, [
    moveActive, ensureActive, onChange, writeValue, getSelectionRect,
    cellToRC, dateKeys.length, rcToCell, setActiveAndMaybeRect,
    focusTable, copySelection, pasteFromText
  ]);

  // Fallback “paste” z eventu (np. gdy brak Clipboard API / meta+V)
  const handlePasteCapture = useCallback((e) => {
    if (!e.clipboardData) return;
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      e.preventDefault();
      pasteFromText(text);
    }
  }, [pasteFromText]);

  // a11y: aria-activedescendant (opcjonalnie)
  const activeId = active
    ? `cell-${nameToRow.get(active.name)}-${dateToCol.get(active.dateKey)}`
    : undefined;

  // Czy dana komórka jest w naszym (wewnętrznym) zaznaczeniu?
  const isSelectedInternal = useCallback((name, dateKey) => {
    if (!rect) return false;
    const r = nameToRow.get(name);
    const c = dateToCol.get(dateKey);
    if (r == null || c == null) return false;
    return r >= rect.r1 && r <= rect.r2 && c >= rect.c1 && c <= rect.c2;
  }, [rect, nameToRow, dateToCol]);

  return (
    <div className="schedule-grid-wrapper">
      <table
        ref={tableRef}
        className="schedule-table"
        role="grid"
        aria-label="Grafik pracy (wybór komórek bez kursora)"
        aria-activedescendant={activeId}
        tabIndex={0}
        onKeyDownCapture={handleKeyDown}
        onPasteCapture={handlePasteCapture}
      >
        <thead>
          <tr role="row">
            <th role="columnheader">Pracownik</th>
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              return (
                <th
                  role="columnheader"
                  key={dateStr}
                  className={isHoliday?.(day) ? 'holiday-column' : ''}
                  title={format(day, 'EEEE')}
                  onClick={() => onToggleHoliday?.(dateStr)}
                >
                  {format(day, 'dd')}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {employees.map((name) => (
            <tr role="row" key={name}>
              <td
                role="rowheader"
                className="employee-name"
                title="Kliknij, aby wybrać pierwszy dzień w wierszu"
                onClick={(e) => handleCellClick(name, dateKeys[0], e)}
              >
                {name}
              </td>

              {daysInMonth.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const value = schedule[name]?.[dateKey] ?? '';
                const holiday = isHoliday?.(day);

                // priorytet: nasze (wewnętrzne) zaznaczenie; jeśli go nie ma, użyj zewnętrznego
                const selectedByInternal = isSelectedInternal(name, dateKey);
                const selectedByExternal = isInSelectionRange?.(name, dateKey);
                const isSelected = selectedByInternal || (!!selectedByExternal && !rect);

                const isActiveCell =
                  active?.name === name && active?.dateKey === dateKey;

                return (
                  <GridCellSelect
                    key={`${name}__${dateKey}`}
                    name={name}
                    dateKey={dateKey}
                    value={value}
                    holiday={holiday}
                    isSelected={!!isSelected}
                    isActive={!!isActiveCell}
                    onClick={handleCellClick}
                    {...(isActiveCell ? { id: activeId } : {})}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// src/shared/schedules/grid/keyboardNav.js

/**
 * Buduje mapy indeksów do szybkiego odnajdywania pozycji w siatce.
 * @param {string[]} employees
 * @param {string[]} dateKeys
 * @returns {{nameToRow: Map<string, number>, dateToCol: Map<string, number>}}
 */
export function buildIndexMaps(employees, dateKeys) {
  return {
    nameToRow: new Map(employees.map((n, i) => [n, i])),
    dateToCol: new Map(dateKeys.map((d, i) => [d, i])),
  };
}

/**
 * Ustawia fokus na docelowej komórce i delikatnie przewija widok.
 * - w edycji celujemy w .cell-input
 * - w readOnly celujemy w <td>
 * @param {string} name
 * @param {string} dateKey
 * @param {{readOnly?: boolean, inputSelector?: string, cellSelector?: string}} opts
 */
export function focusCell(name, dateKey, opts = {}) {
  const {
    readOnly = false,
    inputSelector = '.cell-input',
    cellSelector = 'td',
  } = opts;

  // Proste i bezpieczne "escape" dla atrybutów selektora
  const esc = (s) =>
    (typeof CSS !== 'undefined' && CSS.escape)
      ? CSS.escape(String(s))
      : String(s).replace(/["\\]/g, '\\$&');

  const inputSel = `${inputSelector}[data-name="${esc(name)}"][data-date="${esc(dateKey)}"]`;
  const tdSel    = `${cellSelector}[data-name="${esc(name)}"][data-date="${esc(dateKey)}"]`;

  // 1) Preferuj input w trybie edycji; 2) w readOnly – <td>; 3) fallback: input w <td>
  let el = readOnly ? document.querySelector(tdSel) : document.querySelector(inputSel);
  if (!el && !readOnly) {
    const td = document.querySelector(tdSel);
    if (td) el = td.querySelector('input, [tabindex]');
  }

  if (el) {
    // Fokus bez skakania viewportem
    if (typeof el.focus === 'function') {
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }
    // Łagodne przewinięcie do widoku (najbliżej jak się da)
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}

/**
 * Fabryka handlera strzałek dla grida (działa i z inputami, i w readOnly).
 *
 * @param {Object} cfg
 * @param {string[]} cfg.employees
 * @param {string[]} cfg.dateKeys
 * @param {boolean}  [cfg.readOnly=false]
 * @param {boolean}  [cfg.wrap=false]     - zawijanie na brzegach
 * @param {(colIdx:number)=>boolean} [cfg.isColDisabled] - np. pomiń święta/wyłączone kolumny
 * @param {(name:string, dateKey:string)=>void} [cfg.onMove] - callback po przeskoku
 * @param {string}   [cfg.inputSelector='.cell-input']
 * @param {string}   [cfg.cellSelector='td']
 *
 * @returns {(e:KeyboardEvent, name:string, dateKey:string)=>void}
 */
export function makeGridKeyHandler(cfg) {
  const {
    employees,
    dateKeys,
    readOnly = false,
    wrap = false,
    isColDisabled,
    onMove,
    inputSelector = '.cell-input',
    cellSelector = 'td',
  } = cfg;

  const { nameToRow, dateToCol } = buildIndexMaps(employees, dateKeys);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const nextIndex = (idx, delta, max, wrapFlag) => {
    if (wrapFlag) {
      const m = max + 1;
      // bezpieczne modulo, również dla ujemnych
      return ((idx + delta) % m + m) % m;
    }
    return clamp(idx + delta, 0, max);
  };

  const findNextCol = (currentCol, delta, colMax, wrapFlag) => {
    let tries = 0;
    let col = currentCol;

    while (tries <= colMax + 1) {
      col = nextIndex(col, delta, colMax, wrapFlag);
      if (!isColDisabled || !isColDisabled(col)) return col;
      tries += 1;
      if (!wrapFlag && (col === 0 || col === colMax)) break;
    }
    return currentCol;
  };

  return (e, name, dateKey) => {
    const k = e.key;
    if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'ArrowLeft' && k !== 'ArrowRight') return;

    // Zablokuj zachowanie inputa oraz globalne skróty, które mogłyby kolidować
    e.preventDefault();
    e.stopPropagation();

    const r = nameToRow.get(name);
    const c = dateToCol.get(dateKey);
    if (r == null || c == null) return;

    const rowMax = employees.length - 1;
    const colMax = dateKeys.length - 1;

    let nr = r;
    let nc = c;

    if (k === 'ArrowUp')    nr = nextIndex(r, -1, rowMax, wrap);
    if (k === 'ArrowDown')  nr = nextIndex(r, +1, rowMax, wrap);
    if (k === 'ArrowLeft')  nc = findNextCol(c, -1, colMax, wrap);
    if (k === 'ArrowRight') nc = findNextCol(c, +1, colMax, wrap);

    const nextName = employees[nr];
    const nextDate = dateKeys[nc];

    focusCell(nextName, nextDate, { readOnly, inputSelector, cellSelector });
    if (typeof onMove === 'function') onMove(nextName, nextDate);
  };
}

// (opcjonalnie) eksport domyślny dla wygody importu
export default {
  buildIndexMaps,
  focusCell,
  makeGridKeyHandler,
};

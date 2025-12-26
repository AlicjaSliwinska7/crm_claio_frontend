// Proste utils do kopiowania/wklejania siatki (Excel/Sheets friendly)

/** Parsuje tekst z CSV/TSV do macierzy stringów */
export function parseClipboardGrid(text) {
  if (!text) return [[]];
  // Zamień \r\n na \n, rozbij wiersze
  const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  // Wykryj separator: tab lub średnik/przecinek (fallback tab)
  const likelyHasTabs = rows.some((r) => r.includes('\t'));
  const sep = likelyHasTabs ? '\t' : (text.includes(';') ? ';' : (text.includes(',') ? ',' : '\t'));
  // Rozbij na komórki; proste split – wystarczy do naszych 1-znakowych wartości
  return rows
    .map((r) => r.split(sep))
    .filter((arr) => !(arr.length === 1 && arr[0] === '')); // usuń pusty ostatni wiersz
}

/** Składa macierz do TSV (najbardziej kompatybilne do schowka) */
export function toTSV(matrix) {
  return matrix.map((row) => row.join('\t')).join('\n');
}

/** Odczyt tekstu ze schowka (z eventu lub z navigator.clipboard) */
export async function readClipboardText(e) {
  if (e && e.clipboardData && typeof e.clipboardData.getData === 'function') {
    return e.clipboardData.getData('text/plain') || '';
  }
  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return '';
    }
  }
  return '';
}

/** Zapis tekstu do schowka (TSV/Plain) */
export async function writeClipboardText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback niżej
    }
  }
  // Fallback „stary” – tymczasowy textarea
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ekstrakcja prostokąta z danych grafiku do macierzy (pod kopiowanie).
 * schedule: Record<name, Record<dateKey, string>>
 */
export function snapshotMatrix({ schedule, employees, dateKeys, range }) {
  const { r0, c0, r1, c1 } = range; // inclusive
  const out = [];
  for (let r = r0; r <= r1; r += 1) {
    const name = employees[r];
    const rowObj = schedule[name] || {};
    const row = [];
    for (let c = c0; c <= c1; c += 1) {
      const dk = dateKeys[c];
      row.push(rowObj[dk] ?? '');
    }
    out.push(row);
  }
  return out;
}

/**
 * Wkleja macierz od (r,c) w prawo/w dół, wywołując onWrite(name, dateKey, value)
 * - stop na brzegach
 * - opcjonalnie pomija kolumny (np. święta)
 */
export function applyMatrix({
  matrix,
  startRow,
  startCol,
  employees,
  dateKeys,
  onWrite,
  isColDisabled = () => false,
}) {
  const rMax = employees.length - 1;
  const cMax = dateKeys.length - 1;

  for (let i = 0; i < matrix.length; i += 1) {
    const r = startRow + i;
    if (r > rMax) break;
    const name = employees[r];

    // Płyniemy po kolumnach, ale musimy offset kolumny liczyć względem rzeczywistych nie-disabled
    let c = startCol;
    for (let j = 0; j < matrix[i].length; j += 1) {
      // Znajdź najbliższą nie-zablokowaną kolumnę >= c
      while (c <= cMax && isColDisabled(c)) c += 1;
      if (c > cMax) break;

      const dk = dateKeys[c];
      const val = String(matrix[i][j] ?? '').trim().toLowerCase();
      onWrite(name, dk, val);
      c += 1;
    }
  }
}

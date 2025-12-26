// src/shared/utils/formatters.js

/* =========================
 * Tekst / stringi
 * ========================= */
export const safeString = (v) => (v == null ? '' : String(v));

export const trim = (v) => safeString(v).trim();

export const nullIfEmpty = (v) => {
  const t = trim(v);
  return t === '' ? null : t;
};

export const normalizeSpaces = (v) => trim(v).replace(/\s+/g, ' ');

export const toLower = (v) => trim(v).toLowerCase();
export const toUpper = (v) => trim(v).toUpperCase();

export const titleCase = (v) =>
  normalizeSpaces(v)
    .toLowerCase()
    .replace(/(^.| [^\s])/g, (m) => m.toUpperCase());

export const slugify = (v) =>
  trim(v)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // usuń diakrytyki
    .replace(/[^a-z0-9]+/g, '-') // zamień na myślniki
    .replace(/(^-|-$)/g, ''); // obetnij skraje

export const joinArray = (arr, sep = '; ') =>
  Array.isArray(arr) ? arr.join(sep) : safeString(arr);

/* =========================
 * Funkcyjne
 * ========================= */
export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

export const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((acc, fn) => fn(acc), x);

/* =========================
 * Liczby / parsowanie
 * ========================= */
export const sanitizeNumberString = (v) =>
  String(v ?? '')
    .replace(/\u00A0/g, ' ') // nbsp -> spacja
    .replace(/\s+/g, '') // usuń spacje
    .replace(',', '.'); // przecinek -> kropka

export const toNumber = (v) => {
  if (v === '' || v == null) return null;
  const n = Number(sanitizeNumberString(v));
  return Number.isFinite(n) ? n : null;
};

export const toInt = (v) => {
  const n = toNumber(v);
  return n == null ? null : Math.trunc(n);
};

export const isNumeric = (v) => {
  const n = toNumber(v);
  return Number.isFinite(n);
};

/* =========================
 * Zakresy / matematyka
 * ========================= */
export const clamp = (n, min = -Infinity, max = Infinity) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
};

export const clamp01 = (n) => clamp(n, 0, 1);

export const between = (n, min, max) => {
  const x = Number(n);
  return Number.isFinite(x) && x >= min && x <= max;
};

export const round = (n, digits = 0) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return NaN;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
};

export const roundTo = (n, step = 1) => {
  const x = Number(n);
  const s = Number(step);
  if (!Number.isFinite(x) || !Number.isFinite(s) || s === 0) return NaN;
  return Math.round(x / s) * s;
};

export const ensureInRange = (n, min, max, fallback = min) => {
  const x = toNumber(n);
  if (x == null) return fallback;
  return clamp(x, min, max);
};

/* =========================
 * Waluty / procenty
 * ========================= */
export const formatMoney = (
  v,
  currency = 'PLN',
  { minimumFractionDigits, maximumFractionDigits, locale = 'pl-PL' } = {}
) => {
  const x = Number(v);
  if (!Number.isFinite(x)) return '—';
  const opts = {
    style: 'currency',
    currency,
    ...(minimumFractionDigits != null ? { minimumFractionDigits } : {}),
    ...(maximumFractionDigits != null ? { maximumFractionDigits } : {}),
  };
  return new Intl.NumberFormat(locale, opts).format(x);
};

export const formatPercent = (v, { digits = 0, locale = 'pl-PL' } = {}) => {
  const x = Number(v);
  if (!Number.isFinite(x)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(x);
};

/** "12,5%" -> 0.125 ; "12.5" -> 0.125 ; "0.125" -> 0.125 */
export const parsePercent = (txt) => {
  const raw = String(txt ?? '').trim();
  if (!raw) return null;
  const hasPct = raw.includes('%');
  const clean = sanitizeNumberString(raw.replace('%', ''));
  const n = Number(clean);
  if (!Number.isFinite(n)) return null;
  return hasPct ? n / 100 : n;
};

export const floatToPercent = (v, digits = 0) =>
  v == null || !Number.isFinite(Number(v)) ? '—' : formatPercent(Number(v), { digits });

export const percentToFloat = (txt) => parsePercent(txt);

/* =========================
 * Daty
 * ========================= */
export const toDate = (d) => {
  if (!d && d !== 0) return null;
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const fmtDate = (d, locale = 'pl-PL') => {
  const dt = toDate(d);
  return dt ? dt.toLocaleDateString(locale) : '—';
};

export const fmtDateTime = (d, locale = 'pl-PL') => {
  const dt = toDate(d);
  return dt ? dt.toLocaleString(locale, { hour12: false }) : '—';
};

// YYYY-MM-DD (ISO bez strefy)
export const formatDateISO = (d) => {
  try {
    const dt = d ? new Date(d) : new Date();
    return dt.toISOString().slice(0, 10);
  } catch {
    return safeString(d);
  }
};

// "HH:mm"
export const formatTimeHHMM = (t) => {
  if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) return t;
  try {
    const dt = t ? new Date(t) : new Date();
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return safeString(t);
  }
};

/* =========================
 * Inne
 * ========================= */
export const coalesce = (...vals) => vals.find((v) => v != null);

export const mapNullish = (v, fn) => (v == null ? v : fn(v));

export const parseBoolean = (v) => {
  if (typeof v === 'boolean') return v;
  const t = String(v ?? '').trim().toLowerCase();
  if (['1', 'true', 'tak', 'yes', 'y'].includes(t)) return true;
  if (['0', 'false', 'nie', 'no', 'n'].includes(t)) return false;
  return null;
};

/* =========================
 * Domyślny pakiet eksportów
 * ========================= */
export default {
  // tekst
  safeString,
  trim,
  nullIfEmpty,
  normalizeSpaces,
  toLower,
  toUpper,
  titleCase,
  slugify,
  joinArray,
  // funkcyjne
  pipe,
  compose,
  // liczby
  sanitizeNumberString,
  toNumber,
  toInt,
  isNumeric,
  // matematyka/zakresy
  clamp,
  clamp01,
  between,
  round,
  roundTo,
  ensureInRange,
  // waluty/procenty
  formatMoney,
  formatPercent,
  parsePercent,
  floatToPercent,
  percentToFloat,
  // daty
  toDate,
  fmtDate,
  fmtDateTime,
  formatDateISO,
  formatTimeHHMM,
  // inne
  coalesce,
  mapNullish,
  parseBoolean,
};
export const fmtDateTimeIntl = (d, {
  locale = 'pl-PL',
  dateStyle = 'medium',
  timeStyle = 'short',
} = {}) => {
  try {
    if (!d) return ''
    const dt = d instanceof Date ? d : new Date(d)
    if (Number.isNaN(dt.getTime())) return ''
    return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(dt)
  } catch {
    return ''
  }
}

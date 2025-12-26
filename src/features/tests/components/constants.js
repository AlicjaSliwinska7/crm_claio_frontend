// src/features/tests/components/constants.js

// ===== stałe + słowniki =====
export const PAGE_SIZE = 50;

export const STATUS_DEFS = Object.freeze([
  { key: 'czeka na rozpoczęcie', label: 'Czeka na rozpoczęcie' },
  { key: 'wstrzymane',           label: 'Wstrzymane' },
  { key: 'w trakcie',            label: 'W trakcie' },
  { key: 'zakończone',           label: 'Zakończone' },
]);

export const OUTCOME_DEFS = Object.freeze([
  { key: 'pozytywny',     label: 'Pozytywny' },
  { key: 'negatywny',     label: 'Negatywny' },
  { key: 'nie dotyczy',   label: 'Nie dotyczy' },
]);

// Szybkie zbiory do walidacji / filtrowania
export const STATUS_KEYS  = Object.freeze(STATUS_DEFS.map(s => s.key));
export const OUTCOME_KEYS = Object.freeze(OUTCOME_DEFS.map(o => o.key));

// ===== pomocnicze =====
export const toStr = v => (v ?? '').toString();

export const norm = s =>
  String(s || '')
    .trim()
    .toLowerCase();

export const fmtDate = d => (d ? new Date(d).toLocaleDateString('pl-PL') : '—');

// Mapowanie PL -> EN token (zgodne z klasami CSS .status--…)
const STATUS_TOKEN_MAP = Object.freeze({
  // status
  'czeka na rozpoczęcie': 'pending',
  'wstrzymane':           'on-hold',
  'w trakcie':            'in-progress',
  'zakończone':           'completed',
  // outcome
  'pozytywny':            'positive',
  'negatywny':            'negative',
  'nie dotyczy':          'not-applicable',
});

export const toStatusToken = s => {
  const k = norm(s);
  if (!k) return 'unknown';
  const mapped = STATUS_TOKEN_MAP[k];
  if (mapped) return mapped;
  return k
    .replace(/\//g, '-')
    .replace(/\\/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'unknown';
};

/**
 * Buduje klasy badge dla statusu/wyniku.
 * @param {string} s           Wartość (PL)
 * @param {'solid'|'outline'} [variant]  Wariant wyglądu (opcjonalny)
 */
export const statusBadgeClass = (s, variant) =>
  `status-badge ${variant ? `badge--${variant} ` : ''}status--${toStatusToken(s)}`;

export const SLOT_META = [
  { key: 'morning', label: 'Rano', emoji: '☀️' },
  { key: 'afternoon', label: 'Popołudnie', emoji: '🌤️' },
  { key: 'evening', label: 'Wieczór', emoji: '🌙' },
  { key: 'night', label: 'Noc', emoji: '🟣' },
]

export const MAX_BADGES_PER_SLOT = 6
export const BADGE_COLOR_MODE = 'type' // 'type' | 'status' | 'priority' | 'difficulty'

export const TYPE_LABELS = { admin: 'Administracyjne', client: 'Klient', tech: 'Techniczne', other: 'Inne' }
export const STATUS_LABELS = {
  assigned: 'Przydzielone',
  progress: 'W trakcie',
  blocked: 'Zablokowane',
  done: 'Zakończone',
}
export const DIFF_LABELS = { easy: 'Łatwe', medium: 'Średnie', hard: 'Trudne' }
export const PRIO_LABELS = { high: 'Wysoki priorytet', normal: 'Normalny priorytet', low: 'Niski priorytet' }

export const SHIFT_META = {
  morning: { short: 'I', label: 'Zmiana I (rano)', bg: 'var(--c-diff-easy)' },
  afternoon: { short: 'II', label: 'Zmiana II (popołudnie)', bg: 'var(--c-diff-medium)' },
  evening: { short: 'III', label: 'Zmiana III (wieczór)', bg: 'var(--c-type-other)' },
  night: { short: 'III', label: 'Zmiana III (noc)', bg: 'var(--c-type-other)' },
}
export const STATUS_CLASS = {
  nieprzydzielone: 'status--unassigned',
  przydzielone: 'status--assigned',
  'w toku': 'status--inprogress',
  w_trakcie: 'status--inprogress',
  w_weryfikacji: 'status--review',
  'do poprawy': 'status--changes',
  do_poprawy: 'status--changes',
  zatwierdzone: 'status--approved',
  odrzucone: 'status--rejected',
}

export const STATUS_ORDER = ['przydzielone', 'w toku', 'w_weryfikacji', 'do poprawy', 'zatwierdzone', 'odrzucone']
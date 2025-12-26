// src/shared/utils/phone.js

// Wewnętrzny: 2–6 cyfr, bez spacji
export function formatInternal(v) {
  const digits = String(v ?? '').replace(/\D+/g, '').slice(0, 6);
  return digits;
}

// Zewnętrzny: 7–15 cyfr, grupy po 3 (np. 123 456 789)
export function formatExternal(v) {
  const digits = String(v ?? '').replace(/\D+/g, '').slice(0, 15);
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

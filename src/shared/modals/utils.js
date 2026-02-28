// Utils

// Dozwolone znaki w methodNo: litery/cyfry, -, _, /, .
export const sanitizeMethodNo = (raw) => {
  if (!raw) return '';
  let s = String(raw).replace(/\s+/g, '');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/[^A-Za-z0-9._\-\/]/g, '');
  return s;
};

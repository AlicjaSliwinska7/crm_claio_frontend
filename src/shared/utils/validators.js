// src/features/files/utils/validators.js
// Uniwersalne walidatory plików + formularza dodawania dokumentu

export const ALLOWED_EXTS_DEFAULT = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx',
]

// Domyślne progi długości
export const NAME_MIN_DEFAULT = 3
export const NAME_MAX_DEFAULT = 150
export const FILE_NAME_MIN_DEFAULT = 3
export const FILE_NAME_MAX_DEFAULT = 120

export const fileExt = (name = '') => {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot).toLowerCase() : ''
}

export const isAllowedExt = (name, allowedExts = ALLOWED_EXTS_DEFAULT) =>
  allowedExts.includes(fileExt(name))

export function validateDocName(name, { min = NAME_MIN_DEFAULT, max = NAME_MAX_DEFAULT } = {}) {
  const v = (name || '').trim()
  if (!v) return `Nazwa jest wymagana.`
  if (v.length < min) return `Nazwa musi mieć co najmniej ${min} znaki.`
  if (v.length > max) return `Nazwa może mieć maksymalnie ${max} znaków.`
  return ''
}

export function validateFilePresence(file) {
  return file ? '' : 'Załącz plik.'
}

export function validateFileExt(file, { allowedExts = ALLOWED_EXTS_DEFAULT } = {}) {
  if (!file) return 'Załącz plik.'
  if (!isAllowedExt(file.name, allowedExts)) {
    return `Niedozwolone rozszerzenie. Dozwolone: ${allowedExts.join(', ')}`
  }
  return ''
}

export function validateFileNameLength(
  file,
  { min = FILE_NAME_MIN_DEFAULT, max = FILE_NAME_MAX_DEFAULT } = {}
) {
  if (!file) return 'Załącz plik.'
  const len = (file.name || '').length
  if (len < min) return `Nazwa pliku musi mieć co najmniej ${min} znaki.`
  if (len > max) return `Nazwa pliku może mieć maksymalnie ${max} znaków.`
  return ''
}

// Opcjonalnie (użyj, jeśli chcesz kontrolować wielkość pliku):
export function validateFileSize(file, { maxBytes } = {}) {
  if (!file || !maxBytes) return ''
  return file.size > maxBytes ? `Plik jest zbyt duży (max ${maxBytes} B).` : ''
}

/**
 * Walidacja całego formularza dodawania dokumentu.
 * Zwraca obiekt { name: string, file: string } z komunikatami błędów (puste = ok).
 */
export function validateDocumentForm(
  { name, file },
  {
    allowedExts = ALLOWED_EXTS_DEFAULT,
    nameMin = NAME_MIN_DEFAULT,
    nameMax = NAME_MAX_DEFAULT,
    fileNameMin = FILE_NAME_MIN_DEFAULT,
    fileNameMax = FILE_NAME_MAX_DEFAULT,
    maxBytes, // opcjonalnie
  } = {}
) {
  const nameErr = validateDocName(name, { min: nameMin, max: nameMax })
  // sklej walidacje pliku w jedną wiadomość (pierwszy napotkany błąd)
  let fileErr = validateFilePresence(file)
  if (!fileErr) fileErr = validateFileExt(file, { allowedExts })
  if (!fileErr) fileErr = validateFileNameLength(file, { min: fileNameMin, max: fileNameMax })
  if (!fileErr && maxBytes) fileErr = validateFileSize(file, { maxBytes })

  return { name: nameErr, file: fileErr }
}
// src/features/forms/utils/validators.js

/** Proste validatory — zwracają string z błędem lub null (gdy OK) */
export const required = (label = 'Pole') => value => {
  const v = value == null ? '' : String(value).trim()
  return v ? null : `${label} jest wymagane.`
}

export const email = (label = 'E-mail') => value => {
  const v = value == null ? '' : String(value).trim()
  if (!v) return null // wymagane ogarnia "required"
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  return ok ? null : `Podaj poprawny adres dla „${label}”.`
}

export const minLen = (n, label = 'Pole') => value => {
  const v = value == null ? '' : String(value)
  if (!v) return null
  return v.length >= n ? null : `${label} musi mieć min. ${n} znaki.`
}

export const maxLen = (n, label = 'Pole') => value => {
  const v = value == null ? '' : String(value)
  if (!v) return null
  return v.length <= n ? null : `${label} może mieć maks. ${n} znaków.`
}

export const pattern = (re, msg) => value => {
  const v = value == null ? '' : String(value).trim()
  if (!v) return null
  return re.test(v) ? null : (msg || 'Nieprawidłowy format.')
}

/** Pozwala zbudować własny validator (fn zwraca true/false lub string z błędem) */
export const custom = (fn, msg = 'Nieprawidłowa wartość.') => (value, values) => {
  const res = fn(value, values)
  if (res === true || res == null) return null
  if (res === false) return msg
  if (typeof res === 'string') return res
  return msg
}

/** Waliduj obiekt wg schematu { field: [validators...] } */
export function validateObject(values, schema) {
  const errors = {}
  for (const key of Object.keys(schema || {})) {
    const validators = schema[key] || []
    const value = values?.[key]
    for (const v of validators) {
      const err = v(value, values)
      if (err) { errors[key] = err; break }
    }
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  }
}

/** Zwraca pierwsze pole z błędem — przydatne do focus */
export function firstErrorKey(errors) {
  return Object.keys(errors || {})[0] || null
}

// src/features/messages/hooks/inbox.utils.js

export function norm(s) {
  return (s || '').toString().toLowerCase()
}

export function normName(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function mkFileItem(file) {
  return {
    id: `f-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    file,
    name: file?.name || 'plik',
    size: typeof file?.size === 'number' ? file.size : 0,
    type: file?.type || '',
  }
}

export function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean).map(String)))
}

/**
 * ConfirmProvider bywa różny:
 * - boolean true/false
 * - { confirmed: true }
 * - { isConfirmed: true } (SweetAlert2)
 * - { value: true }
 * - { ok: true }
 * - { status: 'confirmed' } itp.
 */
export function isConfirmOk(res) {
  if (res === true) return true
  if (res === false || res == null) return false

  if (typeof res === 'string') {
    const s = res.trim().toLowerCase()
    if (s === 'true' || s === 'ok' || s === 'yes' || s === 'confirm' || s === 'confirmed') return true
    return false
  }

  if (typeof res !== 'object') return Boolean(res)

  if (res.confirmed === true) return true
  if (res.isConfirmed === true) return true
  if (res.ok === true) return true
  if (res.value === true) return true
  if (res.accepted === true) return true
  if (res.success === true) return true
  if (res.result === true) return true

  if (typeof res.status === 'string' && res.status.toLowerCase() === 'confirmed') return true

  return false
}
// src/features/messages/pages/inbox/chat/utils.js

export function formatDateHeader(iso) {
  const date = new Date(iso)
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  const d1 = new Date(a)
  const d2 = new Date(b)
  return d1.toDateString() === d2.toDateString()
}

export function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** ✅ FIX: bez re.test() z /g (stanowe), split na grupie */
export function highlightText(text, query, markClassName = 'msg-mark') {
  const t = String(text ?? '')
  const q = String(query ?? '').trim()
  if (!q) return t
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig')
  const parts = t.split(re)
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={markClassName}>
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

export function fileSizePretty(bytes) {
  if (!bytes || typeof bytes !== 'number') return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
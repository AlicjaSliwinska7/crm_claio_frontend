// src/shared/utils/formatBytes.js

/**
 * Czytelne formatowanie rozmiaru plików.
 *  - 0–1023 B  → "XYZ B"
 *  - 1.0–1023.9 KB → "X.Y KB"
 *  - 1.0–1023.9 MB → "X.Y MB"
 *  - 1.0+ GB → "X.Y GB"
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`

  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`

  const gb = mb / 1024
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`
}

export default formatBytes

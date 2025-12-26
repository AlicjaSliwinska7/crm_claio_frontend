import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function AccreditedBadge({ ok }) {
  return ok ? (
    <span className="status-badge" title="Akredytowane" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <CheckCircle2 size={16} /> tak
    </span>
  ) : (
    <span className="status-badge" title="Nieakredytowane" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <XCircle size={16} /> nie
    </span>
  )
}

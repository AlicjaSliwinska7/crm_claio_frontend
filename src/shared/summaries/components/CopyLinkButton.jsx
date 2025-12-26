// src/shared/summaries/components/CopyLinkButton.jsx
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link as LinkIcon, Check } from 'lucide-react'

export default function CopyLinkButton({ makeUrl, className = 'btn ghost' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={className}
      onClick={async () => {
        const url = makeUrl ? makeUrl() : window.location.href
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      title="Kopiuj link"
      aria-label="Kopiuj link"
    >
      {copied ? <Check size={16} /> : <LinkIcon size={16} />} Link
    </button>
  )
}
CopyLinkButton.propTypes = {
  makeUrl: PropTypes.func, // opcjonalnie: generuj link z filtrami
}

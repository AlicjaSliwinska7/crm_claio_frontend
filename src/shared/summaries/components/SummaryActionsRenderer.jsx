import React from 'react'
import PropTypes from 'prop-types'
import { Download } from 'lucide-react'
import CsvIconAction from './CsvIconAction'

export default function SummaryActionsRenderer({ actions = [] }) {
  if (!actions || actions.length === 0) return null

  return (
    <>
      {actions.map((a) => {
        if (!a) return null

        if (a.type === 'custom') {
          return <React.Fragment key={a.key}>{a.render?.()}</React.Fragment>
        }

        if (a.type === 'csv') {
          // pozwalamy podmienić ikonę, ale domyślnie Download
          const icon = a.icon ?? <Download size={18} />
          // CsvIconAction renderuje wewnętrznie przycisk z Download,
          // więc jeśli chcesz własną ikonę – w przyszłości dodamy "children".
          // Na teraz najważniejsze: config-only + spójny styl.
          return <CsvIconAction key={a.key} csv={a.csv} title={a.title} />
        }

        if (a.type === 'button') {
          return (
            <button
              key={a.key}
              type="button"
              className="tss-btn"
              onClick={a.onClick}
              disabled={a.disabled}
              title={a.title || a.label}
              aria-label={a.title || a.label}
            >
              {a.label}
            </button>
          )
        }

        if (a.type === 'iconButton') {
          return (
            <button
              key={a.key}
              type="button"
              className="tss-icon-btn tss-btn--icon"
              onClick={a.onClick}
              disabled={a.disabled}
              title={a.title}
              aria-label={a.title}
            >
              {a.icon}
            </button>
          )
        }

        return null
      })}
    </>
  )
}

SummaryActionsRenderer.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    })
  ),
}
// src/features/messages/components/MessageView.jsx
import React from 'react'
import PropTypes from 'prop-types'

function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageView({ message }) {
  if (!message) {
    return <div className="message-view message-view--empty">Wybierz wiadomość</div>
  }

  const {
    subject = '(bez tematu)',
    sender = '—',
    date = null,
    content = '',
    isHtml = false, // jeśli kiedyś podasz HTML, kontrolujesz to pole po stronie logiki
  } = message

  const d = date ? new Date(date) : null
  const iso = d && !isNaN(d) ? d.toISOString() : undefined

  return (
    <section className="message-view" aria-label="Podgląd wiadomości">
      <header className="message-view__header">
        <h3 className="message-view__subject">{subject}</h3>
        <div className="message-view__meta">
          <span className="message-view__from"><strong>Od:</strong> {sender}</span>
          <span className="message-view__date">
            <strong>Data:</strong>{' '}
            {iso ? <time dateTime={iso}>{formatDate(date)}</time> : '—'}
          </span>
        </div>
      </header>

      <article className="message-view__body">
        {isHtml ? (
          // Uwaga: renderowanie HTML – tylko jeśli content jest zaufany / oczyszczony!
          <div
            className="message-view__html"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          // Tekst domyślnie jako pre-wrap, aby zachować nowe linie
          <pre className="message-view__text" aria-label="Treść wiadomości">
            {content || '—'}
          </pre>
        )}
      </article>
    </section>
  )
}

MessageView.propTypes = {
  message: PropTypes.shape({
    subject: PropTypes.string,
    sender: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    content: PropTypes.string,
    isHtml: PropTypes.bool,
  }),
}

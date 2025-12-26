// src/features/messages/components/MessageItem.jsx
import React from 'react'
import PropTypes from 'prop-types'
import '../styles/messages.css'

function formatShort(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleString('pl-PL', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MessageItem({ message, onClick, selected = false }) {
  if (!message) return null

  const {
    from = message.senderName || '—',
    subject = '(bez tematu)',
    date = null,
    read = false,
  } = message

  const handleClick = () => onClick && onClick(message)
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick && onClick(message)
    }
  }

  return (
    <div
      className={[
        'message-item',
        read ? 'is-read' : 'is-unread',
        selected ? 'is-selected' : '',
      ].join(' ').trim()}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={selected ? 'true' : 'false'}
      aria-label={`${read ? 'przeczytana' : 'nieprzeczytana'} wiadomość od ${from}: ${subject}`}
      title={`${from} — ${subject}`}
    >
      {!read && <span className="msg-unread-dot" aria-hidden="true" />}

      <div className="message-from" title={from}>{from}</div>

      <div className="message-subject" title={subject}>
        {subject}
      </div>

      <time
        className="message-date"
        dateTime={date ? new Date(date).toISOString() : undefined}
        title={formatShort(date)}
        aria-label={`Data: ${formatShort(date)}`}
      >
        {formatShort(date)}
      </time>
    </div>
  )
}

MessageItem.propTypes = {
  message: PropTypes.shape({
    from: PropTypes.string,
    senderName: PropTypes.string,
    subject: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    read: PropTypes.bool,
  }),
  onClick: PropTypes.func,
  selected: PropTypes.bool,
}

export default React.memo(MessageItem)

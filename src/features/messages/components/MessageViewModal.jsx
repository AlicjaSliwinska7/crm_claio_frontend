// src/features/messages/components/MessageViewModal.jsx
import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../../shared/modals/modals/Modal'
import '../styles/messages.css'

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

export default function MessageViewModal({ open, onClose, message }) {
  if (!open) return null

  const {
    senderName = '—',
    text = '',
    timestamp = null,
    reactions = {},
    attachments = [],
  } = message || {}

  const reactionPairs = Object.entries(reactions || {}) // {userId: '👍'} → [['u1','👍'], ...]

  return (
    <Modal isOpen={open} onClose={onClose} title="Podgląd wiadomości" size="md">
      <div className="msgv-body">
        <div className="msgv-meta">
          <div><b>Nadawca:</b> {senderName || '—'}</div>
          <div><b>Data:</b> {formatDate(timestamp)}</div>
        </div>

        <div className="msgv-text">
          {text || <span className="muted">— brak treści —</span>}
        </div>

        {attachments?.length > 0 && (
          <div className="msgv-attachments">
            <div className="msgv-section-title">Załączniki</div>
            <ul className="msgv-attach-list">
              {attachments.map((a, i) => (
                <li key={i}>
                  {a.url
                    ? <a href={a.url} target="_blank" rel="noreferrer">{a.name || a.url}</a>
                    : <span>{a.name || 'Załącznik'}</span>
                  }
                </li>
              ))}
            </ul>
          </div>
        )}

        {reactionPairs.length > 0 && (
          <div className="msgv-reactions">
            <div className="msgv-section-title">Reakcje</div>
            <div className="msgv-reaction-row">
              {reactionPairs.map(([uid, emoji]) => (
                <span key={uid} className="msg-reaction">{emoji}</span>
              ))}
            </div>
          </div>
        )}

        <div className="msgv-footer">
          <button type="button" className="tss-btn" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </Modal>
  )
}

MessageViewModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.shape({
    senderName: PropTypes.string,
    text: PropTypes.string,
    timestamp: PropTypes.string,
    reactions: PropTypes.object,
    attachments: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    })),
  }),
}

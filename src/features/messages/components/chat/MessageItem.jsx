// src/features/messages/pages/inbox/chat/MessageItem.jsx
import React from 'react'
import { formatDateHeader, isSameDay, fileSizePretty, highlightText } from '../../utils'
import ReactionBar from './ReactionBar'
import MessageReactionsChips from './MessageReactionsChips'

export default function MessageItem({
  msg,
  idx = 0,
  arr,
  messages,
  users,
  loggedInUserId,
  messageSearch,
  onReply,
  onJumpToMessage,
  messageElsRef,
  onReaction,

  reactOpenForId,
  setReactOpenForId,
}) {
  if (!msg) return null

  const prev = arr?.[idx - 1]
  const showDate = idx === 0 || !isSameDay(msg.timestamp, prev?.timestamp)
  const showAuthor = idx === 0 || msg.sender !== prev?.sender
  const isOwn = msg.sender === loggedInUserId
  const isOpen = reactOpenForId === msg.id

  const replyTarget = msg.replyToId ? messages?.find((m) => m?.id === msg.replyToId) : null

  const toggleReactions = (e) => {
    e?.stopPropagation?.()
    setReactOpenForId?.((cur) => (cur === msg.id ? null : msg.id))
  }

  return (
    <>
      {showDate && <div className="date-separator">{formatDateHeader(msg.timestamp)}</div>}

      <div
        ref={(el) => {
          if (el && msg.id && messageElsRef?.current) {
            messageElsRef.current[msg.id] = el
          }
        }}
        className={`message-block ${isOwn ? 'own' : ''}`}
      >
        {showAuthor && <div className="message-author">{users?.[msg.sender] || msg.sender}</div>}

        <div className={`message ${isOwn ? 'own' : ''} ${isOpen ? 'is-react-open' : ''}`}>
          {replyTarget && (
            <button
              className="reply-preview"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onJumpToMessage?.(replyTarget.id)
              }}
              title="Przejdź do wiadomości, na którą odpowiadasz"
              aria-label="Przejdź do wiadomości, na którą odpowiadasz"
            >
              <div className="reply-preview__who">{users?.[replyTarget.sender] || replyTarget.sender}</div>
              <div className="reply-preview__text">{(replyTarget.text || '').slice(0, 140) || '—'}</div>
            </button>
          )}

          <div className="message-text">{highlightText(msg.text || '', messageSearch)}</div>

          {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
            <div className="msg-files" aria-label="Załączniki w wiadomości">
              {msg.attachments.filter(Boolean).map((a) => (
                <div key={a.id || a.name} className="msg-file">
                  <span className="msg-file__name">{a?.name || 'plik'}</span>
                  {typeof a?.size === 'number' && a.size > 0 ? (
                    <span className="msg-file__size">{fileSizePretty(a.size)}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* ✅ open po kliknięciu (+) sterowane klasą is-react-open w CSS */}
          <ReactionBar
            open={isOpen}
            onPick={(emoji) => {
              setReactOpenForId?.(null)
              // ✅ KLUCZ: useInboxLogic oczekuje indeksu wiadomości, nie msg.id
              onReaction?.(idx, emoji)
            }}
          />

          <MessageReactionsChips reactions={msg.reactions} isOwn={isOwn} />
        </div>

        <div className="message-time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
          {isOwn && msg.read ? '✓✓' : ''}

          <button
            className="msg-react-btn"
            type="button"
            onClick={toggleReactions}
            title={isOpen ? 'Zamknij reakcje' : 'Dodaj reakcję'}
            aria-label={isOpen ? 'Zamknij reakcje' : 'Dodaj reakcję'}
          >
            +
          </button>

          <button
            className="msg-reply-btn"
            type="button"
            onClick={() => onReply?.(msg)}
            title="Odpowiedz"
            aria-label="Odpowiedz"
          >
            ↩
          </button>
        </div>
      </div>
    </>
  )
}
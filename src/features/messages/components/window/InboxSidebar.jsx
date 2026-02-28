// src/features/messages/components/inbox/InboxSidebar.jsx
import React from 'react'

export default function InboxSidebar({
  conversations,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onEditConversation, // ✅ NEW
  loggedInUserId,
}) {
  return (
    <div className="sidebar">
      <h3>
        Rozmowy
        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <button
            className="new-chat-btn"
            onClick={onNewConversation}
            title="Nowa rozmowa"
            aria-label="Nowa rozmowa"
            type="button"
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </div>
      </h3>

      <input
        className="conversation-search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Szukaj rozmów…"
        aria-label="Szukaj rozmów"
      />

      <ul>
        {(conversations || []).map((conv) => {
          const unread = (conv.messages || []).filter((m) => !m.read && m.sender !== loggedInUserId).length
          const isActive = conv.id === activeConversationId

          return (
            <li
              key={conv.id}
              className={isActive ? 'active' : ''}
              onClick={() => onSelectConversation(conv.id)}
              role="button"
              aria-current={isActive ? 'true' : 'false'}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectConversation(conv.id)
              }}
            >
              <span className="conversation-name" title={conv.name}>
                {conv.name}
              </span>

              {unread > 0 && (
                <span className="chat-unread-count" aria-label={`Nieprzeczytane: ${unread}`}>
                  {unread}
                </span>
              )}

              {/* ✅ EDIT */}
              <button
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditConversation?.(conv.id)
                }}
                title="Edytuj rozmowę"
                aria-label="Edytuj rozmowę"
                type="button"
              >
                <i className="fas fa-pen" aria-hidden="true" />
              </button>

              <button
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conv.id)
                }}
                title="Usuń rozmowę"
                aria-label="Usuń rozmowę"
                type="button"
              >
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
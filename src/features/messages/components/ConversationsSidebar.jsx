import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function ConversationsSidebar({
  conversations,
  allConversations,
  activeId,
  onSelect,
  onDelete,
  searchQuery,
  onChangeSearch,
  onNew,
}) {
  return (
    <div className='sidebar'>
      <h3>
        Rozmowy
        <button type='button' className='new-chat-btn' onClick={onNew} title='Nowa rozmowa' aria-label='Nowa rozmowa'>
          <Plus size={18} aria-hidden='true' />
        </button>
      </h3>

      <input
        className='conversation-search'
        value={searchQuery}
        onChange={e => onChangeSearch(e.target.value)}
        placeholder='Szukaj...'
        aria-label='Szukaj rozmów'
      />

      <ul>
        {conversations.map(conv => {
          const unread = conv.messages.filter(m => !m.read && m.sender !== 'u1').length // 'u1' – lokalny user
          const isActive = conv.id === activeId
          return (
            <li
              key={conv.id}
              className={isActive ? 'active' : ''}
              onClick={() => onSelect(conv.id)}
              role='button'
              aria-current={isActive ? 'true' : 'false'}
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(conv.id)}
            >
              <span className='conversation-name'>
                {conv.name}
                {unread > 0 && <span className='chat-unread-count'>{unread}</span>}
              </span>

              <button
                type='button'
                className='delete-chat-btn'
                onClick={e => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                title='Usuń rozmowę'
                aria-label='Usuń rozmowę'
              >
                <Trash2 size={16} aria-hidden='true' />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

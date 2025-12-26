import React from 'react'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

export default function ChatWindow({
  users,
  conversation,
  isSameDay,
  onSendMessage,
  onReact,
  messagesRef,
  onOpenNew,
}) {
  if (!conversation) {
    return (
      <div className='chat-window'>
        <div className='empty-chat'>
          <div className='empty-card'>
            <div className='empty-icon' aria-hidden='true'>💬</div>
            <div className='empty-title'>Brak wybranej rozmowy</div>
            <p className='empty-desc'>Wybierz rozmowę z listy po lewej albo rozpocznij nową.</p>
            <div className='empty-actions'>
              <button type='button' className='btn btn-primary' onClick={onOpenNew}>Nowa rozmowa</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='chat-window'>
      <ChatHeader title={conversation.name} members={conversation.members} users={users} />
      <ChatMessages
        users={users}
        messages={conversation.messages}
        isSameDay={isSameDay}
        onReact={onReact}
        messagesRef={messagesRef}
      />
      <ChatInput onSend={onSendMessage} />
    </div>
  )
}

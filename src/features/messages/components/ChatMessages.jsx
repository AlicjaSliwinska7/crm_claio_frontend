import React, { Fragment } from 'react'
import MessageItem from './MessageItem'
import { loggedInUserId } from '../data/mock'
import { formatDateHeader } from '../utils/dates'

export default function ChatMessages({ users, messages, isSameDay, onReact, messagesRef }) {
  return (
    <div className='chat-messages' ref={messagesRef}>
      {messages.map((msg, idx, arr) => {
        const showDate = idx === 0 || !isSameDay(msg.timestamp, arr[idx - 1]?.timestamp)
        const showAuthor = idx === 0 || msg.sender !== arr[idx - 1].sender

        return (
          <Fragment key={msg.id || `${msg.timestamp}-${idx}`}>
            {showDate && <div className='date-separator'>{formatDateHeader(msg.timestamp)}</div>}
            <MessageItem
              msg={msg}
              showAuthor={showAuthor}
              users={users}
              isOwn={msg.sender === loggedInUserId}
              onReact={emoji => onReact(idx, emoji)}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

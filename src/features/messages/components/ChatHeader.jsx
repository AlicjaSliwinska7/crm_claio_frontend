import React from 'react'

export default function ChatHeader({ title, members, users }) {
  return (
    <div className='chat-header'>
      <div>
        <b>{title}</b>
        <div className='chat-members'>{members.map(id => users[id]).join(', ')}</div>
      </div>
    </div>
  )
}

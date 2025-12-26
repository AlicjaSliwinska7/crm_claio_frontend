import React, { useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef(null)

  const handleEmojiClick = (emojiObjOrEvent, maybeData) => {
    const picked = emojiObjOrEvent?.emoji || maybeData?.emoji || ''
    if (!picked) return
    setValue(v => v + picked)
    inputRef.current?.focus()
  }

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
    setShowEmoji(false)
  }

  return (
    <div className='chat-input'>
      <button
        type='button'
        className='emoji-toggle-btn'
        onClick={() => setShowEmoji(p => !p)}
        title='Emoji'
        aria-label='Wstaw emoji'
      >
        😊
      </button>

      {showEmoji && (
        <div className='emoji-picker-wrapper' onMouseDown={e => e.preventDefault()}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <label className='file-attach' title='Dodaj załącznik' aria-label='Dodaj załącznik'>
        📎
        <input type='file' style={{ display: 'none' }} />
      </label>

      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder='Napisz wiadomość...'
        aria-label='Napisz wiadomość'
      />

      <button type='button' onClick={handleSend} aria-label='Wyślij wiadomość'>
        Wyślij
      </button>
    </div>
  )
}

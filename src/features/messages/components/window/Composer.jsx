// src/features/messages/pages/inbox/chat/Composer.jsx
import React from 'react'
import { fileSizePretty } from '../../utils'
import EmojiPanel from './EmojiPanel'

export default function Composer({
  newMessage,
  onChangeMessage,
  onSend,
  inputRef,

  showEmoji,
  onOpenEmoji,
  onCloseEmoji,
  emojiBtnRef,
  onPickEmoji,

  pendingFiles,
  onAddFiles,
  onRemovePendingFile,
}) {
  return (
    <div className="chat-input">
      <div className="composer">
        <button
          ref={emojiBtnRef}
          className="emoji-toggle-btn"
          onClick={showEmoji ? onCloseEmoji : onOpenEmoji}
          title="Emoji"
          aria-label="Wstaw emoji"
          type="button"
        >
          😊
        </button>

        <label className="file-attach" title="Dodaj załącznik" aria-label="Dodaj załącznik">
          📎
          <input
            type="file"
            style={{ display: 'none' }}
            multiple
            onChange={(e) => {
              if (e.target.files?.length) onAddFiles?.(e.target.files)
              e.target.value = ''
            }}
          />
        </label>

        <input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => onChangeMessage?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend?.()
            }
          }}
          placeholder="Napisz wiadomość... (Enter = wyślij)"
          aria-label="Napisz wiadomość"
        />

        <button className="btn btn-primary" onClick={onSend} aria-label="Wyślij wiadomość" type="button">
          Wyślij
        </button>
      </div>

      {Array.isArray(pendingFiles) && pendingFiles.length > 0 && (
        <div className="pending-files" aria-label="Załączniki oczekujące">
          <div className="pending-files__title">Załączniki (oczekujące):</div>
          <div className="pending-files__list">
            {pendingFiles.map((pf) => (
              <div key={pf.id} className="pending-file">
                <span className="pending-file__name">{pf.name}</span>
                {pf.size ? <span className="pending-file__size">{fileSizePretty(pf.size)}</span> : null}
                <button
                  className="pending-file__remove"
                  onClick={() => onRemovePendingFile?.(pf.id)}
                  type="button"
                  aria-label={`Usuń ${pf.name}`}
                  title="Usuń"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="composer-hint">Możesz też przeciągnąć pliki na okno czatu (drag & drop).</div>
        </div>
      )}

      <EmojiPanel open={showEmoji} anchorRef={emojiBtnRef} onClose={onCloseEmoji} onPick={onPickEmoji} />
    </div>
  )
}
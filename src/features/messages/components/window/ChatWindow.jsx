// src/features/messages/pages/inbox/ChatWindow.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'

import MessageItem from '../chat/MessageItem'
import Composer from '../window/Composer'

export default function ChatWindow({
  activeConversation,
  users,
  loggedInUserId,

  newMessage,
  onChangeMessage,
  onSend,

  showEmojiPicker,
  onToggleEmoji,
  onEmojiPick,

  onReaction,
  onOpenNewConversation,

  inputRef,
  messagesContainerRef,
  messageElsRef,

  onReply,
  replyTo,
  onCancelReply,
  onJumpToMessage,

  pendingFiles,
  onAddFiles,
  onRemovePendingFile,

  messageSearch,
}) {
  const hasActive = !!activeConversation
  const [dragOver, setDragOver] = useState(false)
  const dragDepth = useRef(0)

  // ✅ reakcje – stabilne zamykanie (delay)
  const [reactOpenForId, setReactOpenForId] = useState(null)
  const closeTimerRef = useRef(null)

  const closeWithDelay = useCallback((id) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setReactOpenForId((cur) => (cur === id ? null : cur))
    }, 260)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  // D&D handlers
  const onDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current += 1
    setDragOver(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragOver(false)
    }
  }
  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragOver) setDragOver(true)
  }
  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = 0
    setDragOver(false)
    const files = e.dataTransfer?.files
    if (files && files.length) onAddFiles?.(files)
  }

  // ✅ emoji panel – Composer ma swoje nazwy propsów, więc mapujemy
  const emojiBtnRef = useRef(null)
  const isEmojiOpen = !!showEmojiPicker

  const closeEmoji = useCallback(() => {
    if (isEmojiOpen) onToggleEmoji?.()
  }, [isEmojiOpen, onToggleEmoji])

  const pickEmoji = useCallback(
    (emoji) => {
      // 1) jeśli parent podał handler (może oczekiwać stringa)
      if (typeof onEmojiPick === 'function') onEmojiPick(emoji)
      // 2) fallback: dopisz do inputa
      else onChangeMessage?.(`${String(newMessage || '')}${emoji}`)

      // ✅ po wybraniu emoji: zamknij i focus
      closeEmoji()
      queueMicrotask(() => inputRef?.current?.focus?.())
    },
    [onEmojiPick, onChangeMessage, newMessage, closeEmoji, inputRef]
  )

  // ✅ FIX ESLINT: hook zawsze wywoływany (nie po warunkowym return)
  const messages = useMemo(() => activeConversation?.messages ?? [], [activeConversation])

  // ✅ brak rozmowy
  if (!hasActive) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <div className="empty-card">
            <div className="empty-icon" aria-hidden="true">
              💬
            </div>
            <div className="empty-title">Brak wybranej rozmowy</div>
            <p className="empty-desc">Wybierz rozmowę z listy po lewej albo rozpocznij nową.</p>
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={onOpenNewConversation} type="button">
                Nowa rozmowa
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSend = () => {
    setReactOpenForId(null)
    onSend?.()
  }

  return (
    <div
      className="chat-window"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {dragOver && (
        <div className="drop-overlay" role="presentation" aria-hidden="true">
          <div className="drop-card">
            <div className="drop-ico">📎</div>
            <div className="drop-title">Upuść pliki, aby dodać do wiadomości</div>
          </div>
        </div>
      )}

      <div className="chat-messages" ref={messagesContainerRef}>
        {(messages || [])
          .filter(Boolean)
          .map((msg, idx, arr) => (
            <MessageItem
              key={msg?.id || `${idx}`}
              msg={msg}
              idx={idx}
              arr={arr}
              messages={messages}
              users={users}
              loggedInUserId={loggedInUserId}
              reactOpenForId={reactOpenForId}
              setReactOpenForId={setReactOpenForId}
              closeWithDelay={closeWithDelay}
              cancelClose={cancelClose}
              onReaction={onReaction}
              onReply={onReply}
              onJumpToMessage={onJumpToMessage}
              messageElsRef={messageElsRef}
              messageSearch={messageSearch}
            />
          ))}
      </div>

      <Composer
        inputRef={inputRef}
        emojiBtnRef={emojiBtnRef}
        newMessage={newMessage}
        onChangeMessage={onChangeMessage}
        onSend={handleSend}
        pendingFiles={pendingFiles}
        onAddFiles={onAddFiles}
        onRemovePendingFile={onRemovePendingFile}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
        // ✅ MAPOWANIE do nazw, których Composer faktycznie używa:
        showEmoji={!!showEmojiPicker}
        onOpenEmoji={onToggleEmoji}
        onCloseEmoji={onToggleEmoji}
        onPickEmoji={pickEmoji}
      />
    </div>
  )
}
// src/features/messages/pages/MessagesInboxView.jsx
import React, { useMemo } from 'react'
import '../styles/index.css'

import MessagesModal from '../../../shared/modals/modals/MessagesModal'

// ✅ zgodnie z Twoim plikiem: src/features/messages/components/inbox/InboxSidebar.jsx
import InboxSidebar from '../components/window/InboxSidebar'

import ChatWindow from '../components/window/ChatWindow'
import useInboxLogic from '../hooks/useInboxLogic'

// ✅ shared modal (create + edit)
import NewConversationModal from '../../../shared/modals/modals/NewConversationModal'

export default function MessagesInboxView({
  inModal = false,
  open = true,
  onClose,
  unreadSubtitle,
}) {
  const logic = useInboxLogic()

  const {
    users,
    loggedInUserId,

    conversations,
    activeConversation,
    activeConversationId,

    searchQuery,
    newMessage,
    showEmojiPicker,
    showNewModal,

    // ✅ CREATE
    newConvError,
    clearNewConvError,

    filteredConversations,

    inputRef,
    messagesContainerRef,
    messageElsRef,

    pendingFiles,
    replyTo,

    // ✅ SEARCH IN CONVERSATION (z hooka)
    messageSearch,
    messageHits,
    activeHitIdx,
    setMessageSearch,
    clearMessageSearch,
    goPrevHit,
    goNextHit,

    setActiveConversationId,
    setSearchQuery,
    setNewMessage,
    setShowEmojiPicker,
    setShowNewModal,

    addFiles,
    removePendingFile,
    beginReplyTo,
    cancelReply,

    scrollToMessageId,

    handleCreateConversation,
    handleSendMessage,
    handleReaction,
    handleDeleteConversation,
    handleEmojiClick,

    // ✅ EDIT (z hooka)
    showEditModal,
    editingConversation,
    editConvError,
    openEditConversation,
    closeEditConversation,
    handleUpdateConversation,
    clearEditConvError,
  } = logic

  const contextTitle = useMemo(() => activeConversation?.name || undefined, [activeConversation?.name])

  const contextSubtitle = useMemo(() => {
    const ids = activeConversation?.members || []
    if (!ids.length) return undefined
    const map = Array.isArray(users) ? Object.fromEntries(users.map((u) => [u.id, u.name])) : (users || {})
    const names = ids.map((id) => map[id] || id).join(', ')
    return names || undefined
  }, [activeConversation?.members, users])

  const usersArray = useMemo(() => {
    if (Array.isArray(users)) return users
    return Object.entries(users || {}).map(([id, name]) => ({ id, name }))
  }, [users])

  // ✅ toolbar do headera modala (prawa strona) — używa Twoich klas z _conversation-search.css
  const headerToolbar = useMemo(() => {
    const hasQuery = !!messageSearch?.trim()
    const hitsCount = messageHits?.length || 0
    const shownIdx = hitsCount ? Math.min(activeHitIdx + 1, hitsCount) : 0

    return (
      <div className="conv-search" aria-label="Szukaj w rozmowie">
        <i className="fas fa-search" aria-hidden="true" />

        <input
          value={messageSearch}
          onChange={(e) => setMessageSearch(e.target.value)}
          placeholder="Szukaj w rozmowie…"
          aria-label="Szukaj w rozmowie"
          autoComplete="off"
        />

        {hasQuery ? (
          <>
            <span className="conv-search__count" title="Liczba trafień" aria-live="polite">
              {hitsCount ? `${shownIdx}/${hitsCount}` : '0/0'}
            </span>

            <button
              className="conv-search__nav"
              onClick={goPrevHit}
              aria-label="Poprzednie trafienie"
              title="Poprzednie"
              type="button"
              disabled={!hitsCount}
            >
              ‹
            </button>

            <button
              className="conv-search__nav"
              onClick={goNextHit}
              aria-label="Następne trafienie"
              title="Następne"
              type="button"
              disabled={!hitsCount}
            >
              ›
            </button>

            <button
              className="conv-search__clear"
              onClick={clearMessageSearch}
              aria-label="Wyczyść"
              title="Wyczyść"
              type="button"
            >
              ×
            </button>
          </>
        ) : (
          // stabilny layout w headerze (licznik / nav / clear “zajmują miejsce”, ale są pasywne)
          <>
            <span className="conv-search__count" aria-hidden="true">
              —
            </span>

            <button className="conv-search__nav" type="button" disabled aria-hidden="true" tabIndex={-1}>
              ‹
            </button>

            <button className="conv-search__nav" type="button" disabled aria-hidden="true" tabIndex={-1}>
              ›
            </button>

            <button className="conv-search__clear" type="button" disabled aria-hidden="true" tabIndex={-1} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              ×
            </button>
          </>
        )}
      </div>
    )
  }, [messageSearch, messageHits, activeHitIdx, setMessageSearch, goPrevHit, goNextHit, clearMessageSearch])

  const inboxUI = (
    <div className={`message-inbox ${inModal ? 'message-inbox--modal' : ''}`}>
      <InboxSidebar
        conversations={filteredConversations}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => {
          clearNewConvError?.()
          setShowNewModal(true)
        }}
        onDeleteConversation={handleDeleteConversation}
        onEditConversation={openEditConversation}
        loggedInUserId={loggedInUserId}
      />

      <ChatWindow
        activeConversation={activeConversation}
        users={users}
        loggedInUserId={loggedInUserId}
        newMessage={newMessage}
        onChangeMessage={setNewMessage}
        onSend={handleSendMessage}
        showEmojiPicker={showEmojiPicker}
        onToggleEmoji={() => setShowEmojiPicker((p) => !p)}
        onEmojiPick={handleEmojiClick}
        onReaction={handleReaction}
        onOpenNewConversation={() => {
          clearNewConvError?.()
          setShowNewModal(true)
        }}
        inputRef={inputRef}
        messagesContainerRef={messagesContainerRef}
        messageElsRef={messageElsRef}
        onReply={beginReplyTo}
        replyTo={replyTo}
        onCancelReply={cancelReply}
        onJumpToMessage={scrollToMessageId}
        pendingFiles={pendingFiles}
        onAddFiles={addFiles}
        onRemovePendingFile={removePendingFile}
        messageSearch={messageSearch}
      />

      {/* ✅ CREATE */}
      <NewConversationModal
        open={showNewModal}
        onClose={() => {
          setShowNewModal(false)
          clearNewConvError?.()
        }}
        mode="create"
        onCreate={handleCreateConversation}
        users={usersArray}
        loggedInUserId={loggedInUserId}
        existingConversations={conversations}
        error={newConvError}
        onClearError={clearNewConvError}
      />

      {/* ✅ EDIT */}
      <NewConversationModal
        open={showEditModal}
        onClose={() => {
          closeEditConversation?.()
          clearEditConvError?.()
        }}
        mode="edit"
        conversation={editingConversation}
        onSave={handleUpdateConversation}
        users={usersArray}
        loggedInUserId={loggedInUserId}
        existingConversations={conversations}
        error={editConvError}
        onClearError={clearEditConvError}
      />
    </div>
  )

  if (!inModal) return inboxUI

  return (
    <MessagesModal
      open={open}
      onClose={onClose}
      title="Wiadomości"
      subtitle={unreadSubtitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle}
      headerToolbar={headerToolbar} // ✅ TU: w headerze modala
      size="xl"
      className="messages-modal"
    >
      {inboxUI}
    </MessagesModal>
  )
}
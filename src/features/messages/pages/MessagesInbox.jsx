// src/features/messages/pages/MessagesInboxView.jsx
import React, { useMemo } from 'react'

// ✅ MUSI być import stylów inboxa, inaczej wszystko robi się “białe”
import '../styles/index.css'

import MessagesModal from '../../../shared/modals/modals/MessagesModal'
import InboxSidebar from '../components/window/InboxSidebar'
import ChatWindow from '../components/window/ChatWindow'
import useInboxLogic from '../hooks/useInboxLogic'

// ✅ nasz modal z messages (nie z shared)
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

    conversations, // ✅ DODANE

    activeConversation,
    activeConversationId,
    searchQuery,
    newMessage,
    showEmojiPicker,
    showNewModal,

    filteredConversations,

    inputRef,
    messagesContainerRef,
    messageElsRef,

    pendingFiles,
    replyTo,
    messageSearch,
    messageHits,
    activeHitIdx,

    setActiveConversationId,
    setSearchQuery,
    setNewMessage,
    setShowEmojiPicker,
    setShowNewModal,

    addFiles,
    removePendingFile,
    beginReplyTo,
    cancelReply,

    setMessageSearch,
    clearMessageSearch,
    goPrevHit,
    goNextHit,
    scrollToMessageId,

    handleCreateConversation,
    handleSendMessage,
    handleReaction,
    handleDeleteConversation,
    handleEmojiClick,
  } = logic

  const contextTitle = useMemo(() => {
    const title = activeConversation?.name
    return title && String(title).trim() ? title : undefined
  }, [activeConversation])

  const contextSubtitle = useMemo(() => {
    if (!activeConversation?.members?.length) return undefined
    return `Uczestnicy: ${activeConversation.members.length}`
  }, [activeConversation])

  const usersArray = useMemo(() => {
    if (Array.isArray(users)) return users
    return Object.entries(users || {}).map(([id, name]) => ({ id, name }))
  }, [users])

  const inboxUI = (
    <div
      className={`message-inbox ${inModal ? 'message-inbox--modal' : ''}`}
      aria-label={inModal ? 'Wiadomości — modal' : 'Wiadomości'}
    >
      <InboxSidebar
        conversations={filteredConversations}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => setShowNewModal(true)}
        onDeleteConversation={handleDeleteConversation}
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
        onOpenNewConversation={() => setShowNewModal(true)}
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
        onChangeMessageSearch={setMessageSearch}
        onClearMessageSearch={clearMessageSearch}
        messageHits={messageHits}
        activeHitIdx={activeHitIdx}
        onPrevHit={goPrevHit}
        onNextHit={goNextHit}
      />

      {/* ✅ modal tworzenia rozmowy */}
      <NewConversationModal
        open={showNewModal}
        onCreate={handleCreateConversation}
        onClose={() => setShowNewModal(false)}
        loggedInUserId={loggedInUserId}
        users={usersArray}
        existingConversations={conversations}
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
      size="xl"
    >
      {inboxUI}
    </MessagesModal>
  )
}
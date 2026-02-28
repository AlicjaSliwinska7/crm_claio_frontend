// src/features/messages/pages/inbox/chat/ChatMessageList.jsx
import React, { useMemo } from 'react'
import ChatMessageItem from './ChatMessageItem'

function formatDateHeader(iso) {
	const date = new Date(iso)
	return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isSameDay(a, b) {
	if (!a || !b) return false
	const d1 = new Date(a)
	const d2 = new Date(b)
	return d1.toDateString() === d2.toDateString()
}

export default function ChatMessageList({
	messages,
	users,
	loggedInUserId,
	messageElsRef,
	messagesContainerRef,
	messageSearch,
	highlightText,
	onReply,
	onJumpToMessage,
	onReaction,
	reactOpenForId,
	setReactOpenForId,
	typingLabel,
}) {
	const byId = useMemo(() => {
		const map = new Map()
		;(messages || []).forEach((m) => {
			if (m?.id) map.set(m.id, m)
		})
		return map
	}, [messages])

	return (
		<div className="chat-messages" ref={messagesContainerRef}>
			{(messages || []).map((msg, idx, arr) => {
				const showDate = idx === 0 || !isSameDay(msg.timestamp, arr[idx - 1]?.timestamp)
				const showAuthor = idx === 0 || msg.sender !== arr[idx - 1]?.sender

				const replyTarget = msg.replyToId ? byId.get(msg.replyToId) : null

				return (
					<React.Fragment key={msg.id || `${msg.timestamp}-${idx}`}>
						{showDate && <div className="date-separator">{formatDateHeader(msg.timestamp)}</div>}

						<ChatMessageItem
							msg={msg}
							showAuthor={showAuthor}
							users={users}
							loggedInUserId={loggedInUserId}
							messageElsRef={messageElsRef}
							messageSearch={messageSearch}
							highlightText={highlightText}
							replyTarget={replyTarget}
							onJumpToMessage={onJumpToMessage}
							onReply={onReply}
							onReaction={onReaction}
							reactOpenForId={reactOpenForId}
							setReactOpenForId={setReactOpenForId}
						/>
					</React.Fragment>
				)
			})}

			{typingLabel ? <div className="typing-indicator">{typingLabel}</div> : null}
		</div>
	)
}

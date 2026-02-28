// src/features/messages/pages/inbox/chat/ChatMessageItem.jsx
import React, { useMemo } from 'react'

function fileSizePretty(bytes) {
	if (!bytes || typeof bytes !== 'number') return ''
	const kb = bytes / 1024
	if (kb < 1024) return `${Math.round(kb)} KB`
	const mb = kb / 1024
	return `${mb.toFixed(1)} MB`
}

export default function ChatMessageItem({
	msg,
	showAuthor,
	users,
	loggedInUserId,
	messageElsRef,
	messageSearch,
	highlightText,
	replyTarget,
	onJumpToMessage,
	onReply,
	onReaction,
	reactOpenForId,
	setReactOpenForId,
}) {
	const isOwn = msg.sender === loggedInUserId
	const isReactOpen = reactOpenForId === msg.id

	const reactionCounts = useMemo(() => {
		const acc = {}
		Object.values(msg.reactions || {}).forEach((emoji) => {
			acc[emoji] = (acc[emoji] || 0) + 1
		})
		return acc
	}, [msg.reactions])

	const timeLabel = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

	return (
		<div
			ref={(el) => {
				if (el && msg.id) messageElsRef.current[msg.id] = el
			}}
			className={`message-block ${isOwn ? 'own' : ''}`}
		>
			{showAuthor && <div className="message-author">{users?.[msg.sender] || msg.sender}</div>}

			<div
				className={`message ${isOwn ? 'own' : ''}`}
				onMouseEnter={() => setReactOpenForId(msg.id)}
				onMouseLeave={() => setReactOpenForId((cur) => (cur === msg.id ? null : cur))}
			>
				{replyTarget && (
					<button
						className="reply-preview"
						type="button"
						onClick={() => onJumpToMessage?.(replyTarget.id)}
						title="Przejdź do wiadomości, na którą odpowiadasz"
						aria-label="Przejdź do wiadomości, na którą odpowiadasz"
					>
						<div className="reply-preview__who">{users?.[replyTarget.sender] || replyTarget.sender}</div>
						<div className="reply-preview__text">{(replyTarget.text || '').slice(0, 140) || '—'}</div>
					</button>
				)}

				<div className="message-text">{highlightText(msg.text, messageSearch)}</div>

				{Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
					<div className="msg-files" aria-label="Załączniki w wiadomości">
						{msg.attachments.map((a) => (
							<div key={a.id || a.name} className="msg-file">
								<span className="msg-file__name">{a.name}</span>
								{typeof a.size === 'number' && a.size > 0 ? (
									<span className="msg-file__size">{fileSizePretty(a.size)}</span>
								) : null}
							</div>
						))}
					</div>
				)}

				{/* ✅ pasek reakcji — po kliknięciu chowamy go (robi to ChatWindow) */}
				{isReactOpen && (
					<div className="reaction-bar" onMouseDown={(e) => e.preventDefault()} role="group" aria-label="Dodaj reakcję">
						{['👍', '❤️', '😂', '😮'].map((emoji) => (
							<button
								key={emoji}
								type="button"
								className="reaction-btn"
								onClick={() => onReaction?.(msg.id, emoji)}
								aria-label={`Dodaj reakcję ${emoji}`}
							>
								<span className="reaction-emoji" aria-hidden="true">
									{emoji}
								</span>
							</button>
						))}
					</div>
				)}

				{Object.keys(reactionCounts).length > 0 && (
					<div className="message-reactions">
						{Object.entries(reactionCounts).map(([emoji, count]) => (
							<span key={emoji} className="message-reactions__chip">
								<span className="reaction-emoji" aria-hidden="true">
									{emoji}
								</span>
								<span className="message-reactions__count">{count}</span>
							</span>
						))}
					</div>
				)}
			</div>

			<div className="message-time">
				{timeLabel} {isOwn && msg.read ? '✓✓' : ''}

				{/* ✅ reply zawsze klikalne (reaction bar nie powinien tego zasłaniać — CSS ogarniemy) */}
				<button className="msg-reply-btn" type="button" onClick={() => onReply?.(msg)} title="Odpowiedz" aria-label="Odpowiedz">
					↩
				</button>
			</div>
		</div>
	)
}

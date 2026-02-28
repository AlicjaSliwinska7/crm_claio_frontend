// src/features/messages/components/inbox/ChatMessages.jsx
import React, { useMemo } from 'react'
import { formatDateHeader, isSameDay } from './inbox.utils'

const esc = (s) => (s || '').toString()
const norm = (s) => esc(s).toLowerCase()

function highlightText(text, query) {
	if (!query) return text
	const t = esc(text)
	const q = esc(query).trim()
	if (!q) return t

	const tl = t.toLowerCase()
	const ql = q.toLowerCase()

	const parts = []
	let idx = 0
	while (true) {
		const found = tl.indexOf(ql, idx)
		if (found === -1) {
			parts.push({ type: 'text', value: t.slice(idx) })
			break
		}
		if (found > idx) parts.push({ type: 'text', value: t.slice(idx, found) })
		parts.push({ type: 'hit', value: t.slice(found, found + q.length) })
		idx = found + q.length
	}
	return parts
}

export default function ChatMessages({
	messages,
	users,
	loggedInUserId,
	onReaction,
	onReply,
	containerRef,

	// ✅ reply-to / jump
	onJumpToMessage,

	// ✅ search
	messageSearch,
	messageHits,
	activeHitIdx,

	// ✅ refs map
	messageElsRef,
}) {
	const hitSet = useMemo(() => new Set(messageHits || []), [messageHits])

	return (
		<div className="chat-messages" ref={containerRef}>
			{messages.map((msg, idx, arr) => {
				const showDate = idx === 0 || !isSameDay(msg.timestamp, arr[idx - 1]?.timestamp)
				const showAuthor = idx === 0 || msg.sender !== arr[idx - 1]?.sender
				const isOwn = msg.sender === loggedInUserId

				const reactionCounts = Object.values(msg.reactions || {}).reduce((acc, emoji) => {
					acc[emoji] = (acc[emoji] || 0) + 1
					return acc
				}, {})

				const isHit = messageSearch?.trim() ? hitSet.has(msg.id) : false
				const isActiveHit = messageSearch?.trim() && messageHits?.length
					? msg.id === messageHits[activeHitIdx]
					: false

				const parts = highlightText(msg.text, messageSearch)

				return (
					<React.Fragment key={msg.id || `${msg.timestamp}-${idx}`}>
						{showDate && <div className="date-separator">{formatDateHeader(msg.timestamp)}</div>}

						<div
							ref={(el) => {
								if (!messageElsRef?.current) return
								if (el) messageElsRef.current.set(msg.id, el)
								else messageElsRef.current.delete(msg.id)
							}}
							className={[
								'message-block',
								isOwn ? 'own' : '',
								isHit ? 'message-block--hit' : '',
								isActiveHit ? 'message-block--activehit' : '',
							].filter(Boolean).join(' ')}
						>
							{showAuthor && <div className="message-author">{users[msg.sender]}</div>}

							<div className={`message ${isOwn ? 'own' : ''}`}>
								{/* ✅ Reply quote (jeśli wiadomość jest odpowiedzią na inną) */}
								{msg.replyTo?.id && (
									<button
										type="button"
										className="reply-quote"
										onClick={() => onJumpToMessage?.(msg.replyTo.id)}
										title="Przejdź do wiadomości, na którą odpowiadasz"
									>
										<span className="reply-quote__who">{users[msg.replyTo.sender] || msg.replyTo.sender}</span>
										<span className="reply-quote__text">{(msg.replyTo.text || '').toString()}</span>
									</button>
								)}

								{/* tekst z highlightem */}
								<div className="message-text">
									{Array.isArray(parts)
										? parts.map((p, i) =>
												p.type === 'hit' ? (
													<mark key={i} className="msg-hit">
														{p.value}
													</mark>
												) : (
													<span key={i}>{p.value}</span>
												)
										  )
										: parts}
								</div>

								{/* ✅ Attachments (mock meta) */}
								{Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
									<div className="msg-files" aria-label="Załączniki">
										{msg.attachments.map((f) => (
											<div key={f.id || f.name} className="msg-file" title={f.name}>
												<span className="msg-file__icon" aria-hidden="true">📎</span>
												<span className="msg-file__name">{f.name}</span>
											</div>
										))}
									</div>
								)}

								{/* reakcje + reply */}
								<div className="reaction-bar fade-in" onMouseDown={(e) => e.preventDefault()}>
									{['👍', '❤️', '😂', '😮'].map((emoji, i) => (
										<span
											key={i}
											className="reaction-btn"
											onClick={() => onReaction(idx, emoji)}
											role="button"
											aria-label={`Dodaj reakcję ${emoji}`}
										>
											{emoji}
										</span>
									))}
									<button
										type="button"
										className="reply-btn"
										onClick={() => onReply?.(msg)}
										aria-label="Odpowiedz na wiadomość"
										title="Odpowiedz"
									>
										↩
									</button>
								</div>

								{Object.keys(reactionCounts).length > 0 && (
									<div className="message-reactions">
										{Object.entries(reactionCounts).map(([emoji, count]) => (
											<span key={emoji}>
												{emoji} {count}
											</span>
										))}
									</div>
								)}
							</div>

							<div className="message-time">
								{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
								{isOwn && msg.read ? '✓✓' : ''}
							</div>
						</div>
					</React.Fragment>
				)
			})}
		</div>
	)
}

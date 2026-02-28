// src/features/messages/pages/inbox/chat/ChatComposer.jsx
import React, { useMemo } from 'react'
import EmojiPickerPopover from './EmojiPickerPopover'

function fileSizePretty(bytes) {
	if (!bytes || typeof bytes !== 'number') return ''
	const kb = bytes / 1024
	if (kb < 1024) return `${Math.round(kb)} KB`
	const mb = kb / 1024
	return `${mb.toFixed(1)} MB`
}

export default function ChatComposer({
	value,
	onChange,
	onSend,
	inputRef,

	showEmojiPicker,
	onToggleEmoji,
	onEmojiPick,

	pendingFiles,
	onAddFiles,
	onRemovePendingFile,

	replyTo,
	users,
	onCancelReply,
	onJumpToMessage,
}) {
	const canSend = String(value || '').trim().length > 0 || (pendingFiles?.length ?? 0) > 0

	const replyLabel = useMemo(() => {
		if (!replyTo) return ''
		return users?.[replyTo.sender] || replyTo.sender
	}, [replyTo, users])

	return (
		<div className="chat-input">
			<div className="composer">
				<button className="emoji-toggle-btn" onClick={onToggleEmoji} title="Emoji" aria-label="Wstaw emoji" type="button">
					😊
				</button>

				{showEmojiPicker && (
					<EmojiPickerPopover
						onPick={onEmojiPick}
						onClose={onToggleEmoji}
						anchorSelector=".emoji-toggle-btn"
						title="Emoji"
					/>
				)}

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
					value={value || ''}
					onChange={(e) => onChange?.(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							onSend?.()
						}
					}}
					placeholder="Napisz wiadomość... (Enter = wyślij)"
					aria-label="Napisz wiadomość"
				/>

				<button className="btn btn-primary" onClick={onSend} aria-label="Wyślij wiadomość" type="button" disabled={!canSend}>
					Wyślij
				</button>
			</div>

			{replyTo && (
				<div className="reply-bar" aria-label="Odpowiedź do wiadomości">
					<div className="reply-bar__left">
						<div className="reply-bar__meta">
							Odpowiadasz na: <b>{replyLabel}</b>
						</div>
						<div className="reply-bar__text">{(replyTo.text || '').slice(0, 170) || '—'}</div>
					</div>

					<div className="reply-bar__actions">
						<button className="reply-bar__jump" onClick={() => onJumpToMessage?.(replyTo.id)} type="button">
							Pokaż
						</button>
						<button
							className="reply-bar__cancel"
							onClick={onCancelReply}
							type="button"
							aria-label="Anuluj odpowiedź"
							title="Anuluj odpowiedź"
						>
							×
						</button>
					</div>
				</div>
			)}

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
		</div>
	)
}

// src/features/messages/components/inbox/ChatInput.jsx
import React, { lazy, Suspense, useRef } from 'react'

// Lazy emoji picker – nie blokuje renderu, gdy paczki brak
const LazyEmojiPicker = lazy(() => import('emoji-picker-react').catch(() => ({ default: () => null })))

export default function ChatInput({
	inputRef,
	value,
	onChange,
	onSend,
	showEmojiPicker,
	onToggleEmoji,
	onEmojiPick,

	// ✅ files
	pendingFiles,
	onAddFiles,
	onRemovePendingFile,

	// ✅ reply
	replyTo,
	onCancelReply,
	users,

	// ✅ DnD info (optional)
}) {
	const fileInputRef = useRef(null)

	const openFilePicker = () => fileInputRef.current?.click?.()

	return (
		<div className="chat-input" aria-label="Pole wpisywania wiadomości">
			{/* ✅ Reply preview */}
			{replyTo?.id && (
				<div className="composer-reply" role="status" aria-label="Odpowiedź do wiadomości">
					<div className="composer-reply__text">
						<span className="composer-reply__label">Odpowiedź do:</span>{' '}
						<strong>{users?.[replyTo.sender] || replyTo.sender}</strong> —{' '}
						<span className="composer-reply__snippet">{replyTo.text}</span>
					</div>
					<button className="composer-reply__close" onClick={onCancelReply} aria-label="Anuluj odpowiedź" title="Anuluj">
						×
					</button>
				</div>
			)}

			{/* ✅ pending files */}
			{Array.isArray(pendingFiles) && pendingFiles.length > 0 && (
				<div className="composer-files" aria-label="Załączniki do wysłania">
					{pendingFiles.map((f) => (
						<div key={f.id} className="composer-file" title={f.name}>
							<span className="composer-file__icon" aria-hidden="true">📎</span>
							<span className="composer-file__name">{f.name}</span>
							<button
								type="button"
								className="composer-file__remove"
								onClick={() => onRemovePendingFile?.(f.id)}
								aria-label={`Usuń plik ${f.name}`}
								title="Usuń"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			<div className="chat-input__row">
				<button
					className="emoji-toggle-btn"
					onClick={onToggleEmoji}
					title="Emoji"
					aria-label="Wstaw emoji"
					type="button"
				>
					😊
				</button>

				{showEmojiPicker && (
					<div className="emoji-picker-wrapper" onMouseDown={(e) => e.preventDefault()}>
						<Suspense fallback={null}>
							<LazyEmojiPicker onEmojiClick={onEmojiPick} />
						</Suspense>
					</div>
				)}

				{/* ✅ Attach: click → picker */}
				<button
					type="button"
					className="file-attach"
					title="Dodaj załącznik"
					aria-label="Dodaj załącznik"
					onClick={openFilePicker}
				>
					📎
				</button>

				<input
					ref={fileInputRef}
					type="file"
					multiple
					style={{ display: 'none' }}
					onChange={(e) => {
						if (e.target.files?.length) onAddFiles?.(e.target.files)
						// reset value, żeby ponownie można było wybrać ten sam plik
						e.target.value = ''
					}}
				/>

				<input
					ref={inputRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							onSend()
						}
					}}
					placeholder="Napisz wiadomość…"
					aria-label="Napisz wiadomość"
				/>

				<button onClick={onSend} aria-label="Wyślij wiadomość" type="button">
					Wyślij
				</button>
			</div>
		</div>
	)
}

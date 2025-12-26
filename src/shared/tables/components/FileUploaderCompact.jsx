// src/shared/tables/components/FileUploaderCompact.jsx
import React, { useRef, useState, useId } from 'react'

/**
 * FileUploaderCompact — lekki, uniwersalny uploader (1 plik).
 * - używa klas .file-uploader / .upload-dropzone / .input-file / .upload-list...
 * - styl bierze z CSS modułu „registers-*”
 */
export default function FileUploaderCompact({
	accept = '',
	value = null, // File | null
	onChange, // (file|null) => void
	error = '', // string (komunikat błędu)
	onValidate, // (file|null) => string (zwraca błąd do rodzica)
}) {
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef(null)
	const baseId = useId()
	const errorId = `${baseId}-error`

	const setFile = file => {
		// wyślij do rodzica
		onChange?.(file || null)

		// jeśli rodzic chce walidować — pozwól mu
		if (onValidate) {
			onValidate(file || null)
		}
	}

	const onPickFile = e => {
		const f = e.target.files?.[0] || null
		setFile(f)
	}

	const clearFile = () => {
		onChange?.(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
		onValidate?.(null)
	}

	const openFileDialog = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className='file-uploader file-uploader--compact' style={{ minWidth: 280 }}>
			<div
				className={`upload-dropzone ${isDragging ? 'is-dragover' : ''}`}
				tabIndex={0}
				onClick={openFileDialog}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						openFileDialog()
					}
				}}
				onDragEnter={e => {
					e.preventDefault()
					setIsDragging(true)
				}}
				onDragOver={e => e.preventDefault()}
				onDragLeave={() => setIsDragging(false)}
				onDrop={e => {
					e.preventDefault()
					setIsDragging(false)
					const f = e.dataTransfer?.files?.[0] || null
					setFile(f)
				}}>
				<input
					ref={fileInputRef}
					id={baseId}
					className='input-file'
					type='file'
					accept={accept}
					onChange={onPickFile}
					aria-invalid={!!error}
					aria-describedby={error ? errorId : undefined}
				/>
			</div>

			{error && (
				<small id={errorId} className='field-error' aria-live='assertive'>
					{error}
				</small>
			)}

			{value && (
				<ul className='upload-list' aria-live='polite'>
					<li className='upload-item is-success' key={value.name}>
						<div className='upload-item__thumb'>FILE</div>
						<div className='upload-item__meta'>
							<div className='upload-item__name' title={value.name}>
								{value.name}
							</div>
							<div className='upload-item__details'>
								{Number.isFinite(value.size) ? `${(value.size / 1024).toFixed(value.size < 10 * 1024 ? 1 : 0)} KB` : ''}{' '}
								• {value.type || 'plik'}
							</div>
						</div>
						<div className='upload-item__actions'>
							<button type='button' className='upload-remove' onClick={clearFile} title='Usuń'>
								✕
							</button>
						</div>
					</li>
				</ul>
			)}
		</div>
	)
}

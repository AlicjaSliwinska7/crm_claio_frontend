// src/shared/tables/components/DocumentPreviewModal.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Modal } from '../../modals' // dostosuj ścieżkę do swojej struktury

/**
 * DocumentPreviewModal
 *
 * Props:
 *  - open: bool
 *  - onClose: () => void
 *  - title: string
 *  - url: string
 *  - mime: string
 *  - meta: { size?, uploadedBy?, uploadedAt? }
 */
function DocumentPreviewModal({ open, onClose, title = 'Podgląd dokumentu', url, mime, meta }) {
	if (!open) return null

	const safeMime = mime || ''
	const isImage = safeMime.startsWith('image/')
	const isPdf = safeMime === 'application/pdf' || (url && url.endsWith('.pdf'))

	return (
		<Modal title={title} onClose={onClose} size='lg'>
			<div className='doc-preview' style={{ display: 'grid', gap: 12 }}>
				{meta && (
					<div className='doc-preview__meta muted' style={{ fontSize: 13 }}>
						{meta.size && <span>Rozmiar: {meta.size} • </span>}
						{meta.uploadedBy && <span>Wgrał(a): {meta.uploadedBy} • </span>}
						{meta.uploadedAt && <span>Data: {meta.uploadedAt}</span>}
					</div>
				)}

				{url ? (
					<>
						{isPdf && (
							<iframe
								title='Podgląd PDF'
								src={url}
								style={{
									width: '100%',
									height: '70vh',
									border: '1px solid #e5e7eb',
									borderRadius: 8,
								}}
								allowFullScreen
							/>
						)}

						{isImage && !isPdf && (
							<img
								alt={title}
								src={url}
								style={{
									maxWidth: '100%',
									maxHeight: '70vh',
									objectFit: 'contain',
									borderRadius: 8,
									border: '1px solid #e5e7eb',
								}}
							/>
						)}

						{!isPdf && !isImage && (
							<a
								href={url}
								target='_blank'
								rel='noreferrer'
								className='m-btn m-btn--primary'
								style={{ justifySelf: 'start' }}>
								Otwórz w nowej karcie
							</a>
						)}
					</>
				) : (
					<p className='muted' style={{ fontSize: 13 }}>
						Brak adresu dokumentu.
					</p>
				)}
			</div>
		</Modal>
	)
}

DocumentPreviewModal.propTypes = {
	open: PropTypes.bool,
	onClose: PropTypes.func,
	title: PropTypes.string,
	url: PropTypes.string,
	mime: PropTypes.string,
	meta: PropTypes.shape({
		size: PropTypes.string,
		uploadedBy: PropTypes.string,
		uploadedAt: PropTypes.string,
	}),
}

export default memo(DocumentPreviewModal)

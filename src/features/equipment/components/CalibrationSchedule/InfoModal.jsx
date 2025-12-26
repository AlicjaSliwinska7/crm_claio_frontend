import React from 'react'
import Modal from '../../../../shared/modals/modals/Modal'

export default function InfoModal({ open, title = 'Informacja', message = '', onClose }) {
	if (!open) return null

	return (
		<Modal title={title} onClose={onClose} className='ui-modal ui-modal--x-narrow'>
			<div className='m-section'>
				<p style={{ margin: 0 }}>{message}</p>
			</div>

			<div className='m-actions m-actions--footer'>
				<button type='button' className='m-btn m-btn--primary' onClick={onClose} autoFocus>
					OK
				</button>
			</div>
		</Modal>
	)
}

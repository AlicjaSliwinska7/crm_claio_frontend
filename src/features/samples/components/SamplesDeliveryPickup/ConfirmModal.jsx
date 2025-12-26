import React from 'react'
import Modal from '../../../../shared/modals/modals/Modal'
import '../../../../shared/modals/styles/form-modal.css'

export default function ConfirmModal({
	open,
	type, // 'deliver' | 'pickup'
	date,
	setDate,
	onConfirm,
	onClose,
	size = 'sm', // 👈 domyślnie węższy modal
}) {
	if (!open) return null

	const isDeliver = type === 'deliver'
	const title = isDeliver ? 'Potwierdź dostawę próbek' : 'Potwierdź odbiór próbek'
	const label = isDeliver ? 'Data dostawy' : 'Data odbioru'

	return (
		<Modal title={title} onClose={onClose} size={size}>
			<form
				className='m-form'
				onSubmit={e => {
					e.preventDefault()
					onConfirm()
				}}>
				<div className='m-field'>
					<label className='m-label' htmlFor='confirm-date'>
						{label}
					</label>
					<input
						id='confirm-date'
						type='date'
						className='m-input'
						value={date}
						onChange={e => setDate(e.target.value)}
					/>
				</div>

				<div className='m-actions--footer' role='toolbar' aria-label='Akcje potwierdzenia'>
					<button type='submit' className='m-btn m-btn--primary'>
						Zatwierdź
					</button>
					<button type='button' className='m-btn m-btn--secondary' onClick={onClose}>
						Anuluj
					</button>
				</div>
			</form>
		</Modal>
	)
}

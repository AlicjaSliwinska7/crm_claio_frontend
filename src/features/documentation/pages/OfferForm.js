import React, { useState, useEffect } from 'react'

function OfferForm({ offer, onSave, onClose }) {
	const [formData, setFormData] = useState({
		number: '',
		company: '',
		contactPerson: '',
		contactEmail: '',
		createDate: '',
		expiryDate: '',
		status: '',
		amount: '',
		subject: '',
		sampleSize: '',
		standard: '',
	})

	useEffect(() => {
		if (offer) {
			setFormData(offer)
		}
	}, [offer])

	const handleChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = e => {
		e.preventDefault()
		onSave(formData)
	}

	return (
		<form onSubmit={handleSubmit} className='modal-form'>
			<h4>{offer ? 'Edytuj ofertę' : 'Nowa oferta'}</h4>

			<input
				type='text'
				name='company'
				placeholder='Nazwa firmy'
				value={formData.company}
				onChange={handleChange}
				required
			/>
			<input
				type='text'
				name='contactPerson'
				placeholder='Osoba kontaktowa'
				value={formData.contactPerson}
				onChange={handleChange}
			/>
			<input
				type='text'
				name='contactEmail'
				placeholder='e-mail'
				value={formData.contactEmail}
				onChange={handleChange}
			/>
			<input type='date' name='validUntil' value={formData.createDate} onChange={handleChange} />
			<input type='date' name='validUntil' value={formData.expiryDate} onChange={handleChange} />
			<select name='status' value={formData.status} onChange={handleChange}>
				<option value=''>Status oferty</option>
				<option value='w przygotowaniu'>w przygotowaniu</option>
				<option value='wysłana'>wysłana</option>
				<option value='przyjęta'>przyjęta</option>
				<option value='odrzucona'>odrzucona</option>
			</select>
			<input type='text' name='amount' placeholder='Kwota' value={formData.amount} onChange={handleChange} />
			<input
				type='text'
				name='subject'
				placeholder='Przedmiot badań'
				value={formData.subject}
				onChange={handleChange}
			/>
			<input
				type='number'
				name='sampleSize'
				placeholder='Liczebność próbki'
				value={formData.sampleSize}
				onChange={handleChange}
			/>
			<input type='text' name='standard' placeholder='Badania według' value={formData.standard} onChange={handleChange} />

			<div className='modal-buttons'>
				<button type='submit'>Zapisz</button>
				<button type='button' onClick={onClose}>
					Anuluj
				</button>
			</div>
		</form>
	)
}

export default OfferForm

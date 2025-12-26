import React, { useState, useEffect } from 'react'

function SampleForm({ sample, onSave, onClose }) {
	const [formData, setFormData] = useState({
		receivedDate: '',
		contractNumber: '',
		code: '',
		sampleNumber: '',
		subject: '',
		quantity: '',
		client: '',
		scope: '',
		disposal: '',
		notes: '',
		status: '',
		returnDate: '',
		comment: '',
	})

	useEffect(() => {
		if (sample) {
			setFormData(sample)
		}
	}, [sample])

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
			<h4>{sample ? 'Edytuj próbkę' : 'Nowa próbka'}</h4>

			<input type='date' name='receivedDate' value={formData.receivedDate} onChange={handleChange} required />
			<input
				type='text'
				name='contractNumber'
				placeholder='Nr zlecenia / umowy'
				value={formData.contractNumber}
				onChange={handleChange}
			/>
			<input type='text' name='code' placeholder='KOD' value={formData.code} onChange={handleChange} />
			<input type='text' name='sampleNumber' placeholder='Nr próbki' value={formData.sampleNumber} onChange={handleChange} />
			<input
				type='text'
				name='subject'
				placeholder='Przedmiot badań / wyrób'
				value={formData.subject}
				onChange={handleChange}
			/>
			<input type='number' name='quantity' placeholder='Ilość sztuk' value={formData.quantity} onChange={handleChange} />
			<input type='text' name='client' placeholder='Zleceniodawca' value={formData.client} onChange={handleChange} />
			<input type='text' name='scope' placeholder='Zakres badań' value={formData.scope} onChange={handleChange} />
			<select name='disposal' value={formData.disposal} onChange={handleChange}>
				<option value=''>Próbka po badaniu</option>
				<option value='zwrot'>zwrot</option>
				<option value='likwidacja'>likwidacja</option>
			</select>
			<input type='text' name='notes' placeholder='Uwagi' value={formData.notes} onChange={handleChange} />
			<select name='status' value={formData.status} onChange={handleChange} required>
				<option value=''>Status</option>
				<option value='zarejestrowane'>zarejestrowane</option>
				<option value='przyjęte'>przyjęte</option>
				<option value='w trakcie badań'>w trakcie badań</option>
				<option value='do zwrotu'>do zwrotu</option>
				<option value='do utylizacji'>do utylizacji</option>
			</select>
			<input type='date' name='returnDate' value={formData.returnDate} onChange={handleChange} />
			<input type='text' name='comment' placeholder='Komentarz' value={formData.comment} onChange={handleChange} />

			<div className='modal-buttons'>
				<button type='submit'>Zapisz</button>
				<button type='button' onClick={onClose}>
					Anuluj
				</button>
			</div>
		</form>
	)
}

export default SampleForm

// src/components/pages/forms/ContactForm.jsx
import React from 'react'

// Upewnij się, że ścieżka do DeptSuggest jest poprawna dla Twojego drzewa plików.
// Jeśli komponent faktycznie żyje w src/components/ContactList/DeptSuggest,
// a ten plik jest w src/components/pages/forms/, wtedy ścieżka powinna być "../../ContactList/DeptSuggest".
import DeptSuggest from '../../../shared/forms/DeptSuggest'

import { pipe, trim, normalizeSpaces, titleCase, toUpper, toLower } from '../../../shared/utils/formatters'

// ⬇️ Telefoniczne formatery przenieśliśmy do osobnego modułu:
import { formatInternal, formatExternal } from '../../../shared/utils/phone'

export default function ContactForm({
	form = {},
	setForm = () => {},
	errors = {},
	setErrors = () => {},
	departmentOptions = [],
	onSubmitForm = e => e.preventDefault(),
	onClose = () => {},
}) {
	const onFieldChange = (name, formatter) => eOrVal => {
		const raw = eOrVal?.target ? eOrVal.target.value : eOrVal
		const value = formatter ? formatter(raw ?? '') : raw ?? ''
		setForm(prev => ({ ...prev, [name]: value }))
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
	}

	const err = name => Boolean(errors?.[name])

	return (
		<form onSubmit={onSubmitForm} className='m-form modal-form' noValidate>
			{/* ===== Sekcja: Dane kontaktowe ===== */}
			<section className='m-section' aria-labelledby='cf_section_contact'>
				<h6 id='cf_section_contact' className='m-section__title'>
					Dane kontaktowe
				</h6>

				{/* Imię */}
				<div className={`m-field ${err('firstName') ? 'm--invalid' : ''}`}>
					<label className='m-label' htmlFor='cf_firstName'>
						Imię <span aria-hidden='true'>*</span>
					</label>
					<input
						id='cf_firstName'
						name='firstName'
						placeholder='Imię'
						value={form.firstName ?? ''}
						onChange={onFieldChange('firstName', pipe(normalizeSpaces, titleCase))}
						aria-invalid={err('firstName')}
						className='m-input'
						autoComplete='off'
					/>
					{err('firstName') && <div className='m-error'>{errors.firstName}</div>}
				</div>

				{/* Nazwisko */}
				<div className={`m-field ${err('lastName') ? 'm--invalid' : ''}`}>
					<label className='m-label' htmlFor='cf_lastName'>
						Nazwisko <span aria-hidden='true'>*</span>
					</label>
					<input
						id='cf_lastName'
						name='lastName'
						placeholder='Nazwisko'
						value={form.lastName ?? ''}
						onChange={onFieldChange('lastName', pipe(normalizeSpaces, titleCase))}
						aria-invalid={err('lastName')}
						className='m-input'
						autoComplete='off'
					/>
					{err('lastName') && <div className='m-error'>{errors.lastName}</div>}
				</div>

				{/* Dział (podpowiedzi) */}
				<div className='m-field'>
					<label className='m-label' htmlFor='cf_department'>
						Dział
					</label>
					<DeptSuggest
						id='cf_department'
						value={form.department ?? ''}
						onChange={onFieldChange('department', pipe(normalizeSpaces, titleCase))}
						options={departmentOptions}
						placeholder='Dział'
						/* Większość komponentów przyjmie className; część – inputClassName.
               Dajemy oba dla kompatybilności. */
						className='m-input'
						inputClassName='m-input'
					/>
				</div>

				{/* Stanowisko */}
				<div className='m-field'>
					<label className='m-label' htmlFor='cf_position'>
						Stanowisko
					</label>
					<input
						id='cf_position'
						name='position'
						placeholder='Stanowisko'
						value={form.position ?? ''}
						onChange={onFieldChange('position', pipe(normalizeSpaces, titleCase))}
						className='m-input'
						autoComplete='off'
					/>
				</div>

				{/* Telefony i e-mail */}
				<div className={`m-field ${err('phoneInternal') ? 'm--invalid' : ''}`}>
					<label className='m-label' htmlFor='cf_phoneInternal'>
						Tel. wewnętrzny
					</label>
					<input
						id='cf_phoneInternal'
						name='phoneInternal'
						placeholder='Tel. wewn. (2–6 cyfr)'
						inputMode='numeric'
						pattern='[0-9]{2,6}'
						title='Podaj 2–6 cyfr, bez spacji.'
						value={form.phoneInternal ?? ''}
						onChange={onFieldChange('phoneInternal', formatInternal)}
						aria-invalid={err('phoneInternal')}
						className='m-input'
						autoComplete='off'
					/>
					{err('phoneInternal') && <div className='m-error'>{errors.phoneInternal}</div>}
				</div>

				<div className={`m-field ${err('phoneExternal') ? 'm--invalid' : ''}`}>
					<label className='m-label' htmlFor='cf_phoneExternal'>
						Tel. zewnętrzny
					</label>
					<input
						id='cf_phoneExternal'
						name='phoneExternal'
						placeholder='Tel. zewn. (7–15 cyfr)'
						inputMode='tel'
						title='Tylko cyfry, formatujemy automatycznie w grupy po 3.'
						value={form.phoneExternal ?? ''}
						onChange={onFieldChange('phoneExternal', formatExternal)}
						aria-invalid={err('phoneExternal')}
						className='m-input'
						autoComplete='off'
					/>
					{err('phoneExternal') && <div className='m-error'>{errors.phoneExternal}</div>}
				</div>

				<div className={`m-field ${err('email') ? 'm--invalid' : ''}`}>
					<label className='m-label' htmlFor='cf_email'>
						E-mail
					</label>
					<input
						id='cf_email'
						name='email'
						placeholder='E-mail'
						inputMode='email'
						value={form.email ?? ''}
						onChange={onFieldChange('email', pipe(trim, toLower))}
						aria-invalid={err('email')}
						className='m-input'
						autoComplete='off'
					/>
					{err('email') && <div className='m-error'>{errors.email}</div>}
				</div>
			</section>

			{/* ===== Sekcja: Lokalizacja ===== */}
			<section className='m-section' aria-labelledby='cf_section_location'>
				<h6 id='cf_section_location' className='m-section__title'>
					Lokalizacja
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<label className='m-label' htmlFor='cf_building'>
							Budynek
						</label>
						<input
							id='cf_building'
							name='building'
							placeholder='Budynek (np. A)'
							value={form.building ?? ''}
							onChange={onFieldChange('building', pipe(trim, toUpper))}
							className='m-input'
							autoComplete='off'
						/>
					</div>

					<div className='m-field'>
						<label className='m-label' htmlFor='cf_room'>
							Pokój
						</label>
						<input
							id='cf_room'
							name='room'
							placeholder='Pokój (np. 101)'
							value={form.room ?? ''}
							onChange={onFieldChange('room', trim)}
							className='m-input'
							autoComplete='off'
						/>
					</div>
				</div>
			</section>

			{/* ===== Akcje (sticky w body) ===== */}
			<div className='m-actions m-actions--footer'>
				<button type='button' className='m-btn m-btn--secondary' onClick={onClose}>
					Anuluj
				</button>
				<button type='submit' className='m-btn m-btn--primary m-btn--lg'>
					Zapisz
				</button>
			</div>
		</form>
	)
}

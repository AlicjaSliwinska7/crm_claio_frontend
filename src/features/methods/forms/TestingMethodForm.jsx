import React from 'react'

/**
 * Dozwolone znaki w methodNo: litery/cyfry, -, _, /, .
 */
function sanitizeMethodNo(raw) {
	if (!raw) return ''
	let s = String(raw).replace(/\s+/g, '')
	s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
	s = s.replace(/[^A-Za-z0-9._\-\/]/g, '')
	return s
}

/**
 * TestingMethodForm
 * – czysty formularz (bez modala), gotowy do użycia w .ui-modal (form-modal.css)
 *
 * Props:
 * - form: { standardNo, title, methodNo, methodName, accredited }
 * - setForm: fn(updater)
 * - knownStandards: string[] — podpowiedzi do nr normy (datalist)
 * - existingMethodNosForStandard: string[] — podpowiedzi do nr metody w wybranej normie (datalist)
 * - formErr: string — błąd „twardy” (np. duplikat metody)
 * - softWarn: string — ostrzeżenie „miękkie” (np. usunięto PL znaki)
 * - setSoftWarn: fn(string)
 * - onSubmit: fn(event)
 * - onCancel: fn()
 * - isEditing?: boolean — wpływa tylko na label przycisku zapisu
 */
export default function TestingMethodForm({
	form,
	setForm,
	knownStandards = [],
	existingMethodNosForStandard = [],
	formErr = '',
	softWarn = '',
	setSoftWarn = () => {},
	onSubmit,
	onCancel,
	isEditing = false,
}) {
	const { standardNo = '', title = '', methodNo = '', methodName = '', accredited = false } = form || {}

	return (
		<form className='m-form' onSubmit={onSubmit}>
			{/* Nr normy/dokumentu */}
			<div className='m-field'>
				<label className='m-label' htmlFor='tmf-standardNo'>
					Nr normy/dokumentu*
				</label>
				<input
					id='tmf-standardNo'
					className='m-input'
					type='text'
					list='tmf-standards-list'
					value={standardNo}
					onChange={e => setForm(f => ({ ...f, standardNo: e.target.value }))}
					required
				/>
				<datalist id='tmf-standards-list'>
					{knownStandards.map(no => (
						<option key={no} value={no} />
					))}
				</datalist>
			</div>

			{/* Tytuł normy/dokumentu */}
			<div className='m-field'>
				<label className='m-label' htmlFor='tmf-title'>
					Tytuł normy/dokumentu*
				</label>
				<input
					id='tmf-title'
					className='m-input'
					type='text'
					value={title}
					onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
					required
				/>
			</div>

			{/* Wiersz: Nr metody + Akredytacja */}
			<div className='m-row'>
				{/* Nr metody badawczej */}
				<div className={`m-field${formErr ? ' m--invalid' : ''}`}>
					<label className='m-label' htmlFor='tmf-methodNo'>
						Nr metody badawczej*
					</label>
					<input
						id='tmf-methodNo'
						className='m-input'
						type='text'
						list='tmf-method-nos-list'
						inputMode='latin'
						placeholder='np. M-PL-001'
						value={methodNo}
						onKeyDown={e => {
							if (e.key === ' ') e.preventDefault()
						}}
						onBeforeInput={e => {
							if (typeof e.data === 'string' && /\s/.test(e.data)) e.preventDefault()
						}}
						onChange={e => {
							const raw = e.target.value
							const sanitized = sanitizeMethodNo(raw)
							setForm(f => ({ ...f, methodNo: sanitized }))
							if (raw !== sanitized) {
								setSoftWarn('Usunięto spacje/PL znaki lub niedozwolone symbole. Dozwolone: A–Z, 0–9, -, _, /, .')
							} else {
								setSoftWarn('')
							}
						}}
						aria-invalid={!!formErr}
						aria-describedby={(formErr ? 'tmf-method-dup-err ' : '') + (softWarn ? 'tmf-method-soft-warn' : '')}
						required
					/>
					<datalist id='tmf-method-nos-list'>
						{existingMethodNosForStandard.map(no => (
							<option key={no} value={no} />
						))}
					</datalist>

					{existingMethodNosForStandard.length > 0 && (
						<small className='m-help'>Istniejące w tej normie: {existingMethodNosForStandard.join(', ')}</small>
					)}

					{softWarn && (
						<small id='tmf-method-soft-warn' className='m-help' aria-live='polite'>
							{softWarn}
						</small>
					)}

					{formErr && (
						<small id='tmf-method-dup-err' className='m-error' aria-live='assertive'>
							{formErr}
						</small>
					)}
				</div>

				{/* Akredytacja */}
				<div className='m-field' style={{ alignSelf: 'end' }}>
					<label className='m-label' htmlFor='tmf-accredited'>
						Akredytacja
					</label>
					<label className='m-choice'>
						<input
							id='tmf-accredited'
							type='checkbox'
							checked={!!accredited}
							onChange={e => setForm(f => ({ ...f, accredited: e.target.checked }))}
						/>
						Akredytowana
					</label>
				</div>
			</div>

			{/* Nazwa metody badawczej */}
			<div className='m-field'>
				<label className='m-label' htmlFor='tmf-methodName'>
					Nazwa metody badawczej*
				</label>
				<input
					id='tmf-methodName'
					className='m-input'
					type='text'
					value={methodName}
					onChange={e => setForm(f => ({ ...f, methodName: e.target.value }))}
					required
				/>
			</div>

			{/* Przyciski akcji */}
			<div className='m-actions m-actions--footer'>
				<button type='button' className='m-btn m-btn--secondary' onClick={onCancel}>
					Anuluj
				</button>
				<button type='submit' className='m-btn m-btn--primary' disabled={!!formErr}>
					{isEditing ? 'Zapisz zmiany' : 'Zapisz'}
				</button>
			</div>
		</form>
	)
}

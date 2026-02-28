// MethodModal.jsx
import React from 'react'
import Modal from '../../../shared/modals/modals/Modal' // <-- zamiast AddModal
import { sanitizeMethodNo } from '../utils'

export default function MethodModal({
	open,
	onClose,
	isEditing,
	form,
	setForm,
	knownStandards = [],
	existingMethodNosForStandard = [],
	formErr = '',
	softWarn = '',
	setSoftWarn = () => {},
	submitSave,
}) {
	if (!open) return null

	const ids = {
		standardNo: 'mm-standardNo',
		standardsList: 'mm-standards-list',
		title: 'mm-title',
		methodNo: 'mm-methodNo',
		methodNosList: 'mm-method-nos-list',
		methodName: 'mm-methodName',
		accredited: 'mm-accredited',
		softWarn: 'mm-method-soft-warn',
		dupErr: 'mm-method-dup-err',
	}
	const describedBy = (formErr ? `${ids.dupErr} ` : '') + (softWarn ? `${ids.softWarn}` : '')

	return (
		<Modal
			title={isEditing ? 'Edytuj metodę badawczą' : 'Dodaj metodę badawczą'}
			onClose={onClose}
			className='ui-modal ui-modal--x-narrow' // ⬅️ jeszcze węższy wariant
		>
			<form className='m-form' onSubmit={submitSave}>
				{/* Nr normy */}
				<div className='m-field'>
					<label className='m-label' htmlFor={ids.standardNo}>
						Nr normy/dokumentu*
					</label>
					<input
						id={ids.standardNo}
						className='m-input'
						type='text'
						list={ids.standardsList}
						value={form.standardNo}
						onChange={e => setForm(f => ({ ...f, standardNo: e.target.value }))}
						required
					/>
					<datalist id={ids.standardsList}>
						{knownStandards.map(no => (
							<option key={no} value={no} />
						))}
					</datalist>
				</div>

				{/* Tytuł */}
				<div className='m-field'>
					<label className='m-label' htmlFor={ids.title}>
						Tytuł normy/dokumentu*
					</label>
					<input
						id={ids.title}
						className='m-input'
						type='text'
						value={form.title}
						onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
						required
					/>
				</div>

				{/* Wiersz: nr metody + akredytacja */}
				<div className='m-row'>
					<div className={`m-field${formErr ? ' m--invalid' : ''}`}>
						<label className='m-label' htmlFor={ids.methodNo}>
							Nr metody badawczej*
						</label>
						<input
							id={ids.methodNo}
							className='m-input'
							type='text'
							list={ids.methodNosList}
							inputMode='latin'
							placeholder='np. M-PL-001'
							value={form.methodNo}
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
								setSoftWarn(
									raw !== sanitized
										? 'Usunięto spacje/PL znaki lub niedozwolone symbole. Dozwolone: A–Z, 0–9, -, _, /, .'
										: ''
								)
							}}
							aria-invalid={!!formErr}
							aria-describedby={describedBy || undefined}
							required
						/>
						<datalist id={ids.methodNosList}>
							{existingMethodNosForStandard.map(no => (
								<option key={no} value={no} />
							))}
						</datalist>

						{existingMethodNosForStandard.length > 0 && (
							<small className='m-help'>Istniejące w tej normie: {existingMethodNosForStandard.join(', ')}</small>
						)}
						{softWarn && (
							<small id={ids.softWarn} className='m-help' aria-live='polite'>
								{softWarn}
							</small>
						)}
						{formErr && (
							<small id={ids.dupErr} className='m-error' aria-live='assertive'>
								{formErr}
							</small>
						)}
					</div>

					<div className='m-field' style={{ alignSelf: 'end' }}>
						<label className='m-label' htmlFor={ids.accredited}>
							Akredytacja
						</label>
						<label className='m-choice'>
							<input
								id={ids.accredited}
								type='checkbox'
								checked={!!form.accredited}
								onChange={e => setForm(f => ({ ...f, accredited: e.target.checked }))}
							/>
							Akredytowana
						</label>
					</div>
				</div>

				{/* Nazwa metody */}
				<div className='m-field'>
					<label className='m-label' htmlFor={ids.methodName}>
						Nazwa metody badawczej*
					</label>
					<input
						id={ids.methodName}
						className='m-input'
						type='text'
						value={form.methodName}
						onChange={e => setForm(f => ({ ...f, methodName: e.target.value }))}
						required
					/>
				</div>

				{/* Akcje tylko raz */}
				<div className='m-actions m-actions--footer'>
					<button type='button' className='m-btn m-btn--secondary' onClick={onClose}>
						Anuluj
					</button>
					<button type='submit' className='m-btn m-btn--primary' disabled={!!formErr}>
						{isEditing ? 'Zapisz zmiany' : 'Zapisz'}
					</button>
				</div>
			</form>
		</Modal>
	)
}

// src/components/pages/contents/Sample.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Modal from '../../../shared/modals/modals/Modal'
import '../../../shared/modals/styles/form-modal.css' // styl modala (blue underline)
import SampleForm from '../forms/SampleForm'

/**
 * Normalizacja — wspiera oba zestawy nazw pól:
 * - nowy (jak w Rejestrze): receivedDate, orderNo, code, sampleNo, item, qty, client, scope, afterTest, notes, status, returnDate, comment
 * - stary: contractNumber, sampleNumber, subject, quantity, disposal
 */
function normalizeSample(src = {}) {
	const s = { ...src }
	return {
		id: s.id ?? s.sampleId ?? '',
		receivedDate: s.receivedDate ?? s.date ?? '',
		orderNo: s.orderNo ?? s.contractNumber ?? '',
		code: s.code ?? s.sampleCode ?? '',
		sampleNo: s.sampleNo ?? s.sampleNumber ?? s.id ?? '',
		item: s.item ?? s.subject ?? '',
		qty: s.qty ?? s.quantity ?? '',
		client: s.client ?? s.customer ?? '',
		scope: s.scope ?? s.range ?? '',
		afterTest: s.afterTest ?? s.disposal ?? '', // zwrot / likwidacja
		notes: s.notes ?? s.note ?? '',
		status: s.status ?? '',
		returnDate: s.returnDate ?? s.backDate ?? '',
		comment: s.comment ?? '',
	}
}

const Field = ({ label, children, title }) => (
	<div className='sample-field'>
		<div className='sample-field__label'>{label}</div>
		<div className='sample-field__value' title={title}>
			{children || '—'}
		</div>
	</div>
)

export default function Sample({ samples = [] }) {
	const { id } = useParams()
	const navigate = useNavigate()

	// znajdź próbkę po id
	const raw = useMemo(() => samples.find(s => String(s.id) === String(id)) || null, [samples, id])
	const sample = useMemo(() => (raw ? normalizeSample(raw) : null), [raw])

	// modal edycji
	const [showModal, setShowModal] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [newSample, setNewSample] = useState(sample ? { ...sample } : {})

	// gdy zmienia się id/próbka — aktualizuj stan edycji
	useEffect(() => {
		setNewSample(sample ? { ...sample } : {})
	}, [sample?.id]) // eslint-disable-line react-hooks/exhaustive-deps

	const handleUpdateSample = e => {
		e.preventDefault()
		// tu normalnie dispatch / API call; na razie konsola
		console.log('Zapisano dane próbki:', newSample)
		setShowModal(false)
		setIsEditing(false)
	}

	if (!sample) {
		return (
			<div className='main-card'>
				<h2>Nie znaleziono próbki</h2>
				<button className='add-offer-btn' onClick={() => navigate(-1)} style={{ marginTop: 8 }}>
					Wróć
				</button>
			</div>
		)
	}

	return (
		<div className='main-card sample-details'>
			{/* Nagłówek */}
			<div className='sample-header'>
				<h2 className='sample-title'>Szczegóły próbki {sample.sampleNo || sample.id}</h2>
				<div className='sample-actions'>
					<button
						className='add-offer-btn'
						onClick={() => {
							setShowModal(true)
							setIsEditing(true)
						}}
						aria-label='Edytuj próbkę'
						title='Edytuj próbkę'>
						Edytuj
					</button>

					<Link
						className='add-offer-btn'
						to={`/probki/rejestr-probek/${encodeURIComponent(sample.id || id)}/formularz`}
						title='Otwórz formularz próbki'>
						Formularz
					</Link>
				</div>
			</div>

			{/* Grid pól (z zachowaniem Twojej typografii i klas card) */}
			<div className='sample-grid'>
				<Field label='Data przyjęcia'>{sample.receivedDate}</Field>

				<Field label='Nr zlecenia / umowy' title={sample.orderNo}>
					{sample.orderNo ? (
						<Link to={`/sprzedaz/rejestr-zlecen?order=${encodeURIComponent(sample.orderNo)}`}>{sample.orderNo}</Link>
					) : (
						'—'
					)}
				</Field>

				<Field label='KOD' title={sample.code}>
					{sample.code ? (
						<Link to={`/probki/rejestr-probek?code=${encodeURIComponent(sample.code)}`}>{sample.code}</Link>
					) : (
						'—'
					)}
				</Field>

				<Field label='Nr próbki'>{sample.sampleNo}</Field>
				<Field label='Przedmiot badań' title={sample.item}>
					{sample.item}
				</Field>
				<Field label='Ilość sztuk'>{sample.qty}</Field>

				<Field label='Zleceniodawca' title={sample.client}>
					{sample.client ? (
						<Link to={`/sprzedaz/klienci/${encodeURIComponent(sample.client)}`}>{sample.client}</Link>
					) : (
						'—'
					)}
				</Field>

				<Field label='Zakres badań' title={sample.scope}>
					{sample.scope ? (
						<Link to={`/metody-badawcze/spis?q=${encodeURIComponent(sample.scope)}`}>{sample.scope}</Link>
					) : (
						'—'
					)}
				</Field>

				<Field label='Po badaniu (zwrot/likwidacja)'>{sample.afterTest}</Field>
				<Field label='Uwagi' title={sample.notes}>
					{sample.notes}
				</Field>
				<Field label='Status'>{sample.status}</Field>
				<Field label='Data zwrotu'>{sample.returnDate}</Field>
				<Field label='Komentarz' title={sample.comment}>
					{sample.comment}
				</Field>
			</div>

			{/* Modal edycji — styl „blue underline”, wąski */}
			{showModal && (
				<Modal title='Edytuj próbkę' onClose={() => setShowModal(false)} size='sm'>
					<form className='m-form' onSubmit={handleUpdateSample}>
						{/* Jeśli Twój <SampleForm> sam renderuje pola, tylko go osadzamy */}
						<SampleForm
							sample={newSample}
							onSave={handleUpdateSample}
							onClose={() => setShowModal(false)}
							setSample={setNewSample}
						/>
						{/* Jeśli SampleForm już ma własne akcje, sekcja poniżej nie jest wymagana */}
						{/* <div className="m-actions--footer">
              <button type="submit" className="m-btn m-btn--primary">Zapisz</button>
              <button type="button" className="m-btn m-btn--secondary" onClick={() => setShowModal(false)}>Anuluj</button>
            </div> */}
					</form>
				</Modal>
			)}

			{/* Lokalny CSS (lekki) — korzysta z Twoich istniejących klas card/btn */}
			<style>{`
        .sample-details { display: grid; gap: 16px; }
        .sample-header {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          border-bottom: 3.5px solid #4a6fa5c2; padding-bottom: 8px;
        }
        .sample-title { margin: 0; font-weight: 800; font-size: 22px; }
        .sample-actions { display: flex; gap: .5rem; }
        .sample-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(240px, 1fr));
          gap: 12px 16px;
        }
        @media (max-width: 720px) {
          .sample-grid { grid-template-columns: 1fr; }
        }
        .sample-field { display: grid; gap: 4px; }
        .sample-field__label { font-weight: 600; color: #2c3e50; }
        .sample-field__value a { text-decoration: none; color: #1b3552; }
        .sample-field__value a:hover { text-decoration: underline; }
      `}</style>
		</div>
	)
}

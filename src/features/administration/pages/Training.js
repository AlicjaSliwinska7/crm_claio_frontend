// src/components/pages/contents/Training.js
import React, { useMemo, useState, useId } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../../../shared/tables/styles/directories_lists_registers/details-view.css'
import Modal from '../../../shared/modals/modals/Modal'
import { ArrowLeft, Pencil, Trash2, Plus, CheckCircle2, Circle, FilePlus2, Calendar, Users } from 'lucide-react'

/* =============================== DEMO / MOCK =============================== */
// W realnym wdrożeniu pobierzesz szkolenie po :id z API/store.
const DEMO_TRAININGS = [
	{
		id: 1,
		type: 'wewnętrzne',
		title: 'Szkolenie BHP',
		topic: 'Zasady bezpieczeństwa w laboratorium',
		date: '2025-07-12',
		participants: ['Alicja Śliwińska', 'Jan Kowalski'],
		notes: [
			{
				id: 'n1',
				text: 'Przypomnieć o obowiązkowych okularach ochronnych.',
				at: '2025-07-10T09:00:00Z',
			},
		],
		decisions: [
			{
				id: 'd1',
				text: 'Zaktualizować instrukcję stanowiskową do 31.07.',
				owner: 'Jan Kowalski',
				due: '2025-07-31',
				done: false,
			},
		],
		agenda: [
			{ id: 'a1', time: '09:00', item: 'Wprowadzenie i cele' },
			{ id: 'a2', time: '09:20', item: 'ŚOI – omówienie' },
			{ id: 'a3', time: '10:00', item: 'Ewakuacja i pierwsza pomoc' },
		],
		attachments: [
			{ id: 'f1', name: 'Prezentacja_BHP.pdf', url: '#' },
			{ id: 'f2', name: 'Lista_kontrolna.docx', url: '#' },
		],
		attendance: [
			{ user: 'Alicja Śliwińska', status: 'obecny' },
			{ user: 'Jan Kowalski', status: 'obecny' },
		],
		timeline: [
			{ id: 't1', at: '2025-07-01T08:00:00Z', text: 'Utworzono szkolenie' },
			{ id: 't2', at: '2025-07-05T10:05:00Z', text: 'Dodano materiały' },
		],
	},
]

/* =============================== Utils =============================== */
const fmt = d => (d ? new Date(d).toLocaleString('pl-PL', { dateStyle: 'medium' }) : '—')
const fmtDT = d => (d ? new Date(d).toLocaleString('pl-PL') : '—')
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`
const byDateDesc = (a, b) => new Date(b.at) - new Date(a.at)

/* =============================== Component =============================== */
export default function Training() {
	const { id } = useParams()
	const navigate = useNavigate()

	const initial = useMemo(() => {
		const found = DEMO_TRAININGS.find(t => String(t.id) === String(id))
		return (
			found || {
				id,
				type: 'wewnętrzne',
				title: 'Nowe szkolenie',
				topic: '',
				date: '',
				participants: [],
				notes: [],
				decisions: [],
				agenda: [],
				attachments: [],
				attendance: [],
				timeline: [],
			}
		)
	}, [id])

	const [training, setTraining] = useState(initial)

	// Edycja danych podstawowych
	const [showEdit, setShowEdit] = useState(false)
	const [form, setForm] = useState({
		title: training.title || '',
		topic: training.topic || '',
		type: training.type || 'wewnętrzne',
		date: training.date || '',
		participantsText: (training.participants || []).join(', '),
	})

	// Pomocnicze inputy „Add”
	const [noteText, setNoteText] = useState('')
	const [decisionText, setDecisionText] = useState('')
	const [decisionOwner, setDecisionOwner] = useState('')
	const [decisionDue, setDecisionDue] = useState('')
	const [agendaTime, setAgendaTime] = useState('')
	const [agendaItem, setAgendaItem] = useState('')
	const [fileName, setFileName] = useState('')

	const participants = training.participants || []
	const attendance = training.attendance || []

	/* =============================== Actions =============================== */
	const saveEdit = e => {
		e.preventDefault()
		const participantsParsed = (form.participantsText || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)

		const updated = {
			...training,
			title: (form.title || '').trim() || '—',
			topic: (form.topic || '').trim() || '—',
			type: form.type,
			date: form.date,
			participants: participantsParsed,
			// zsynchronizuj listę obecności z listą uczestników
			attendance: participantsParsed.map(p => {
				const prev = attendance.find(a => a.user === p)
				return prev || { user: p, status: 'obecny' }
			}),
			timeline: [
				...training.timeline,
				{
					id: uid('t'),
					at: new Date().toISOString(),
					text: 'Zaktualizowano dane szkolenia',
				},
			],
		}
		setTraining(updated)
		setShowEdit(false)
	}

	const addNote = e => {
		e.preventDefault()
		if (!noteText.trim()) return
		setTraining(prev => ({
			...prev,
			notes: [{ id: uid('n'), text: noteText.trim(), at: new Date().toISOString() }, ...(prev.notes || [])],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano notatkę' }, ...(prev.timeline || [])],
		}))
		setNoteText('')
	}

	const addDecision = e => {
		e.preventDefault()
		if (!decisionText.trim()) return
		setTraining(prev => ({
			...prev,
			decisions: [
				...(prev.decisions || []),
				{
					id: uid('d'),
					text: decisionText.trim(),
					owner: decisionOwner.trim() || '—',
					due: decisionDue || '',
					done: false,
				},
			],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano ustalenie' }, ...(prev.timeline || [])],
		}))
		setDecisionText('')
		setDecisionOwner('')
		setDecisionDue('')
	}

	const toggleDecision = id => {
		setTraining(prev => ({
			...prev,
			decisions: (prev.decisions || []).map(d => (d.id === id ? { ...d, done: !d.done } : d)),
			timeline: [
				{
					id: uid('t'),
					at: new Date().toISOString(),
					text: 'Zmieniono status ustalenia',
				},
				...(prev.timeline || []),
			],
		}))
	}

	const removeDecision = id => {
		setTraining(prev => ({
			...prev,
			decisions: (prev.decisions || []).filter(d => d.id !== id),
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto ustalenie' }, ...(prev.timeline || [])],
		}))
	}

	const addAgenda = e => {
		e.preventDefault()
		if (!agendaItem.trim()) return
		setTraining(prev => ({
			...prev,
			agenda: [...(prev.agenda || []), { id: uid('a'), time: agendaTime || '', item: agendaItem.trim() }],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano punkt agendy' }, ...(prev.timeline || [])],
		}))
		setAgendaTime('')
		setAgendaItem('')
	}

	const addAttachment = e => {
		e.preventDefault()
		if (!fileName.trim()) return
		setTraining(prev => ({
			...prev,
			attachments: [...(prev.attachments || []), { id: uid('f'), name: fileName.trim(), url: '#' }],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano materiał' }, ...(prev.timeline || [])],
		}))
		setFileName('')
	}

	const setAttendance = (user, status) => {
		setTraining(prev => ({
			...prev,
			attendance: (prev.attendance || []).map(a => (a.user === user ? { ...a, status } : a)),
			timeline: [
				{
					id: uid('t'),
					at: new Date().toISOString(),
					text: `Zmieniono obecność: ${user} → ${status}`,
				},
				...(prev.timeline || []),
			],
		}))
	}

	const removeNote = id => {
		setTraining(prev => ({
			...prev,
			notes: (prev.notes || []).filter(n => n.id !== id),
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto notatkę' }, ...(prev.timeline || [])],
		}))
	}

	const removeAttachment = id => {
		setTraining(prev => ({
			...prev,
			attachments: (prev.attachments || []).filter(f => f.id !== id),
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto materiał' }, ...(prev.timeline || [])],
		}))
	}

	const deleteTraining = () => {
		if (!window.confirm('Usunąć to szkolenie? Tej operacji nie można cofnąć.')) return
		navigate('/administracja/szkolenia')
	}

	/* =============================== Render =============================== */
	return (
		<div className='details-view'>
			{/* Header */}
			<div className='details-header'>
				<div className='details-header-left'>
					<button className='icon-btn' onClick={() => navigate(-1)} title='Wróć' aria-label='Wróć'>
						<ArrowLeft size={18} />
					</button>
					<div>
						<h2 className='details-title'>{training.title || 'Szkolenie'}</h2>
						<div className='details-meta'>
							<span className='meta-chip' title='Typ'>
								{training.type || '—'}
							</span>
							<span className='meta-chip' title='Data'>
								<Calendar size={14} /> {fmt(training.date)}
							</span>
							<span className='meta-chip' title='Uczestnicy'>
								<Users size={14} /> {participants.length}
							</span>
						</div>
					</div>
				</div>

				<div className='details-actions'>
					<button
						className='edit-btn'
						onClick={() => {
							setForm({
								title: training.title || '',
								topic: training.topic || '',
								type: training.type || 'wewnętrzne',
								date: training.date || '',
								participantsText: participants.join(', '),
							})
							setShowEdit(true)
						}}
						title='Edytuj'>
						<Pencil size={18} />
					</button>
					<button className='delete-btn' onClick={deleteTraining} title='Usuń'>
						<Trash2 size={18} />
					</button>
				</div>
			</div>

			{/* Key-value table */}
			<div className='details-card'>
				<table className='details-table'>
					<tbody>
						<tr>
							<th style={{ width: 200 }}>Temat</th>
							<td>{training.topic || '—'}</td>
						</tr>
						<tr>
							<th>Typ</th>
							<td>{training.type || '—'}</td>
						</tr>
						<tr>
							<th>Data</th>
							<td>{fmt(training.date)}</td>
						</tr>
						<tr>
							<th>Uczestnicy</th>
							<td>{participants.length ? participants.join(', ') : '—'}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* Sections grid */}
			<div className='details-grid'>
				{/* Notatki */}
				<section className='details-card'>
					<h3 className='section-title'>Notatki</h3>
					<form onSubmit={addNote} className='form-inline'>
						<input
							type='text'
							className='details-input'
							placeholder='Dodaj notatkę…'
							value={noteText}
							onChange={e => setNoteText(e.target.value)}
						/>
						<button className='add-btn' title='Dodaj notatkę'>
							<Plus size={16} />
						</button>
					</form>
					<div className='notes-list'>
						{(training.notes || []).sort(byDateDesc).map(n => (
							<div key={n.id} className='note-card'>
								<div>
									<div>{n.text}</div>
									<div className='muted small'>{fmtDT(n.at)}</div>
								</div>
								<button className='delete-btn' title='Usuń notatkę' onClick={() => removeNote(n.id)}>
									<Trash2 size={16} />
								</button>
							</div>
						))}
						{(!training.notes || !training.notes.length) && <div className='muted'>—</div>}
					</div>
				</section>

				{/* Ustalenia */}
				<section className='details-card'>
					<h3 className='section-title'>Ustalenia / Zadania</h3>
					<form onSubmit={addDecision} className='form-grid'>
						<input
							type='text'
							className='details-input'
							placeholder='Treść ustalenia…'
							value={decisionText}
							onChange={e => setDecisionText(e.target.value)}
						/>
						<input
							type='text'
							className='details-input'
							placeholder='Właściciel'
							value={decisionOwner}
							onChange={e => setDecisionOwner(e.target.value)}
						/>
						<input
							type='date'
							className='details-input'
							value={decisionDue}
							onChange={e => setDecisionDue(e.target.value)}
							title='Termin'
						/>
						<button className='add-btn' title='Dodaj ustalenie'>
							<Plus size={16} />
						</button>
					</form>

					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Ustalenie</th>
									<th>Właściciel</th>
									<th>Termin</th>
									<th>Status</th>
									<th>Akcje</th>
								</tr>
							</thead>
							<tbody>
								{(training.decisions || []).map(d => (
									<tr key={d.id}>
										<td>{d.text}</td>
										<td className='ta-center'>{d.owner || '—'}</td>
										<td className='ta-center'>{d.due || '—'}</td>
										<td className='ta-center'>
											{d.done ? (
												<span className='status-badge'>
													<CheckCircle2 size={16} /> wykonane
												</span>
											) : (
												<span className='status-badge'>
													<Circle size={16} /> otwarte
												</span>
											)}
										</td>
										<td className='actions-col'>
											<button className='edit-btn' title='Przełącz status' onClick={() => toggleDecision(d.id)}>
												<Pencil size={16} />
											</button>
											<button className='delete-btn' title='Usuń' onClick={() => removeDecision(d.id)}>
												<Trash2 size={16} />
											</button>
										</td>
									</tr>
								))}
								{(!training.decisions || !training.decisions.length) && (
									<tr>
										<td colSpan={5} className='ta-center'>
											Brak ustaleń.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* Agenda */}
				<section className='details-card'>
					<h3 className='section-title'>Agenda</h3>
					<form onSubmit={addAgenda} className='form-inline'>
						<input
							type='time'
							className='details-input'
							value={agendaTime}
							onChange={e => setAgendaTime(e.target.value)}
						/>
						<input
							type='text'
							className='details-input'
							placeholder='Punkt agendy…'
							value={agendaItem}
							onChange={e => setAgendaItem(e.target.value)}
						/>
						<button className='add-btn' title='Dodaj punkt'>
							<Plus size={16} />
						</button>
					</form>

					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Godzina</th>
									<th>Temat</th>
								</tr>
							</thead>
							<tbody>
								{(training.agenda || []).map(a => (
									<tr key={a.id}>
										<td className='ta-center'>{a.time || '—'}</td>
										<td>{a.item || '—'}</td>
									</tr>
								))}
								{(!training.agenda || !training.agenda.length) && (
									<tr>
										<td colSpan={2} className='ta-center'>
											Brak agendy.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* Materiały */}
				<section className='details-card'>
					<h3 className='section-title'>Materiały</h3>
					<form onSubmit={addAttachment} className='form-inline'>
						<input
							type='text'
							className='details-input'
							placeholder='Nazwa pliku / link…'
							value={fileName}
							onChange={e => setFileName(e.target.value)}
						/>
						<button className='add-btn' title='Dodaj materiał'>
							<FilePlus2 size={16} />
						</button>
					</form>

					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Nazwa</th>
									<th>Akcje</th>
								</tr>
							</thead>
							<tbody>
								{(training.attachments || []).map(f => (
									<tr key={f.id}>
										<td>{f.url ? <a href={f.url}>{f.name}</a> : f.name}</td>
										<td className='actions-col'>
											<button className='delete-btn' title='Usuń' onClick={() => removeAttachment(f.id)}>
												<Trash2 size={16} />
											</button>
										</td>
									</tr>
								))}
								{(!training.attachments || !training.attachments.length) && (
									<tr>
										<td colSpan={2} className='ta-center'>
											Brak materiałów.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* Obecność */}
				<section className='details-card'>
					<h3 className='section-title'>Obecność</h3>
					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Uczestnik</th>
									<th>Status</th>
									<th>Akcje</th>
								</tr>
							</thead>
							<tbody>
								{attendance.map(a => (
									<tr key={a.user}>
										<td>{a.user}</td>
										<td className='ta-center'>
											{a.status === 'obecny' ? (
												<span className='status-badge'>
													<CheckCircle2 size={16} /> obecny
												</span>
											) : (
												<span className='status-badge'>
													<Circle size={16} /> nieobecny
												</span>
											)}
										</td>
										<td className='actions-col'>
											<button
												className='edit-btn'
												title='Oznacz obecny'
												onClick={() => setAttendance(a.user, 'obecny')}>
												<CheckCircle2 size={16} />
											</button>
											<button
												className='delete-btn'
												title='Oznacz nieobecny'
												onClick={() => setAttendance(a.user, 'nieobecny')}>
												<Circle size={16} />
											</button>
										</td>
									</tr>
								))}
								{attendance.length === 0 && (
									<tr>
										<td colSpan={3} className='ta-center'>
											Brak uczestników.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* Historia */}
				<section className='details-card'>
					<h3 className='section-title'>Historia zmian</h3>
					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Data</th>
									<th>Opis</th>
								</tr>
							</thead>
							<tbody>
								{(training.timeline || []).sort(byDateDesc).map(e => (
									<tr key={e.id}>
										<td style={{ whiteSpace: 'nowrap' }}>{fmtDT(e.at)}</td>
										<td>{e.text}</td>
									</tr>
								))}
								{(!training.timeline || !training.timeline.length) && (
									<tr>
										<td colSpan={2} className='ta-center'>
											Brak historii.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>
			</div>

			{/* MODAL: Edycja danych szkolenia */}
			{showEdit && (
				<Modal title='Edytuj szkolenie' onClose={() => setShowEdit(false)} size='sm'>
					<EditTrainingForm form={form} setForm={setForm} onCancel={() => setShowEdit(false)} onSubmit={saveEdit} />
				</Modal>
			)}
		</div>
	)
}

/* ============================ Edit form (modal) ============================ */
function EditTrainingForm({ form, setForm, onSubmit, onCancel }) {
	const titleId = useId()
	const idFor = name => `training_edit_${name}`

	return (
		<form className='m-form modal-form' onSubmit={onSubmit} noValidate aria-labelledby={titleId}>
			<section className='m-section' aria-labelledby={idFor('section_data')}>
				<h6 id={titleId} className='m-section__title'>
					Dane szkolenia
				</h6>

				{/* Typ + Data */}
				<div className='m-row'>
					<div className='m-field'>
						<label className='m-label' htmlFor={idFor('type')}>
							Typ
						</label>
						<select
							id={idFor('type')}
							className='m-select'
							value={form.type}
							onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
							<option value='wewnętrzne'>wewnętrzne</option>
							<option value='zewnętrzne'>zewnętrzne</option>
						</select>
					</div>

					<div className='m-field'>
						<label className='m-label' htmlFor={idFor('date')}>
							Data
						</label>
						<input
							id={idFor('date')}
							type='date'
							className='m-input'
							value={form.date}
							onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
						/>
					</div>
				</div>

				{/* Tytuł */}
				<div className='m-field'>
					<label className='m-label' htmlFor={idFor('title')}>
						Tytuł* <span aria-hidden='true'>*</span>
					</label>
					<input
						id={idFor('title')}
						type='text'
						className='m-input'
						value={form.title}
						onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
						required
					/>
				</div>

				{/* Temat */}
				<div className='m-field'>
					<label className='m-label' htmlFor={idFor('topic')}>
						Temat* <span aria-hidden='true'>*</span>
					</label>
					<input
						id={idFor('topic')}
						type='text'
						className='m-input'
						value={form.topic}
						onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
						required
					/>
				</div>

				{/* Uczestnicy jako tekst (prosty edytor listy) */}
				<div className='m-field'>
					<label className='m-label' htmlFor={idFor('participants')}>
						Uczestnicy (rozdziel przecinkami)
					</label>
					<input
						id={idFor('participants')}
						type='text'
						className='m-input'
						placeholder='np. Jan Kowalski, Anna Nowak'
						value={form.participantsText}
						onChange={e => setForm(f => ({ ...f, participantsText: e.target.value }))}
					/>
					<div className='m-help'>Wpisz kilka osób oddzielając przecinkami.</div>
				</div>
			</section>

			<div className='m-actions m-actions--footer'>
				<button type='button' className='m-btn m-btn--secondary' onClick={onCancel}>
					Anuluj
				</button>
				<button type='submit' className='m-btn m-btn--primary m-btn--lg'>
					Zapisz
				</button>
			</div>
		</form>
	)
}

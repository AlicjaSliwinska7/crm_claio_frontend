// src/components/pages/contents/Appointment.js
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../../../shared/tables/styles/directories_lists_registers/details-view.css'
import Modal from '../../../shared/modals/modals/Modal'
import { ArrowLeft, Pencil, Trash2, Plus, CheckCircle2, Circle, FilePlus2, Calendar, Users } from 'lucide-react'

/* =============================== DEMO / MOCK =============================== */
const DEMO_APPOINTMENTS = [
	{
		id: 'A-001',
		topic: 'Kickoff projektu X',
		date: '2025-09-15',
		time: '10:00',
		members: ['Alicja Śliwińska', 'Jan Kowalski'],
		place: 'Sala konferencyjna 2 / Teams',
		arrangements: 'Ustalić zakres MVP, terminy, role.',
		notes: [{ id: 'n1', text: 'Przygotować dokumentację wstępną.', at: '2025-09-10T08:00:00Z' }],
		decisions: [
			{ id: 'd1', text: 'Zdefiniować backlog startowy.', owner: 'Jan Kowalski', due: '2025-09-20', done: false },
		],
		attachments: [{ id: 'f1', name: 'Agenda_Kickoff.pdf', url: '#' }],
		timeline: [{ id: 't1', at: '2025-09-01T10:00:00Z', text: 'Dodano spotkanie' }],
	},
	{
		id: 'A-002',
		topic: 'Spotkanie z klientem TechSolutions',
		date: '2025-09-18',
		time: '14:30',
		members: ['Alicja Śliwińska', 'Opiekun klienta'],
		place: 'Biuro klienta / online',
		arrangements: 'Omówienie wymagań, potwierdzenie budżetu.',
		notes: [],
		decisions: [],
		attachments: [],
		timeline: [{ id: 't2', at: '2025-09-05T09:00:00Z', text: 'Dodano spotkanie' }],
	},
]

/* =============================== Utils =============================== */
const fmtDate = d => (d ? new Date(d).toLocaleDateString('pl-PL', { dateStyle: 'medium' }) : '—')
const fmtDateTime = d => (d ? new Date(d).toLocaleString('pl-PL') : '—')
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`
const byDateDesc = (a, b) => new Date(b.at) - new Date(a.at)

/* =============================== Component =============================== */
export default function Appointment() {
	const { id } = useParams()
	const navigate = useNavigate()

	const initial = useMemo(() => {
		const found = DEMO_APPOINTMENTS.find(a => String(a.id) === String(id))
		return (
			found || {
				id,
				topic: 'Nowe spotkanie',
				date: '',
				time: '',
				members: [],
				place: '',
				arrangements: '',
				notes: [],
				decisions: [],
				attachments: [],
				timeline: [],
			}
		)
	}, [id])

	const [appointment, setAppointment] = useState(initial)

	// Edycja danych podstawowych
	const [showEdit, setShowEdit] = useState(false)
	const [form, setForm] = useState({
		topic: appointment.topic || '',
		date: appointment.date || '',
		time: appointment.time || '',
		membersText: (appointment.members || []).join(', '),
		place: appointment.place || '',
		arrangements: appointment.arrangements || '',
	})

	// „Add” helpers
	const [noteText, setNoteText] = useState('')
	const [decisionText, setDecisionText] = useState('')
	const [decisionOwner, setDecisionOwner] = useState('')
	const [decisionDue, setDecisionDue] = useState('')
	const [fileName, setFileName] = useState('')

	const members = appointment.members || []

	/* =============================== Actions =============================== */
	const saveEdit = e => {
		e.preventDefault()
		const membersParsed = form.membersText
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)

		const updated = {
			...appointment,
			topic: form.topic.trim() || '—',
			date: form.date,
			time: form.time,
			members: membersParsed,
			place: form.place.trim(),
			arrangements: form.arrangements.trim(),
			timeline: [
				...appointment.timeline,
				{ id: uid('t'), at: new Date().toISOString(), text: 'Zaktualizowano dane spotkania' },
			],
		}
		setAppointment(updated)
		setShowEdit(false)
	}

	const addNote = e => {
		e.preventDefault()
		if (!noteText.trim()) return
		setAppointment(prev => ({
			...prev,
			notes: [{ id: uid('n'), text: noteText.trim(), at: new Date().toISOString() }, ...(prev.notes || [])],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano notatkę' }, ...(prev.timeline || [])],
		}))
		setNoteText('')
	}

	const addDecision = e => {
		e.preventDefault()
		if (!decisionText.trim()) return
		setAppointment(prev => ({
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
		setAppointment(prev => ({
			...prev,
			decisions: (prev.decisions || []).map(d => (d.id === id ? { ...d, done: !d.done } : d)),
			timeline: [
				{ id: uid('t'), at: new Date().toISOString(), text: 'Zmieniono status ustalenia' },
				...(prev.timeline || []),
			],
		}))
	}

	const removeDecision = id => {
		setAppointment(prev => ({
			...prev,
			decisions: (prev.decisions || []).filter(d => d.id !== id),
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto ustalenie' }, ...(prev.timeline || [])],
		}))
	}

	const addAttachment = e => {
		e.preventDefault()
		if (!fileName.trim()) return
		setAppointment(prev => ({
			...prev,
			attachments: [...(prev.attachments || []), { id: uid('f'), name: fileName.trim(), url: '#' }],
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Dodano materiał' }, ...(prev.timeline || [])],
		}))
		setFileName('')
	}

	const removeAttachment = id => {
		setAppointment(prev => ({
			...prev,
			attachments: (prev.attachments || []).filter(f => f.id !== id),
			timeline: [{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto materiał' }, ...(prev.timeline || [])],
		}))
	}

	const deleteAppointment = () => {
		if (!window.confirm('Usunąć to spotkanie? Tej operacji nie można cofnąć.')) return
		navigate('/administracja/spotkania')
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
						<h2 className='details-title'>{appointment.topic || 'Spotkanie'}</h2>
						<div className='details-meta'>
							<span className='meta-chip' title='Data'>
								<Calendar size={14} /> {fmtDate(appointment.date)} {appointment.time ? `• ${appointment.time}` : ''}
							</span>
							<span className='meta-chip' title='Uczestnicy'>
								<Users size={14} /> {members.length}
							</span>
							{appointment.place && (
								<span className='meta-chip' title='Miejsce'>
									{appointment.place}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className='details-actions'>
					<button
						className='edit-btn'
						onClick={() => {
							setForm({
								topic: appointment.topic || '',
								date: appointment.date || '',
								time: appointment.time || '',
								membersText: members.join(', '),
								place: appointment.place || '',
								arrangements: appointment.arrangements || '',
							})
							setShowEdit(true)
						}}
						title='Edytuj'>
						<Pencil size={18} />
					</button>
					<button className='delete-btn' onClick={deleteAppointment} title='Usuń'>
						<Trash2 size={18} />
					</button>
				</div>
			</div>

			{/* Key-value card */}
			<div className='details-card'>
				<table className='details-table'>
					<tbody>
						<tr>
							<th style={{ width: 200 }}>Data</th>
							<td>
								{fmtDate(appointment.date)} {appointment.time ? `— ${appointment.time}` : ''}
							</td>
						</tr>
						<tr>
							<th>Uczestnicy</th>
							<td>{members.length ? members.join(', ') : '—'}</td>
						</tr>
						<tr>
							<th>Miejsce</th>
							<td>{appointment.place || '—'}</td>
						</tr>
						<tr>
							<th>Ustalenia (opis)</th>
							<td>{appointment.arrangements || '—'}</td>
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
						{(appointment.notes || []).sort(byDateDesc).map(n => (
							<div key={n.id} className='note-card'>
								<div>
									<div>{n.text}</div>
									<div className='muted small'>{fmtDateTime(n.at)}</div>
								</div>
								<button
									className='delete-btn'
									title='Usuń notatkę'
									onClick={() => {
										setAppointment(prev => ({
											...prev,
											notes: (prev.notes || []).filter(x => x.id !== n.id),
											timeline: [
												{ id: uid('t'), at: new Date().toISOString(), text: 'Usunięto notatkę' },
												...(prev.timeline || []),
											],
										}))
									}}>
									<Trash2 size={16} />
								</button>
							</div>
						))}
						{(!appointment.notes || !appointment.notes.length) && <div className='muted'>—</div>}
					</div>
				</section>

				{/* Ustalenia / Action items */}
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
								{(appointment.decisions || []).map(d => (
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
								{(!appointment.decisions || !appointment.decisions.length) && (
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
								{(appointment.attachments || []).map(f => (
									<tr key={f.id}>
										<td>{f.url ? <a href={f.url}>{f.name}</a> : f.name}</td>
										<td className='actions-col'>
											<button className='delete-btn' title='Usuń' onClick={() => removeAttachment(f.id)}>
												<Trash2 size={16} />
											</button>
										</td>
									</tr>
								))}
								{(!appointment.attachments || !appointment.attachments.length) && (
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
								{(appointment.timeline || []).sort(byDateDesc).map(e => (
									<tr key={e.id}>
										<td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(e.at)}</td>
										<td>{e.text}</td>
									</tr>
								))}
								{(!appointment.timeline || !appointment.timeline.length) && (
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

			{/* MODAL: Edycja danych spotkania */}
			{showEdit && (
				<Modal title='Edytuj spotkanie' onClose={() => setShowEdit(false)}>
					<form className='modal-form' onSubmit={saveEdit} style={{ display: 'grid', gap: 10, minWidth: 360 }}>
						<label className='form-field'>
							<span>Temat*</span>
							<input
								type='text'
								className='details-input'
								value={form.topic}
								onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
								required
							/>
						</label>
						<label className='form-field'>
							<span>Data</span>
							<input
								type='date'
								className='details-input'
								value={form.date}
								onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
							/>
						</label>
						<label className='form-field'>
							<span>Godzina</span>
							<input
								type='time'
								className='details-input'
								value={form.time}
								onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
							/>
						</label>
						<label className='form-field'>
							<span>Uczestnicy (rozdziel przecinkami)</span>
							<input
								type='text'
								className='details-input'
								value={form.membersText}
								onChange={e => setForm(f => ({ ...f, membersText: e.target.value }))}
								placeholder='np. Jan Kowalski, Anna Nowak'
							/>
						</label>
						<label className='form-field'>
							<span>Miejsce</span>
							<input
								type='text'
								className='details-input'
								value={form.place}
								onChange={e => setForm(f => ({ ...f, place: e.target.value }))}
							/>
						</label>
						<label className='form-field'>
							<span>Ustalenia (opis)</span>
							<input
								type='text'
								className='details-input'
								value={form.arrangements}
								onChange={e => setForm(f => ({ ...f, arrangements: e.target.value }))}
							/>
						</label>

						<div className='modal-buttons' style={{ marginTop: 8 }}>
							<button type='submit'>Zapisz</button>
							<button type='button' onClick={() => setShowEdit(false)}>
								Anuluj
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	)
}

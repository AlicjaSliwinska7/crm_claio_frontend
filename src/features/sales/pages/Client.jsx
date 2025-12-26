// src/components/pages/contents/Client.js
import React, { useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ClientForm from '../forms/ClientForm'
import '../../../shared/tables/styles/directories_lists_registers/details-view.css'
import Modal from '../../../shared/modals/modals/Modal'
import { ArrowLeft, Pencil, FileText, ClipboardList } from 'lucide-react'

function Client({ clients = [] }) {
	const { id } = useParams()
	const navigate = useNavigate()
	const decodedId = decodeURIComponent(id || '')

	const client = useMemo(
		() => clients.find(c => (c?.name || '').toLowerCase() === decodedId.toLowerCase()),
		[clients, decodedId]
	)

	const [showModal, setShowModal] = useState(false)
	const [newClient, setNewClient] = useState(client ? { ...client } : {})
	const [sameAsAddress, setSameAsAddress] = useState(false)

	if (!client) {
		return (
			<div className='details-view'>
				<div className='details-header'>
					<div className='details-header-left'>
						<button className='icon-btn' onClick={() => navigate(-1)} aria-label='Wróć' title='Wróć'>
							<ArrowLeft size={18} />
						</button>
						<div>
							<h2 className='details-title'>Nie znaleziono klienta</h2>
							<div className='details-meta'>
								<span className='meta-chip'>ID: {decodedId}</span>
							</div>
						</div>
					</div>
				</div>

				<div className='details-card'>
					<p className='muted'>Sprawdź, czy adres URL jest poprawny lub wróć do listy klientów.</p>
					<div style={{ marginTop: 8 }}>
						<Link to='/sprzedaz/klienci' className='details-link'>
							Przejdź do listy klientów
						</Link>
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = e => {
		e.preventDefault()
		// podłącz zapis do API/store; tu zamykamy modal
		setShowModal(false)
	}

	const fullAddr = a =>
		[a?.street, a?.buildingNumber].filter(Boolean).join(' ') +
		(a?.postalCode || a?.city ? `, ${[a?.postalCode, a?.city].filter(Boolean).join(' ')}` : '') +
		(a?.country ? `, ${a.country}` : '')

	return (
		<div className='details-view'>
			{/* Header */}
			<div className='details-header'>
				<div className='details-header-left'>
					<button className='icon-btn' onClick={() => navigate(-1)} aria-label='Wróć' title='Wróć'>
						<ArrowLeft size={18} />
					</button>
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<h2 className='details-title'>{client.name}</h2>
					<div className='details-meta'>
						<span className='meta-chip'>NIP: {client.NIP || '—'}</span>
						{client.website && (
							<span className='meta-chip'>
								<a className='details-link' href={client.website} target='_blank' rel='noreferrer'>
									{client.website}
								</a>
							</span>
						)}
						{client.email && (
							<span className='meta-chip'>
								<a className='details-link' href={`mailto:${client.email}`}>
									{client.email}
								</a>
							</span>
						)}
					</div>
				</div>

				<div className='details-actions'>
					<button
						className='edit-btn'
						title='Edytuj klienta'
						aria-label='Edytuj klienta'
						onClick={() => {
							setShowModal(true)
							setNewClient({ ...client })
							setSameAsAddress(false)
						}}>
						<Pencil size={16} />
					</button>
					<Link
						className='add-btn'
						title='Utwórz ofertę'
						aria-label='Utwórz ofertę'
						to={`/sprzedaz/oferty?client=${encodeURIComponent(client.name)}`}>
						<FileText size={16} />
					</Link>
					<Link
						className='add-btn'
						title='Utwórz zlecenie'
						aria-label='Utwórz zlecenie'
						to={`/sprzedaz/rejestr-zlecen?client=${encodeURIComponent(client.name)}`}>
						<ClipboardList size={16} />
					</Link>
				</div>
			</div>

			{/* Dane podstawowe */}
			<div className='details-card'>
				<div className='details-table-wrap'>
					<table className='details-table'>
						<tbody>
							<tr>
								<th>Pełna nazwa</th>
								<td>{client.name || '—'}</td>
							</tr>
							<tr>
								<th>NIP</th>
								<td>{client.NIP || '—'}</td>
							</tr>
							<tr>
								<th>E-mail (ogólny)</th>
								<td>
									{client.email ? (
										<a className='details-link' href={`mailto:${client.email}`}>
											{client.email}
										</a>
									) : (
										'—'
									)}
								</td>
							</tr>
							<tr>
								<th>Strona WWW</th>
								<td>
									{client.website ? (
										<a className='details-link' href={client.website} target='_blank' rel='noreferrer'>
											{client.website}
										</a>
									) : (
										'—'
									)}
								</td>
							</tr>
							<tr>
								<th>Adres siedziby</th>
								<td>{fullAddr(client.address || {}) || '—'}</td>
							</tr>
							<tr>
								<th>Adres korespondencyjny</th>
								<td>{fullAddr(client.contactAddress || {}) || '—'}</td>
							</tr>
							<tr>
								<th>Osoba kontaktowa</th>
								<td>{client.contactPerson || '—'}</td>
							</tr>
							<tr>
								<th>Telefon kontaktowy</th>
								<td>{client.contactPhone || '—'}</td>
							</tr>
							<tr>
								<th>E-mail kontaktowy</th>
								<td>
									{client.contactEmail ? (
										<a className='details-link' href={`mailto:${client.contactEmail}`}>
											{client.contactEmail}
										</a>
									) : (
										'—'
									)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Sekcje: Oferty + Zlecenia */}
			<div className='details-grid'>
				<section className='details-card'>
					<h3 className='section-title'>Oferty klienta</h3>
					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Nr oferty</th>
									<th>Data</th>
									<th>Status</th>
									<th>Kwota</th>
									<th className='ta-center'>Podgląd</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colSpan={5} className='ta-center' style={{ padding: 10 }}>
										Brak ofert powiązanych.{' '}
										<Link className='details-link' to={`/sprzedaz/oferty?client=${encodeURIComponent(client.name)}`}>
											Dodaj nową ofertę
										</Link>
										.
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<section className='details-card'>
					<h3 className='section-title'>Zlecenia klienta</h3>
					<div className='details-table-wrap'>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Nr zlecenia</th>
									<th>Data przyjęcia</th>
									<th>Etap</th>
									<th>Wartość</th>
									<th className='ta-center'>Podgląd</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colSpan={5} className='ta-center' style={{ padding: 10 }}>
										Brak zleceń powiązanych.{' '}
										<Link
											className='details-link'
											to={`/sprzedaz/rejestr-zlecen?client=${encodeURIComponent(client.name)}`}>
											Utwórz zlecenie
										</Link>
										.
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>

			{/* Modal edycji klienta */}
			{showModal && (
				<Modal title='Edytuj klienta' onClose={() => setShowModal(false)}>
					<ClientForm
						newClient={newClient}
						setNewClient={setNewClient}
						onSubmit={handleSubmit}
						onClose={() => setShowModal(false)}
						sameAsAddress={sameAsAddress}
						setSameAsAddress={setSameAsAddress}
					/>
				</Modal>
			)}
		</div>
	)
}

export default Client

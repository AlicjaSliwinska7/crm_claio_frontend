// src/features/equipment/pages/CalibrationLab.jsx
import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

const toStr = v => (v ?? '—').toString()
const safeArr = a => (Array.isArray(a) ? a : [])
const joinServices = s => {
	const arr = safeArr(s).filter(Boolean)
	return arr.length ? arr.join(', ') : '—'
}

export default function CalibrationLab({ labs = [] }) {
	const { id: idFromPath } = useParams()
	const [sp] = useSearchParams()
	const navigate = useNavigate()
	const location = useLocation()

	// ID może przyjść z :id lub ?select=...
	const selectedId = useMemo(() => {
		const q = sp.get('select')
		return decodeURIComponent(idFromPath || q || '')
	}, [idFromPath, sp])

	// 1) z nawigacji (location.state.lab)
	const labFromState = location?.state?.lab

	// 2) z localStorage (jeśli używasz tam przechowywania listy)
	const labsFromStorage = useMemo(() => {
		try {
			const raw = localStorage.getItem('calibrationLabs')
			if (raw) return JSON.parse(raw)
		} catch {}
		return null
	}, [])

	// 3) z propsów (fallback)
	const allCandidates = useMemo(() => {
		if (Array.isArray(labsFromStorage) && labsFromStorage.length) return labsFromStorage
		if (Array.isArray(labs) && labs.length) return labs
		return []
	}, [labsFromStorage, labs])

	const lab = labFromState ?? (selectedId && allCandidates.find(x => String(x?.id) === String(selectedId))) ?? null

	const handleBack = () => {
		navigate('/wyposazenie/laboratoria-wzorcowania')
	}

	const handleEdit = () => {
		// umowa: lista laboratoriów reaguje na ?edit=<id> i otwiera modal edycji
		navigate(`/wyposazenie/laboratoria-wzorcowania?edit=${encodeURIComponent(selectedId)}`)
	}

	// Brak ID
	if (!selectedId) {
		return (
			<div className='content-pad'>
				<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
					<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
						<li>
							<Link to='/wyposazenie/laboratoria-wzorcowania' className='link'>
								Laboratoria wzorcowania
							</Link>
						</li>
						<li aria-current='page' className='muted'>
							—
						</li>
					</ol>
				</nav>

				<p>Nie wybrano laboratorium.</p>
				<button className='m-btn m-btn--secondary' onClick={handleBack}>
					Wróć do listy
				</button>
			</div>
		)
	}

	// Nie znaleziono
	if (!lab) {
		return (
			<div className='content-pad'>
				<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
					<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
						<li>
							<Link to='/wyposazenie/laboratoria-wzorcowania' className='link'>
								Laboratoria wzorcowania
							</Link>
						</li>
						<li aria-current='page' className='muted'>
							{selectedId}
						</li>
					</ol>
				</nav>

				<h2>Laboratorium: {selectedId}</h2>
				<p>Nie znaleziono danych dla tego laboratorium.</p>
				<button className='m-btn m-btn--secondary' onClick={handleBack}>
					Wróć do listy
				</button>
			</div>
		)
	}

	const titleText = `${toStr(lab.name)}${lab.city ? ` — ${toStr(lab.city)}` : ''}`

	return (
		<div className='content-pad'>
			{/* Breadcrumb */}
			<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
				<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
					<li>
						<Link to='/wyposazenie/laboratoria-wzorcowania' className='link'>
							Laboratoria wzorcowania
						</Link>
					</li>
					<li aria-current='page' className='muted'>
						{titleText}
					</li>
				</ol>
			</nav>

			{/* Nagłówek */}
			<header className='detail-header' style={{ marginBottom: 12 }}>
				<h2 style={{ margin: 0 }}>
					{toStr(lab.name)}
					{lab.city ? <span className='muted'> — {toStr(lab.city)}</span> : null}
				</h2>
				{lab.services && lab.services.length > 0 ? (
					<div className='muted' style={{ marginTop: 4 }}>
						Zakres: {joinServices(lab.services)}
					</div>
				) : null}
			</header>

			{/* Sekcja: dane adresowe */}
			<section className='m-section' aria-labelledby='lab-sec-address'>
				<h6 id='lab-sec-address' className='m-section__title'>
					Dane adresowe
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Miasto</div>
						<div>{toStr(lab.city)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Adres</div>
						<div>{toStr(lab.address)}</div>
					</div>
				</div>
			</section>

			{/* Sekcja: kontakt */}
			<section className='m-section' aria-labelledby='lab-sec-contact'>
				<h6 id='lab-sec-contact' className='m-section__title'>
					Kontakt
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Osoba kontaktowa</div>
						<div>{toStr(lab.contactPerson)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Telefon</div>
						<div>
							{lab.phone ? (
								<a href={`tel:${lab.phone}`} className='link' onClick={e => e.stopPropagation()}>
									{lab.phone}
								</a>
							) : (
								'—'
							)}
						</div>
					</div>
				</div>

				<div className='m-field'>
					<div className='m-label'>E-mail</div>
					<div>
						{lab.email ? (
							<a href={`mailto:${lab.email}`} className='link' onClick={e => e.stopPropagation()}>
								{lab.email}
							</a>
						) : (
							'—'
						)}
					</div>
				</div>
			</section>

			{/* Sekcja: zakres usług */}
			<section className='m-section' aria-labelledby='lab-sec-services'>
				<h6 id='lab-sec-services' className='m-section__title'>
					Zakres usług
				</h6>
				<div className='m-field'>
					<div>{joinServices(lab.services)}</div>
				</div>
			</section>

			{/* Sekcja: notatki */}
			<section className='m-section' aria-labelledby='lab-sec-notes'>
				<h6 id='lab-sec-notes' className='m-section__title'>
					Notatki
				</h6>
				<div className='m-field'>
					<div>{toStr(lab.notes)}</div>
				</div>
			</section>

			{/* Akcje */}
			<div className='m-actions' style={{ display: 'flex', gap: 8, marginTop: 12 }}>
				<button type='button' className='m-btn m-btn--secondary' onClick={handleBack}>
					Wróć do listy
				</button>
				<button type='button' className='m-btn m-btn--primary' onClick={handleEdit}>
					Edytuj
				</button>
			</div>
		</div>
	)
}

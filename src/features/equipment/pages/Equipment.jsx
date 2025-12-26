// src/components/pages/contents/Equipment.jsx
import React, { useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom'

/** Pomocnicze */
const rangeToString = r => {
	const unit = r?.unit ? ` ${r.unit}` : ''
	const val = [r?.rangeMin ?? '', r?.rangeMax ?? ''].filter(Boolean).join(' – ')
	return val ? `${val}${unit}` : '—'
}
const toStr = v => (v ?? '—').toString()

export default function Equipment({ items = [] }) {
	const { id: idFromPath } = useParams()
	const [sp] = useSearchParams()
	const navigate = useNavigate()
	const location = useLocation()

	// ID może przyjść jako /wyposazenie/:id albo ?select=...
	const selectedId = useMemo(() => {
		const q = sp.get('select')
		return decodeURIComponent(idFromPath || q || '')
	}, [idFromPath, sp])

	// 1) z nawigacji (location.state)
	const itemFromState = location?.state?.item

	// 2) z localStorage (jeśli przechowujesz stan rejestru)
	const itemsFromStorage = useMemo(() => {
		try {
			const raw = localStorage.getItem('equipmentRegistry')
			if (raw) return JSON.parse(raw)
		} catch {}
		return null
	}, [])

	// 3) z propsów (fallback)
	const allCandidates = useMemo(() => {
		if (Array.isArray(itemsFromStorage) && itemsFromStorage.length) return itemsFromStorage
		if (Array.isArray(items) && items.length) return items
		return []
	}, [itemsFromStorage, items])

	const item = itemFromState ?? (selectedId && allCandidates.find(x => String(x?.id) === String(selectedId))) ?? null

	const handleEdit = () => {
		// Umowa: EquipmentRegistry reaguje na ?edit=<id> i otwiera modal edycji
		navigate(`/wyposazenie/rejestr-wyposazenia?edit=${encodeURIComponent(selectedId)}`)
	}

	const handleBack = () => {
		navigate('/wyposazenie/rejestr-wyposazenia')
	}

	// Brak ID
	if (!selectedId) {
		return (
			<div className='content-pad'>
				<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
					<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
						<li>
							<Link to='/wyposazenie/rejestr-wyposazenia' className='link'>
								Wyposażenie
							</Link>
						</li>
						<li aria-current='page' className='muted'>
							—
						</li>
					</ol>
				</nav>

				<p>Nie wybrano pozycji wyposażenia.</p>
				<Link to='/wyposazenie/rejestr-wyposazenia' className='link'>
					Wróć do rejestru
				</Link>
			</div>
		)
	}

	// Nie znaleziono
	if (!item) {
		return (
			<div className='content-pad'>
				<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
					<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
						<li>
							<Link to='/wyposazenie/rejestr-wyposazenia' className='link'>
								Wyposażenie
							</Link>
						</li>
						<li aria-current='page' className='muted'>
							{selectedId}
						</li>
					</ol>
				</nav>

				<h2>Wyposażenie: {selectedId}</h2>
				<p>Nie znaleziono danych dla tej pozycji.</p>
				<div className='m-actions' style={{ marginTop: 12 }}>
					<button className='m-btn m-btn--secondary' onClick={handleBack}>
						Wróć do rejestru
					</button>
				</div>
			</div>
		)
	}

	const isMachine = item.type === 'maszyna'
	const isInstrument = item.type === 'przyrząd'
	const titleText = `${toStr(item.name)} (${toStr(item.id)})`

	return (
		<div className='content-pad'>
			{/* Breadcrumb */}
			<nav aria-label='Breadcrumb' style={{ marginBottom: 12 }}>
				<ol className='breadcrumb' style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
					<li>
						<Link to='/wyposazenie/rejestr-wyposazenia' className='link'>
							Wyposażenie
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
					{toStr(item.name)} <span className='muted'>({toStr(item.id)})</span>
				</h2>
				<div className='muted' style={{ marginTop: 4 }}>
					Typ: {toStr(item.type)} • Status: {toStr(item.status)}
				</div>
			</header>

			{/* Sekcja: podstawowe */}
			<section className='m-section' aria-labelledby='eq-sec-basic'>
				<h6 id='eq-sec-basic' className='m-section__title'>
					Dane podstawowe
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>ID</div>
						<div>{toStr(item.id)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Nazwa</div>
						<div>{toStr(item.name)}</div>
					</div>
				</div>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Status</div>
						<div>{toStr(item.status)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Tryb użycia</div>
						<div>{toStr(item.usageMode)}</div>
					</div>
				</div>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Lokalizacja</div>
						<div>{toStr(item.location)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Grupa</div>
						<div>{toStr(item.group)}</div>
					</div>
				</div>
			</section>

			{/* Sekcja: parametry wspólne */}
			<section className='m-section' aria-labelledby='eq-sec-params'>
				<h6 id='eq-sec-params' className='m-section__title'>
					Parametry
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Model</div>
						<div>{toStr(item.model)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Producent</div>
						<div>{toStr(item.producer)}</div>
					</div>
				</div>
			</section>

			{/* Sekcja: maszynowe */}
			{isMachine && (
				<section className='m-section' aria-labelledby='eq-sec-machine'>
					<h6 id='eq-sec-machine' className='m-section__title'>
						Maszyna
					</h6>

					<div className='m-row'>
						<div className='m-field'>
							<div className='m-label'>Operator</div>
							<div>{toStr(item.operator)}</div>
						</div>
						<div className='m-field'>
							<div className='m-label'>Moc</div>
							<div>{toStr(item.power)}</div>
						</div>
					</div>
				</section>
			)}

			{/* Sekcja: przyrządowe */}
			{isInstrument && (
				<section className='m-section' aria-labelledby='eq-sec-instrument'>
					<h6 id='eq-sec-instrument' className='m-section__title'>
						Przyrząd
					</h6>

					<div className='m-row'>
						<div className='m-field'>
							<div className='m-label'>Wielkość</div>
							<div>{toStr(item.measures)}</div>
						</div>
						<div className='m-field'>
							<div className='m-label'>Jednostka</div>
							<div>{toStr(item.unit)}</div>
						</div>
					</div>

					<div className='m-field'>
						<div className='m-label'>Zakres</div>
						<div>{rangeToString(item)}</div>
					</div>
				</section>
			)}

			{/* Sekcja: dodatkowe */}
			<section className='m-section' aria-labelledby='eq-sec-extra'>
				<h6 id='eq-sec-extra' className='m-section__title'>
					Dodatkowe
				</h6>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Nr seryjny</div>
						<div>{toStr(item.serialNumber)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Nr inwentarzowy</div>
						<div>{toStr(item.assetNumber)}</div>
					</div>
				</div>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Dostawca</div>
						<div>{toStr(item.supplier)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Data zakupu</div>
						<div>{toStr(item.purchaseDate)}</div>
					</div>
				</div>

				<div className='m-row'>
					<div className='m-field'>
						<div className='m-label'>Typ przyrządu</div>
						<div>{toStr(item.instrumentType)}</div>
					</div>
					<div className='m-field'>
						<div className='m-label'>Użytkownik</div>
						<div>{toStr(item.user)}</div>
					</div>
				</div>

				<div className='m-field'>
					<div className='m-label'>Opis / uwagi</div>
					<div>{toStr(item.info)}</div>
				</div>
			</section>

			{/* Akcje */}
			<div className='m-actions' style={{ display: 'flex', gap: 8, marginTop: 12 }}>
				<button className='m-btn m-btn--secondary' onClick={handleBack} type='button'>
					Wróć do rejestru
				</button>
				<button className='m-btn m-btn--primary' onClick={handleEdit} type='button'>
					Edytuj
				</button>
			</div>
		</div>
	)
}

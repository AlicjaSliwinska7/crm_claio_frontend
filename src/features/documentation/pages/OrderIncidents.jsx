// src/components/pages/contents/OrderIncidents.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { MAIN_PROCESS_STAGES } from './Workflow'

function genId() {
	return 'INC-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}

function safeMs(d) {
	const t = d ? new Date(d).getTime() : NaN
	return Number.isFinite(t) ? t : NaN
}

function fmtDateTime(dt) {
	if (!dt) return '—'
	const d = new Date(dt)
	return Number.isFinite(d.getTime()) ? d.toLocaleString() : '—'
}

function fmtDuration(ms) {
	if (!ms || ms <= 0) return '0 min'
	const totalMinutes = Math.round(ms / 60000)
	const h = Math.floor(totalMinutes / 60)
	const m = totalMinutes % 60
	if (h > 0 && m > 0) return `${h} h ${m} min`
	if (h > 0) return `${h} h`
	return `${m} min`
}

export default function OrderIncidents({ orderId, currentUser, defaultStage }) {
	const storageKey = useMemo(() => `docOrders:incidents:${orderId}`, [orderId])

	// Lista zgłoszeń (persist per orderId)
	const [incidents, setIncidents] = useState(() => {
		try {
			const raw = localStorage.getItem(storageKey)
			return raw ? JSON.parse(raw) : []
		} catch {
			return []
		}
	})

	// Pola edycyjne nowego zgłoszenia
	const [type, setType] = useState('przestój') // 'przestój' | 'błąd' | 'uwaga'
	const [stage, setStage] = useState(defaultStage || MAIN_PROCESS_STAGES[0])
	const [startedAt, setStartedAt] = useState('')
	const [endedAt, setEndedAt] = useState('')
	const [note, setNote] = useState('')

	// Gdy zmieni się orderId – przeładuj jego zgłoszenia
	useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey)
			setIncidents(raw ? JSON.parse(raw) : [])
		} catch {
			setIncidents([])
		}
	}, [storageKey])

	// Persistuj listę
	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(incidents))
		} catch {}
	}, [storageKey, incidents])

	// Aktualizuj domyślny etap przy zmianie propsów
	useEffect(() => {
		setStage(defaultStage || MAIN_PROCESS_STAGES[0])
	}, [defaultStage, orderId])

	const canAddDates = type !== 'uwaga'

	const addIncident = () => {
		// Minimalna walidacja
		const nowIso = new Date().toISOString()
		let start = canAddDates ? startedAt || nowIso : null
		let end = canAddDates ? endedAt || null : null

		if (canAddDates) {
			const s = safeMs(start)
			const e = safeMs(end)
			if (Number.isFinite(s) && Number.isFinite(e) && e < s) {
				// jeżeli koniec < start → zamień miejscami
				const tmp = start
				start = end
				end = tmp
			}
		}

		// Przy uwadze zachęcamy do opisu, ale nie blokujemy
		const payload = {
			id: genId(),
			orderId,
			type, // 'przestój' | 'błąd' | 'uwaga'
			stage, // etap procesu głównego
			startedAt: canAddDates ? start : null,
			endedAt: canAddDates ? end : null,
			note: (note || '').trim(),
			reporter: currentUser || '—',
			createdAt: nowIso,
		}

		setIncidents(prev => [payload, ...prev]) // <<< od razu na górę listy

		// reset pól (zostaw typ i etap, by szybciej dodawać seryjnie)
		if (canAddDates) {
			setStartedAt('')
			setEndedAt('')
		}
		setNote('')
	}

	const handleKeyDown = e => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault()
			addIncident()
		}
	}

	const removeById = id => {
		setIncidents(prev => prev.filter(i => i.id !== id))
	}

	// ======= Podsumowania =======
	const { totalCount, totalDowntimeMs, byStage } = useMemo(() => {
		const acc = {}
		let totMs = 0

		for (const inc of incidents) {
			const sKey = inc.stage || '—'
			if (!acc[sKey]) acc[sKey] = { count: 0, downtimeMs: 0 }
			acc[sKey].count += 1

			if (inc.type !== 'uwaga') {
				const s = safeMs(inc.startedAt)
				const e = safeMs(inc.endedAt)
				const endMs = Number.isFinite(e) ? e : Date.now()
				if (Number.isFinite(s)) {
					const diff = Math.max(0, endMs - s)
					acc[sKey].downtimeMs += diff
					totMs += diff
				}
			}
		}

		return {
			totalCount: incidents.length,
			totalDowntimeMs: totMs,
			byStage: acc,
		}
	}, [incidents])

	const byStageRows = useMemo(() => {
		const rows = Object.entries(byStage).map(([stage, data]) => ({
			stage,
			count: data.count,
			downtimeMs: data.downtimeMs,
		}))
		// sortuj malejąco po czasie przestoju
		rows.sort((a, b) => b.downtimeMs - a.downtimeMs || b.count - a.count)
		return rows
	}, [byStage])

	return (
		<div>
			<h3 style={{ marginTop: 0 }}>Zgłoszenia (przestoje / błędy / uwagi)</h3>

			{/* Formularz DODAJ – bez <form>, żeby nie triggerować submitu rodzica */}
			<div className='docForm'>
				<div className='docForm__grid'>
					<label className='f'>
						<span className='l'>Typ zgłoszenia</span>
						<select className='i i--sm' value={type} onChange={e => setType(e.target.value)}>
							<option value='przestój'>przestój</option>
							<option value='błąd'>błąd</option>
							<option value='uwaga'>uwaga</option>
						</select>
					</label>

					<label className='f f--span2'>
						<span className='l'>Etap procesu głównego</span>
						<select className='i' value={stage} onChange={e => setStage(e.target.value)}>
							{MAIN_PROCESS_STAGES.map(s => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</label>

					{canAddDates && (
						<>
							<label className='f'>
								<span className='l'>Od</span>
								<input
									type='datetime-local'
									className='i i--md'
									value={startedAt}
									onChange={e => setStartedAt(e.target.value)}
								/>
							</label>
							<label className='f'>
								<span className='l'>Do</span>
								<input
									type='datetime-local'
									className='i i--md'
									value={endedAt}
									onChange={e => setEndedAt(e.target.value)}
								/>
							</label>
						</>
					)}

					<label className='f f--span3'>
						<span className='l'>Opis sytuacji</span>
						<textarea
							className='i t'
							placeholder={type === 'uwaga' ? 'Krótka uwaga / komentarz…' : 'Opisz krótko sytuację, wpływ i kontekst…'}
							value={note}
							onChange={e => setNote(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</label>

					<div className='f f--row'>
						<button type='button' className='ghost' onClick={addIncident}>
							Dodaj zgłoszenie
						</button>
					</div>
				</div>
			</div>

			<div className='kb__divider' />

			{/* Lista zgłoszeń */}
			{incidents.length === 0 ? (
				<div className='kb__empty'>Brak zgłoszeń dla tego zlecenia.</div>
			) : (
				<div className='docOrders__list'>
					{incidents.map(inc => (
						<div key={inc.id} className='card' style={{ padding: 10 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
								<span className='kb__chip'>{inc.type}</span>
								<span className='kb__chip' title='Etap procesu'>
									{inc.stage}
								</span>
								<span className='kb__chip' title='Dodał'>
									{inc.reporter}
								</span>
								<span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>
									utw.: {fmtDateTime(inc.createdAt)}
								</span>
							</div>

							{inc.type !== 'uwaga' && (
								<p style={{ margin: '8px 0 0 0', fontSize: 13 }}>
									<b>Okres:</b> {fmtDateTime(inc.startedAt)} — {fmtDateTime(inc.endedAt)}
								</p>
							)}

							{inc.note && <p style={{ margin: '6px 0 0 0' }}>{inc.note}</p>}

							<div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
								<button className='ghost sm' type='button' onClick={() => removeById(inc.id)} title='Usuń zgłoszenie'>
									🗑
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Podsumowanie pod listą */}
			<div className='card' style={{ marginTop: 12 }}>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
					<span className='kb__chip'>Zgłoszeń: {totalCount}</span>
					<span className='kb__chip'>Czas przestoju łącznie: {fmtDuration(totalDowntimeMs)}</span>
				</div>

				<div style={{ marginTop: 10, overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ textAlign: 'left' }}>
								<th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Etap procesu</th>
								<th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Zgłoszeń</th>
								<th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Czas przestoju</th>
							</tr>
						</thead>
						<tbody>
							{byStageRows.length === 0 ? (
								<tr>
									<td style={{ padding: 8 }} colSpan={3}>
										—
									</td>
								</tr>
							) : (
								byStageRows.map(r => (
									<tr key={r.stage}>
										<td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>{r.stage}</td>
										<td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>{r.count}</td>
										<td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9' }}>
											{fmtDuration(r.downtimeMs)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

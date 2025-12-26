// src/components/pages/contents/DocumentationOrdersPage.jsx
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/documentation-orders.css'
import OrdersList from './OrdersList'
import { NEXT, PREV } from './Workflow'

// Bazowa ścieżka do widoku detali dokumentacji
const ORDER_DETAILS_BASE = '/dokumentacja/zlecenia'

/* =================== Demo data (z jednym wygenerowanym formularzem) =================== */
const demoOrders = [
	{
		id: 'OFT-001_2025',
		status: 'w przygotowaniu',
		number: '',
		acceptanceDate: '',
		client: {
			name: 'TechSolutions Sp. z o.o.',
			nip: '123-456-78-90',
			contact: 'Jan Kowalski',
			email: 'j.k@tech.pl',
			phone: '+48 501 000 000',
			address: '',
		},
		invoice: { address: 'ul. Informatyczna 15A, 00-950 Warszawa' },
		report: {
			manufacturer: 'TechSolutions',
			website: 'https://techsolutions.pl',
			address: '',
			email: '',
			phone: '',
		},
		order: {
			subject: 'Tworzywo sztuczne – płyta PE',
			description: 'Badania zgodnie z ISO 527-1:2019',
			model: 'PE-A1',
			nominalCapacity: '',
			nominalVoltage: '',
			crankingCurrent: '',
			sampleSize: 3,
			sampleProvidedByClient: true,
			postTest: 'zwrot do Zleceniodawcy',
			statementOfCompliance: false,
			decisionAcceptance: false,
			deadlineDaysFromStart: 14,
			deadlineConditions: {
				sampleAcceptance: true,
				orderRegistration: true,
				prepayment: false,
			},
			additionalDocsRequired: false,
			clientObservation: false,
			language: 'polski',
			deliveryForm: 'papier + PDF',
			copies: 1,
			methods: [{ ref: 'ISO 527-1:2019', test: 'Wytrzymałość', acc: 'A', point: 'A' }],
			notes: 'Pakować w osobne opakowania.',
		},
		payment: { priceNet: '', prepaymentNet: '', terms: '14 dni' },
		meta: { updatedAt: '2025-09-01T10:00:00Z' },
	},
	{
		id: 'OFT-002_2025',
		status: 'podpisane',
		number: 'ZL-2025/002',
		acceptanceDate: '2025-07-15',
		client: {
			name: 'GreenEnergy S.A.',
			nip: '789-012-34-56',
			contact: 'Anna Zielińska',
			email: 'a.z@green.pl',
			phone: '',
			address: '',
		},
		invoice: { address: 'ul. Ekologiczna 3B, 30-300 Kraków' },
		report: {
			manufacturer: 'GreenEnergy',
			website: 'https://greenenergy.pl',
			address: '',
			email: '',
			phone: '',
		},
		order: {
			subject: 'Kabel elektryczny (typ B)',
			description: 'PN-EN 50395:2000',
			model: 'B-220',
			nominalCapacity: '',
			nominalVoltage: '',
			crankingCurrent: '',
			sampleSize: 5,
			sampleProvidedByClient: true,
			postTest: 'zwrot do Zleceniodawcy',
			statementOfCompliance: true,
			decisionAcceptance: true,
			deadlineDaysFromStart: 10,
			deadlineConditions: {
				sampleAcceptance: true,
				orderRegistration: true,
				prepayment: false,
			},
			additionalDocsRequired: false,
			clientObservation: false,
			language: 'angielski',
			deliveryForm: 'PDF',
			copies: 1,
			methods: [
				{
					ref: 'PN-EN 50395:2000',
					test: 'Wytrzymałość izolacji',
					acc: 'NA',
					point: 'B',
				},
			],
			notes: '',
		},
		payment: { priceNet: '8 750,00', prepaymentNet: '', terms: '14 dni' },
		meta: { updatedAt: '2025-09-02T08:30:00Z' },
		generatedForm: {
			type: 'internal',
			at: '2025-09-02T09:30:00Z',
			fileName: 'Formularz_ZL-2025-002.pdf',
		},
	},
	{
		id: 'OFT-003_2025',
		status: 'zarejestrowane',
		number: 'ZL-2025/003',
		acceptanceDate: '2025-07-20',
		client: {
			name: 'Meditech Polska',
			nip: '456-789-01-23',
			contact: 'Tomasz Wójcik',
			email: 't.w@meditech.pl',
			phone: '',
			address: '',
		},
		invoice: { address: 'ul. Zdrowa 88, 60-123 Poznań' },
		report: {
			manufacturer: 'Meditech',
			website: 'https://meditech.pl',
			address: '',
			email: '',
			phone: '',
		},
		order: {
			subject: 'Narzędzia chirurgiczne',
			description: 'EN ISO 13485:2016 – testy wytrzymałościowe',
			model: 'Chir-12',
			nominalCapacity: '',
			nominalVoltage: '',
			crankingCurrent: '',
			sampleSize: 12,
			sampleProvidedByClient: false,
			postTest: 'utylizacja',
			statementOfCompliance: true,
			decisionAcceptance: true,
			deadlineDaysFromStart: 21,
			deadlineConditions: {
				sampleAcceptance: true,
				orderRegistration: true,
				prepayment: true,
			},
			additionalDocsRequired: true,
			clientObservation: true,
			language: 'polski',
			deliveryForm: 'papier + PDF',
			copies: 2,
			methods: [{ ref: 'EN ISO 13485:2016', test: 'Wytrzymałość', acc: 'A', point: 'A' }],
			notes: 'Ostrożnie – narzędzia ostre.',
		},
		payment: { priceNet: '22 300,00', prepaymentNet: '', terms: '14 dni' },
		meta: { updatedAt: '2025-09-03T09:00:00Z' },
	},
]

/* =================== Pomocniki =================== */
function genId(prefix = 'OFT') {
	const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
	const year = new Date().getFullYear()
	return `${prefix}-${rand}_${year}`
}
function updateStatusInState(setOrders, id, dir) {
	const MAP = dir === 'next' ? NEXT : PREV
	setOrders(prev =>
		prev.map(o => {
			if (o.id !== id) return o
			const to = MAP[o.status]
			return to
				? {
						...o,
						status: to,
						meta: { ...(o.meta || {}), updatedAt: new Date().toISOString() },
				  }
				: o
		})
	)
}

/* =================== Komponent =================== */
export default function DocumentationOrdersPage() {
	const [orders, setOrders] = useState(demoOrders)
	const [activeId, setActiveId] = useState(demoOrders[0]?.id || null)
	const navigate = useNavigate()

	// Zestawienie statusów (kolorowe kapsuły na górze)
	const summary = useMemo(() => {
		const agg = {
			total: orders.length,
			'w przygotowaniu': 0,
			wysłane: 0,
			podpisane: 0,
			zarejestrowane: 0,
		}
		orders.forEach(o => (agg[o.status] = (agg[o.status] || 0) + 1))
		return agg
	}, [orders])

	/* --------- CRUD / Akcje --------- */
	const startCreate = () => {
		const neo = {
			id: genId('OFT'),
			status: 'w przygotowaniu',
			number: '',
			acceptanceDate: '',
			client: {
				name: '',
				nip: '',
				contact: '',
				email: '',
				phone: '',
				address: '',
			},
			invoice: { address: '' },
			report: { manufacturer: '', website: '', address: '', email: '', phone: '' },
			order: {
				subject: '',
				description: '',
				model: '',
				nominalCapacity: '',
				nominalVoltage: '',
				crankingCurrent: '',
				sampleSize: 1,
				sampleProvidedByClient: false,
				postTest: 'zwrot do Zleceniodawcy',
				statementOfCompliance: false,
				decisionAcceptance: false,
				deadlineDaysFromStart: 14,
				deadlineConditions: {
					sampleAcceptance: true,
					orderRegistration: true,
					prepayment: false,
				},
				additionalDocsRequired: false,
				clientObservation: false,
				language: 'polski',
				deliveryForm: 'PDF',
				copies: 1,
				methods: [],
				notes: '',
			},
			payment: { priceNet: '', prepaymentNet: '', terms: '14 dni' },
			process: {},
			meta: { updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
		}

		// Dodaj do lokalnego stanu listy (żeby po powrocie już było widoczne)
		setOrders(prev => [neo, ...prev])
		setActiveId(neo.id)

		// Przejdź do widoku detali dokumentacji, przekaż cały obiekt + ?new=1
		navigate(`${ORDER_DETAILS_BASE}/${neo.id}?new=1`, { state: { order: neo } })
	}

	const openById = id => setActiveId(id)

	// Usuń (z dbałością o activeId w tym samym cyklu)
	const deleteById = id => {
		setOrders(prev => {
			const next = prev.filter(o => o.id !== id)
			if (activeId === id) setActiveId(next[0]?.id || null)
			return next
		})
	}

	const nextById = id => updateStatusInState(setOrders, id, 'next')
	const prevById = id => updateStatusInState(setOrders, id, 'prev')

	// Generowanie formularza: zaktualizuj rekord (mock)
	const handleGenerateForm = async id => {
		setOrders(prev =>
			prev.map(o =>
				o.id === id
					? {
							...o,
							generatedForm: {
								type: 'internal',
								at: new Date().toISOString(),
								fileName: `Formularz_${(o.number || o.id).replace(/[^\w\-]+/g, '-')}.pdf`,
							},
							meta: { ...(o.meta || {}), updatedAt: new Date().toISOString() },
					  }
					: o
			)
		)
	}

	// (opcjonalnie) Podgląd – placeholder
	const handlePreviewForm = id => {
		console.debug('Preview form for', id)
	}

	return (
		<div className='docOrders'>
			{/* Kolorowe zestawienie na górze (globalne podsumowanie) */}
			<div className='docOrders__summary'>
				<div className='summary-pill tone-slate'>
					<span>Łącznie</span>
					<b>{summary.total}</b>
				</div>
				<div className='summary-pill tone-amber'>
					<span>w przygotowaniu</span>
					<b>{summary['w przygotowaniu']}</b>
				</div>
				<div className='summary-pill tone-blue'>
					<span>wysłane</span>
					<b>{summary['wysłane']}</b>
				</div>
				<div className='summary-pill tone-indigo'>
					<span>podpisane</span>
					<b>{summary['podpisane']}</b>
				</div>
				<div className='summary-pill tone-green'>
					<span>zarejestrowane</span>
					<b>{summary['zarejestrowane']}</b>
				</div>
			</div>

			{/* Tylko lista (OrderDetails otwierasz w osobnym route) */}
			<OrdersList
				orders={orders}
				activeId={activeId}
				onSelect={openById}
				onCreate={startCreate}
				onDelete={deleteById}
				onNextStatus={nextById}
				onPrevStatus={prevById}
				onGenerateForm={handleGenerateForm}
				onPreviewForm={handlePreviewForm}
			/>
		</div>
	)
}

import React from 'react'
import { Navigate } from 'react-router-dom'
import Clients from '../../features/sales/pages/ClientsDirectory.jsx'
import Client from '../../features/sales/pages/Client.jsx'
import Offers from '../../features/sales/pages/OffersRegister.jsx'
import OrdersRegister from '../../features/sales/pages/OrdersRegister.jsx'
import SalesSummary from '../../features/sales/pages/SalesSummary.jsx'
import PricingBuilder from '../../features/sales/pages/PricingBuilder.jsx'

export function buildSalesRoutes(deps) {
	const { clients, setClients, offers, setOffers, ordersRegister, setOrdersRegister } = deps
	return [
		{
			path: 'sprzedaz',
			children: [
				{ index: true, element: <Navigate to='oferty' replace /> },
				{
					path: 'klienci',
					children: [
						{ index: true, element: <Clients clients={clients} setClients={setClients} /> },
						{ path: ':id', element: <Client clients={clients} /> },
					],
				},
				{ path: 'oferty', element: <Offers offers={offers} setOffers={setOffers} clients={clients} /> },
				{
					path: 'rejestr-zlecen',
					element: <OrdersRegister ordersRegister={ordersRegister} setOrdersRegister={setOrdersRegister} />,
				},
				{ path: 'zestawienia', element: <SalesSummary ordersRegister={ordersRegister} offers={offers} /> },
				{ path: 'cennik', element: <PricingBuilder offers={offers} setOffers={setOffers} clients={clients} /> },
			],
		},

	]
}

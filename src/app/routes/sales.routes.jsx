// src/routes/buildSalesRoutes.js (lub gdzie ten plik leży)
import React from 'react'
import { Navigate } from 'react-router-dom'

import ClientsDirectory from '../../features/sales/pages/ClientsDirectory'
import Client from '../../features/sales/pages/Client'
import OffersRegister from '../../features/sales/pages/OffersRegister'
import OrdersRegister from '../../features/sales/pages/OrdersRegister'
import SalesSummary from '../../features/sales/pages/SalesSummary'
import PricingBuilder from '../../features/sales/pages/PricingBuilder'

export function buildSalesRoutes(deps) {
  const { clients, setClients, offers, setOffers, ordersRegister, setOrdersRegister } = deps

  return [
    {
      path: 'sprzedaz',
      children: [
        // domyślna podstrona: /sprzedaz -> /sprzedaz/oferty
        { index: true, element: <Navigate to="oferty" replace /> },

        {
          path: 'klienci',
          children: [
            // ✅ ClientsDirectory ma własny stan (useListCrud + initialClients)
            // więc NIE przekazujemy tu clients/setClients (bo to nic nie daje i rozjeżdża dane)
            { index: true, element: <ClientsDirectory /> },

            // ✅ widok szczegółów klienta nadal może korzystać z deps.clients
            { path: ':id', element: <Client clients={clients} /> },
          ],
        },

        { path: 'oferty', element: <OffersRegister offers={offers} setOffers={setOffers} clients={clients} /> },

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

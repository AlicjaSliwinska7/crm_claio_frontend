import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';

const AccountData = lazy(() => import('../../features/account/pages/AccountData.jsx'));
const AccountProfileSettings = lazy(() => import('../../features/account/pages/AccountProfileSettings.jsx'));
const QuickAccessSettings = lazy(() => import('../../app/layout/core/quick-access/QuickAccessSettings.jsx'));

const withFallback = (el) => <Suspense fallback={null}>{el}</Suspense>;

export function buildProfileRoutes() {
  return [
    { path: 'profil', element: withFallback(<AccountData />) },
    {
      path: 'ustawienia',
      children: [
        { index: true, element: <Navigate to="profil" replace /> },
        { path: 'profil', element: withFallback(<AccountProfileSettings />) },
        { path: 'skroty', element: withFallback(<QuickAccessSettings />) },
      ],
    },
  ];
}

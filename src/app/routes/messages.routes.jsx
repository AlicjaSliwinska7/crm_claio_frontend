// src/app/routes/messages.routes.jsx
import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

const MessagesInbox = lazy(() => import('../../features/messages/pages/MessagesInbox.js'))
const MessageForm   = lazy(() => import('../../features/messages/forms/MessageForm.js'))
const Notifications = lazy(() => import('../../features/notifications/pages/Notifications.jsx'))
const S = ({ children }) => <Suspense fallback={null}>{children}</Suspense>

export function buildMessagesRoutes() {
  return [
    { path: 'wiadomości/*', element: <Navigate to="/wiadomosci" replace /> },
    {
      path: 'wiadomosci',
      children: [
        {
           index: true, element: <S><MessagesInbox /></S> },
        { path: 'nowa', element: <S><MessageForm /></S> },
      ],
    },
    { path: 'powiadomienia/*', element: <S><Notifications /></S> },
  ]
}

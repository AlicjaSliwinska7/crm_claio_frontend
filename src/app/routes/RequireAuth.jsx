// src/app/routes/RequireAuth.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PATHS } from './paths'
export default function RequireAuth({ isAuthed, children }) {
  const loc = useLocation()
  if (!isAuthed) return <Navigate to={PATHS.LOGIN} replace state={{ from: loc }} />
  return children
}

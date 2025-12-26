// src/app/routes/lazy.js
import React from 'react'
export const lazyPage = (loader) => {
  const Cmp = React.lazy(loader)
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Ładowanie…</div>}>
      <Cmp />
    </React.Suspense>
  )
}

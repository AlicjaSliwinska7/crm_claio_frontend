import React from 'react'
import QuickAccess from './QuickAccess'
import './styles/quick-access-settings.css'

export default function QuickAccessSettings() {
  return (
    <div className="qa-settings-page">
      <div className="qa-settings-header">
        <p className="qa-settings-subtitle">
          Dodawaj i usuwaj kafelki widoczne na stronie głównej. Zmiany zapisują się automatycznie.
        </p>
      </div>

      <div className="qa-settings-card">
        <QuickAccess manage alwaysOpenAdd />
      </div>
    </div>
  )
}

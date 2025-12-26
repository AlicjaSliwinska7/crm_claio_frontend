import React from 'react'
import { useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import useAccountProfile from '../hooks/useAccountProfile'
import { User, RefreshCw, Pencil } from '../../../shared/ui/icons'
import '../styles/account-data.css'

export default function AccountData() {
  const navigate = useNavigate()
  const { initial: user, clear } = useAccountProfile()

  const handleEdit = () => navigate('/ustawienia/profil')
  const handleReset = () => {
    if (window.confirm('Przywrócić dane domyślne profilu?')) {
      clear()
      window.location.reload()
    }
  }

  return (
    <div className='account-page'>
      <div className='account-card'>
        <header className='account-header'>
          <div>
            <div className='account-title'>
              <span className='title-icon' aria-hidden='true'>
                <User size={20} />
              </span>
              <div>
                <h1>Profil użytkownika</h1>
                <p>Podstawowe informacje o użytkowniku</p>
              </div>
            </div>
          </div>

          <div className='account-actions'>
            <button
              className='btn btn--secondary'
              onClick={handleReset}
              title='Przywróć domyślne'
            >
              <RefreshCw size={16} />
              Przywróć
            </button>
            <button
              className='btn btn--primary'
              onClick={handleEdit}
              title='Edytuj profil'
            >
              <Pencil size={16} />
              Edytuj profil
            </button>
          </div>
        </header>

        <section className='account-grid'>
          <Field label='Imię'>{user.firstName || '—'}</Field>
          <Field label='Drugie imię'>{user.secondName || '—'}</Field>

          <Field label='Nazwisko'>{user.lastName || '—'}</Field>
          <Field label='Stanowisko'>{user.position || '—'}</Field>

          <Field label='Rola'>
            {user.role ? <span className='badge-muted'>{user.role}</span> : '—'}
          </Field>
          <Field label='Dział'>{user.department || '—'}</Field>

          <Field label='Telefon wewn.'>{user.internalPhone || '—'}</Field>
          <Field label='Telefon zewn.'>{user.externalPhone || '—'}</Field>

          <Field label='E-mail'>{user.email || '—'}</Field>
          <Field label='ID pracownika'>{user.employeeId || '—'}</Field>
        </section>

        <section className='account-section'>
          <h2>Opis</h2>
          <div className='account-description'>{user.description || '—'}</div>
        </section>
      </div>
    </div>
  )
}

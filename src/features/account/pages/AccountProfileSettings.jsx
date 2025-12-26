// src/features/account/pages/AccountProfileSettings.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LabeledInput from '../components/LabeledInput'
import LabeledTextarea from '../components/LabeledTextarea'
import useAccountProfile from '../hooks/useAccountProfile'
import { User, RefreshCw, Pencil } from '../../../shared/ui/icons'
import '../styles/account-data.css'

export default function AccountProfileSettings() {
  const navigate = useNavigate()
  const { initial, save, clear } = useAccountProfile()
  const [form, setForm] = useState(initial)

  const onChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = e => {
    e.preventDefault()
    save(form)
    navigate('/konto')
  }

  const onResetToDefault = () => {
    if (window.confirm('Na pewno przywrócić domyślne dane profilu?')) {
      clear()
      setForm({ ...initial })
      navigate('/konto')
      window.location.reload()
    }
  }

  return (
    <div className="account-page">
      <form className="account-card" onSubmit={onSubmit}>
        <header className="account-header">
          <div className="account-title">
            <span className="title-icon" aria-hidden="true">
              <User size={20} />
            </span>
            <div>
              <h1>Ustawienia profilu</h1>
              <p>Edytuj informacje wyświetlane w danych konta</p>
            </div>
          </div>

          <div className="account-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onResetToDefault}
              title="Przywróć domyślne"
            >
              <RefreshCw size={16} />
              Przywróć
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              title="Zapisz zmiany"
            >
              <Pencil size={16} />
              Zapisz
            </button>
          </div>
        </header>

        {/* ten sam układ co w AccountData, tylko w środku są inputy */}
        <section className="account-grid">
          <div className="account-field">
            <LabeledInput
              label="Imię"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
            />
          </div>
          <div className="account-field">
            <LabeledInput
              label="Drugie imię"
              name="secondName"
              value={form.secondName}
              onChange={onChange}
            />
          </div>

          <div className="account-field">
            <LabeledInput
              label="Nazwisko"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
            />
          </div>
          <div className="account-field">
            <LabeledInput
              label="Stanowisko"
              name="position"
              value={form.position}
              onChange={onChange}
            />
          </div>

          <div className="account-field">
            <LabeledInput
              label="Rola"
              name="role"
              value={form.role}
              onChange={onChange}
            />
          </div>
          <div className="account-field">
            <LabeledInput
              label="Dział"
              name="department"
              value={form.department}
              onChange={onChange}
            />
          </div>

          <div className="account-field">
            <LabeledInput
              label="Telefon wewnętrzny"
              name="internalPhone"
              value={form.internalPhone}
              onChange={onChange}
            />
          </div>
          <div className="account-field">
            <LabeledInput
              label="Telefon zewnętrzny"
              name="externalPhone"
              value={form.externalPhone}
              onChange={onChange}
            />
          </div>

          <div className="account-field">
            <LabeledInput
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
            />
          </div>
          <div className="account-field">
            <LabeledInput
              label="ID pracownika"
              name="employeeId"
              value={form.employeeId}
              onChange={onChange}
            />
          </div>
        </section>

        <section className="account-section">
          <h2>Opis</h2>
          <div className="account-field account-field--textarea">
            <LabeledTextarea
              name="description"
              rows={5}
              value={form.description}
              onChange={onChange}
              placeholder="Krótki opis, kompetencje, zakres obowiązków…"
            />
          </div>
        </section>
      </form>
    </div>
  )
}

import React, { useState, useEffect } from 'react'

const EMPTY = {
  receivedDate: '',   // Data wpływu
  orderNumber: '',    // Nr umowy / zlecenia
  client: '',         // Nazwa / zleceniodawca
  calcCard: '',       // Karta kalkulacyjna
  scope: '',          // Zakres badań
  subject: '',        // Przedmiot badań / wyrób (typ próbki)
  quantity: '',       // Ilość próbek
  code: '',           // Oznaczenie próbki
  price: '',          // Cena
  hours: '',          // Godziny [kwota]
  utilized: false,    // Wykorzystana
  workCode: '',       // Kod Pracy
  stage: '',          // Etap zlecenia
  notes: '',          // Uwagi
}

function OrderRegisterForm({ order, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    setForm(order ? { ...EMPTY, ...order } : EMPTY)
  }, [order])

  const change = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = e => {
    e.preventDefault()
    if (!form.receivedDate || !form.orderNumber || !form.client) {
      alert('Wymagane: Data wpływu, Nr umowy/zlecenia oraz Nazwa / zleceniodawca.')
      return
    }
    onSave(order ? { ...order, ...form } : form)
  }

  return (
    <form onSubmit={submit} className='modal-form'>
      <h4>Dane zlecenia</h4>

      {/* Data wpływu + Nr umowy */}
      <div className='two-col'>
        <label>
          <span>Data wpływu *</span>
          <input
            type='date'
            name='receivedDate'
            value={form.receivedDate}
            onChange={change}
            required
          />
        </label>
        <label>
          <span>Nr umowy / zlecenia *</span>
          <input
            name='orderNumber'
            value={form.orderNumber}
            onChange={change}
            required
          />
        </label>
      </div>

      {/* Nazwa / zleceniodawca */}
      <label>
        <span>Nazwa / zleceniodawca *</span>
        <input
          name='client'
          value={form.client}
          onChange={change}
          required
        />
      </label>

      {/* Karta kalkulacyjna + Kod Pracy */}
      <div className='two-col'>
        <label>
          <span>Karta kalkulacyjna</span>
          <input
            name='calcCard'
            value={form.calcCard}
            onChange={change}
          />
        </label>
        <label>
          <span>Kod Pracy</span>
          <input
            name='workCode'
            value={form.workCode}
            onChange={change}
          />
        </label>
      </div>

      {/* Zakres badań */}
      <label>
        <span>Zakres badań</span>
        <textarea
          name='scope'
          rows={2}
          value={form.scope}
          onChange={change}
        />
      </label>

      {/* Przedmiot badań/wyrób */}
      <label>
        <span>Przedmiot badań / wyrób (typ próbki)</span>
        <input
          name='subject'
          value={form.subject}
          onChange={change}
        />
      </label>

      {/* Ilość próbek + Oznaczenie próbki */}
      <div className='two-col'>
        <label>
          <span>Ilość próbek</span>
          <input
            type='number'
            name='quantity'
            value={form.quantity}
            onChange={change}
          />
        </label>
        <label>
          <span>Oznaczenie próbki</span>
          <input
            name='code'
            value={form.code}
            onChange={change}
          />
        </label>
      </div>

      {/* Cena + Godziny */}
      <div className='two-col'>
        <label>
          <span>Cena</span>
          <input
            name='price'
            value={form.price}
            onChange={change}
          />
        </label>
        <label>
          <span>Godziny [kwota]</span>
          <input
            name='hours'
            value={form.hours}
            onChange={change}
          />
        </label>
      </div>

      {/* Wykorzystana + Etap zlecenia */}
      <div className='two-col'>
        <label className='checkbox-label'>
          <input
            type='checkbox'
            name='utilized'
            checked={!!form.utilized}
            onChange={change}
          />
          Wykorzystana
        </label>
        <label>
          <span>Etap zlecenia</span>
          <select
            name='stage'
            value={form.stage}
            onChange={change}
          >
            <option value=''>— wybierz —</option>
            <option value='zarejestrowane'>Zarejestrowane</option>
            <option value='w trakcie badań'>W trakcie badań</option>
            <option value='zakończone'>Zakończone</option>
            <option value='wstrzymane'>Wstrzymane</option>
            <option value='anulowane'>Anulowane</option>
          </select>
        </label>
      </div>

      {/* Uwagi */}
      <label>
        <span>Uwagi</span>
        <textarea
          name='notes'
          rows={3}
          value={form.notes}
          onChange={change}
        />
      </label>

      <div className='modal-buttons'>
        <button type='submit'>Zapisz</button>
        <button type='button' onClick={onClose}>Anuluj</button>
      </div>
    </form>
  )
}

export default OrderRegisterForm

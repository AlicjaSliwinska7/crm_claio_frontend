import React, { useCallback, useEffect, useMemo } from 'react';

export default function ClientForm({
  newClient,
  setNewClient,
  onSubmit,
  onClose,
  sameAsAddress,
  setSameAsAddress,
}) {
  // Bezpieczne wartości + aliasy
  const emptyAddr = { street: '', buildingNumber: '', postalCode: '', city: '', country: '' };
  const client = useMemo(() => {
    const c = newClient || {};
    return {
      id: String(c.id ?? ''),
      name: String(c.name ?? ''),
      NIP: String(c.NIP ?? ''),
      email: String(c.email ?? ''),
      website: String(c.website ?? ''),
      address: { ...(c.address || emptyAddr) },
      contactAddress: { ...(c.contactAddress || emptyAddr) },
      contactPerson: String(c.contactPerson ?? ''),
      contactPhone: String(c.contactPhone ?? ''),
      contactEmail: String(c.contactEmail ?? ''),
    };
  }, [newClient]);

  const A = client.address;
  const C = client.contactAddress;

  const safeSet = typeof setNewClient === 'function' ? setNewClient : () => {};
  const safeOnSubmit = typeof onSubmit === 'function' ? onSubmit : (e) => e.preventDefault();
  const safeOnClose = typeof onClose === 'function' ? onClose : () => {};

  const setField = useCallback(
    (path, value) => {
      if (!path.includes('.')) {
        safeSet(prev => ({ ...(prev || {}), [path]: value }));
        return;
      }
      const [root, leaf] = path.split('.');
      safeSet(prev => ({
        ...(prev || {}),
        [root]: { ...((prev && prev[root]) || {}), [leaf]: value },
      }));
    },
    [safeSet]
  );

  const handleChange = (e) => {
    const { name, value } = e.target || {};
    if (!name) return;
    setField(name, value);
  };

  const handleBlurTrim = (e) => {
    const { name, value } = e.target || {};
    if (!name || typeof value !== 'string') return;
    const trimmed = value.trim();
    if (trimmed !== value) setField(name, trimmed);
  };

  const handleSameAs = (e) => {
    const checked = !!e.target.checked;
    setSameAsAddress?.(checked);
    if (checked) {
      safeSet(prev => ({
        ...(prev || {}),
        contactAddress: { ...((prev && prev.address) || emptyAddr) },
      }));
    }
  };

  // Żywa synchronizacja kontaktowego adresu, gdy checkbox aktywny
  useEffect(() => {
    if (!sameAsAddress) return;
    safeSet(prev => ({
      ...(prev || {}),
      contactAddress: { ...((prev && prev.address) || emptyAddr) },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameAsAddress, client.address.street, client.address.buildingNumber, client.address.postalCode, client.address.city, client.address.country]);

  const idFor = (name) => `client_${name}`;

  return (
    <form onSubmit={safeOnSubmit} className="m-form modal-form" noValidate>
      {/* ===== Sekcja: Dane firmy ===== */}
      <section className="m-section" aria-labelledby={idFor('section_company')}>
        <h6 id={idFor('section_company')} className="m-section__title">Dane firmy</h6>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('name')}>
            Nazwa firmy <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('name')}
            name="name"
            className="m-input"
            placeholder="Nazwa firmy"
            value={client.name}
            onChange={handleChange}
            onBlur={handleBlurTrim}
            autoComplete="organization"
            required
          />
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('NIP')}>NIP</label>
            <input
              id={idFor('NIP')}
              name="NIP"
              className="m-input"
              placeholder="NIP"
              value={client.NIP}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('email')}>E-mail</label>
            <input
              id={idFor('email')}
              name="email"
              type="email"
              className="m-input"
              placeholder="E-mail"
              value={client.email}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('website')}>Strona internetowa</label>
          <input
            id={idFor('website')}
            name="website"
            className="m-input"
            placeholder="https://…"
            value={client.website}
            onChange={handleChange}
            onBlur={handleBlurTrim}
            autoComplete="url"
          />
        </div>
      </section>

      {/* ===== Sekcja: Adres siedziby ===== */}
      <section className="m-section" aria-labelledby={idFor('section_address')}>
        <h6 id={idFor('section_address')} className="m-section__title">Adres siedziby</h6>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('address.street')}>Ulica</label>
            <input
              id={idFor('address.street')}
              name="address.street"
              className="m-input"
              placeholder="Ulica"
              value={A.street}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-line1"
            />
          </div>
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('address.buildingNumber')}>Nr budynku</label>
            <input
              id={idFor('address.buildingNumber')}
              name="address.buildingNumber"
              className="m-input"
              placeholder="Nr"
              value={A.buildingNumber}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('address.postalCode')}>Kod pocztowy</label>
            <input
              id={idFor('address.postalCode')}
              name="address.postalCode"
              className="m-input"
              placeholder="00-000"
              value={A.postalCode}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="postal-code"
            />
          </div>
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('address.city')}>Miasto</label>
            <input
              id={idFor('address.city')}
              name="address.city"
              className="m-input"
              placeholder="Miasto"
              value={A.city}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-level2"
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('address.country')}>Kraj</label>
          <input
            id={idFor('address.country')}
            name="address.country"
            className="m-input"
            placeholder="Kraj"
            value={A.country}
            onChange={handleChange}
            onBlur={handleBlurTrim}
            autoComplete="country-name"
          />
        </div>

        <div className="checkbox-group" style={{ marginTop: 6 }}>
          <label className="m-choice">
            <input type="checkbox" checked={!!sameAsAddress} onChange={handleSameAs} />
            Adres kontaktowy taki jak siedziby
          </label>
        </div>
      </section>

      {/* ===== Sekcja: Adres kontaktowy ===== */}
      <section className="m-section" aria-labelledby={idFor('section_contact_address')}>
        <h6 id={idFor('section_contact_address')} className="m-section__title">Adres kontaktowy</h6>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactAddress.street')}>Ulica</label>
            <input
              id={idFor('contactAddress.street')}
              name="contactAddress.street"
              className="m-input"
              placeholder="Ulica"
              value={C.street}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-line1"
              disabled={sameAsAddress}
            />
          </div>
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactAddress.buildingNumber')}>Nr budynku</label>
            <input
              id={idFor('contactAddress.buildingNumber')}
              name="contactAddress.buildingNumber"
              className="m-input"
              placeholder="Nr"
              value={C.buildingNumber}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-line2"
              disabled={sameAsAddress}
            />
          </div>
        </div>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactAddress.postalCode')}>Kod pocztowy</label>
            <input
              id={idFor('contactAddress.postalCode')}
              name="contactAddress.postalCode"
              className="m-input"
              placeholder="00-000"
              value={C.postalCode}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="postal-code"
              disabled={sameAsAddress}
            />
          </div>
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactAddress.city')}>Miasto</label>
            <input
              id={idFor('contactAddress.city')}
              name="contactAddress.city"
              className="m-input"
              placeholder="Miasto"
              value={C.city}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="address-level2"
              disabled={sameAsAddress}
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('contactAddress.country')}>Kraj</label>
          <input
            id={idFor('contactAddress.country')}
            name="contactAddress.country"
            className="m-input"
            placeholder="Kraj"
            value={C.country}
            onChange={handleChange}
            onBlur={handleBlurTrim}
            autoComplete="country-name"
            disabled={sameAsAddress}
          />
        </div>
      </section>

      {/* ===== Sekcja: Osoba kontaktowa ===== */}
      <section className="m-section" aria-labelledby={idFor('section_contact_person')}>
        <h6 id={idFor('section_contact_person')} className="m-section__title">Osoba kontaktowa</h6>

        <div className="m-row">
          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactPerson')}>
              Imię i nazwisko <span aria-hidden="true">*</span>
            </label>
            <input
              id={idFor('contactPerson')}
              name="contactPerson"
              className="m-input"
              placeholder="Imię i nazwisko"
              value={client.contactPerson}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="name"
              required
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={idFor('contactPhone')}>
              Telefon <span aria-hidden="true">*</span>
            </label>
            <input
              id={idFor('contactPhone')}
              name="contactPhone"
              type="tel"
              className="m-input"
              placeholder="+48 …"
              value={client.contactPhone}
              onChange={handleChange}
              onBlur={handleBlurTrim}
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div className="m-field">
          <label className="m-label" htmlFor={idFor('contactEmail')}>
            E-mail kontaktowy <span aria-hidden="true">*</span>
          </label>
          <input
            id={idFor('contactEmail')}
            name="contactEmail"
            type="email"
            className="m-input"
            placeholder="adres@firma.pl"
            value={client.contactEmail}
            onChange={handleChange}
            onBlur={handleBlurTrim}
            autoComplete="email"
            required
          />
        </div>
      </section>

      {/* ===== Akcje ===== */}
      <div className="m-actions m-actions--footer">
        <button type="button" onClick={safeOnClose} className="m-btn m-btn--secondary">
          Anuluj
        </button>
        <button type="submit" className="m-btn m-btn--primary m-btn--lg">
          Zapisz
        </button>
      </div>
    </form>
  );
}

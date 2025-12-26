import React, { useEffect, useRef, useState } from 'react';
import { usePasswordModal } from '../../../app/providers/PasswordModalProvider';
import '../styles/change-password.css';
import '../styles/modal.css';

/** Pojedyncze pole hasła z przełącznikiem widoczności */
function PasswordField({
  name,
  value,
  onChange,
  label,
  autoComplete,
  autoFocus = false,
  describedBy,
}) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  const toggle = () => {
    setVisible(v => !v);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="pw-field">
      <label className="pw-label" htmlFor={`pw-${name}`}>
        {label}
      </label>

      <div className="pw-inputwrap">
        <input
          ref={inputRef}
          id={`pw-${name}`}
          className="pw-input"
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder=""
          aria-describedby={describedBy}
          {...(autoFocus ? { autoFocus: true } : {})}
        />
        <button
          type="button"
          className="pw-toggle"
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          aria-pressed={visible}
          onClick={toggle}
          title={visible ? 'Ukryj' : 'Pokaż'}
        >
          {visible ? (
            /* Otwarte oko */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            /* Przekreślone oko */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9.88 9.88A3.5 3.5 0 0012 15.5c1.933 0 3.5-1.567 3.5-3.5 0-.58-.14-1.127-.39-1.612"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

const ChangePasswordModal = () => {
  const { isOpen, closePasswordModal } = usePasswordModal();
  const [form, setForm] = useState({ current: '', next: '', repeat: '' });
  const [error, setError] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closePasswordModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    dialogRef.current?.querySelector('.pw-input')?.focus();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closePasswordModal]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.current || !form.next || !form.repeat) {
      setError('Uzupełnij wszystkie pola.');
      return;
    }
    if (form.next !== form.repeat) {
      setError('Nowe hasła nie są takie same.');
      return;
    }

    // TODO: call API + toast
    closePasswordModal();
  };

  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) closePasswordModal();
  };

  const isSubmitDisabled = !form.current || !form.next || !form.repeat;

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal__backdrop change-pass"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="modal ui-modal ui-modal--sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-title"
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          className="modal-close"
          onClick={closePasswordModal}
          aria-label="Zamknij okno"
        >
          ×
        </button>

        {/* Klasa no-underline usuwa pasek tylko tutaj */}
        <h2 id="cp-title" className="no-underline">Zmień hasło</h2>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <PasswordField
            name="current"
            value={form.current}
            onChange={onChange}
            label="Stare hasło"
            autoComplete="current-password"
            autoFocus
            describedBy={error ? 'cp-err' : undefined}
          />

          <PasswordField
            name="next"
            value={form.next}
            onChange={onChange}
            label="Nowe hasło"
            autoComplete="new-password"
            describedBy={error ? 'cp-err' : undefined}
          />

          <PasswordField
            name="repeat"
            value={form.repeat}
            onChange={onChange}
            label="Powtórz nowe hasło"
            autoComplete="new-password"
            describedBy={error ? 'cp-err' : undefined}
          />

          {error && (
            <p className="error-text" role="alert" id="cp-err">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" onClick={closePasswordModal}>
              Anuluj
            </button>
            <button type="submit" disabled={isSubmitDisabled} aria-disabled={isSubmitDisabled}>
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

// src/features/account/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      // Bez backendu: po "udanym" logowaniu idziemy na stronę główną lub /konto
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img
          src="/logo2.svg"
          alt="Logo"
          className="login-logo"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.svg';
          }}
        />
        <h2>Logowanie</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-username">Użytkownik</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            aria-label="Nazwa użytkownika"
          />

          <label htmlFor="login-password">Hasło</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-label="Hasło"
          />

          <button type="submit">Zaloguj</button>
        </form>
      </div>
    </div>
  );
}

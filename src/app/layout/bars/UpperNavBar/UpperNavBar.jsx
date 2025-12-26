// src/app/layout/bars/upper/UpperNavBar.jsx
import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePasswordModal } from '../../../providers/PasswordModalProvider.jsx';
import './styles/upper-nav-bar.css';

import SearchBox from './components/SearchBox';
import UserMenu from './components/UserMenu';
import { PATHS } from '../../../routes/paths';

function UpperNavBar({ clients = [] }) {
  const navigate = useNavigate();
  const { openPasswordModal } = usePasswordModal();

  const handleSearchSubmit = useCallback(
    (query) => {
      if (!query?.trim()) return;
      navigate(PATHS.searchUrl(query.trim()));
    },
    [navigate]
  );

  const handlePickClient = useCallback(
    (name) => {
      if (!name) return;
      navigate(PATHS.SALES.CLIENT(name));
    },
    [navigate]
  );

  return (
    <div className="navbar">
      <Link to={PATHS.HOME} className="logo-link" aria-label="Strona główna">
        {/* Zachowujemy dokładnie to samo stylowanie — brak width/height, brak skalowania */}
        <img
          src="/logo2.svg"
          alt="logo"
          onError={(e) => {
            // cichy fallback bez zmiany rozmiaru (CSS steruje wyglądem)
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.svg';
          }}
        />
      </Link>

      {/* Pasek wyszukiwania – JEDYNY w całej aplikacji */}
      <div className="search-container">
        <SearchBox
          clients={clients}
          onSubmit={handleSearchSubmit}
          onPickClient={handlePickClient}
        />
      </div>

      <UserMenu
        userName="Alicja Śliwińska"
        onChangePassword={openPasswordModal}
      />
    </div>
  );
}

export default UpperNavBar;

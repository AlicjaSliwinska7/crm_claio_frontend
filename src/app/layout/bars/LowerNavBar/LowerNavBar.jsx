// src/app/layout/bars/LowerNavBar/LowerNavBar.jsx
import React, { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './styles/lower-nav-bar.css';

import { MENU } from './config';
import NavLinkItem from './components/NavLinkItem';
import NavDropdown from './components/NavDropdown';

import { useNotifications } from '../../../providers/NotificationsProvider.jsx';
import { useMessages } from '../../../providers/MessagesProvider.jsx';
import { usePasswordModal } from '../../../providers/PasswordModalProvider.jsx';

const NewConversationModal = lazy(() =>
  import('../../../../features/messages/components/NewConversationModal')
);

export default function LowerNavBar() {
  const { unreadCount: unreadNotifications } = useNotifications();
  const { unreadCount: unreadMessages } = useMessages();
  const { openPasswordModal } = usePasswordModal();

  const [openId, setOpenId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const barRef = useRef(null);

  const badges = useMemo(
    () => ({
      messages: unreadMessages ?? 0,
      notifications: unreadNotifications ?? 0,
    }),
    [unreadMessages, unreadNotifications]
  );

  const handleAction = useCallback((action) => {
    switch (action) {
      case 'composeMessage':
        setComposeOpen(true);
        break;
      case 'changePassword':
        openPasswordModal();
        break;
      default:
        break;
    }
  }, [openPasswordModal]);

  // Zamknij rozwinięte dropdowny po kliknięciu poza paskiem lub po ESC
  useEffect(() => {
    const onDocClick = (e) => {
      const el = barRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setOpenId(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('click', onDocClick, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      {/* WAŻNE: data-topbar = true → wlicza się do dynamicznego offsetu (--nav-offset) */}
      <nav
        ref={barRef}
        className="lower-navbar"
        data-topbar
        role="navigation"
        aria-label="Dolny pasek nawigacyjny"
      >
        <div className="nav-links">
          {MENU.map((item) => {
            if (item.type === 'link') {
              return (
                <NavLinkItem
                  key={item.id}
                  to={item.to}
                  iconClass={item.iconClass}
                  label={item.label}
                  badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                  onClick={() => setOpenId(null)}
                />
              );
            }
            // Dropdown
            return (
              <NavDropdown
                key={item.id}
                id={item.id}
                iconClass={item.iconClass}
                label={item.label}
                items={item.items}
                badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                openId={openId}
                setOpenId={setOpenId}
                onAction={handleAction}
              />
            );
          })}
        </div>
      </nav>

      <Suspense fallback={null}>
        {composeOpen && (
          <NewConversationModal
            open
            onClose={() => setComposeOpen(false)}
            onCreate={() => {
              setComposeOpen(false);
              window.location.assign('/wiadomosci');
            }}
          />
        )}
      </Suspense>
    </>
  );
}

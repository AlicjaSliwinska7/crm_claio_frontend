import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavLinkItem({
  to,
  label,
  iconClass,
  badgeCount = 0,
  onClick,         // opcjonalnie: zamknij otwarte dropdowny po kliknięciu linku
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => ['nav-link', isActive ? 'active' : ''].join(' ').trim()}
    >
      <span className="nav-icon-wrapper">
        <span className="icon-with-badge">
          {iconClass ? <i className={iconClass} aria-hidden="true" /> : null}
          {badgeCount > 0 && <span className="notification-badge">{badgeCount}</span>}
        </span>
        <span>{label}</span>
      </span>
    </NavLink>
  );
}

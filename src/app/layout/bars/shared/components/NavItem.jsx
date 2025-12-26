// src/app/layout/bars/shared/components/NavItem.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavItem({
  to,
  children,
  className = 'sidebar-link',
  activeClass = 'active',
  style,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => [className, isActive ? activeClass : ''].join(' ').trim()}
      style={style}
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

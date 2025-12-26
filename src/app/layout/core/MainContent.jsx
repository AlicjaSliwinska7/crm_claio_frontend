// src/app/layout/core/MainContent.jsx
import React from 'react';
import './styles/page-title.css';
import './styles/main-content.css';
import PageTitle from './components/PageTitle';

/**
 * MainContent
 * Props:
 *  - title: string
 *  - Icon?: React.ComponentType | null
 *  - iconClass?: string | ''
 *  - subtitle?: string | null
 *  - actionsRight?: React.ReactNode
 *  - className?: string
 *  - suppressHeading?: boolean   // ⬅️ NOWE: gdy true – nie renderujemy PageTitle
 */
export default function MainContent({
  title,
  Icon = null,
  iconClass = '',
  subtitle = null,
  actionsRight = null,
  className = '',
  suppressHeading = false,          // ⬅️ default: nagłówek widoczny
  children,
}) {
  const showHeading = !!title && !suppressHeading;

  return (
    <div className={`main-card ${className}`.trim()}>
      {showHeading ? (
        <PageTitle
          title={title}
          subtitle={subtitle}
          right={actionsRight}
          Icon={Icon}
          iconClass={iconClass}
        />
      ) : null}

      <div className="main-content__inner">
        {children}
      </div>
    </div>
  );
}

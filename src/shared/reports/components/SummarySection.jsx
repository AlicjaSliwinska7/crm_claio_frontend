import React from 'react'

export default function SummarySection({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`summary-section ${className}`}>
      {(title || actions) && (
        <header className="summary-section__header">
          <div>
            {title && <h3 className="summary-section__title">{title}</h3>}
            {subtitle && <p className="summary-section__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="summary-section__actions">{actions}</div>}
        </header>
      )}
      <div className="summary-section__body">{children}</div>
    </section>
  )
}

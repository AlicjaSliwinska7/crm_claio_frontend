import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryKpiSection({
  id = 'kpis',
  className = '',
  cardClassName = '',
  icon = null,
  title = 'KPI',
  subtitle = null,
  items = [],
}) {
  return (
    <section id={id} className={clsx('es-section', className)}>
      <div className={clsx('es-card', cardClassName)}>
        <header className="es-section__header">
          <div className="es-section__titlewrap">
            {icon ? <span className="es-headIcon" aria-hidden="true">{icon}</span> : null}
            <h3 className="es-section__title">{title}</h3>
          </div>
        </header>

        {subtitle ? <div className="es-subtitle">{subtitle}</div> : null}

        <div className="tss-card tss-kpis">
          <div className="tss-kpis__row">
            {items.map((it) => (
              <span
                key={it.key}
                className="tss-kpi"
                style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
              >
                {it.icon ? <span aria-hidden="true" style={{ color: 'var(--es-blue)' }}>{it.icon}</span> : null}
                <strong>{it.value}</strong>
                <span className="muted">{it.label}</span>
                {it.sub ? <span className="tss-sep">•</span> : null}
                {it.sub ? <span className="muted">{it.sub}</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

SummaryKpiSection.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      icon: PropTypes.node,
      label: PropTypes.node.isRequired,
      value: PropTypes.node.isRequired,
      sub: PropTypes.node,
    })
  ),
}
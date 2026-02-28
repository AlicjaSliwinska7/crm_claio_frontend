import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import SummaryControlsRenderer from '../../components/SummaryControlsRenderer'
import SummaryActionsRenderer from '../../components/SummaryActionsRenderer'

export default function SummaryFiltersSection({
  id = 'filters',
  className = '',
  cardClassName = '',
  icon = null,
  title = 'Filtry',
  subtitle = null,
  controls = [],
  actions = [],
  components = {},
}) {
  return (
    <section id={id} className={clsx('es-section', className)}>
      <div className={clsx('es-card', cardClassName)}>
        <header className="es-section__header">
          <div className="es-section__titlewrap">
            {icon ? <span className="es-headIcon" aria-hidden="true">{icon}</span> : null}
            <h3 className="es-section__title">{title}</h3>
          </div>
            {actions?.length ? (
    <div className="es-headActions">
      <SummaryActionsRenderer actions={actions} />
    </div>
  ) : null}
        </header>

        {subtitle ? <div className="es-subtitle">{subtitle}</div> : null}

        <SummaryControlsRenderer controls={controls} components={components} />
      </div>
    </section>
  )
}

SummaryFiltersSection.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  controls: PropTypes.array,
  actions: PropTypes.node,
  components: PropTypes.object,
}
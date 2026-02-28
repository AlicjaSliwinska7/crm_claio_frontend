// src/shared/summary2/components/SummaryHeader.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

export default function SummaryHeader({
  className = '',
  icon = null,
  title,
  titleClassName = '',
  actions = null,
  actionsClassName = '',
}) {
  return (
    <header className={clsx('es-section__header', className)}>
      <div className="es-section__titlewrap">
        {icon ? <span className="es-headIcon" aria-hidden="true">{icon}</span> : null}
        <h3 className={clsx('es-section__title', titleClassName)}>{title}</h3>
      </div>

      {actions ? (
        <div className={clsx('es-headActions', actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </header>
  )
}

SummaryHeader.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  titleClassName: PropTypes.string,
  actions: PropTypes.node,
  actionsClassName: PropTypes.string,
}
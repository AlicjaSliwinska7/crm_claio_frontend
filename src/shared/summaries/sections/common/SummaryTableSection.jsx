import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import SummaryControlsRenderer from '../../components/SummaryControlsRenderer'
import SummaryActionsRenderer from '../../components/SummaryActionsRenderer'

export default function SummaryTableSection({
  id,
  className = '',
  cardClassName = '',
  headerClassName = '',

  icon = null,
  title,
  subtitle = null,

  csv = null,
  actions = [],

  controls = null,
  controlComponents = {},

  table,
  empty = null,
}) {
  const renderTable = () => {
    if (!table) return null
    if (React.isValidElement(table)) return table
    const Cmp = table.Component
    if (!Cmp) return null
    return <Cmp {...(table.props || {})} />
  }

  const tableNode = renderTable()

  const controlsNode = Array.isArray(controls)
    ? <SummaryControlsRenderer controls={controls} components={controlComponents} />
    : controls

  const mergedActions = csv
    ? [...(actions || []), { type: 'csv', key: 'csv', csv, title: csv.title || 'Eksportuj CSV' }]
    : (actions || [])

  return (
    <section id={id} className={clsx('es-section', className)}>
      <div className={clsx('es-card', cardClassName)}>
        <header className={clsx('es-section__header', headerClassName)}>
          <div className="es-section__titlewrap">
            {icon ? <span className="es-headIcon" aria-hidden="true">{icon}</span> : null}
            <h3 className="es-section__title">{title}</h3>
          </div>

          {mergedActions?.length ? (
            <div className="es-headActions">
              <SummaryActionsRenderer actions={mergedActions} />
            </div>
          ) : null}
        </header>

        {subtitle ? <div className="es-subtitle">{subtitle}</div> : null}

        {controlsNode ? (
          Array.isArray(controls) ? controlsNode : <div className="es-panel-controls">{controlsNode}</div>
        ) : null}

        {tableNode ? tableNode : (empty ? <div className="tss-empty">{empty}</div> : null)}
      </div>
    </section>
  )
}

SummaryTableSection.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  headerClassName: PropTypes.string,

  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,

  csv: PropTypes.shape({
    rows: PropTypes.array,
    columns: PropTypes.array,
    filename: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    title: PropTypes.string,
  }),

  actions: PropTypes.array,

  controls: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  controlComponents: PropTypes.object,

  table: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.shape({
      Component: PropTypes.any,
      props: PropTypes.object,
    }),
  ]),
  empty: PropTypes.node,
}
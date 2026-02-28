import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import SummaryControlsRenderer from '../../components/SummaryControlsRenderer'
import SummaryActionsRenderer from '../../components/SummaryActionsRenderer'

export default function SummaryChartSection({
  id,
  className = '',
  cardClassName = '',
  headerClassName = '',

  icon = null,
  title,
  subtitle = null,

  // shortcut
  csv = null,

  // ✅ config-only actions
  actions = [],

  controls = null,
  controlComponents = {},

  chart,
  empty = null,

  footer = null,
}) {
  const renderChart = () => {
    if (!chart) return null
    if (React.isValidElement(chart)) return chart
    const Cmp = chart.Component
    if (!Cmp) return null
    return (
      <div className={clsx('d2-chart', chart.className)}>
        <Cmp {...(chart.props || {})} />
      </div>
    )
  }

  const chartNode = renderChart()

  const controlsNode = Array.isArray(controls)
    ? <SummaryControlsRenderer controls={controls} components={controlComponents} />
    : controls

  // csv shortcut -> akcja csv
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

        {chartNode ? chartNode : (empty ? <div className="tss-empty">{empty}</div> : null)}

        {footer ? <div style={{ marginTop: 12 }}>{footer}</div> : null}
      </div>
    </section>
  )
}

SummaryChartSection.propTypes = {
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

  chart: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.shape({
      Component: PropTypes.any,
      props: PropTypes.object,
      className: PropTypes.string,
    }),
  ]),
  empty: PropTypes.node,

  footer: PropTypes.node,
}
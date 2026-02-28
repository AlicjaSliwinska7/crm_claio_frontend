// src/shared/tables/components/ListLayout.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

const cx = (...xs) => xs.filter(Boolean).join(' ')

/**
 * ListLayout — wspólny szkielet dla list/tabel.
 *
 * WAŻNE: tableContainerClassName domyślnie NIE powinien doklejać `table-container`,
 * bo poziomy scroll obsługuje TableScrollWrapper (wewnętrzny .table-xscroller + custom bar).
 *
 * Jeśli masz gdzieś starsze listy bez TableScrollWrapper — wtedy możesz ręcznie podać:
 * tableContainerClassName="table-container"
 */
function ListLayout({
  // stare propsy
  controls,
  children,
  summary,
  footer,
  rootClassName = 'contact-list',
  controlsClassName = 'contact-controls',
  tableContainerClassName = '', // ✅ zmiana: nie doklejamy już table-container domyślnie

  // nowe
  title,
  header,
  left,
  right,
  stickyControls = false,
  variant,
  className,
  'aria-label': ariaLabel,

  ...rest
}) {
  const root = cx('list', rootClassName, variant, className)
  const controlsCN = cx('list-controls', controlsClassName, stickyControls && 'list-controls--sticky')

  // ✅ ZAWSZE mamy list-table-container, a legacy klasa jest opcjonalna
  const tableCN = cx('list-table-container', tableContainerClassName)

  return (
    <section className={root} aria-label={ariaLabel} {...rest}>
      {header ?? (title ? <h2 className="list-title">{title}</h2> : null)}

      {controls ? (
        <div className={controlsCN}>{controls}</div>
      ) : left || right ? (
        <div className={controlsCN}>
          <div className="list-controls__left">{left}</div>
          <div className="list-controls__right">{right}</div>
        </div>
      ) : null}

      <div className={tableCN}>{children}</div>

      {summary ?? null}
      {footer ?? null}
    </section>
  )
}

ListLayout.propTypes = {
  controls: PropTypes.node,
  children: PropTypes.node,
  summary: PropTypes.node,
  footer: PropTypes.node,
  rootClassName: PropTypes.string,
  controlsClassName: PropTypes.string,
  tableContainerClassName: PropTypes.string,

  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  header: PropTypes.node,
  left: PropTypes.node,
  right: PropTypes.node,
  stickyControls: PropTypes.bool,
  variant: PropTypes.string,
  className: PropTypes.string,
  'aria-label': PropTypes.string,
}

export default memo(ListLayout)

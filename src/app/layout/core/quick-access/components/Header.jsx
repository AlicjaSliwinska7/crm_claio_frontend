// src/app/layout/core/quick-access/components/Header.jsx
import React from 'react'
import PropTypes from 'prop-types'

function Header({ title = 'SKRÓTY', className = '', rightSlot = null, 'data-testid': testId }) {
  const cls = className ? `qa-header ${className}` : 'qa-header'
  return (
    <div className={cls} data-testid={testId}>
      <h2 className="qa-header__title">{title}</h2>
      {rightSlot ? <div className="qa-header__actions">{rightSlot}</div> : null}
    </div>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  rightSlot: PropTypes.node,
  'data-testid': PropTypes.string,
}

export default React.memo(Header)

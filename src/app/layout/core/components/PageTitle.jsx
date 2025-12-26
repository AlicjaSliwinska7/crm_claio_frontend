import React from 'react'

export default function PageTitle({ title, iconClass = '', Icon = null, subtitle, right }) {
  return (
    <h2 className="page-title">
      <div className="page-title__left">
        {Icon ? (
          <Icon />
        ) : iconClass ? (
          <i className={`page-title__icon fa-fw ${iconClass}`} aria-hidden="true" />
        ) : null}

          {title}
          {subtitle ? <div className="page-title__subtitle">{subtitle}</div> : null}
      </div>

      {right ? <div className="page-title__right">{right}</div> : null}
    </h2>
  )
}

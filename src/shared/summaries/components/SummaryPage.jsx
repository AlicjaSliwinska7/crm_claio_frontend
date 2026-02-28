import React from 'react'
import PropTypes from 'prop-types'

export default function SummaryPage({ config }) {
  if (!config) return null
  const { rootClassName = '', sections = [] } = config

  return (
    <div className={rootClassName}>
      {sections.map((s, idx) => {
        const key = s?.id || String(idx)
        if (typeof s?.render === 'function') return <React.Fragment key={key}>{s.render()}</React.Fragment>
        const Cmp = s?.Component
        if (!Cmp) return null
        return <Cmp key={key} {...(s.props || {})} />
      })}
    </div>
  )
}

SummaryPage.propTypes = {
  config: PropTypes.shape({
    rootClassName: PropTypes.string,
    sections: PropTypes.array,
  }),
}
// src/shared/diagrams2/charts/parts/BaseResponsive.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { ResponsiveContainer } from 'recharts'

export default function BaseResponsive({ height = '100%', children }) {
  return (
    <div className="d2-chart__inner">
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

BaseResponsive.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node.isRequired,
}
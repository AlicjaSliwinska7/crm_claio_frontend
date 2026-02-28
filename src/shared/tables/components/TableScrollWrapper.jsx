// src/shared/tables/components/TableScrollWrapper.jsx
import React from 'react'
import PropTypes from 'prop-types'
import useHorizontalScrollbar from '../hooks/useHorizontalScrollbar'

export default function TableScrollWrapper({ children, className = '', deps = [] }) {
  const { scrollerRef, barRef, thumbStyle, onThumbMouseDown, onTrackMouseDown } =
    useHorizontalScrollbar(deps)

  // ✅ NIE dodajemy już display:none na barze (bo wtedy barW=0 i thumb się nie policzy)
  const isInactive = thumbStyle.display === 'none'

  return (
    <div ref={scrollerRef} className={`table-scroll-wrapper ${className}`.trim()}>
      <div className="table-xscroller">{children}</div>

      <div
        ref={barRef}
        className={`table-hscroll ${isInactive ? 'is-inactive' : ''}`}
        aria-hidden="true"
        onMouseDown={onTrackMouseDown}
      >
        <div
          className="table-hscroll__thumb"
          style={thumbStyle}
          onMouseDown={onThumbMouseDown}
        />
      </div>
    </div>
  )
}

TableScrollWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  deps: PropTypes.array,
}

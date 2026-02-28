import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import useVerticalScrollbar from '../hooks/useVerticalScrollbar'

export default function ScrollArea({
  side = 'left',
  className = '',
  style,
  children,

  // gateKey = open section id ('' gdy wszystko zwinięte)
  gateKey = '',
  deps = [],
}) {
  const enabled = gateKey !== ''

  const {
    frameRef,
    scrollerRef,
    barRef,
    thumbStyle,
    isScrollable,
    recalc,
    onThumbMouseDown,
    onTrackMouseDown,
  } = useVerticalScrollbar(deps, { enabled })

  const frameCls = useMemo(() => {
    const base = 'scroll-area-frame'
    return className ? `${base} ${className}` : base
  }, [className])

  const barSideCls = side === 'left' ? 'sa-vbar--left' : 'sa-vbar--right'
  const scrollerSideCls = side === 'left' ? 'scroll-area--left' : 'scroll-area--right'

  // po zmianie gateKey (otwarcie/zamknięcie) przelicz
  useEffect(() => {
    recalc()
    requestAnimationFrame(recalc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateKey])

  // po zmianie treści też przelicz
  useEffect(() => {
    recalc()
    requestAnimationFrame(recalc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  return (
    <div
      ref={frameRef}
      className={frameCls}
      data-bars-scroll="1"
      style={{
        ...style,
        overflow: 'hidden',
      }}
    >
      <div ref={scrollerRef} className={`scroll-area ${scrollerSideCls}`}>
        <div className="scroll-area__inner">{children}</div>
      </div>

      <div
        ref={barRef}
        className={`sa-vbar ${barSideCls} ${isScrollable ? '' : 'is-hidden'}`}
        onMouseDown={onTrackMouseDown}
        role="presentation"
      >
        <div
          className="sa-vbar__thumb"
          style={thumbStyle}
          onMouseDown={onThumbMouseDown}
          role="presentation"
        />
      </div>
    </div>
  )
}

ScrollArea.propTypes = {
  side: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  gateKey: PropTypes.any,
  deps: PropTypes.array,
}
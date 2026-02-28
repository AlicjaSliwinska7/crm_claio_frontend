import React from 'react'
import PropTypes from 'prop-types'

// ❗ NIE importujemy lokalnie scroll-bars.css,
// bo ma być jeden SSOT (np. ../shared/styles/scroll-bars.css importowany w sidebarach)

import ScrollArea from './ScrollArea'
/**
 * SidebarPane — wrapper na sidebary z custom scrollbar (bars/ScrollArea)
 *
 * - side="left"  => custom bar po PRAWEJ  (default)
 * - side="right" => custom bar po LEWEJ
 *
 * Uwaga:
 * - Nie używamy direction: rtl (to hack pod native scrollbar).
 * - scrollbar rysuje ScrollArea + sa-vbar (custom).
 */
export default function SidebarPane({
  side = 'left',           // 'left' | 'right'
  className = '',
  style = {},
  children,
  gateKey = null,          // ✅ SSOT dla bramki (np. openSectionId)
}) {
  // Mapowanie: w ScrollArea side="left" oznacza bar po LEWEJ,
  // a u Ciebie w komentarzach bywało odwrotnie. Ujednolicamy:
  // - jeśli to lewy sidebar (pane po lewej ekranu) i chcesz bar po PRAWEJ => ScrollArea side="right"
  // - jeśli to prawy sidebar i chcesz bar po LEWEJ => ScrollArea side="left"
  const scrollSide = side === 'left' ? 'right' : 'left'
  const paneClass = side === 'right' ? 'sidebar--right' : 'sidebar--left'

  return (
    <aside className={`sidebar-pane ${paneClass} ${className}`.trim()} style={style}>
      <ScrollArea
        side={scrollSide}
        className="sidebar-scroll"
        gateKey={gateKey}
        style={{ height: '100%', width: '100%', minHeight: 0 }}
      >
        <div className="sidebar-content">
          {children}
        </div>
      </ScrollArea>
    </aside>
  )
}

SidebarPane.propTypes = {
  side: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  gateKey: PropTypes.any,
}
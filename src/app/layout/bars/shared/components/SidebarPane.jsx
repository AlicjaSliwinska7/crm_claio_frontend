import React from 'react'
import './styles/scroll-bars.css'

/**
 * Uniwersalny wrapper na sidebary.
 * - side="left"  => scrollbar po PRAWEJ (domyślnie LTR)
 * - side="right" => scrollbar po LEWEJ (direction: rtl na scrollerze)
 *
 * Uwaga: scrollbar rysuje się na elemencie .sidebar-scroll (to on ma overflow).
 */
export default function SidebarPane({
  side = 'left',           // 'left' | 'right'
  className = '',
  style = {},
  children,
}) {
  const sideClass = side === 'right' ? 'sidebar--right' : 'sidebar--left'

  return (
    <aside className={`sidebar-pane ${sideClass} ${className}`} style={style}>
      {/* Element SCROLLUJĄCY – to na nim celujemy pseudo-elementami */}
      <div className="sidebar-scroll" data-side={side}>
        {/* Przywracamy normalny kierunek treści (ważne dla side='right') */}
        <div className="sidebar-content">
          {children}
        </div>
      </div>
    </aside>
  )
}

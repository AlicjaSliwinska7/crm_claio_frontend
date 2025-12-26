import React, { useEffect, useId } from 'react';

/**
 * ScrollArea — przewijalny wrapper z kontrolą strony paska.
 * Props:
 *  - side: 'left' | 'right'   => left = pasek po PRAWEJ (LTR), right = pasek po LEWEJ (RTL)
 *  - className?: string
 *  - style?: React.CSSProperties
 */
export default function ScrollArea({
  side = 'left',
  className = '',
  style,
  children,
  ...rest
}) {
  const sideClass = side === 'right' ? 'scroll-area--right' : 'scroll-area--left';

  // stabilny atrybut data do precyzyjnego targetowania (i ewentualnych override'ów)
  const uid = useId();
  const dataAttr = `sa${String(uid).replace(/[:]/g, '')}`;

  // Twarde ukrycie przycisków scrollbara jako dodatkowe zabezpieczenie
  useEffect(() => {
    const STYLE_ID = `sa-hide-arrows-${dataAttr}`;
    if (document.getElementById(STYLE_ID)) return;

    const css = `
[data-sa="${dataAttr}"]::-webkit-scrollbar-button{display:none;width:0;height:0;padding:0;margin:0;border:0;background:transparent;-webkit-appearance:none;appearance:none}
[data-sa="${dataAttr}"]::-webkit-scrollbar-track,
[data-sa="${dataAttr}"]::-webkit-scrollbar{background:transparent}
[data-sa="${dataAttr}"]::-webkit-scrollbar-thumb{background:var(--sa-thumb,rgba(0,0,0,.28));border-radius:var(--sa-radius,8px);border:2px solid transparent;background-clip:padding-box}
[data-sa="${dataAttr}"]::-webkit-scrollbar-thumb:hover{background:var(--sa-thumb-hover,rgba(0,0,0,.36))}
[data-sa="${dataAttr}"]::-webkit-scrollbar-thumb:active{background:var(--sa-thumb-active,rgba(0,0,0,.46))}
    `.trim();

    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(STYLE_ID);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [dataAttr]);

  // SCROLLER MUSI BYĆ NA ELEMENCIE ZEWNĘTRZNYM
  const scrollStyle = {
    overflowY: 'auto',
    overflowX: 'hidden',
    direction: side === 'right' ? 'rtl' : 'ltr',
    ...style,
  };

  const cls = ['scroll-area', sideClass, className].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={scrollStyle}
      data-side={side}
      data-sa={dataAttr}
      {...rest}
    >
      {/* Przywrócenie normalnego kierunku treści, gdy zewnętrzny ma RTL */}
      <div className="scroll-area__inner" style={{ direction: 'ltr' }}>
        {children}
      </div>
    </div>
  );
}

// src/app/layout/bars/shared/hooks/useAnchorDock.js
import { useEffect, useRef, useState } from 'react';

/**
 * Dokuje element do kotwicy (np. '#shift-handle-anchor').
 *
 * API:
 *   const { style, ready, recalc } = useAnchorDock('#shift-handle-anchor', {
 *     gap: 12,                 // dodatkowy odstęp pod kotwicą (px)
 *     cssGapVar: '--sidebar-gap', // jeśli ustawisz :root { --sidebar-gap: 12px; }
 *     minHeight: 0             // minimalna wysokość
 *   });
 *
 * Zgodność wstecz:
 *   useAnchorDock('#shift-handle-anchor', 0)  // drugi arg = minHeight (stary podpis)
 */
export function useAnchorDock(anchorSelector = '#shift-handle-anchor', opts = {}) {
  // Wsteczna zgodność: jeśli drugi argument to liczba → to minHeight
  const normalized = typeof opts === 'number' ? { minHeight: opts } : opts;
  const {
    gap = 0,
    cssGapVar,           // np. '--sidebar-gap'
    minHeight = 0,
  } = normalized;

  const readCssNumber = (varName) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (!v) return null;
      // akceptujemy '12', '12px' itd.
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  };

  const initialTop = 145 + (typeof window !== 'undefined' ? 0 : 0) + (gap || 0);
  const initialHeight = Math.max(
    0,
    (typeof window !== 'undefined' ? window.innerHeight : 0) - initialTop
  );

  const [style, setStyle] = useState({ top: initialTop, height: initialHeight });
  const [ready, setReady] = useState(false);

  const rafRef = useRef(null);
  const anchorRef = useRef(null);

  const scheduleMeasure = () => {
    if (rafRef.current != null || typeof window === 'undefined') return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measureNow();
    });
  };

  const measureNow = () => {
    if (typeof document === 'undefined') return;

    if (!anchorRef.current) {
      anchorRef.current = document.querySelector(anchorSelector) || null;
      setReady(!!anchorRef.current);
      if (!anchorRef.current) return; // brak kotwicy – spróbujemy przy następnym zdarzeniu
    }

    const rect = anchorRef.current.getBoundingClientRect();
    const cssGap = cssGapVar ? readCssNumber(cssGapVar) : null;
    const gapPx = (cssGap != null ? cssGap : 0) + (gap || 0);

    const top = Math.max(0, Math.round(rect.bottom) + gapPx);
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;
    const height = Math.max(minHeight, viewportH - top);

    setStyle((prev) => (prev.top !== top || prev.height !== height ? { top, height } : prev));
  };

  useEffect(() => {
    scheduleMeasure();

    const onScroll = () => scheduleMeasure();
    const onResize = () => scheduleMeasure();
    const onVisibility = () => scheduleMeasure();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // visibilitychange nie wspiera passive
    document.addEventListener('visibilitychange', onVisibility);

    // Obserwuj kotwicę, body i html pod kątem zmian layoutu
    let roAnchor = null;
    let roDoc = null;
    let mo = null;

    if ('ResizeObserver' in window) {
      const attachRO = () => {
        if (!anchorRef.current) return;
        roAnchor = new ResizeObserver(scheduleMeasure);
        try { roAnchor.observe(anchorRef.current); } catch {}
      };
      attachRO();

      try {
        roDoc = new ResizeObserver(scheduleMeasure);
        roDoc.observe(document.documentElement);
        roDoc.observe(document.body);
      } catch {}

      // Jeśli kotwica renderuje się później (lazy), złap ją przez MutationObserver
      mo = new MutationObserver(() => {
        if (!anchorRef.current) {
          const el = document.querySelector(anchorSelector);
          if (el) {
            anchorRef.current = el;
            setReady(true);
            attachRO();
            scheduleMeasure();
          }
        }
      });
      try { mo.observe(document.body, { childList: true, subtree: true }); } catch {}
    }

    return () => {
      try { roAnchor?.disconnect(); } catch {}
      try { roDoc?.disconnect(); } catch {}
      try { mo?.disconnect(); } catch {}
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  // ważne: zależności obejmują selektor kotwicy i parametry mające wpływ na wynik
  }, [anchorSelector, gap, cssGapVar, minHeight]);

  const recalc = () => scheduleMeasure();

  return { style, ready, recalc };
}

export default useAnchorDock;

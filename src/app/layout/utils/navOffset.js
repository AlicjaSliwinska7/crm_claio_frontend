// src/app/layout/utils/navOffset.js
export function mountTopBarsOffsetObserver() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // Wszystkie elementy liczone do offsetu (mogą być różne w przyszłości)
  const SELECTORS = [
    '.upper-navbar', '.UpperNavBar',
    '.lower-navbar', '.LowerNavBar',
    '[data-topbar]', '[data-sticky="top"]',
  ].join(',');

  const root = document.documentElement;
  let raf = null;

  const measure = () => {
    raf = null;
    const bars = Array.from(document.querySelectorAll(SELECTORS))
      // tylko widoczne
      .filter(el => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      });

    // sumujemy wysokości (np. gdy masz dwa paski)
    const total = bars.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);

    // ustawiamy globalną zmienną CSS z bezpiecznym fallbackiem
    root.style.setProperty('--nav-offset', `${Math.round(total)}px`);
  };

  const schedule = () => {
    if (raf != null) return;
    raf = requestAnimationFrame(measure);
  };

  // Reaguj na resize/scroll (zmiana wysokości, sticky, itp.)
  const onResize = () => schedule();
  const onScroll = () => schedule();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Obserwator zmian layoutu
  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => schedule());
    document.querySelectorAll(SELECTORS).forEach(el => ro.observe(el));
  }

  // Pomiar startowy
  schedule();

  return () => {
    try { ro?.disconnect(); } catch {}
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    if (raf != null) cancelAnimationFrame(raf);
  };
}

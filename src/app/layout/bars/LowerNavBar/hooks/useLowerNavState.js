import { useCallback, useEffect, useRef, useState } from 'react';

export default function useLowerNavState() {
  const [openId, setOpenId] = useState(null);   // null | string
  const rootRef = useRef(null);

  const toggle = useCallback((id) => {
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  // Esc -> zamknij
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Klik poza -> zamknij
  useEffect(() => {
    const onDoc = (e) => {
      if (!openId) return;
      const el = rootRef.current;
      if (el && !el.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openId, close]);

  return { openId, toggle, close, rootRef };
}

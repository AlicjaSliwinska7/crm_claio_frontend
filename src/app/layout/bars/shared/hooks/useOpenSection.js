// src/app/layout/bars/shared/hooks/useOpenSection.js
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function useOpenSection(sections = [], { storageKey = 'bars.sidebar.open' } = {}) {
  const { pathname } = useLocation();
  const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

  const [open, setOpen] = useState(() => {
    try { return storage?.getItem(storageKey) || ''; } catch { return ''; }
  });

  useEffect(() => {
    try { storage?.setItem(storageKey, open); } catch {}
  }, [open, storageKey, storage]);

  // aktywni rodzice na podstawie URL (jeśli item.base/href pasuje do pathname)
  const activeParents = useMemo(() => {
    const set = new Set();
    const walk = (arr, parentId = null, parentSectionId = null) => {
      for (const x of arr || []) {
        if (x.items?.length) walk(x.items, x.id || parentId, x.id || parentSectionId);
        const href = x.to || x.base;
        if (href && pathname.startsWith(href)) {
          if (parentId) set.add(parentId);
          if (parentSectionId) set.add(parentSectionId);
        }
      }
    };
    const normalized = sections.map(s => ({ ...s, items: s.items || [] }));
    walk(normalized);
    return set;
  }, [pathname, sections]);

  const isOpen = (id) => open === id || activeParents.has(id);
  const toggle = (id) => setOpen(prev => (prev === id ? '' : id));

  return { open, isOpen, toggle, activeParents };
}

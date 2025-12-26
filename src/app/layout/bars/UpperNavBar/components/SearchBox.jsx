import { useEffect, useRef, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import SearchSuggestions from "./SearchSuggestions";
import { suggest } from "../../../../../features/search/api/search.api";

function useDebounce(v, d = 200) {
  const [val, setVal] = useState(v);
  useEffect(() => { const id = setTimeout(() => setVal(v), d); return () => clearTimeout(id); }, [v, d]);
  return val;
}

/**
 * Props:
 * - clients?: Array<{ id?: string, name: string }>
 * - onSubmit?(query: string)
 * - onPickClient?(name: string)
 */
export default function SearchBox({ clients = [], onSubmit, onPickClient }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(term, 200);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  // Załaduj podpowiedzi (mock + szybkie trafienia z lokalnej listy klientów)
  useEffect(() => {
    let alive = true;
    const q = debounced.trim();
    if (!q) { setItems([]); setOpen(false); setActive(-1); return; }
    (async () => {
      try {
        const base = await suggest(q);
        const quick = (clients || [])
          .filter(c => (c?.name || "").toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5)
          .map(c => ({
            id: `client-${c.id ?? c.name}`,
            type: "client",
            title: c.name,
            subtitle: "Klient (lokalna lista)",
            url: null
          }));
        const merged = [...quick, ...base];
        if (!alive) return;
        setItems(merged);
        setOpen(merged.length > 0);
        setActive(merged.length ? 0 : -1);
      } catch (e) {
        console.warn("suggest error:", e);
        setItems([]); setOpen(false); setActive(-1);
      }
    })();
    return () => { alive = false; };
  }, [debounced, clients]);

  function goToResults(q) {
    const query = q.trim();
    if (!query) return;
    navigate({ pathname: "/szukaj", search: createSearchParams({ q: query }).toString() });
    onSubmit?.(query);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => (i + 1) % items.length); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => (i - 1 + items.length) % items.length); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) {
        const it = items[active];
        if (it.type === "client" && !it.url) {
          onPickClient?.(it.title);
        } else if (it.url) {
          navigate(it.url);
        } else {
          goToResults(term);
        }
      } else {
        goToResults(term);
      }
      setOpen(false);
    }
    if (e.key === "Escape") { setOpen(false); setActive(-1); }
  }

  // Zamknij przy kliknięciu poza
  useEffect(() => {
    function onDoc(e) {
      const w = wrapRef.current;
      if (!w) return;
      if (!w.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="searchbar-wrapper">
      <form
        className="searchbar"
        role="search"
        onSubmit={(e) => { e.preventDefault(); goToResults(term); }}
      >
        <input
          type="search"
          className="search-bar"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => { if (items.length) setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder="Szukaj…"
          aria-label="Szukaj"
          autoComplete="off"
        />
        {/* (opcjonalnie) ikona lupy po prawej – zachowuje Twoją klasę */}
        <button
          type="submit"
          className="search-icon"
          aria-label="Szukaj"
          title="Szukaj"
        >
          <i className="fas fa-search" />
        </button>
      </form>

      <SearchSuggestions
        open={open}
        items={items}
        activeIndex={active}
        onHoverIndex={setActive}
        onPickClient={(name) => { onPickClient?.(name); setOpen(false); }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

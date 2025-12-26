import React, { useEffect, useMemo, useState } from "react";
import "../styles/knowledge-base.css";
import { KB_SAMPLE } from "../../documentation/pages/KbSample";
import KbList from "../../documentation/pages/KbList";
import KbArticleView from "../../documentation/pages/KbArticleView";

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    tag: "all",
    equipment: "all",
    review: "all",
  });
  const [sortKey, setSortKey] = useState("updated_desc");
  const [activeId, setActiveId] = useState(KB_SAMPLE[0]?.id || null);

  const allTags = useMemo(() => {
    const s = new Set();
    KB_SAMPLE.forEach(a => (a.tags || []).forEach(t => s.add(t)));
    return ["all", ...Array.from(s)];
  }, []);

  const allEquipment = useMemo(() => {
    const s = new Set();
    KB_SAMPLE.forEach(a => (a.equipment || []).forEach(t => s.add(t)));
    return ["all", ...Array.from(s)];
  }, []);

  const allCategories = useMemo(() => {
    const s = new Set();
    KB_SAMPLE.forEach(a => a.category && s.add(a.category));
    return ["all", ...Array.from(s)];
  }, []);

  const topTags = useMemo(() => {
    const m = new Map();
    KB_SAMPLE.forEach(a => (a.tags || []).forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const matchesReview = (validUntil) => {
      if (filters.review === "all") return true;
      if (!validUntil) return false;
      const d = new Date(validUntil); d.setHours(0, 0, 0, 0);
      const diff = Math.round((d - today) / 86400000);
      if (filters.review === "overdue") return diff < 0;
      if (filters.review === "dueSoon") return diff >= 0 && diff <= 30;
      return true;
    };

    const list = KB_SAMPLE.filter(a => {
      if (q) {
        const blob = `${a.title} ${a.content} ${(a.tags || []).join(" ")} ${(a.equipment || []).join(" ")}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.category !== "all" && a.category !== filters.category) return false;
      if (filters.tag !== "all" && !(a.tags || []).includes(filters.tag)) return false;
      if (filters.equipment !== "all" && !(a.equipment || []).includes(filters.equipment)) return false;
      if (!matchesReview(a.validUntil)) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sortKey === "title_asc") return (a.title || "").localeCompare(b.title || "");
      if (sortKey === "status") return (a.status || "").localeCompare(b.status || "");
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });

    return list;
  }, [query, filters, sortKey]);

  const resultsCount = filtered.length;
  const active = useMemo(
    () => filtered.find(x => x.id === activeId) || filtered[0] || null,
    [filtered, activeId]
  );

  const resetFilters = () =>
    setFilters({ status: "all", category: "all", tag: "all", equipment: "all", review: "all" });

  const copyPermalink = async () => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.hash.replace(/^#\??/, ""));
      if (active?.id) params.set("kb", active.id); else params.delete("kb");
      url.hash = `?${params.toString()}`;
      await navigator.clipboard.writeText(url.toString());
    } catch {}
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.replace(/^#\??/, ""));
    const id = params.get("kb");
    if (id) setActiveId(id);

    const savedFilters = localStorage.getItem("kbFilters");
    if (savedFilters) { try { setFilters(JSON.parse(savedFilters)); } catch {} }
    const savedQuery = localStorage.getItem("kbQuery");
    if (savedQuery) setQuery(savedQuery);
    const savedSort = localStorage.getItem("kbSortKey");
    if (savedSort) setSortKey(savedSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem("kbFilters", JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem("kbQuery", query); }, [query]);
  useEffect(() => { localStorage.setItem("kbSortKey", sortKey); }, [sortKey]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.replace(/^#\??/, ""));
    if (activeId) params.set("kb", activeId); else params.delete("kb");
    url.hash = `?${params.toString()}`;
    window.history.replaceState(null, "", url);
  }, [activeId]);

  useEffect(() => {
    const onKey = (e) => {
      if (!filtered.length) return;
      const idx = filtered.findIndex(x => x.id === activeId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = filtered[Math.min(idx + 1, filtered.length - 1)];
        if (next) setActiveId(next.id);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = filtered[Math.max(idx - 1, 0)];
        if (prev) setActiveId(prev.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, activeId]);

  return (
    <div className="kb__wrap">
      <aside className="kb__side panel">
        <div className="kb__filters">
          <input
            className="search"
            placeholder="Szukaj w tytułach, tagach, treści…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <div className="kb__filters-row">
            <select className="select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status:e.target.value }))}>
              <option value="all">Status: wszystkie</option>
              <option value="draft">Szkic</option>
              <option value="review">Do przeglądu</option>
              <option value="approved">Zatwierdzone</option>
              <option value="archived">Archiwalne</option>
            </select>
            <select className="select" value={filters.review} onChange={e => setFilters(f => ({ ...f, review:e.target.value }))}>
              <option value="all">Przegląd: wszystkie</option>
              <option value="dueSoon">Wkrótce (≤30 dni)</option>
              <option value="overdue">Po terminie</option>
            </select>
          </div>

          <div className="kb__filters-row">
            <select className="select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category:e.target.value }))}>
              {allCategories.map(c => <option key={c} value={c}>Kategoria: {c === "all" ? "wszystkie" : c}</option>)}
            </select>
            <select className="select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="updated_desc">Sortuj: aktualizacja ⬇</option>
              <option value="title_asc">Sortuj: tytuł ⬆</option>
              <option value="status">Sortuj: status</option>
            </select>
          </div>

          <div className="kb__filters-row">
            <select className="select" value={filters.tag} onChange={e => setFilters(f => ({ ...f, tag:e.target.value }))}>
              {allTags.map(t => <option key={t} value={t}>Tag: {t === "all" ? "wszystkie" : `#${t}`}</option>)}
            </select>
            <select className="select" value={filters.equipment} onChange={e => setFilters(f => ({ ...f, equipment:e.target.value }))}>
              {allEquipment.map(t => <option key={t} value={t}>Sprzęt: {t === "all" ? "wszystko" : t}</option>)}
            </select>
          </div>

          <div className="kb__chips">
            {topTags.map(t => (
              <button
                key={t}
                type="button"
                className={`kb__chip ${filters.tag === t ? "is-active" : ""}`}
                onClick={() => setFilters(f => ({ ...f, tag: f.tag === t ? "all" : t }))}
                title={`Filtruj po #${t}`}
              >
                #{t}
              </button>
            ))}
          </div>

          <div className="kb__filters-row kb__filters-row--meta">
            <span className="kb__count">Wyniki: {resultsCount}</span>
            <button className="ghost kb__clear" onClick={resetFilters} type="button">
              Wyczyść filtry
            </button>
          </div>
        </div>

        <KbList items={filtered} activeId={active?.id || null} onPick={id => setActiveId(id)} />
      </aside>

      <main className="kb__main panel">
        {active ? (
          <>
            <div className="kb__actions">
              <span className={`kb__status kb__status--${active.status}`}>{active.status}</span>
              {active.validUntil && <span className="kb__valid">Ważne do: {active.validUntil}</span>}
              <div className="kb__spacer" />
              <button className="ghost" type="button" onClick={copyPermalink}>Kopiuj link</button>
              <button className="ghost" type="button" onClick={() => window.print()}>Drukuj</button>
              <a className="ghost" href={`#/baza-wiedzy/${active.id}`} target="_blank" rel="noreferrer">Otwórz</a>
            </div>

            <KbArticleView article={active} />
          </>
        ) : (
          <div className="kb__empty">Brak wyników. Zmień filtry lub wpisz inną frazę.</div>
        )}
      </main>
    </div>
  );
}

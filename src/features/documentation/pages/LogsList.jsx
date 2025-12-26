import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/documentation-orders.css";

const SET_PREFIX = "logset.v1.";
const MAP_PREFIX = "logmap.v1."; // powiązane mapowania per plik

function readAllSets() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(SET_PREFIX)) continue;
    const id = k.slice(SET_PREFIX.length);
    try {
      const arr = JSON.parse(localStorage.getItem(k)) || [];
      const files = arr.length;
      const rows = arr.reduce((s, it) => s + (it?.records?.length || 0), 0);
      const updatedAt = arr.reduce((mx, it) => Math.max(mx, it?.createdAt || 0), 0) || null;
      out.push({ id, key: k, files, rows, updatedAt });
    } catch { /* ignore */ }
  }
  out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return out;
}

export default function LogsList() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(() => readAllSets());

  useEffect(() => {
    const fn = () => setRows(readAllSets());
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r =>
      r.id.toLowerCase().includes(s) ||
      String(r.files).includes(s) ||
      String(r.rows).includes(s)
    );
  }, [rows, q]);

  const createNew = () => {
    const id = prompt("ID nowego zestawu (np. O-1003-1):");
    if (!id) return;
    const key = SET_PREFIX + id;
    if (localStorage.getItem(key)) {
      alert("Taki zestaw już istnieje."); return;
    }
    try { localStorage.setItem(key, JSON.stringify([])); } catch { alert("Błąd zapisu do localStorage."); return; }
    setRows(readAllSets());
    nav(`/dokumentacja/logi/${encodeURIComponent(id)}`);
  };

  const removeSet = (id) => {
    if (!window.confirm(`Usunąć zestaw „${id}”?`)) return;
    localStorage.removeItem(SET_PREFIX + id);
    // wyczyść mapowania tego zestawu
    const prefix = MAP_PREFIX + id + ":";
    const rm = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) rm.push(k);
    }
    rm.forEach(k => localStorage.removeItem(k));
    setRows(readAllSets());
  };

  const prettyDate = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>Logi z badań — zestawy</h2>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={createNew}>+ Nowy zestaw</button>
      </div>

      <div className="pppList__filters card">
        <input
          className="i"
          placeholder="Szukaj po ID / liczbie plików / wierszy…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="kb__empty">Brak zestawów. Utwórz nowy.</div>
      ) : (
        <div className="pppList__grid">
          {filtered.map((row) => (
            <article key={row.id} className="pppList__item card">
              <div className="pppList__row1">
                <div className="pppList__title">
                  <button
                    type="button"
                    className="docLink pppList__linkLike"
                    onClick={() => nav(`/dokumentacja/logi/${encodeURIComponent(row.id)}`)}
                  >
                    {row.id}
                  </button>
                  <div className="chips">
                    <span className="chip">pliki: {row.files}</span>
                    <span className="chip">wiersze: {row.rows}</span>
                    <span className="chip">akt.: {prettyDate(row.updatedAt)}</span>
                  </div>
                </div>
                <div className="pppList__metaRight">
                  <button className="ghost" type="button" onClick={() => nav(`/dokumentacja/logi/${encodeURIComponent(row.id)}`)}>Otwórz ↗</button>
                  <button className="ghost" type="button" onClick={() => removeSet(row.id)}>Usuń</button>
                </div>
              </div>
              <div className="pppList__row2">
                <div className="pppList__meta">
                  <span className="pppList__metaLabel">Klucz:</span> <code>{SET_PREFIX}{row.id}</code>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

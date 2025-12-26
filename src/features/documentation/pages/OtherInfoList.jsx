// src/components/pages/contents/OtherInfoList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/documentation-orders.css";

const SET_PREFIX = "infset.v1.";

function readAllSets() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(SET_PREFIX)) continue;
    const id = k.slice(SET_PREFIX.length);
    try {
      const arr = JSON.parse(localStorage.getItem(k)) || [];
      const items = arr.length;
      const updatedAt = arr.reduce((mx, it) => Math.max(mx, it?.updatedAt || 0), 0) || null;
      out.push({ id, key: k, items, updatedAt });
    } catch {}
  }
  out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return out;
}

function prettyDate(ts) { return ts ? new Date(ts).toLocaleString() : "—"; }

export default function OtherInfoList() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(() => readAllSets());

  useEffect(() => {
    const refresh = () => setRows(readAllSets());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => r.id.toLowerCase().includes(s) || String(r.items).includes(s));
  }, [rows, q]);

  const createNew = () => {
    const id = prompt("ID nowego zestawu informacji (np. O-1003-materiały-klienta):");
    if (!id) return;
    const key = SET_PREFIX + id;
    if (localStorage.getItem(key)) { alert("Taki zestaw już istnieje."); return; }
    try { localStorage.setItem(key, JSON.stringify([])); } catch { alert("Błąd zapisu do localStorage."); return; }
    setRows(readAllSets());
    nav(`/dokumentacja/inne-informacje/${encodeURIComponent(id)}`);
  };

  const removeSet = (id) => {
    if (!window.confirm(`Usunąć zestaw „${id}”?`)) return;
    localStorage.removeItem(SET_PREFIX + id);
    setRows(readAllSets());
  };

  // === DEMO SEED ===
  const loadDemo = () => {
    const now = Date.now();
    const demo = {
      "O-1003-materiały-klienta": [
        {
          id: "u1", kind: "url", title: "Zdjęcia produktu (Google Photos)",
          url: "https://example.com/zdjecia-produktu", tags: ["zdjęcia","klient"],
          updatedAt: now - 1000 * 60 * 60
        },
        {
          id: "n1", kind: "note", title: "Ustalenia z maila 12.09",
          description: "Klient potwierdził **model VOLT-60**.\nDodać badanie prądu rozruchu wg 6.2.",
          tags: ["mail","ustalenia"], updatedAt: now - 1000 * 60 * 50
        },
        {
          id: "f1", kind: "file", title: "Instrukcja_VOLT-60.pdf",
          fileName: "Instrukcja_VOLT-60.pdf", fileType: "application/pdf", fileSize: 1024 * 450,
          tags: ["instrukcja","pdf"], updatedAt: now - 1000 * 60 * 40
        },
      ],
      "O-1007-dodatkowe-materiały": [
        {
          id: "u2", kind: "url", title: "Repo dokumentów (SharePoint)",
          url: "https://example.com/sharepoint/o-1007", tags: ["repo","sharepoint"],
          updatedAt: now - 1000 * 60 * 35
        },
        {
          id: "n2", kind: "note", title: "Warunki środowiskowe",
          description: "Wymagane badanie w **23±2°C**, RH **50±10%**.",
          tags: ["warunki","środowisko"], updatedAt: now - 1000 * 60 * 30
        },
        {
          id: "f2", kind: "file", title: "Zdjęcie_1.jpg",
          fileName: "Zdjęcie_1.jpg", fileType: "image/jpeg", fileSize: 1024 * 800,
          tags: ["zdjęcia"], updatedAt: now - 1000 * 60 * 25
        },
      ]
    };

    Object.entries(demo).forEach(([id, arr]) => {
      localStorage.setItem(SET_PREFIX + id, JSON.stringify(arr));
    });
    setRows(readAllSets());
  };

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>Inne informacje — zestawy</h2>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={loadDemo}>Wczytaj demo</button>
        <button className="ghost" type="button" onClick={createNew}>+ Nowy zestaw</button>
      </div>

      <div className="pppList__filters card">
        <input
          className="i"
          placeholder="Szukaj po ID / liczbie pozycji…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="kb__empty">Brak zestawów. Użyj „Wczytaj demo” lub utwórz nowy.</div>
      ) : (
        <div className="pppList__grid">
          {filtered.map((row) => (
            <article key={row.id} className="pppList__item card">
              <div className="pppList__row1">
                <div className="pppList__title">
                  <button
                    type="button"
                    className="docLink pppList__linkLike"
                    onClick={() => nav(`/dokumentacja/inne-informacje/${encodeURIComponent(row.id)}`)}
                  >
                    {row.id}
                  </button>
                  <div className="chips">
                    <span className="chip">pozycji: {row.items}</span>
                    <span className="chip">akt.: {prettyDate(row.updatedAt)}</span>
                  </div>
                </div>
                <div className="pppList__metaRight">
                  <button className="ghost" type="button" onClick={() => nav(`/dokumentacja/inne-informacje/${encodeURIComponent(row.id)}`)}>Otwórz ↗</button>
                  <button className="ghost" type="button" onClick={() => removeSet(row.id)}>Usuń</button>
                </div>
              </div>
              <div className="pppList__row2">
                <div className="pppList__meta">
                  <span className="pppList__metaLabel">Klucz:</span> <code>infset.v1.{row.id}</code>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

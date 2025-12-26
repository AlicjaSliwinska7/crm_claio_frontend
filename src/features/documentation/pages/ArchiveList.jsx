import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/documentation-orders.css";

/* ===== Mock loader (podmień na backend) ===== */
async function mockLoadArchives() {
  const today = (d) => d.toISOString().slice(0, 10);
  const now = new Date();
  return [
    {
      orderId: "o-1001",
      contractNumber: "ZL-2025/001",
      clientName: "AutoTech Sp. z o.o.",
      manufacturer: "Voltmax GmbH",
      createdAt: today(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)),
      updatedAt: today(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
      status: "pending", // pending | archived
      docsCount: 6,
      contents: ["PPP", "PB", "Karty badań (2)", "Logi", "Sprawozdanie"],
    },
    {
      orderId: "o-1003",
      contractNumber: "ZL-2025/010",
      clientName: "StartBattery s.r.o.",
      manufacturer: "StartBattery s.r.o.",
      createdAt: today(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14)),
      updatedAt: today(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)),
      status: "archived",
      docsCount: 9,
      contents: ["PPP", "PB", "Karty badań (4)", "Logi", "Zdjęcia", "Sprawozdanie"],
    },
  ];
}

/* ===== Pomocnicze ===== */
function Chip({ tone = "neutral", children, title }) {
  const cls =
    tone === "ok" ? "chip chip--ok" :
    tone === "warn" ? "chip chip--warn" :
    tone === "blue" ? "chip chip--info" :
    "chip";
  return <span className={cls} title={title}>{children}</span>;
}

function includesCI(hay, needle) {
  return (hay || "").toLowerCase().includes((needle || "").toLowerCase());
}

/* ===== Lista archiwów ===== */
export default function ArchiveList({ loadArchives = mockLoadArchives }) {
  const nav = useNavigate();
  const loc = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all|pending|archived
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await loadArchives();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadArchives, loc.key]);

  const list = useMemo(() => {
    let arr = items.slice();
    if (q.trim()) {
      arr = arr.filter(x =>
        includesCI(x.contractNumber, q) ||
        includesCI(x.clientName, q) ||
        includesCI(x.manufacturer, q) ||
        (x.contents || []).some(s => includesCI(s, q))
      );
    }
    if (status !== "all") arr = arr.filter(x => x.status === status);
    if (from) arr = arr.filter(x => !x.createdAt || x.createdAt >= from);
    if (to) arr = arr.filter(x => !x.createdAt || x.createdAt <= to);
    arr.sort((a,b) => String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
    return arr;
  }, [items, q, status, from, to]);

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter(x => x.status === "pending").length;
    const archived = items.filter(x => x.status === "archived").length;
    return { total, pending, archived, visible: list.length };
  }, [items, list]);

  const clear = () => { setQ(""); setStatus("all"); setFrom(""); setTo(""); };
  const openArchive = (row) => nav(`/dokumentacja/archiwizacja/${row.orderId}`);

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>Archiwum zleceń</h2>
        <div className="kb__spacer" />
      </div>

      <div className="docOrders__summary">
        <div className="summary-pill tone-blue"><span>Wszystkie</span><b>{stats.total}</b></div>
        <div className="summary-pill tone-amber"><span>Do archiwizacji</span><b>{stats.pending}</b></div>
        <div className="summary-pill tone-green"><span>Zarchiwizowane</span><b>{stats.archived}</b></div>
        <div className="summary-pill tone-slate"><span>Widoczne</span><b>{stats.visible}</b></div>
      </div>

      {/* filtry */}
      <div className="pppList__filters card">
        <input className="i" placeholder="Szukaj (nr zlecenia, klient, producent, zawartość)…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="i" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Status: wszystkie</option>
          <option value="pending">Do archiwizacji</option>
          <option value="archived">Zarchiwizowane</option>
        </select>
        <label className="f">
          <span className="l">Od (data utw.)</span>
          <input type="date" className="i" value={from} onChange={e=>setFrom(e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Do (data utw.)</span>
          <input type="date" className="i" value={to} onChange={e=>setTo(e.target.value)} />
        </label>
        <button className="ghost" type="button" onClick={clear}>Wyczyść</button>
      </div>

      {loading ? <div className="kb__empty">Ładowanie…</div> : null}
      {!loading && list.length === 0 ? <div className="kb__empty">Nic nie znaleziono.</div> : null}

      <div className="pppList__grid">
        {list.map(row => (
          <article key={row.orderId} className="pppList__item card">
            <div className="pppList__row1">
              <div className="pppList__title">
                <button className="docLink pppList__linkLike" type="button" onClick={() => openArchive(row)}>
                  {row.contractNumber}
                </button>
                <div className="chips">
                  {row.status === "archived" ? <Chip tone="ok">zarchiwizowane</Chip> : <Chip>do archiwizacji</Chip>}
                  <Chip title="liczba dokumentów">{row.docsCount} dok.</Chip>
                </div>
              </div>
              <div className="pppList__metaRight">
                <span className="pppList__metaLabel">Utw.:</span> <b>{row.createdAt || "—"}</b>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Zmiana:</span> <span>{row.updatedAt || "—"}</span>
              </div>
            </div>

            <div className="pppList__row2">
              <div className="pppList__meta">
                <span className="pppList__metaLabel">Klient:</span> <b>{row.clientName || "—"}</b>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Producent:</span> <span>{row.manufacturer || "—"}</span>
              </div>
              <div className="pppList__codes">
                {(row.contents || []).slice(0,3).map((c,i)=><code key={i} className="pppList__code">{c}</code>)}
                {row.contents && row.contents.length>3 ? <span className="pppList__more">+{row.contents.length-3}</span> : null}
              </div>
            </div>

            <div className="pppList__row3">
              <div className="pppList__actions">
                <button className="ghost" type="button" onClick={() => openArchive(row)}>Otwórz teczkę ↗</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

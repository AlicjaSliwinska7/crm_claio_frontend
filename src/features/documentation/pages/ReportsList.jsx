import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/documentation-orders.css";

/* ===== Mock loader (podmień na backend) ===== */
async function mockLoadReports() {
  // Minimalny kształt listingu sprawozdań
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  return [
    {
      id: "s-1001",
      reportNumber: "ZL-2025/010/S-001",
      orderId: "o-1003",
      contractNumber: "ZL-2025/010",
      clientName: "StartBattery s.r.o.",
      manufacturer: "StartBattery s.r.o.",
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)),
      updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
      status: "draft", // draft | verified | final
      samples: ["ZL-2025/010/1", "ZL-2025/010/2"],
      url: "",
    },
    {
      id: "s-1002",
      reportNumber: "ZL-2025/001/S-002",
      orderId: "o-1001",
      contractNumber: "ZL-2025/001",
      clientName: "AutoTech Sp. z o.o.",
      manufacturer: "Voltmax GmbH",
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)),
      updatedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)),
      status: "final",
      samples: ["ZL-2025/001/1-2025-09-16", "ZL-2025/001/2-2025-09-16"],
      url: "https://example.com/sprawozdanie.pdf",
    },
  ];
}

/* ===== Pomocnicze ===== */
function Chip({ tone = "neutral", title, children }) {
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

/* ===== Lista sprawozdań ===== */
export default function ReportsList({
  loadReports = mockLoadReports,
  onCreateNew, // opcjonalnie: () => void
}) {
  const nav = useNavigate();
  const loc = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtry
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all|draft|verified|final
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await loadReports();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadReports, loc.key]);

  const list = useMemo(() => {
    let arr = items.slice();

    if (q.trim()) {
      arr = arr.filter(x =>
        includesCI(x.reportNumber, q) ||
        includesCI(x.contractNumber, q) ||
        includesCI(x.clientName, q) ||
        includesCI(x.manufacturer, q) ||
        (x.samples || []).some(s => includesCI(s, q))
      );
    }
    if (status !== "all") arr = arr.filter(x => x.status === status);
    if (from) arr = arr.filter(x => !x.createdAt || x.createdAt >= from);
    if (to) arr = arr.filter(x => !x.createdAt || x.createdAt <= to);

    // sort: najnowsze aktualizacje na górze
    arr.sort((a,b) => String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
    return arr;
  }, [items, q, status, from, to]);

  const openReport = (row) => nav(`/dokumentacja/sprawozdania/${row.id}`);
  const openOrder  = (row) => nav(`/dokumentacja/zlecenia/${row.orderId}`);

  const stats = useMemo(() => {
    const total = items.length;
    const draft = items.filter(x => x.status === "draft").length;
    const verified = items.filter(x => x.status === "verified").length;
    const final = items.filter(x => x.status === "final").length;
    return { total, draft, verified, final, visible: list.length };
  }, [items, list]);

  const clear = () => { setQ(""); setStatus("all"); setFrom(""); setTo(""); };

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>Sprawozdania z badań</h2>
        <div className="kb__spacer" />
        {onCreateNew ? <button className="ghost" onClick={onCreateNew} type="button">+ Utwórz sprawozdanie</button> : null}
      </div>

      <div className="docOrders__summary">
        <div className="summary-pill tone-blue"><span>Wszystkie</span><b>{stats.total}</b></div>
        <div className="summary-pill tone-amber"><span>Szkice</span><b>{stats.draft}</b></div>
        <div className="summary-pill tone-indigo"><span>Sprawdzone</span><b>{stats.verified}</b></div>
        <div className="summary-pill tone-green"><span>Finalne</span><b>{stats.final}</b></div>
        <div className="summary-pill tone-slate"><span>Widoczne</span><b>{stats.visible}</b></div>
      </div>

      {/* filtry */}
      <div className="pppList__filters card">
        <input className="i" placeholder="Szukaj (nr, klient, producent, próbki)…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="i" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Status: wszystkie</option>
          <option value="draft">Szkic</option>
          <option value="verified">Sprawdzone</option>
          <option value="final">Finalne</option>
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
          <article key={row.id} className="pppList__item card">
            <div className="pppList__row1">
              <div className="pppList__title">
                <button className="docLink pppList__linkLike" type="button" onClick={() => openReport(row)}>
                  {row.reportNumber || "— bez numeru —"}
                </button>
                <div className="chips">
                  {row.status === "final" && <Chip tone="ok">finalne</Chip>}
                  {row.status === "verified" && <Chip tone="blue">sprawdzone</Chip>}
                  {row.status === "draft" && <Chip>szkic</Chip>}
                  <Chip title="liczba próbek">{row.samples?.length || 0} prób.</Chip>
                </div>
              </div>
              <div className="pppList__metaRight">
                <span className="pppList__metaLabel">Utworzono:</span> <b>{row.createdAt || "—"}</b>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Zmiana:</span> <span>{row.updatedAt || "—"}</span>
              </div>
            </div>

            <div className="pppList__row2">
              <div className="pppList__meta">
                <span className="pppList__metaLabel">Zlecenie:</span> <b>{row.contractNumber || "—"}</b>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Klient:</span> <span>{row.clientName || "—"}</span>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Producent:</span> <span>{row.manufacturer || "—"}</span>
              </div>
              <div className="pppList__codes">
                {(row.samples || []).slice(0,3).map((c,i)=><code key={i} className="pppList__code">{c}</code>)}
                {row.samples && row.samples.length>3 ? <span className="pppList__more">+{row.samples.length-3}</span> : null}
              </div>
            </div>

            <div className="pppList__row3">
              <div className="pppList__actions">
                <button className="ghost" type="button" onClick={() => openReport(row)}>Otwórz ↗</button>
                <button className="ghost" type="button" onClick={() => openOrder(row)}>Zlecenie ↗</button>
                {row.url ? <a className="ghost" href={row.url} target="_blank" rel="noreferrer">PDF ↗</a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

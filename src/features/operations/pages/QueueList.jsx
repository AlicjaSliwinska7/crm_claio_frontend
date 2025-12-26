import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../documentation/styles/documentation-orders.css";

/** Chip */
function Chip({ tone="neutral", title, children }) {
  const cls =
    tone === "ok" ? "chip chip--ok" :
    tone === "warn" ? "chip chip--warn" :
    tone === "info" ? "chip chip--info" :
    "chip";
  return <span className={cls} title={title}>{children}</span>;
}
const ci = (s) => (s||"").toLowerCase();

/** Reusable queue list */
export default function QueueList({
  title,
  hint,              // opcjonalny opis pod tytułem
  loadItems,         // async () => Array<Item>
  emptyText = "Brak pozycji w kolejce.",
}) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtry
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try { const data = await loadItems(); if (alive) setItems(data || []); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [loadItems]);

  const allAssignees = useMemo(() => {
    const s = new Set();
    items.forEach(x => (x.assignees||[]).forEach(a => s.add(a)));
    return ["all", ...Array.from(s)];
  }, [items]);

  const list = useMemo(() => {
    let arr = items.slice();
    if (q.trim()) {
      arr = arr.filter(x =>
        ci(x.contractNumber).includes(ci(q)) ||
        ci(x.client).includes(ci(q)) ||
        ci(x.title).includes(ci(q)) ||
        (x.tags||[]).some(t => ci(t).includes(ci(q)))
      );
    }
    if (status !== "all") arr = arr.filter(x => (x.status||"") === status);
    if (assignee !== "all") arr = arr.filter(x => (x.assignees||[]).includes(assignee));
    if (from) arr = arr.filter(x => !x.dueAt || x.dueAt >= from);
    if (to) arr = arr.filter(x => !x.dueAt || x.dueAt <= to);

    // sort: najpierw priorytet, potem najbliższy dueAt, potem updatedAt
    const prio = { high: 0, normal: 1, low: 2 };
    arr.sort((a,b) =>
      (prio[a.priority||"normal"] - prio[b.priority||"normal"]) ||
      String(a.dueAt||"").localeCompare(String(b.dueAt||"")) ||
      String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))
    );
    return arr;
  }, [items, q, status, assignee, from, to]);

  const stats = useMemo(() => {
    const total = items.length;
    const pHigh = items.filter(x => x.priority === "high").length;
    const st = {};
    items.forEach(x => { st[x.status||"unknown"] = (st[x.status||"unknown"]||0)+1; });
    return { total, pHigh, st, visible: list.length };
  }, [items, list]);

  const clear = () => { setQ(""); setStatus("all"); setAssignee("all"); setFrom(""); setTo(""); };

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>{title}</h2>
        <div className="kb__spacer" />
      </div>
      {hint ? <div className="hint" style={{ marginBottom: 8 }}>{hint}</div> : null}

      {/* Podsumowanie */}
      <div className="docOrders__summary" style={{ flexWrap: "wrap" }}>
        <div className="summary-pill tone-blue"><span>Wszystkie</span><b>{stats.total}</b></div>
        <div className="summary-pill tone-amber"><span>Priorytet ↑</span><b>{stats.pHigh}</b></div>
        <div className="summary-pill tone-slate"><span>Widoczne</span><b>{stats.visible}</b></div>
        {Object.entries(stats.st).map(([k,v]) => (
          <div key={k} className="summary-pill tone-indigo"><span>Status: {k}</span><b>{v}</b></div>
        ))}
      </div>

      {/* Filtry */}
      <div className="pppList__filters card">
        <input className="i" placeholder="Szukaj (zlecenie, klient, tytuł, tag)…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="i" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">Status: wszystkie</option>
          <option value="todo">do zrobienia</option>
          <option value="inprog">w toku</option>
          <option value="blocked">zablokowane</option>
          <option value="done">gotowe</option>
        </select>
        <select className="i" value={assignee} onChange={e=>setAssignee(e.target.value)}>
          {allAssignees.map(a => <option key={a} value={a}>{a === "all" ? "Osoba: wszyscy" : a}</option>)}
        </select>
        <label className="f"><span className="l">Termin od</span>
          <input type="date" className="i" value={from} onChange={e=>setFrom(e.target.value)} />
        </label>
        <label className="f"><span className="l">Termin do</span>
          <input type="date" className="i" value={to} onChange={e=>setTo(e.target.value)} />
        </label>
        <button className="ghost" type="button" onClick={clear}>Wyczyść</button>
      </div>

      {loading ? <div className="kb__empty">Ładowanie…</div> : null}
      {!loading && list.length === 0 ? <div className="kb__empty">{emptyText}</div> : null}

      <div className="pppList__grid">
        {list.map((row, i) => (
          <article key={row.id || i} className="pppList__item card">
            <div className="pppList__row1">
              <div className="pppList__title">
                <button
                  className="docLink pppList__linkLike"
                  type="button"
                  onClick={() => row.href && nav(row.href)}
                  title="Otwórz szczegóły"
                >
                  {row.title}
                </button>
                <div className="chips">
                  <Chip tone={row.priority === "high" ? "warn" : "info"} title="Priorytet">
                    {row.priority || "normal"}
                  </Chip>
                  <Chip title="Status">{row.status || "—"}</Chip>
                  {(row.tags||[]).slice(0,3).map((t,idx)=><Chip key={idx}>{t}</Chip>)}
                  {(row.tags||[]).length>3 ? <Chip>+{(row.tags||[]).length-3}</Chip> : null}
                </div>
              </div>
              <div className="pppList__metaRight">
                <span className="pppList__metaLabel">Zlecenie:</span> <b>{row.contractNumber || "—"}</b>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Klient:</span> <span>{row.client || "—"}</span>
                <span className="pppList__sep">·</span>
                <span className="pppList__metaLabel">Termin:</span> <span>{row.dueAt || "—"}</span>
              </div>
            </div>

            <div className="pppList__row2">
              <div className="pppList__meta">
                <span className="pppList__metaLabel">Przypisani:</span>{" "}
                <span>{(row.assignees||[]).join(", ") || "—"}</span>
              </div>
              <div className="pppList__codes">
                {(row.samples||[]).slice(0,3).map((c,i)=> <code key={i} className="pppList__code">{c}</code>)}
                {(row.samples||[]).length>3 ? <span className="pppList__more">+{(row.samples||[]).length-3}</span> : null}
              </div>
            </div>

            <div className="pppList__row3">
              <div className="pppList__actions">
                {row.href ? <button className="ghost" type="button" onClick={() => nav(row.href)}>Otwórz ↗</button> : null}
                {(row.actions||[]).map((a,idx)=>(
                  <button key={idx} className="ghost" type="button" onClick={a.onClick}>{a.label}</button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

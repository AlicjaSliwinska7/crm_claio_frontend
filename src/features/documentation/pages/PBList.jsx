// src/components/pages/contents/PBList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/documentation-orders.css";

/* ========= Mock loader (podmień przez props: loadPBs=async()=>[]) ========= */
async function mockLoadPBs() {
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString().slice(0, 16);

  return [
    {
      id: "pb-1001",
      orderId: "o-1001",
      pbNumber: "PB-2025/001",
      contractNumber: "ZL-2025/001",
      clientName: "AutoTech Sp. z o.o.",
      preparedAt: iso(now - 8 * 24 * 3600 * 1000),
      approvedAt: iso(now - 7 * 24 * 3600 * 1000),
      updatedAt: iso(now - 6 * 24 * 3600 * 1000),
      methodsCount: 6,
      status: "approved", // draft | approved | archived
      url: "https://example.com/pb-2025-001.pdf",
    },
    {
      id: "pb-1002",
      orderId: "o-1002",
      pbNumber: "",
      contractNumber: "ZL-2025/007",
      clientName: "Akku Polska SA",
      preparedAt: "",
      approvedAt: "",
      updatedAt: iso(now - 2 * 24 * 3600 * 1000),
      methodsCount: 0,
      status: "draft",
      url: "",
    },
    {
      id: "pb-1003",
      orderId: "o-1003",
      pbNumber: "PB-2025/003",
      contractNumber: "ZL-2025/010",
      clientName: "StartBattery s.r.o.",
      preparedAt: iso(now - 12 * 24 * 3600 * 1000),
      approvedAt: "",
      updatedAt: iso(now - 5 * 24 * 3600 * 1000),
      methodsCount: 3,
      status: "draft",
      url: "",
    },
  ];
}

/* ================== Pomocnicze ================== */
function Chip({ tone = "neutral", title, children }) {
  const cls = tone === "ok" ? "chip chip--ok" : tone === "warn" ? "chip chip--warn" : "chip";
  return (
    <span className={cls} title={title} style={{ whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function fmt(dt) {
  return dt ? dt.replace("T", " ") : "—";
}

function includesCI(hay, needle) {
  return (hay || "").toLowerCase().includes((needle || "").toLowerCase());
}

/** Braki minimalne do kompletności PB */
function computeMissing(pb) {
  const lacks = [];
  if (!pb.pbNumber) lacks.push("brak numeru PB");
  if (!pb.preparedAt) lacks.push("brak daty przygotowania");
  if ((pb.methodsCount || 0) <= 0) lacks.push("brak metod");
  return lacks;
}

/* ================== Lista Programów Badań ================== */
export default function PBList({ loadPBs = mockLoadPBs, onCreateNewPB }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtry
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | draft | approved | archived
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyWithFile, setOnlyWithFile] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await loadPBs();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadPBs, location.key]);

  const list = useMemo(() => {
    let arr = rows.slice();

    if (q.trim()) {
      arr = arr.filter(
        (x) =>
          includesCI(x.pbNumber, q) ||
          includesCI(x.contractNumber, q) ||
          includesCI(x.clientName, q) ||
          includesCI(x.orderId, q)
      );
    }

    if (status !== "all") {
      arr = arr.filter((x) => (x.status || "draft") === status);
    }

    if (onlyMissing) {
      arr = arr.filter((x) => computeMissing(x).length > 0);
    }

    if (onlyWithFile) {
      arr = arr.filter((x) => !!x.url);
    }

    // Daty: jeśli filtr ustawiony, wymagaj przygotowanej daty w zakresie
    if (from) {
      arr = arr.filter((x) => x.preparedAt && String(x.preparedAt) >= String(from));
    }
    if (to) {
      arr = arr.filter((x) => x.preparedAt && String(x.preparedAt) <= String(to));
    }

    // sort: najnowsze aktualizacje u góry
    arr.sort(
      (a, b) =>
        String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")) ||
        String(b.preparedAt || "").localeCompare(String(a.preparedAt || ""))
    );

    return arr;
  }, [rows, q, status, onlyMissing, onlyWithFile, from, to]);

  const stats = useMemo(() => {
    const total = rows.length;
    const drafts = rows.filter((x) => (x.status || "draft") === "draft").length;
    const approved = rows.filter((x) => x.status === "approved").length;
    const archived = rows.filter((x) => x.status === "archived").length;
    const visible = list.length;
    return { total, drafts, approved, archived, visible };
  }, [rows, list]);

  const openPB = (row) => navigate(`/dokumentacja/pb/${row.id}`);
  const openOrder = (row) => navigate(`/dokumentacja/zlecenia/${row.orderId}`);

  const createPB = () => {
    if (onCreateNewPB) return onCreateNewPB();
    // front-only szkic – możesz potem podmienić na kreator
    navigate("/dokumentacja/pb/pb-blank");
  };

  const clr = () => {
    setQ("");
    setStatus("all");
    setOnlyMissing(false);
    setOnlyWithFile(false);
    setFrom("");
    setTo("");
  };

  return (
    <div className="pppList">{/* reużywam layout PPPsList */}
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>
          Programy badań
        </h2>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={createPB} aria-label="Utwórz nowy program badań">
          + Utwórz PB
        </button>
      </div>

      {/* podsumowanie */}
      <div className="docOrders__summary">
        <div className="summary-pill tone-blue">
          <span>Wszystkie</span>
          <b>{stats.total}</b>
        </div>
        <div className="summary-pill tone-amber" title="Szkice / w przygotowaniu">
          <span>Robocze</span>
          <b>{stats.drafts}</b>
        </div>
        <div className="summary-pill tone-green" title="Zatwierdzone">
          <span>Zatwierdzone</span>
          <b>{stats.approved}</b>
        </div>
        <div className="summary-pill tone-slate" title="Zarchiwizowane">
          <span>Archiwum</span>
          <b>{stats.archived}</b>
        </div>
        <div className="summary-pill tone-indigo">
          <span>Widoczne</span>
          <b>{stats.visible}</b>
        </div>
      </div>

      {/* filtry */}
      <div className="pppList__filters card">
        <input
          className="i"
          placeholder="Szukaj (nr PB, nr zlecenia, klient, ID zlecenia)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Szukaj PB"
        />

        <select className="i" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtr statusu PB">
          <option value="all">Status: wszystkie</option>
          <option value="draft">Robocze</option>
          <option value="approved">Zatwierdzone</option>
          <option value="archived">Archiwum</option>
        </select>

        <label className="f">
          <span className="l">Od (przygotowano)</span>
          <input type="datetime-local" className="i" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Do (przygotowano)</span>
          <input type="datetime-local" className="i" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>

        <div className="pppList__filters__toggles">
          <label className="f f--row">
            <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
            <span>tylko z brakami</span>
          </label>
          <label className="f f--row">
            <input type="checkbox" checked={onlyWithFile} onChange={(e) => setOnlyWithFile(e.target.checked)} />
            <span>z plikiem</span>
          </label>
          <button className="ghost" type="button" onClick={clr}>
            Wyczyść filtry
          </button>
        </div>
      </div>

      {/* lista */}
      {loading ? <div className="kb__empty">Ładowanie…</div> : null}
      {!loading && list.length === 0 ? (
        <div className="kb__empty" style={{ display: "grid", gap: 12 }}>
          Nic nie znaleziono dla podanych filtrów.
          <div>
            <button className="ghost" type="button" onClick={createPB}>
              + Utwórz PB
            </button>
          </div>
        </div>
      ) : null}

      <div className="pppList__grid">
        {list.map((row) => {
          const missing = computeMissing(row);
          const st = row.status || "draft";

          return (
            <article key={row.id} className="pppList__item card">
              <div className="pppList__row1">
                <div className="pppList__title">
                  <button type="button" className="docLink pppList__linkLike" onClick={() => openPB(row)}>
                    {row.pbNumber || "— brak numeru PB —"}
                  </button>
                  <div className="chips">
                    {st === "approved" ? (
                      <Chip tone="ok">zatwierdzony</Chip>
                    ) : st === "archived" ? (
                      <Chip>archiwum</Chip>
                    ) : (
                      <Chip>roboczy</Chip>
                    )}
                    {missing.map((m, i) => (
                      <Chip key={i} tone="warn">
                        {m}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="pppList__metaRight">
                  <span className="pppList__metaLabel">Przygotowano:</span> <b>{fmt(row.preparedAt)}</b>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Zatwierdzono:</span> <span>{fmt(row.approvedAt)}</span>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Zmiana:</span> <span>{fmt(row.updatedAt)}</span>
                </div>
              </div>

              <div className="pppList__row2">
                <div className="pppList__meta">
                  <span className="pppList__metaLabel">Zlecenie:</span> <b>{row.contractNumber || "—"}</b>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Klient:</span> <span>{row.clientName || "—"}</span>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Metody:</span>{" "}
                  <span>{row.methodsCount > 0 ? row.methodsCount : "—"}</span>
                </div>
                <div className="pppList__codes" />
              </div>

              <div className="pppList__row3">
                <div className="pppList__actions">
                  <button type="button" className="ghost" onClick={() => openPB(row)}>
                    Otwórz PB ↗
                  </button>
                  <button type="button" className="ghost" onClick={() => openOrder(row)}>
                    Zlecenie ↗
                  </button>
                  {row.url ? (
                    <a className="ghost" href={row.url} target="_blank" rel="noreferrer">
                      Plik PDF ↗
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

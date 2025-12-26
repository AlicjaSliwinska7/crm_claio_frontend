// src/components/pages/contents/Logs.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/documentation-orders.css";

/* =============== CSV helpers (frontend-only) =============== */
function detectDelimiter(text) {
  // policz wystąpienia w pierwszych wierszach
  const sample = text.split(/\r?\n/).slice(0, 5).join("\n");
  const counts = [",", ";", "\t"].map((d) => ({
    d,
    c: (sample.match(new RegExp(`\\${d}`, "g")) || []).length,
  }));
  counts.sort((a, b) => b.c - a.c);
  return counts[0].c > 0 ? counts[0].d : ",";
}

function parseCSV(text) {
  const delim = detectDelimiter(text);
  // prosty parser: wspiera "quote,ed", "val"; nie wspiera złożonych CRLF w cudzysłowach (wystarczy do logów)
  const rows = [];
  let row = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') {
        cell += '"'; i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }
    if (!inQ && (ch === delim || ch === "\n" || ch === "\r")) {
      row.push(cell);
      cell = "";
      if (ch === delim) continue;
      if (ch === "\r" && text[i + 1] === "\n") i++; // CRLF
      rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  // header + records
  if (!rows.length) return { header: [], records: [], delim };
  const header = rows[0].map((h, idx) => h?.trim() || `col_${idx + 1}`);
  const records = rows.slice(1).filter(r => r.some(x => String(x).trim() !== ""));
  return { header, records, delim };
}

function toNumberMaybe(s) {
  if (s == null) return null;
  const t = String(s).trim().replace(/\s+/g, "");
  if (!t) return null;
  // polskie przecinki w liczbach
  const norm = t.replace(",", ".").replace(/[^\d.eE+\-]/g, "");
  const v = Number(norm);
  return Number.isFinite(v) ? v : null;
}

function parseMaybeDate(s) {
  if (!s) return null;
  const t = String(s).trim();
  // 1) ISO / „YYYY-MM-DD HH:mm:ss”
  const d1 = Date.parse(t.replace(" ", "T"));
  if (!Number.isNaN(d1)) return new Date(d1);
  // 2) DD.MM.YYYY [HH:mm[:ss]]
  const m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const [_, dd, mm, yy, HH = "0", MM = "0", SS = "0"] = m;
    const y = Number(yy.length === 2 ? (Number(yy) + 2000) : yy);
    const d = new Date(y, Number(mm) - 1, Number(dd), Number(HH), Number(MM), Number(SS));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/* =============== Mini Toast =============== */
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info", ttl = 2200) => {
    setToast({ msg, type });
    const t = setTimeout(() => setToast(null), ttl);
    return () => clearTimeout(t);
  }, []);
  const Toast = useCallback(() => {
    if (!toast) return null;
    return (
      <div
        style={{
          position: "fixed", right: 16, bottom: 16,
          background: toast.type === "error" ? "#fecaca" : toast.type === "warn" ? "#fde68a" : "#dbeafe",
          border: "1px solid rgba(0,0,0,.1)", padding: "10px 12px", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,.15)", zIndex: 9999, color: "#111827", fontWeight: 700
        }}
      >{toast.msg}</div>
    );
  }, [toast]);
  return { show, Toast };
}

/* =============== Canvas chart (lekka linia) =============== */
function useResize(ref, cb) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(cb);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, cb]);
}

function LineChart({ series, xIsTime }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 600, h = wrap.clientHeight || 320;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // marginesy
    const m = { l: 56, r: 16, t: 16, b: 32 };

    // zbuduj domain
    const all = series.flatMap(s => s.data);
    if (!all.length) return;
    const xs = all.map(p => p.x);
    const ys = all.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padY = (maxY - minY) * 0.05 || 1;
    const y0 = minY - padY, y1 = maxY + padY;

    const sx = (x) => m.l + (w - m.l - m.r) * ((x - minX) / (maxX - minX || 1));
    const sy = (y) => h - m.b - (h - m.t - m.b) * ((y - y0) / (y1 - y0 || 1));

    // osie
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, h - m.b); ctx.lineTo(w - m.r, h - m.b);
    ctx.stroke();

    ctx.fillStyle = "#6b7280"; ctx.font = "12px ui-sans-serif, system-ui, -apple-system";
    // etykiety Y (5 ticków)
    for (let i = 0; i <= 5; i++) {
      const t = y0 + (i * (y1 - y0)) / 5;
      const yy = sy(t);
      ctx.strokeStyle = "#f3f4f6";
      ctx.beginPath(); ctx.moveTo(m.l, yy); ctx.lineTo(w - m.r, yy); ctx.stroke();
      ctx.fillText(String(Math.round(t * 1000) / 1000), 4, yy - 2);
    }

    // linie serii
    const palette = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#0891b2", "#d946ef", "#059669"];
    series.forEach((s, idx) => {
      ctx.strokeStyle = palette[idx % palette.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      s.data.forEach((p, i) => {
        const X = sx(p.x), Y = sy(p.y);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      });
      ctx.stroke();
      // legenda
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(m.l + idx * 120, 4, 10, 10);
      ctx.fillStyle = "#111827";
      ctx.fillText(s.name, m.l + 16 + idx * 120, 13);
    });

    // ticks X (5)
    ctx.fillStyle = "#6b7280";
    for (let i = 0; i <= 5; i++) {
      const xv = minX + (i * (maxX - minX)) / 5;
      const xx = sx(xv);
      const label = xIsTime ? new Date(xv).toLocaleTimeString() : String(Math.round(xv * 1000) / 1000);
      ctx.fillText(label, xx - 14, h - 12);
    }
  }, [series, xIsTime]);

  useResize(wrapRef, draw);
  useEffect(draw, [draw]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* =============== Główny komponent =============== */
const LS_KEY = "logViewer.mapping.v1";

export default function Logs() {
  const { show, Toast } = useToast();

  const [files, setFiles] = useState([]); // [{name, header, records, delim}]
  const [active, setActive] = useState(0);
  const [mapping, setMapping] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
  });
  const [xIsTime, setXIsTime] = useState(true);

  const activeFile = files[active] || null;
  const header = activeFile?.header || [];
  const records = activeFile?.records || [];

  /* ---- parsowanie uploadu ---- */
  const parseFile = async (file) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    return { name: file.name, ...parsed };
  };

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter(f => f.type.includes("csv") || f.name.endsWith(".csv") || f.type==="text/plain");
    if (!list.length) { show("Upuść pliki CSV.", "warn"); return; }
    const parsed = await Promise.all(list.map(parseFile));
    setFiles((cur) => [...cur, ...parsed]);
    setActive((cur) => cur || 0);
    show(`Wczytano ${parsed.length} plik(i).`, "info");
  }, [show]);

  const onPick = async (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const parsed = await Promise.all(list.map(parseFile));
    setFiles((cur) => [...cur, ...parsed]);
    if (!files.length) setActive(0);
    show(`Wczytano ${parsed.length} plik(i).`, "info");
  };

  const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };

  /* ---- mapping kolumn ---- */
  const m = mapping[activeFile?.name || ""] || { x: header[0] || "", y: [] };
  const setMap = (patch) => {
    const key = activeFile?.name || "";
    const next = { ...(mapping || {}), [key]: { ...(mapping[key] || { y: [] }), ...patch } };
    setMapping(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  };

  const series = useMemo(() => {
    if (!activeFile) return [];
    const xi = header.indexOf(m.x);
    if (xi < 0) return [];
    const ys = (m.y || []).filter(c => header.includes(c));
    if (!ys.length) return [];

    // zbuduj oś X
    const X = records.map(r => {
      const raw = r[xi];
      if (xIsTime) {
        const d = parseMaybeDate(raw);
        return d ? d.getTime() : toNumberMaybe(raw);
      }
      const n = toNumberMaybe(raw);
      return n != null ? n : null;
    });

    const out = ys.map((col) => {
      const yi = header.indexOf(col);
      const data = [];
      for (let i = 0; i < records.length; i++) {
        const xv = X[i];
        const yv = toNumberMaybe(records[i][yi]);
        if (xv != null && yv != null) data.push({ x: xv, y: yv });
      }
      return { name: col, data };
    }).filter(s => s.data.length > 0);

    return out;
  }, [activeFile, m, header, records, xIsTime]);

  const stats = useMemo(() => {
    const res = {};
    series.forEach(s => {
      if (!s.data.length) return;
      const ys = s.data.map(p => p.y);
      const n = ys.length;
      const min = Math.min(...ys), max = Math.max(...ys);
      const mean = ys.reduce((a,b)=>a+b,0)/n;
      const sd = Math.sqrt(ys.reduce((a,b)=>a+(b-mean)*(b-mean),0)/n);
      res[s.name] = { n, min, max, mean, sd };
    });
    return res;
  }, [series]);

  const exportFiltered = () => {
    if (!activeFile) return;
    const sel = [m.x, ...(m.y||[])].filter(Boolean);
    if (!sel.length) return;
    const idx = sel.map(h => header.indexOf(h));
    const out = [sel.join(",")];
    records.forEach(r => {
      out.push(idx.map(i => (r[i] ?? "").toString().replace(/"/g,'""')).map(v=>`"${v}"`).join(","));
    });
    const blob = new Blob([out.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (activeFile.name.replace(/\.csv$/i,"") || "log") + "_filtered.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>Logi badań (CSV)</h2>
        <div className="kb__spacer" />
        <label className="chip" style={{ cursor: "pointer" }}>
          <input type="file" accept=".csv,text/csv,text/plain" multiple onChange={onPick} />
          <span>+ Dodaj pliki CSV</span>
        </label>
        <button className="ghost" type="button" onClick={exportFiltered} disabled={!activeFile}>Eksport widoku CSV</button>
      </div>

      {/* Strefa drop */}
      <div
        className="card"
        style={{ padding: 24, borderStyle: "dashed", borderWidth: 2 }}
        onDragOver={prevent}
        onDragEnter={prevent}
        onDragLeave={prevent}
        onDrop={onDrop}
      >
        Przeciągnij & upuść pliki CSV tutaj lub użyj przycisku „Dodaj pliki CSV”.
      </div>

      {/* Lista plików */}
      {files.length > 0 && (
        <div className="docOrders__summary" style={{ flexWrap: "wrap" }}>
          {files.map((f, i) => (
            <button
              key={f.name + i}
              className={`summary-pill ${i === active ? "tone-blue" : "tone-slate"}`}
              onClick={() => setActive(i)}
              title={`kolumny: ${f.header.length}, wiersze: ${f.records.length}`}
              type="button"
            >
              <span>{f.name}</span><b>{f.records.length}</b>
            </button>
          ))}
        </div>
      )}

      {!activeFile ? (
        <div className="kb__empty">Brak wczytanych plików.</div>
      ) : (
        <>
          {/* MAPPING */}
          <div className="card" style={{ display: "grid", gap: 12 }}>
            <div className="f f--row" style={{ gap: 12, flexWrap: "wrap" }}>
              <label className="f">
                <span className="l">Kolumna X</span>
                <select className="i" value={m.x || ""} onChange={(e) => setMap({ x: e.target.value })}>
                  {header.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
              <label className="f f--row" title="Traktuj X jako czas (parsowanie dat, oś w ms)">
                <input type="checkbox" checked={xIsTime} onChange={(e)=>setXIsTime(e.target.checked)} />
                <span>X to czas</span>
              </label>

              <label className="f" style={{ minWidth: 240 }}>
                <span className="l">Kolumny Y (serie)</span>
                <select
                  className="i"
                  multiple
                  size={Math.min(8, header.length)}
                  value={m.y || []}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map(o => o.value);
                    setMap({ y: vals });
                  }}
                >
                  {header.filter(h => h !== m.x).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>

            {/* Statystyki */}
            <div className="chips" style={{ flexWrap: "wrap" }}>
              {Object.entries(stats).map(([name, s]) => (
                <span key={name} className="chip" title="n • min • max • mean • sd">
                  {name}: n={s.n}, min={round(s.min)}, max={round(s.max)}, μ={round(s.mean)}, σ={round(s.sd)}
                </span>
              ))}
            </div>
          </div>

          {/* WYKRES */}
          <LineChart series={series} xIsTime={xIsTime} />

          {/* Podgląd tabeli */}
          <div className="docForm__section f--span3" style={{ marginTop: 16 }}>Podgląd danych</div>
          <div className="card" style={{ overflow: "auto" }}>
            <table className="docTable">
              <thead>
                <tr>{header.map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.slice(0, 50).map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => <td key={ci}>{String(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length > 50 ? <div className="hint" style={{ paddingTop: 8 }}>Pokazano pierwsze 50 wierszy.</div> : null}
          </div>
        </>
      )}

      <Toast />
    </div>
  );
}

/* =============== utils =============== */
function round(v) { return Math.round(v * 1000) / 1000; }

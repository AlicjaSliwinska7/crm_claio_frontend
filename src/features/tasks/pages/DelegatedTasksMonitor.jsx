import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, AlertTriangle, CheckCircle2, TimerReset, Send, Eye, CalendarClock } from "lucide-react";
import "../styles/monitor-tasks.css";

/**
 * DelegatedTasksMonitor — monitoring zadań, które zleciłem innym.
 * NOWE:
 *  - Dashboard tygodniowy: wykres linii opóźnień (ostatnie 28 dni)
 *  - Preset „Pilne 7 dni”
 */

export default function DelegatedTasksMonitor({ currentUser = "Alicja Śliwińska", tasks = [], people = [] }) {
  const navigate = useNavigate();

  // --- filtry ---
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");            // "", "todo", "inprogress", "done"
  const [assignee, setAssignee] = useState("");        // pojedynczy filtr
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [presetNext7, setPresetNext7] = useState(false); // NOWE: pilne 7 dni

  // --- znormalizowane zadania delegowane ---
  const delegated = useMemo(() => {
    const mine = (tasks || []).filter(t => String(t.createdBy || "").toLowerCase() === String(currentUser).toLowerCase());
    return mine.filter(t => !(t.assignees || []).some(a => normalize(a) === normalize(currentUser)));
  }, [tasks, currentUser]);

  const today = new Date();
  const todayISO = today.toISOString().slice(0,10);

  // --- przetwarzanie + filtry ---
  const baseItems = useMemo(() => delegated.map(t => enrich(t, todayISO)), [delegated, todayISO]);

  const items = useMemo(() => {
    let out = baseItems;

    // preset „Pilne 7 dni” = termin w [dziś, dziś+7], status != done
    if (presetNext7) {
      const hi = addDays(today, 7).toISOString().slice(0,10);
      out = out.filter(t => t.dueDate && t._status !== "done" && t.dueDate.slice(0,10) >= todayISO && t.dueDate.slice(0,10) <= hi);
    }

    out = out
      .filter(t => (q ? [t.id, t.title, ...(t.labels||[])].join(" ").toLowerCase().includes(q.toLowerCase()) : true))
      .filter(t => (status ? t._status === status : true))
      .filter(t => (assignee ? (t.assignees||[]).some(a => normalize(a) === normalize(assignee)) : true))
      .filter(t => (onlyOverdue ? t._overdue : true))
      .filter(t => (rangeFrom ? (t.createdAt || "").slice(0,10) >= rangeFrom : true))
      .filter(t => (rangeTo ? (t.createdAt || "").slice(0,10) <= rangeTo : true));

    return out;
  }, [baseItems, q, status, assignee, onlyOverdue, rangeFrom, rangeTo, presetNext7, todayISO, today]);

  // --- KPI ---
  const kpi = useMemo(() => {
    const total = items.length;
    const todo = items.filter(t => t._status === "todo").length;
    const inprog = items.filter(t => t._status === "inprogress").length;
    const done = items.filter(t => t._status === "done").length;
    const overdue = items.filter(t => t._overdue).length;
    const avgProgress = total ? Math.round(items.reduce((s,t)=>s+(t._progress||0),0)/total) : 0;
    return { total, todo, inprog, done, overdue, avgProgress };
  }, [items]);

  // --- seria do wykresu: ostatnie 28 dni ---
  const series = useMemo(() => {
    const days = 28;
    const dates = [];
    for (let i = days - 1; i >= 0; i--) dates.push(startOfDay(addDays(today, -i)));
    // przybliżenie: „zadanie po terminie” w danym dniu = dueDate < dzień && status != done (bierze obecny status)
    const points = dates.map(d => {
      const dISO = d.toISOString().slice(0,10);
      const count = baseItems.filter(t => t.dueDate && t._status !== "done" && t.dueDate.slice(0,10) < dISO).length;
      return { x: d, y: count };
    });
    return points;
  }, [baseItems, today]);

  // --- akcje (mock) ---
  function nudge(task) {
    alert(`Wysłano przypomnienie do: ${ (task.assignees||[]).join(", ") }\n\nZadanie: ${task.title}`);
  }
  function openMyTasks(task) {
    navigate(`/zadania/moje/${encodeURIComponent(task.id)}`);
  }

  return (
    <div className="mtm-wrap">
      {/* Header */}
      <div className="mtm-head">
        <h1>Monitoring zadań delegowanych</h1>
        <p>Podgląd postępu i terminowości zadań, które zleciłaś/eś innym użytkownikom.</p>
      </div>

      {/* DASHBOARD: wykres linii opóźnień + szybki preset */}
      <div className="mtm-dash">
        <div className="dash-card">
          <div className="dash-head">
            <div>
              <div className="dash-title">Opóźnienia — ostatnie 28 dni</div>
              <div className="dash-sub">Liczba zadań „po terminie” w danym dniu (bez historii zmian statusu — przybliżenie).</div>
            </div>
            <button
              className={`btn ${presetNext7 ? "primary" : "outline"}`}
              onClick={() => setPresetNext7(s => !s)}
              title="Zadania z terminem w najbliższych 7 dniach"
            >
              <CalendarClock size={16} />
              Pilne 7 dni
            </button>
          </div>

          <LineChart data={series} height={160} />
        </div>

        <div className="dash-kpi">
          <div className="kpi">
            <div className="kpi__label">Razem</div>
            <div className="kpi__value">{kpi.total}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Do zrobienia</div>
            <div className="kpi__value">{kpi.todo}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">W toku</div>
            <div className="kpi__value">{kpi.inprog}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Zrobione</div>
            <div className="kpi__value">{kpi.done}</div>
          </div>
          <div className="kpi warn">
            <div className="kpi__label">Po terminie</div>
            <div className="kpi__value">{kpi.overdue}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Średni progres</div>
            <div className="kpi__value">{kpi.avgProgress}%</div>
          </div>
        </div>
      </div>

      {/* Toolbar / Filtry */}
      <div className="mtm-toolbar">
        <div className="row">
          <div className="inp icon">
            <Search className="icon" size={16} />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Szukaj: tytuł, etykieta, ID…"/>
          </div>

          <div className="inp">
            <label>Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">– wszystkie –</option>
              <option value="todo">do zrobienia</option>
              <option value="inprogress">w toku</option>
              <option value="done">zrobione</option>
            </select>
          </div>

          <div className="inp">
            <label>Osoba</label>
            <select value={assignee} onChange={(e)=>setAssignee(e.target.value)}>
              <option value="">– dowolna –</option>
              {(people || []).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="inp">
            <label>Utworzone (od)</label>
            <input type="date" value={rangeFrom} onChange={(e)=>setRangeFrom(e.target.value)} />
          </div>
          <div className="inp">
            <label>Utworzone (do)</label>
            <input type="date" value={rangeTo} onChange={(e)=>setRangeTo(e.target.value)} />
          </div>

          <label className="chk">
            <input type="checkbox" checked={onlyOverdue} onChange={(e)=>setOnlyOverdue(e.target.checked)} />
            <span><Filter size={14}/></span> Tylko po terminie
          </label>
        </div>
      </div>

      {/* Tabela */}
      <div className="mtm-table">
        <div className="thead">
          <div>ID</div>
          <div>Tytuł</div>
          <div>Odpowiedzialni</div>
          <div>Termin</div>
          <div>Status</div>
          <div>Progres</div>
          <div>Akcje</div>
        </div>
        <div className="sep"/>
        {items.map(t => (
          <div className="trow" key={t.id}>
            <div className="mono">{t.id}</div>
            <div className="title">
              <div className="tt">{t.title}</div>
              {!!(t.labels||[]).length && (
                <div className="labels">
                  {(t.labels||[]).map((lb,i)=><span key={i} className="label">{lb}</span>)}
                </div>
              )}
            </div>
            <div className="assignees">{(t.assignees||[]).join(", ") || "—"}</div>
            <div className="due">
              {t.dueDate ? formatDate(t.dueDate) : "—"}
              {t._overdue && <span className="over"><AlertTriangle size={14}/> po terminie</span>}
            </div>
            <div className="status">
              {chip(t._status)}
            </div>
            <div className="prog">
              <div className="bar"><i style={{width: `${t._progress}%`}}/></div>
              <span>{t._progress}%</span>
            </div>
            <div className="actions">
              <button className="btn ghost" onClick={()=>nudge(t)} title="Przypomnij (mock)">
                <Send size={16}/> Szturchnij
              </button>
              <button className="btn outline" onClick={()=>openMyTasks(t)} title="Podgląd">
                <Eye size={16}/> Szczegóły
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty">Brak wyników dla wybranych filtrów.</div>
        )}
      </div>
    </div>
  );
}

/* ===== Line chart (SVG, bez bibliotek) ===== */
function LineChart({ data = [], width = 560, height = 160, pad = 24 }) {
  const w = width, h = height;
  const xMin = 0, xMax = Math.max(0, data.length - 1);
  const yMax = Math.max(1, ...data.map(p => p.y || 0));

  const px = (i) => pad + (i - xMin) * ((w - pad*2) / (xMax - xMin || 1));
  const py = (y) => h - pad - (y / (yMax || 1)) * (h - pad*2);

  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(2)} ${py(p.y).toFixed(2)}`)
    .join(" ");

  const ticks = 4;
  const yTicks = Array.from({length: ticks+1}, (_,i)=>Math.round((yMax/ticks)*i));

  return (
    <div className="dash-chart">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        {/* grid Y */}
        {yTicks.map((v,i)=>(
          <line key={i} x1={pad} x2={w-pad} y1={py(v)} y2={py(v)} stroke="#e5e7eb" strokeWidth="1" />
        ))}

        {/* area (light fill) */}
        <path d={`${path} L ${px(xMax)} ${py(0)} L ${px(0)} ${py(0)} Z`} fill="#11182710" />

        {/* line */}
        <path d={path} fill="none" stroke="#111827" strokeWidth="2" />

        {/* last point */}
        {data.length > 0 && (
          <circle cx={px(xMax)} cy={py(data[data.length-1].y)} r="3.5" fill="#111827" />
        )}
      </svg>
      <div className="dash-legend">
        <span className="dot" /> opóźnione (liczba zadań)
      </div>
    </div>
  );
}

/* ===== utils ===== */
function normalize(s){ return String(s||"").trim().toLowerCase(); }

function enrich(t, todayISO){
  const status = mapStatus(t.status);
  const progress = calcProgress(t);
  const overdue = !!(t.dueDate && status !== "done" && t.dueDate.slice(0,10) < todayISO);
  return { ...t, _status: status, _progress: progress, _overdue: overdue };
}
function mapStatus(s=""){
  const v = normalize(s);
  if (["done","zrobione","ukończone","finished","complete"].some(k=>v.includes(k))) return "done";
  if (["w toku","in progress","doing","pracuję"].some(k=>v.includes(k))) return "inprogress";
  return "todo";
}
function calcProgress(t){
  const list = Array.isArray(t.checklist) ? t.checklist : [];
  if (!list.length) return mapStatus(t.status) === "done" ? 100 : 0;
  const total = list.length;
  const done = list.filter(x => !!x.done).length;
  return Math.round((done/total)*100);
}
function formatDate(iso){ try { return new Date(iso).toLocaleDateString("pl-PL"); } catch { return iso; } }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }

/* === brakująca funkcja: chip (status badge) === */
function chip(st){
  if (st === "done") return <span className="chip ok"><CheckCircle2 size={14}/> zrobione</span>;
  if (st === "inprogress") return <span className="chip info"><TimerReset size={14}/> w toku</span>;
  return <span className="chip">do zrobienia</span>;
}

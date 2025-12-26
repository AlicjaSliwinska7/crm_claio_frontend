// src/components/pages/contents/KB.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/documentation-orders.css";

/* =============== Mini Toast =============== */
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info", ttl = 2400) => {
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
      >
        {toast.msg}
      </div>
    );
  }, [toast]);
  return { show, Toast };
}

/* =============== Reguły wyposażenia (regex → lista) =============== */
const LS_KEY_RULES = "equipmentRules.v1";
const DEFAULT_RULES = [
  {
    id: "r-60095-62",
    name: "PN-EN 60095-1 p.6.2 — prąd rozruchu",
    pattern: "(60095).*(\\b6\\.2\\b)|\\bpr[aą]d\\s+rozruchu\\b|cranking",
    equipment: ["Stanowisko A2", "Miernik prądu rozruchu", "Czujnik temperatury"],
    priority: 10,
    enabled: true,
  },
  {
    id: "r-60095-61",
    name: "PN-EN 60095-1 p.6.1 — pojemność znamionowa",
    pattern: "(60095).*(\\b6\\.1\\b)|pojemno[aś]?[cć]",
    equipment: ["Stanowisko A1", "Ładowarka laboratoryjna", "Woltomierz"],
    priority: 8,
    enabled: true,
  },
  {
    id: "r-50395",
    name: "PN-EN 50395 — pomiary elektryczne ogólne",
    pattern: "50395|wytrzyma[oó]?[lł]o[sś][cć]|rezystancja",
    equipment: ["Miernik rezystancji", "Źródło wysokiego napięcia"],
    priority: 6,
    enabled: true,
  },
];

function useEquipmentRules() {
  const [rules] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_RULES);
      return raw ? JSON.parse(raw) : DEFAULT_RULES;
    } catch { return DEFAULT_RULES; }
  });

  const testText = useCallback((text) => {
    const out = [];
    rules.filter(r => r?.enabled !== false && r.pattern).forEach(r => {
      try {
        const re = new RegExp(r.pattern, "i");
        if (re.test(text || "")) out.push(r);
      } catch {/*ignore*/}
    });
    out.sort((a,b)=>Number(b.priority||0)-Number(a.priority||0));
    return out;
  }, [rules]);

  return { testText };
}

/* =============== Mock backend (front-only) =============== */
async function mockGetKBById(id) {
  if (id === "new" || id === "kb-new") return null;
  return {
    id,
    title: "Pojemność znamionowa",
    method: "PN-EN 60095-1:2018",
    point: "6.1",
    sampleCodes: ["ZL-2025/010/1", "ZL-2025/010/2"],
    equipment: ["Stanowisko A1", "Ładowarka laboratoryjna", "Woltomierz"],
    requirements: "Deklaracja producenta ±10%",
    uncertainty: "U = 2% (k=2)",
    units: "Ah",
    env: { temperature: "25 ± 2 °C", humidity: "45 ± 10 %RH", pressure: "", notes: "" },
    description: "Ładowanie wg 5.3, następnie pomiar pojemności metodą rozładowania 0.1C.",
    params: { "prąd_rozładowania": "6 A", "czas": "10 h" },
    extraCalcs: "Średnia, odchylenie standardowe; budżet niepewności wg EA-4/02.",
    results: [
      { name: "Pojemność 1", value: 61.2, unit: "Ah", pass: true },
      { name: "Pojemność 2", value: 60.4, unit: "Ah", pass: true },
    ],
    // NOWE: budżet niepewności (przykład)
    uBudget: {
      k: 2,
      rows: [
        { source: "Rozdzielczość woltomierza", ui: 0.02, unit: "V", ci: 0.5, notes: "" },
        { source: "Powtarzalność pomiaru", ui: 0.8, unit: "%", ci: 1, notes: "" },
      ],
    },
  };
}
async function mockSaveKB(card) {
  console.log("KB save() [frontend mock]", card);
  return { ok: true, id: card?.id || "kb-saved" };
}

/* =============== Heurystyka: auto-tytuł z method + point =============== */
function inferTitle(method, point) {
  const m = String(method || "").trim();
  const p = String(point || "").trim();
  let hint = "";
  // proste heurystyki po punkcie / metodzie
  if (/60095/.test(m) && /^6\.1$/.test(p)) hint = "pojemność znamionowa";
  else if (/60095/.test(m) && /^6\.2$/.test(p)) hint = "prąd rozruchu na zimno";
  else if (/50395/.test(m)) hint = "pomiary elektryczne";
  const base = [m, p && `p.${p}`].filter(Boolean).join(" ");
  return hint ? `${base} — ${hint}` : base || "";
}

/* =============== Komponent główny =============== */
export default function KB({
  getKBById = mockGetKBById,
  saveKB = mockSaveKB,
  initialCard = null, // opcjonalny prefill z PB/Order
}) {
  const { id } = useParams(); // /dokumentacja/karty-badan/:id
  const navigate = useNavigate();
  const { show, Toast } = useToast();
  const { testText } = useEquipmentRules();

  const [loading, setLoading] = useState(true);
  const [titleTouched, setTitleTouched] = useState(false); // blokada nadpisywania gdy user sam edytował

  const [card, setCard] = useState(
    initialCard || {
      title: "", method: "", point: "", units: "",
      sampleCodes: [], equipment: [],
      requirements: "", uncertainty: "",
      description: "",
      env: { temperature: "", humidity: "", pressure: "", notes: "" },
      params: {},            // klucz → wartość
      extraCalcs: "",        // inne obliczenia / komentarze obliczeń
      results: [],           // [{name,value,unit,pass}]
      uBudget: { k: 2, rows: [] }, // NOWE: budżet niepewności
    }
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = initialCard || (id ? await getKBById(id) : null);
        if (alive && data) setCard(prev => ({ ...prev, ...data, uBudget: data.uBudget || prev.uBudget }));
      } catch {
        if (alive) show("Nie udało się pobrać Karty Badań.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, getKBById, initialCard, show]);

  const setField = (patch) => setCard(c => ({ ...c, ...patch }));
  const setEnv = (patch) => setCard(c => ({ ...c, env: { ...(c.env||{}), ...patch }}));
  const setParamsKV = (k,v) => setCard(c => ({ ...c, params: { ...(c.params||{}), [k]: v }}));
  const addParam = () => setParamsKV(`param_${Object.keys(card.params||{}).length+1}`, "");
  const delParam = (k) => setCard(c => { const p={...(c.params||{})}; delete p[k]; return { ...c, params: p }; });

  const setResult = (i, patch) =>
    setCard(c => ({ ...c, results: (c.results||[]).map((r,idx)=> idx===i ? { ...r, ...patch } : r )}));
  const addResult = () =>
    setCard(c => ({ ...c, results: [...(c.results||[]), { name:"", value:"", unit: c.units||"", pass: null }]}));
  const add3Results = () =>
    setCard(c => ({ ...c, results: [...(c.results||[]),
      { name:"", value:"", unit: c.units||"", pass: null },
      { name:"", value:"", unit: c.units||"", pass: null },
      { name:"", value:"", unit: c.units||"", pass: null },
    ]}));
  const delResult = (i) =>
    setCard(c => ({ ...c, results: (c.results||[]).filter((_,idx)=>idx!==i)}));

  // Próbki: tekst <-> tablica
  const sampleCodesText = useMemo(() => (card.sampleCodes||[]).join(", "), [card.sampleCodes]);
  const setSampleCodesText = (v) => {
    const items = String(v||"")
      .split(/[\n;,]+/).map(s=>s.trim()).filter(Boolean);
    setCard(c => ({ ...c, sampleCodes: items }));
  };

  // Auto-prefill tytułu: tylko jeśli tytuł pusty LUB nie był dotykany ręcznie
  useEffect(() => {
    if (titleTouched) return;
    const auto = inferTitle(card.method, card.point);
    if (auto && String(card.title||"").trim() !== auto) {
      setCard(c => ({ ...c, title: auto }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.method, card.point, titleTouched]);

  const nonEmpty = (v) => String(v ?? "").trim().length > 0;
  const resultsValid = useMemo(
    () => (card.results||[]).some(r => nonEmpty(r?.name) && nonEmpty(r?.value)),
    [card.results]
  );
  const canSave = useMemo(() =>
    nonEmpty(card.title) && nonEmpty(card.method) && (card.sampleCodes||[]).length>0 && resultsValid
  , [card.title, card.method, card.sampleCodes, resultsValid]);

  /* ---- Sugestie wyposażenia z reguł ---- */
  const refreshEquipmentSuggestions = () => {
    const before = (card.equipment||[]).length;
    const txt = `${card.method} p.${card.point} ${card.title}`.trim();
    const hits = testText(txt);
    const suggested = Array.from(new Set(hits.flatMap(h => h.equipment||[]).filter(Boolean)));
    const next = Array.from(new Set([...(card.equipment||[]), ...suggested]));
    setField({ equipment: next });
    const added = next.length - before;
    if (added > 0) show(`Dodano podpowiedzi sprzętu: +${added}`, "info");
    else show("Brak nowych podpowiedzi sprzętu dla podanych danych.", "warn");
  };
  const addEquipment = () => {
    const v = prompt("Dodaj pozycję wyposażenia:");
    if (v && v.trim()) setField({ equipment: Array.from(new Set([...(card.equipment||[]), v.trim()])) });
  };
  const removeEquipment = (name) =>
    setField({ equipment: (card.equipment||[]).filter(x=>x!==name) });

  /* ---- Budżet niepewności (frontend-only) ---- */
  const setUB = (patch) => setCard(c => ({ ...c, uBudget: { ...(c.uBudget||{k:2, rows:[]}), ...patch } }));
  const setUBRow = (i, patch) =>
    setUB({ rows: (card.uBudget?.rows||[]).map((r,idx)=> idx===i ? { ...r, ...patch } : r )});
  const addUBRow = () => setUB({ rows: [...(card.uBudget?.rows||[]), { source:"", ui:"", unit:"", ci:"", notes:"" }]});
  const delUBRow = (i) => setUB({ rows: (card.uBudget?.rows||[]).filter((_,idx)=>idx!==i) });

  const ubContribs = useMemo(() => {
    const rows = card.uBudget?.rows || [];
    const contribs = rows.map(r => {
      const ui = Number(String(r.ui||"").toString().replace(",", "."));
      const ci = Number(String(r.ci||"").toString().replace(",", "."));
      const valid = Number.isFinite(ui) && Number.isFinite(ci);
      const c2 = valid ? (ui * ci) ** 2 : 0;
      return { ...r, ui, ci, c2, valid };
    });
    const sumC2 = contribs.reduce((a,b)=> a + (b.valid ? b.c2 : 0), 0);
    const uc = Math.sqrt(sumC2);
    const k = Number(card.uBudget?.k || 2);
    const U = uc * (Number.isFinite(k) ? k : 2);
    return { contribs, sumC2, uc, U, k };
  }, [card.uBudget]);

  /* ---- Zapis ---- */
  const handleSave = async () => {
    if (!canSave) { show("Uzupełnij: Tytuł, Metoda, numery próbek, min. 1 wynik (nazwa + wartość).", "error"); return; }
    const cleanResults = (card.results||[]).filter(r => nonEmpty(r?.name) || nonEmpty(r?.value));
    const payload = { ...card, results: cleanResults, id: card.id || id || undefined };
    const res = await saveKB(payload);
    if (res?.ok) {
      show("Zapisano kartę (frontend/mock).", "info");
      if ((id === "new" || id === "kb-new") && res.id) {
        navigate(`/dokumentacja/karty-badan/${encodeURIComponent(res.id)}`, { replace: true });
      }
    } else {
      show("Nie udało się zapisać karty.", "error");
    }
  };

  if (loading) return <div className="kb__empty">Wczytywanie…</div>;

  return (
    <form className="docForm" onSubmit={(e)=>{ e.preventDefault(); handleSave(); }}>
      {/* Pasek akcji */}
      <div className="kb__actions">
        <div className="chips">
          <span className="chip">Karta badań</span>
          {card.title ? <span className="chip chip--ok">{card.title}</span> : <span className="chip chip--warn">bez tytułu</span>}
        </div>
        <div className="kb__spacer" />
        <button type="button" className="ghost" onClick={refreshEquipmentSuggestions} title="Dopasuj z metody/punktu/tytułu">
          🔎 Podpowiedz wyposażenie
        </button>
        <button type="button" className="ghost" onClick={() => navigate(-1)}>Wstecz</button>
        <button type="submit" className="ghost" disabled={!canSave} aria-label="Zapisz kartę badań">Zapisz</button>
      </div>

      <div className="docForm__grid">
        {/* Nagłówek / metoda / jednostki */}
        <label className="f f--span2">
          <span className="l">Tytuł badania *</span>
          <input
            className="i"
            value={card.title||""}
            onChange={(e)=>{ setField({title: e.target.value}); setTitleTouched(true); }}
            placeholder="np. PN-EN 60095-1 p.6.1 — pojemność znamionowa"
          />
        </label>
        <label className="f">
          <span className="l">Jednostka (domyślna)</span>
          <input className="i i--sm" value={card.units||""} onChange={(e)=>setField({units: e.target.value})} placeholder="np. Ah, A, V" />
        </label>

        <label className="f f--span2">
          <span className="l">Metoda *</span>
          <input className="i" value={card.method||""} onChange={(e)=>setField({method: e.target.value})} placeholder="np. PN-EN 60095-1:2018" />
        </label>
        <label className="f">
          <span className="l">Punkt</span>
          <input className="i i--sm" value={card.point||""} onChange={(e)=>setField({point: e.target.value})} placeholder="np. 6.1" />
        </label>

        {/* Próbki */}
        <label className="f f--span3">
          <span className="l">Numery próbek *</span>
          <textarea
            className="i t"
            rows={2}
            placeholder="np. ZL-2025/010/1, ZL-2025/010/2 (możesz wklejać wierszami)"
            value={sampleCodesText}
            onChange={(e)=>setSampleCodesText(e.target.value)}
          />
          <div className="hint">Rozdzielaj przecinkiem, średnikiem lub nową linią.</div>
        </label>

        {/* Sprzęt */}
        <div className="f f--span3">
          <span className="l">Wykorzystany sprzęt</span>
          <div className="card" style={{ display: "grid", gap: 6 }}>
            <div className="chips" style={{ flexWrap: "wrap" }}>
              {(card.equipment||[]).map(eq => (
                <span key={eq} className="chip">
                  {eq}
                  <button type="button" className="ghost" title="Usuń" onClick={()=>removeEquipment(eq)} style={{marginLeft:6}}>✕</button>
                </span>
              ))}
              <button type="button" className="ghost" onClick={addEquipment}>+ dodaj</button>
            </div>
            <div className="hint">Użyj „🔎 Podpowiedz wyposażenie”, aby dodać automatyczne propozycje.</div>
          </div>
        </div>

        {/* Wymagania / Niepewności / Opis */}
        <label className="f">
          <span className="l">Wymagania / limity</span>
          <textarea className="i t" value={card.requirements||""} onChange={(e)=>setField({requirements: e.target.value})}/>
        </label>
        <label className="f">
          <span className="l">Niepewności pomiarów (opis ogólny)</span>
          <textarea className="i t" value={card.uncertainty||""} onChange={(e)=>setField({uncertainty: e.target.value})}/>
        </label>
        <label className="f">
          <span className="l">Opis badania</span>
          <textarea className="i t" value={card.description||""} onChange={(e)=>setField({description: e.target.value})}/>
        </label>

        {/* Warunki środowiskowe */}
        <div className="docForm__section f--span3">Warunki środowiskowe</div>
        <label className="f">
          <span className="l">Temperatura</span>
          <input className="i i--sm" value={card.env?.temperature||""} onChange={(e)=>setEnv({temperature: e.target.value})} placeholder="np. 23 ± 2 °C"/>
        </label>
        <label className="f">
          <span className="l">Wilgotność</span>
          <input className="i i--sm" value={card.env?.humidity||""} onChange={(e)=>setEnv({humidity: e.target.value})} placeholder="np. 45 ± 10 %RH"/>
        </label>
        <label className="f">
          <span className="l">Ciśnienie</span>
          <input className="i i--sm" value={card.env?.pressure||""} onChange={(e)=>setEnv({pressure: e.target.value})}/>
        </label>
        <label className="f f--span3">
          <span className="l">Uwagi dot. warunków</span>
          <input className="i i--lg" value={card.env?.notes||""} onChange={(e)=>setEnv({notes: e.target.value})}/>
        </label>

        {/* Parametry / Inne obliczenia */}
        <div className="docForm__section f--span3">Parametry & Obliczenia</div>
        <div className="card f--span2" style={{display:"grid", gap:8}}>
          {Object.entries(card.params||{}).map(([k,v])=>(
            <div key={k} className="f f--row" style={{gap:8}}>
              <input className="i i--md" value={k} onChange={(e)=> {
                const nextKey = e.target.value;
                setCard(c => {
                  const p = {...(c.params||{})};
                  const val = p[k]; delete p[k]; p[nextKey]=val; return { ...c, params: p };
                });
              }}/>
              <input className="i i--md" value={v} onChange={(e)=>setParamsKV(k, e.target.value)}/>
              <button type="button" className="ghost" title="Usuń" onClick={()=>delParam(k)}>🗑</button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={addParam}>+ dodaj parametr</button>
        </div>
        <label className="f">
          <span className="l">Inne obliczenia / komentarze</span>
          <textarea className="i t" value={card.extraCalcs||""} onChange={(e)=>setField({extraCalcs: e.target.value})}/>
        </label>

        {/* Wyniki */}
        <div className="docForm__section f--span3">Wyniki i ocena</div>
        <div className="card f--span3">
          <div className="methods-docs__headRow" style={{gridTemplateColumns:"1.6fr 1fr 0.7fr 0.8fr 40px"}}>
            <div>Nazwa wielkości</div>
            <div>Wynik</div>
            <div>Jedn.</div>
            <div>Ocena</div>
            <div />
          </div>
          {(card.results||[]).map((r,i)=>(
            <div key={i} className="methods-docs__row" style={{gridTemplateColumns:"1.6fr 1fr 0.7fr 0.8fr 40px"}}>
              <input className="i i--lg" value={r.name||""} onChange={(e)=>setResult(i,{name:e.target.value})}/>
              <input className="i i--md" value={r.value||""} onChange={(e)=>setResult(i,{value:e.target.value})} />
              <input className="i i--sm" value={r.unit ?? card.units ?? ""} onChange={(e)=>setResult(i,{unit:e.target.value})}/>
              <select className="i" value={r.pass===true?"ok":r.pass===false?"nok":"na"}
                onChange={(e)=>{
                  const v = e.target.value;
                  setResult(i,{ pass: v==="ok" ? true : v==="nok" ? false : null });
                }}>
                <option value="na">—</option>
                <option value="ok">OK / zgodny</option>
                <option value="nok">NOK / niezgodny</option>
              </select>
              <button type="button" className="ghost" title="Usuń" onClick={()=>delResult(i)}>🗑</button>
            </div>
          ))}
          <div style={{display:"flex", gap:8, marginTop:8}}>
            <button type="button" className="ghost" onClick={addResult}>+ dodaj wynik</button>
            <button type="button" className="ghost" onClick={add3Results}>+3 wyniki</button>
          </div>
        </div>

        {/* NOWE: Budżet niepewności */}
        <div className="docForm__section f--span3">Budżet niepewności (EA-4/02 – front-only)</div>
        <div className="card f--span3">
          <div className="f f--row" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
            <label className="f">
              <span className="l">Współczynnik rozszerzenia k</span>
              <input
                className="i i--sm"
                type="number"
                step="0.1"
                value={card.uBudget?.k ?? 2}
                onChange={(e)=>setUB({ k: Number(e.target.value) || 2 })}
              />
            </label>
            <div className="chips">
              <span className="chip">u<sub>c</sub> = {round3(ubContribs.uc)}</span>
              <span className="chip chip--ok">U = {round3(ubContribs.U)}</span>
            </div>
          </div>

          <div className="methods-docs__headRow" style={{gridTemplateColumns:"1.8fr 1fr 0.7fr 0.8fr 2fr 40px", marginTop:8}}>
            <div>Składnik (źródło)</div>
            <div>u<sub>i</sub></div>
            <div>Jedn.</div>
            <div>c<sub>i</sub></div>
            <div>Uwagi</div>
            <div />
          </div>
          {(ubContribs.contribs||[]).map((r,i)=>(
            <div key={i} className="methods-docs__row" style={{gridTemplateColumns:"1.8fr 1fr 0.7fr 0.8fr 2fr 40px"}}>
              <input className="i i--lg" value={r.source||""} onChange={(e)=>setUBRow(i,{source:e.target.value})}/>
              <input className="i i--md" value={r.ui ?? ""} onChange={(e)=>setUBRow(i,{ui:e.target.value})} />
              <input className="i i--sm" value={r.unit||""} onChange={(e)=>setUBRow(i,{unit:e.target.value})}/>
              <input className="i i--sm" value={r.ci ?? ""} onChange={(e)=>setUBRow(i,{ci:e.target.value})}/>
              <input className="i i--lg" value={r.notes||""} onChange={(e)=>setUBRow(i,{notes:e.target.value})}/>
              <button type="button" className="ghost" title="Usuń" onClick={()=>delUBRow(i)}>🗑</button>
            </div>
          ))}
          <div className="hint" style={{marginTop:8}}>
            Wpisz standardowe niepewności u<sub>i</sub> i współczynniki c<sub>i</sub>. System liczy u<sub>c</sub> = √Σ(u<sub>i</sub>·c<sub>i</sub>)² oraz U = k·u<sub>c</sub>.
          </div>
          <div style={{display:"flex", gap:8, marginTop:8}}>
            <button type="button" className="ghost" onClick={addUBRow}>+ dodaj składnik</button>
          </div>
        </div>
      </div>

      <div className="kb__actions">
        <div className="kb__spacer" />
        <button type="button" className="ghost" onClick={()=>navigate(-1)}>Wstecz</button>
        <button type="submit" className="ghost" disabled={!canSave}>Zapisz</button>
      </div>

      <Toast />
    </form>
  );
}

/* ==== helpers ==== */
function round3(v){ const n=Number(v); return Number.isFinite(n) ? Math.round(n*1000)/1000 : "—"; }

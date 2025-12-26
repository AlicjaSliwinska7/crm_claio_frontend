import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/documentation-orders.css";

/* ========= Mini toast ========= */
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
      <div style={{
        position: "fixed", right: 16, bottom: 16,
        background: toast.type === "error" ? "#fecaca" : toast.type === "warn" ? "#fde68a" : "#dbeafe",
        border: "1px solid rgba(0,0,0,.1)", padding: "10px 12px", borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,.15)", zIndex: 9999, color: "#111827", fontWeight: 700
      }}>{toast.msg}</div>
    );
  }, [toast]);
  return { show, Toast };
}

/* ========= Lekki wykres (canvas) ========= */
function useResize(ref, cb) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(cb);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, cb]);
}
function LineChart({ series }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 600, h = wrap.clientHeight || 300;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const all = series.flatMap(s => s.data);
    if (!all.length) return;
    const xs = all.map(p=>p.x), ys = all.map(p=>p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const m = { l: 56, r: 16, t: 16, b: 28 };
    const sx = (x) => m.l + (w - m.l - m.r) * ((x - minX) / (maxX - minX || 1));
    const sy = (y) => h - m.b - (h - m.t - m.b) * ((y - minY) / (maxY - minY || 1));

    // osie
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, h - m.b); ctx.lineTo(w - m.r, h - m.b);
    ctx.stroke();

    const palette = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#0891b2"];
    series.forEach((s, idx) => {
      ctx.strokeStyle = palette[idx % palette.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      s.data.forEach((p,i)=>{ const X=sx(p.x), Y=sy(p.y); i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); });
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(m.l + idx*120, 4, 10, 10);
      ctx.fillStyle = "#111827"; ctx.font="12px ui-sans-serif,system-ui"; ctx.fillText(s.name, m.l+16+idx*120, 13);
    });
  }, [series]);

  useResize(wrapRef, draw);
  useEffect(draw, [draw]);

  return <div ref={wrapRef} style={{ width: "100%", height: 320, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
    <canvas ref={canvasRef} />
  </div>;
}

/* ========= Mock backend ========= */
async function mockGetReportById(id) {
  if (id === "new") return null;
  return {
    id,
    status: "draft",
    reportNumber: "ZL-2025/010/S-001",
    dateOfReport: "2025-09-25",
    client: { name: "StartBattery s.r.o.", address: "CZ", email: "" },
    manufacturer: { name: "StartBattery s.r.o.", address: "CZ" },
    contractNumber: "ZL-2025/010",
    orderId: "o-1003",
    object: { name: "Akumulator rozruchowy 12 V", model: "VOLT-60", nominalCapacity: "60", nominalVoltage: "12", nominalEnergy: "" },
    keyDates: { sampleProd: "", sampleCollect: "", start: "2025-09-18", end: "" },
    referenceDocs: ["PN-EN 60095-1:2018", "PN-EN 50395:2000"],
    statement: { compliance: "", notes: "" },
    samples: [{ code: "ZL-2025/010/1", condition: "OK" }, { code: "ZL-2025/010/2", condition: "OK" }],
    program: [
      { ref: "PN-EN 60095-1:2018", test: "Pojemność znamionowa", point: "6.1", sampleId: "ZL-2025/010/1", result: "" },
      { ref: "PN-EN 60095-1:2018", test: "Prąd rozruchu na zimno", point: "6.2", sampleId: "ZL-2025/010/2", result: "" },
    ],
    environment: { temperature: "", pressure: "", humidity: "" },
    uncertainty: { uVoltage: "±0,001", uMass: "±0,03", uTemp: "", uPressure: "" },
    equipment: [
      { test: "Pojemność", point: "6.1", name: "Stanowisko A1" },
      { test: "Prąd rozruchu", point: "6.2", name: "Stanowisko A2" },
    ],
    resultsBlocks: [
      // elastyczne bloki wyników
      { title: "Wyniki – Pojemność", table: [["Sample ID","OCV przed [V]","OCV po [V]","ΔOCV [%]"], ["ZL-2025/010/1","12.65","12.54","-0.87"]] },
    ],
    attachments: { images: [], charts: [] }, // charts: {name, series:[{name,data:[{x,y}]}]}
    notes: "",
  };
}

/* ========= Komponent ========= */
export default function Report({
  getReportById = mockGetReportById,
  onSave, // (report) => void
}) {
  const { id } = useParams(); // /dokumentacja/sprawozdania/:id
  const nav = useNavigate();
  const { show, Toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rep, setRep] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getReportById(id);
        const empty = {
          id: id || "new",
          status: "draft",
          reportNumber: "",
          dateOfReport: "",
          client: { name: "", address: "", email: "", phone: "" },
          manufacturer: { name: "", address: "", email: "", phone: "" },
          contractNumber: "",
          orderId: "",
          object: { name: "", description: "", model: "", nominalCapacity: "", nominalVoltage: "", nominalEnergy: "" },
          keyDates: { sampleProd: "", sampleCollect: "", start: "", end: "" },
          referenceDocs: [],
          statement: { compliance: "", notes: "" },
          samples: [],
          program: [],
          environment: { temperature: "", pressure: "", humidity: "" },
          uncertainty: { uVoltage: "", uMass: "", uTemp: "", uPressure: "" },
          equipment: [],
          resultsBlocks: [],
          attachments: { images: [], charts: [] },
          notes: "",
        };
        if (alive) setRep(data || empty);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const setField = (patch) => setRep(cur => ({ ...cur, ...patch }));
  const setNested = (path, val) => {
    setRep(cur => {
      const next = JSON.parse(JSON.stringify(cur || {}));
      let obj = next;
      for (let i=0;i<path.length-1;i++) obj = obj[path[i]] = obj[path[i]] ?? {};
      obj[path[path.length-1]] = val;
      return next;
    });
  };

  const canSave = useMemo(() => {
    if (!rep) return false;
    return rep.reportNumber && rep.contractNumber && rep.client?.name && rep.object?.name;
  }, [rep]);

  const handleSave = () => {
    if (!canSave) { show("Uzupełnij wymagane pola (nr sprawozdania, zlecenie, klient, przedmiot).", "error"); return; }
    console.log("REPORT save()", rep);
    onSave?.(rep);
    show("Zapisano (mock).", "info");
  };

  // ===== Załączniki: zdjęcia =====
  const addImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const imgs = await Promise.all(files.map(async (f) => {
      const url = URL.createObjectURL(f);
      return { name: f.name, url };
    }));
    setNested(["attachments","images"], [...(rep.attachments?.images||[]), ...imgs]);
  };
  const removeImage = (i) => setNested(["attachments","images"], (rep.attachments?.images||[]).filter((_,idx)=>idx!==i));

  // ===== Wykres: szybkie dodanie serii z CSV (2 kolumny: x,y) =====
  const [csvName, setCsvName] = useState("");
  const [csvData, setCsvData] = useState("");
  const addChartFromCSV = () => {
    const rows = csvData.trim().split(/\r?\n/).map(r => r.split(/[,;\t]/));
    const data = rows.map(r => ({ x: Number(r[0]), y: Number(r[1]) })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (!data.length) { show("CSV powinno mieć dwie kolumny: x,y", "warn"); return; }
    const chart = { name: csvName || "Wykres", series: [{ name: "seria 1", data }] };
    setNested(["attachments","charts"], [...(rep.attachments?.charts||[]), chart]);
    setCsvName(""); setCsvData(""); show("Dodano wykres.", "info");
  };
  const removeChart = (i) => setNested(["attachments","charts"], (rep.attachments?.charts||[]).filter((_, idx)=>idx!==i));

  if (loading) return <div className="kb__empty">Wczytywanie…</div>;
  if (!rep) return <div className="kb__empty">Nie znaleziono sprawozdania.</div>;

  return (
    <form className="docForm" onSubmit={(e)=>{e.preventDefault(); handleSave();}}>
      <div className="kb__actions">
        <div className="chips">
          <span className="chip">Sprawozdanie z badań</span>
          {rep.status === "final" ? <span className="chip chip--ok">finalne</span> :
           rep.status === "verified" ? <span className="chip chip--info">sprawdzone</span> :
           <span className="chip">szkic</span>}
        </div>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={()=>nav(-1)}>Wstecz</button>
        <button className="ghost" type="submit" disabled={!canSave}>Zapisz</button>
      </div>

      <div className="docForm__grid">
        {/* Meta */}
        <label className="f">
          <span className="l">Nr sprawozdania *</span>
          <input className="i i--md" value={rep.reportNumber||""} onChange={e=>setField({ reportNumber: e.target.value })} />
        </label>
        <label className="f">
          <span className="l">Data sprawozdania</span>
          <input type="date" className="i i--md" value={rep.dateOfReport||""} onChange={e=>setField({ dateOfReport: e.target.value })} />
        </label>
        <label className="f">
          <span className="l">Nr zlecenia / umowy *</span>
          <input className="i i--md" value={rep.contractNumber||""} onChange={e=>setField({ contractNumber: e.target.value })} />
        </label>

        {/* Klient / Producent */}
        <div className="docForm__section f--span3">Klient / Producent</div>
        <label className="f">
          <span className="l">Klient — nazwa *</span>
          <input className="i" value={rep.client?.name || ""} onChange={e=>setNested(["client","name"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Klient — adres</span>
          <input className="i" value={rep.client?.address || ""} onChange={e=>setNested(["client","address"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Producent — nazwa</span>
          <input className="i" value={rep.manufacturer?.name || ""} onChange={e=>setNested(["manufacturer","name"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Producent — adres</span>
          <input className="i" value={rep.manufacturer?.address || ""} onChange={e=>setNested(["manufacturer","address"], e.target.value)} />
        </label>

        {/* Identyfikacja wyrobu */}
        <div className="docForm__section f--span3">Identyfikacja badanego obiektu</div>
        <label className="f">
          <span className="l">Przedmiot / produkt *</span>
          <input className="i" value={rep.object?.name || ""} onChange={e=>setNested(["object","name"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Model</span>
          <input className="i" value={rep.object?.model || ""} onChange={e=>setNested(["object","model"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Opis</span>
          <input className="i" value={rep.object?.description || ""} onChange={e=>setNested(["object","description"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Pojemność znam. [Ah]</span>
          <input className="i" value={rep.object?.nominalCapacity || ""} onChange={e=>setNested(["object","nominalCapacity"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Napięcie znam. [V]</span>
          <input className="i" value={rep.object?.nominalVoltage || ""} onChange={e=>setNested(["object","nominalVoltage"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Energia znam. [Wh]</span>
          <input className="i" value={rep.object?.nominalEnergy || ""} onChange={e=>setNested(["object","nominalEnergy"], e.target.value)} />
        </label>

        {/* Daty kluczowe */}
        <div className="docForm__section f--span3">Daty</div>
        <label className="f">
          <span className="l">Data produkcji próbki</span>
          <input type="date" className="i" value={rep.keyDates?.sampleProd || ""} onChange={e=>setNested(["keyDates","sampleProd"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Data pobrania próbki</span>
          <input type="date" className="i" value={rep.keyDates?.sampleCollect || ""} onChange={e=>setNested(["keyDates","sampleCollect"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Rozpoczęcie badań</span>
          <input type="date" className="i" value={rep.keyDates?.start || ""} onChange={e=>setNested(["keyDates","start"], e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Zakończenie badań</span>
          <input type="date" className="i" value={rep.keyDates?.end || ""} onChange={e=>setNested(["keyDates","end"], e.target.value)} />
        </label>

        {/* Dokumenty odniesienia */}
        <div className="docForm__section f--span3">Dokumenty odniesienia</div>
        <div className="card f--span3" style={{ display: "grid", gap: 8 }}>
          {(rep.referenceDocs||[]).map((r, i) => (
            <div key={i} className="f f--row" style={{ gap: 8 }}>
              <input className="i i--lg" value={r} onChange={e=>{
                const next = [...(rep.referenceDocs||[])]; next[i]=e.target.value; setField({ referenceDocs: next });
              }} />
              <button type="button" className="ghost" onClick={()=>{
                setField({ referenceDocs: (rep.referenceDocs||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={()=>{
            setField({ referenceDocs: [...(rep.referenceDocs||[]), ""] });
          }}>+ dodaj</button>
        </div>

        {/* Oświadczenie / zgodność */}
        <div className="docForm__section f--span3">Oświadczenie / ocena zgodności</div>
        <label className="f f--span3">
          <span className="l">Zgodność (tak/nie + opis)</span>
          <input className="i i--lg" value={rep.statement?.compliance || ""} onChange={e=>setNested(["statement","compliance"], e.target.value)} />
        </label>
        <label className="f f--span3">
          <span className="l">Uwagi</span>
          <textarea className="i t" value={rep.statement?.notes || ""} onChange={e=>setNested(["statement","notes"], e.target.value)} />
        </label>

        {/* Próbki */}
        <div className="docForm__section f--span3">Próbki</div>
        <div className="card f--span3">
          <div className="methods-docs__headRow" style={{ gridTemplateColumns: "2fr 2fr 40px" }}>
            <div>Kod próbki</div><div>Stan</div><div />
          </div>
          {(rep.samples||[]).map((s,i)=>(
            <div key={i} className="methods-docs__row" style={{ gridTemplateColumns: "2fr 2fr 40px" }}>
              <input className="i" value={s.code||""} onChange={e=>{
                const next=[...(rep.samples||[])]; next[i]={...next[i], code:e.target.value}; setField({ samples: next });
              }} />
              <input className="i" value={s.condition||""} onChange={e=>{
                const next=[...(rep.samples||[])]; next[i]={...next[i], condition:e.target.value}; setField({ samples: next });
              }} />
              <button className="ghost" type="button" onClick={()=>{
                setField({ samples:(rep.samples||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button className="ghost" type="button" onClick={()=>setField({ samples:[...(rep.samples||[]), {code:"",condition:""}] })}>+ dodaj próbkę</button>
        </div>

        {/* Program badań (jak w UN 38.3: test, punkt, próbka, wynik) */}
        <div className="docForm__section f--span3">Program badań</div>
        <div className="card f--span3">
          <div className="methods-docs__headRow" style={{ gridTemplateColumns: "2fr 2fr 1fr 1.2fr 40px" }}>
            <div>Dokument odniesienia</div><div>Nazwa badania</div><div>Punkt</div><div>Id próbki</div><div />
          </div>
          {(rep.program||[]).map((r,i)=>(
            <div key={i} className="methods-docs__row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1.2fr 40px" }}>
              <input className="i" value={r.ref||""} onChange={e=>{
                const next=[...(rep.program||[])]; next[i]={...next[i], ref:e.target.value}; setField({ program: next });
              }} />
              <input className="i" value={r.test||""} onChange={e=>{
                const next=[...(rep.program||[])]; next[i]={...next[i], test:e.target.value}; setField({ program: next });
              }} />
              <input className="i" value={r.point||""} onChange={e=>{
                const next=[...(rep.program||[])]; next[i]={...next[i], point:e.target.value}; setField({ program: next });
              }} />
              <input className="i" value={r.sampleId||""} onChange={e=>{
                const next=[...(rep.program||[])]; next[i]={...next[i], sampleId:e.target.value}; setField({ program: next });
              }} />
              <button className="ghost" type="button" onClick={()=>{
                setField({ program:(rep.program||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button className="ghost" type="button" onClick={()=>setField({ program:[...(rep.program||[]), {ref:"",test:"",point:"",sampleId:"",result:""}] })}>+ dodaj pozycję</button>
        </div>

        {/* Warunki środowiskowe */}
        <div className="docForm__section f--span3">Warunki środowiskowe</div>
        <label className="f"><span className="l">Temperatura [°C]</span>
          <input className="i" value={rep.environment?.temperature||""} onChange={e=>setNested(["environment","temperature"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Ciśnienie [kPa]</span>
          <input className="i" value={rep.environment?.pressure||""} onChange={e=>setNested(["environment","pressure"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Wilgotność [%RH]</span>
          <input className="i" value={rep.environment?.humidity||""} onChange={e=>setNested(["environment","humidity"], e.target.value)} />
        </label>

        {/* Niepewności pomiarów */}
        <div className="docForm__section f--span3">Niepewności pomiarów</div>
        <label className="f"><span className="l">Napięcie</span>
          <input className="i" value={rep.uncertainty?.uVoltage||""} onChange={e=>setNested(["uncertainty","uVoltage"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Masa</span>
          <input className="i" value={rep.uncertainty?.uMass||""} onChange={e=>setNested(["uncertainty","uMass"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Temperatura</span>
          <input className="i" value={rep.uncertainty?.uTemp||""} onChange={e=>setNested(["uncertainty","uTemp"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Ciśnienie</span>
          <input className="i" value={rep.uncertainty?.uPressure||""} onChange={e=>setNested(["uncertainty","uPressure"], e.target.value)} />
        </label>

        {/* Wyposażenie */}
        <div className="docForm__section f--span3">Wyposażenie</div>
        <div className="card f--span3">
          <div className="methods-docs__headRow" style={{ gridTemplateColumns: "2fr 1fr 2fr 40px" }}>
            <div>Nazwa badania</div><div>Punkt</div><div>Nazwa wyposażenia</div><div />
          </div>
          {(rep.equipment||[]).map((r,i)=>(
            <div key={i} className="methods-docs__row" style={{ gridTemplateColumns: "2fr 1fr 2fr 40px" }}>
              <input className="i" value={r.test||""} onChange={e=>{
                const next=[...(rep.equipment||[])]; next[i]={...next[i], test:e.target.value}; setField({ equipment: next });
              }} />
              <input className="i" value={r.point||""} onChange={e=>{
                const next=[...(rep.equipment||[])]; next[i]={...next[i], point:e.target.value}; setField({ equipment: next });
              }} />
              <input className="i" value={r.name||""} onChange={e=>{
                const next=[...(rep.equipment||[])]; next[i]={...next[i], name:e.target.value}; setField({ equipment: next });
              }} />
              <button className="ghost" type="button" onClick={()=>{
                setField({ equipment:(rep.equipment||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button className="ghost" type="button" onClick={()=>setField({ equipment:[...(rep.equipment||[]), {test:"",point:"",name:""}] })}>+ dodaj wyposażenie</button>
        </div>

        {/* Bloki wyników (tabele + opis) */}
        <div className="docForm__section f--span3">Wyniki (tabele / opis)</div>
        <div className="card f--span3" style={{ display: "grid", gap: 12 }}>
          {(rep.resultsBlocks||[]).map((b, bi) => (
            <div key={bi} className="card" style={{ padding: 12 }}>
              <label className="f f--span3">
                <span className="l">Tytuł sekcji</span>
                <input className="i i--lg" value={b.title||""} onChange={e=>{
                  const next=[...(rep.resultsBlocks||[])]; next[bi]={...next[bi], title:e.target.value}; setField({ resultsBlocks: next });
                }} />
              </label>
              <div className="hint" style={{ marginBottom: 6 }}>Prosta tabela (edytuj komórki):</div>
              <div style={{ overflow: "auto" }}>
                <table className="docTable">
                  <tbody>
                    {(b.table||[]).map((row, ri)=>(
                      <tr key={ri}>
                        {(row||[]).map((cell, ci)=>(
                          <td key={ci}>
                            <input className="i i--sm" value={cell} onChange={e=>{
                              const next=[...(rep.resultsBlocks||[])];
                              const table = (next[bi].table||[]).map(r=>[...r]);
                              table[ri][ci]=e.target.value;
                              next[bi]={...next[bi], table};
                              setField({ resultsBlocks: next });
                            }} />
                          </td>
                        ))}
                        <td>
                          <button type="button" className="ghost" title="Usuń wiersz" onClick={()=>{
                            const next=[...(rep.resultsBlocks||[])];
                            const table = (next[bi].table||[]).filter((_,idx)=>idx!==ri);
                            next[bi]={...next[bi], table};
                            setField({ resultsBlocks: next });
                          }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="chips" style={{ gap: 8, marginTop: 8 }}>
                <button type="button" className="ghost" onClick={()=>{
                  const next=[...(rep.resultsBlocks||[])];
                  const table = [...(next[bi].table||[]), ["","","",""]];
                  next[bi]={...next[bi], table};
                  setField({ resultsBlocks: next });
                }}>+ wiersz</button>
                <button type="button" className="ghost" onClick={()=>{
                  setField({ resultsBlocks:(rep.resultsBlocks||[]).filter((_,idx)=>idx!==bi) });
                }}>Usuń blok</button>
              </div>
            </div>
          ))}
          <button type="button" className="ghost" onClick={()=>{
            setField({ resultsBlocks:[...(rep.resultsBlocks||[]), { title:"", table:[["Kol1","Kol2"],["",""]] }] });
          }}>+ dodaj blok wyników</button>
        </div>

        {/* Załączniki: zdjęcia */}
        <div className="docForm__section f--span3">Załączniki: zdjęcia</div>
        <div className="card f--span3" style={{ display: "grid", gap: 12 }}>
          <label className="chip" style={{ cursor: "pointer", width: "fit-content" }}>
            <input type="file" accept="image/*" multiple onChange={addImages} />
            <span>+ Dodaj zdjęcia</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {(rep.attachments?.images||[]).map((img,i)=>(
              <figure key={i} className="card" style={{ padding: 8 }}>
                <img src={img.url} alt={img.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
                <figcaption style={{ fontSize: 12, marginTop: 6 }}>{img.name}</figcaption>
                <button type="button" className="ghost" onClick={()=>removeImage(i)}>Usuń</button>
              </figure>
            ))}
          </div>
        </div>

        {/* Załączniki: wykresy (z CSV) */}
        <div className="docForm__section f--span3">Załączniki: wykresy</div>
        <div className="card f--span3" style={{ display: "grid", gap: 12 }}>
          <div className="f f--row" style={{ gap: 8, alignItems: "flex-start" }}>
            <label className="f"><span className="l">Nazwa wykresu</span>
              <input className="i" value={csvName} onChange={e=>setCsvName(e.target.value)} />
            </label>
            <label className="f f--span2"><span className="l">CSV (x,y w kolumnach)</span>
              <textarea className="i t" rows={4} placeholder="x,y" value={csvData} onChange={e=>setCsvData(e.target.value)} />
            </label>
            <button className="ghost" type="button" onClick={addChartFromCSV} style={{ height: 40, alignSelf: "end" }}>Dodaj wykres</button>
          </div>

          {(rep.attachments?.charts||[]).map((c,i)=>(
            <div key={i} className="card" style={{ padding: 12 }}>
              <div className="kb__actions" style={{ marginBottom: 8 }}>
                <div className="chips"><span className="chip">{c.name}</span></div>
                <div className="kb__spacer" />
                <button className="ghost" type="button" onClick={()=>removeChart(i)}>Usuń wykres</button>
              </div>
              <LineChart series={c.series||[]} />
            </div>
          ))}
        </div>

        {/* Uwagi końcowe */}
        <label className="f f--span3">
          <span className="l">Uwagi końcowe</span>
          <textarea className="i t" value={rep.notes||""} onChange={e=>setField({ notes: e.target.value })} />
        </label>
      </div>

      <div className="kb__actions">
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={()=>nav(-1)}>Wstecz</button>
        <button className="ghost" type="submit" disabled={!canSave}>Zapisz</button>
      </div>

      <Toast />
    </form>
  );
}

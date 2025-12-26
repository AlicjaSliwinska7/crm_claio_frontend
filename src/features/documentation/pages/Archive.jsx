import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/documentation-orders.css";

/* ===== Mini toast ===== */
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

/* ===== Mock loader (podmień na backend) ===== */
async function mockGetArchiveByOrderId(orderId) {
  // gdy brak — zwrócimy pusty szablon
  if (orderId === "new") return null;
  return {
    orderId,
    contractNumber: "ZL-2025/010",
    clientName: "StartBattery s.r.o.",
    manufacturer: "StartBattery s.r.o.",
    createdAt: "2025-09-05",
    finishedAt: "2025-09-28",
    archivedAt: "2025-10-02",
    status: "archived", // pending | archived
    location: { shelf: "Regał A", box: "Pudło 12", barcode: "ARCH-2025-010" },
    retention: { years: 5, destroyOn: "2030-10-02" },
    contents: [
      { key: "PPP", present: true },
      { key: "PB", present: true },
      { key: "Karty badań", present: true, note: "4 szt." },
      { key: "Logi", present: true },
      { key: "Zdjęcia", present: true },
      { key: "Sprawozdanie", present: true, note: "UN 38.3" },
      { key: "Korespondencja e-mail", present: false },
    ],
    extra: [{ label: "Inne", present: false, note: "" }],
    description: "", // wygenerowany opis teczki (tekst)
  };
}

/* ===== Komponent ===== */
export default function Archive({
  getArchiveByOrderId = mockGetArchiveByOrderId,
  onSave, // (archive) => void
}) {
  const { id: orderId } = useParams(); // /dokumentacja/archiwum/:id
  const nav = useNavigate();
  const { show, Toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [arc, setArc] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getArchiveByOrderId(orderId);
        const empty = {
          orderId,
          contractNumber: "",
          clientName: "",
          manufacturer: "",
          createdAt: "",
          finishedAt: "",
          archivedAt: "",
          status: "pending",
          location: { shelf: "", box: "", barcode: "" },
          retention: { years: 5, destroyOn: "" },
          contents: [
            { key: "PPP", present: false },
            { key: "PB", present: false },
            { key: "Karty badań", present: false },
            { key: "Logi", present: false },
            { key: "Zdjęcia", present: false },
            { key: "Sprawozdanie", present: false },
            { key: "Korespondencja e-mail", present: false },
          ],
          extra: [],
          description: "",
        };
        if (alive) setArc(data || empty);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [orderId]);

  const setField = (patch) => setArc(cur => ({ ...cur, ...patch }));
  const setNested = (path, val) => {
    setArc(cur => {
      const next = JSON.parse(JSON.stringify(cur||{}));
      let obj = next;
      for (let i=0; i<path.length-1; i++) obj = obj[path[i]] = obj[path[i]] ?? {};
      obj[path[path.length-1]] = val;
      return next;
    });
  };

  const canSave = useMemo(() => {
    if (!arc) return false;
    return arc.contractNumber && arc.clientName;
  }, [arc]);

  const handleSave = () => {
    if (!canSave) { show("Uzupełnij minimum: Nr zlecenia i Klienta.", "error"); return; }
    console.log("ARCHIVE save()", arc);
    onSave?.(arc);
    show("Zapisano (mock).", "info");
  };

  // generator opisu teczki (tekst)
  const generateDescription = () => {
    const lines = [];
    lines.push(`Opis teczki — zlecenie ${arc.contractNumber}`);
    if (arc.clientName) lines.push(`Klient: ${arc.clientName}`);
    if (arc.manufacturer) lines.push(`Producent: ${arc.manufacturer}`);
    if (arc.createdAt) lines.push(`Data przyjęcia/prac: ${arc.createdAt}`);
    if (arc.finishedAt) lines.push(`Zakończenie badań: ${arc.finishedAt}`);
    if (arc.archivedAt) lines.push(`Data archiwizacji: ${arc.archivedAt}`);
    lines.push("");

    lines.push("Zawartość:");
    (arc.contents||[]).forEach(c => {
      if (!c.present) return;
      lines.push(` • ${c.key}${c.note ? ` (${c.note})` : ""}`);
    });
    (arc.extra||[]).forEach(c => {
      if (!c.present) return;
      lines.push(` • ${c.label}${c.note ? ` (${c.note})` : ""}`);
    });

    lines.push("");
    const loc = arc.location || {};
    const locStr = [loc.shelf && `Regał: ${loc.shelf}`, loc.box && `Pudło: ${loc.box}`, loc.barcode && `Kod: ${loc.barcode}`]
      .filter(Boolean).join(", ");
    if (locStr) lines.push(`Lokalizacja: ${locStr}`);

    const ret = arc.retention || {};
    if (ret.years || ret.destroyOn) {
      lines.push(`Retencja: ${ret.years ? `${ret.years} lat` : ""}${ret.destroyOn ? ` (zniszczyć dnia: ${ret.destroyOn})` : ""}`);
    }

    setField({ description: lines.join("\n") });
    show("Wygenerowano opis teczki.", "info");
  };

  const exportTxt = () => {
    const blob = new Blob([arc.description || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (arc.contractNumber || "teczka") + "_opis.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="kb__empty">Wczytywanie…</div>;
  if (!arc) return <div className="kb__empty">Nie znaleziono teczki.</div>;

  return (
    <form className="docForm" onSubmit={(e)=>{e.preventDefault(); handleSave();}}>
      <div className="kb__actions">
        <div className="chips">
          <span className="chip">Teczka archiwalna</span>
          {arc.status === "archived" ? <span className="chip chip--ok">zarchiwizowane</span> : <span className="chip">do archiwizacji</span>}
        </div>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={()=>window.print()}>Drukuj opis</button>
        <button className="ghost" type="button" onClick={exportTxt} disabled={!arc.description}>Eksport TXT</button>
        <button className="ghost" type="button" onClick={()=>window.history.back()}>Wstecz</button>
        <button className="ghost" type="submit" disabled={!canSave}>Zapisz</button>
      </div>

      <div className="docForm__grid">
        {/* Meta */}
        <label className="f">
          <span className="l">Nr zlecenia / umowy *</span>
          <input className="i i--md" value={arc.contractNumber||""} onChange={e=>setField({ contractNumber: e.target.value })} />
        </label>
        <label className="f">
          <span className="l">Klient *</span>
          <input className="i i--md" value={arc.clientName||""} onChange={e=>setField({ clientName: e.target.value })} />
        </label>
        <label className="f">
          <span className="l">Producent</span>
          <input className="i i--md" value={arc.manufacturer||""} onChange={e=>setField({ manufacturer: e.target.value })} />
        </label>

        {/* Daty */}
        <div className="docForm__section f--span3">Daty</div>
        <label className="f"><span className="l">Rozpoczęcie / przyjęcie</span>
          <input type="date" className="i" value={arc.createdAt||""} onChange={e=>setField({ createdAt: e.target.value })} />
        </label>
        <label className="f"><span className="l">Zakończenie badań</span>
          <input type="date" className="i" value={arc.finishedAt||""} onChange={e=>setField({ finishedAt: e.target.value })} />
        </label>
        <label className="f"><span className="l">Archiwizacja</span>
          <input type="date" className="i" value={arc.archivedAt||""} onChange={e=>setField({ archivedAt: e.target.value })} />
        </label>

        {/* Lokalizacja */}
        <div className="docForm__section f--span3">Lokalizacja</div>
        <label className="f"><span className="l">Regał</span>
          <input className="i" value={arc.location?.shelf||""} onChange={e=>setNested(["location","shelf"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Pudło / teczka</span>
          <input className="i" value={arc.location?.box||""} onChange={e=>setNested(["location","box"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Kod / barkod</span>
          <input className="i" value={arc.location?.barcode||""} onChange={e=>setNested(["location","barcode"], e.target.value)} />
        </label>

        {/* Retencja */}
        <div className="docForm__section f--span3">Retencja</div>
        <label className="f"><span className="l">Okres (lata)</span>
          <input className="i" type="number" min="0" value={arc.retention?.years ?? 5}
            onChange={e=>setNested(["retention","years"], Number(e.target.value))} />
        </label>
        <label className="f"><span className="l">Data zniszczenia</span>
          <input type="date" className="i" value={arc.retention?.destroyOn || ""} onChange={e=>setNested(["retention","destroyOn"], e.target.value)} />
        </label>
        <label className="f"><span className="l">Status</span>
          <select className="i" value={arc.status} onChange={e=>setField({ status: e.target.value })}>
            <option value="pending">Do archiwizacji</option>
            <option value="archived">Zarchiwizowane</option>
          </select>
        </label>

        {/* Zawartość teczki – checkboxy + notatki */}
        <div className="docForm__section f--span3">Zawartość teczki</div>
        <div className="card f--span3" style={{ display: "grid", gap: 8 }}>
          {(arc.contents||[]).map((c, i) => (
            <div key={i} className="f f--row" style={{ gap: 12, alignItems: "center" }}>
              <label className="f f--row" style={{ gap: 8 }}>
                <input type="checkbox" checked={!!c.present} onChange={e=>{
                  const next = [...(arc.contents||[])]; next[i] = { ...next[i], present: e.target.checked }; setField({ contents: next });
                }} />
                <span className={`chip ${c.present ? "chip--ok" : ""}`}>{c.key}</span>
              </label>
              <input className="i" placeholder="doprecyzowanie (np. liczba sztuk, wersja)" value={c.note||""}
                onChange={e=>{ const next=[...(arc.contents||[])]; next[i]={...next[i], note:e.target.value}; setField({ contents: next }); }} />
              <button type="button" className="ghost" title="Usuń" onClick={()=>{
                setField({ contents:(arc.contents||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={()=>{
            setField({ contents:[...(arc.contents||[]), { key:"Dokument", present:false, note:"" }] });
          }}>+ dodaj pozycję</button>
        </div>

        {/* Dodatkowe pozycje własne */}
        <div className="docForm__section f--span3">Dodatkowe pozycje</div>
        <div className="card f--span3" style={{ display: "grid", gap: 8 }}>
          {(arc.extra||[]).map((c, i) => (
            <div key={i} className="f f--row" style={{ gap: 12, alignItems: "center" }}>
              <input className="i" placeholder="nazwa pozycji" value={c.label||""}
                onChange={e=>{ const next=[...(arc.extra||[])]; next[i]={...next[i], label:e.target.value}; setField({ extra: next }); }} />
              <label className="f f--row" style={{ gap: 8 }}>
                <input type="checkbox" checked={!!c.present} onChange={e=>{
                  const next=[...(arc.extra||[])]; next[i]={...next[i], present:e.target.checked}; setField({ extra: next });
                }} />
                <span className={`chip ${c.present ? "chip--ok" : ""}`}>obecne</span>
              </label>
              <input className="i" placeholder="uwaga / opis" value={c.note||""}
                onChange={e=>{ const next=[...(arc.extra||[])]; next[i]={...next[i], note:e.target.value}; setField({ extra: next }); }} />
              <button type="button" className="ghost" title="Usuń" onClick={()=>{
                setField({ extra:(arc.extra||[]).filter((_,idx)=>idx!==i) });
              }}>🗑</button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={()=>{
            setField({ extra:[...(arc.extra||[]), { label:"", present:false, note:"" }] });
          }}>+ dodaj pozycję</button>
        </div>

        {/* Opis teczki (auto + edycja) */}
        <div className="docForm__section f--span3">Opis teczki</div>
        <div className="f f--span3">
          <div className="chips" style={{ marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="ghost" onClick={generateDescription}>⚡ Wygeneruj z pól</button>
            <button type="button" className="ghost" onClick={()=>setField({ description: "" })}>Wyczyść opis</button>
          </div>
          <textarea className="i t" rows={10} value={arc.description||""} onChange={e=>setField({ description: e.target.value })} />
        </div>
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

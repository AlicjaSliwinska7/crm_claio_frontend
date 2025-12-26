// src/components/pages/contents/OtherInfoDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/documentation-orders.css";

const SET_PREFIX = "infset.v1.";

function prettyBytes(n){
  if(!n && n!==0) return "—";
  const units = ["B","KB","MB","GB"];
  let i=0, v=n;
  while(v>=1024 && i<units.length-1){ v/=1024; i++; }
  return `${Math.round(v*10)/10} ${units[i]}`;
}
function prettyDate(ts){ return ts ? new Date(ts).toLocaleString() : "—"; }

export default function OtherInfoDetail(){
  const nav = useNavigate();
  const { id } = useParams();
  const [items, setItems] = useState([]);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(SET_PREFIX + id);
      setItems(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [id]);

  const countByKind = useMemo(()=>{
    const acc = { url:0, note:0, file:0 };
    items.forEach(i => { acc[i.kind] = (acc[i.kind]||0) + 1; });
    return acc;
  }, [items]);

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{marginRight:8}}>Inne informacje — {id}</h2>
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={()=>nav(-1)}>Wstecz</button>
      </div>

      <div className="docOrders__summary">
        <div className="summary-pill tone-blue"><span>Pozycji</span><b>{items.length}</b></div>
        <div className="summary-pill tone-indigo"><span>Linki</span><b>{countByKind.url}</b></div>
        <div className="summary-pill tone-amber"><span>Notatki</span><b>{countByKind.note}</b></div>
        <div className="summary-pill tone-green"><span>Pliki</span><b>{countByKind.file}</b></div>
      </div>

      {items.length === 0 ? (
        <div className="kb__empty">Brak pozycji w tym zestawie.</div>
      ) : (
        <div className="pppList__grid">
          {items.map((it)=>(
            <article key={it.id} className="pppList__item card">
              <div className="pppList__row1">
                <div className="pppList__title">
                  <span className="docLink">{it.title || it.fileName || it.url || "(bez tytułu)"}</span>
                  <div className="chips">
                    <span className="chip">{it.kind}</span>
                    {it.tags?.map(t=> <span key={t} className="chip">{t}</span>)}
                    <span className="chip">akt.: {prettyDate(it.updatedAt)}</span>
                  </div>
                </div>
                <div className="pppList__metaRight">
                  {it.kind === "url" && it.url ? (
                    <a className="ghost" href={it.url} target="_blank" rel="noreferrer">Otwórz ↗</a>
                  ) : null}
                </div>
              </div>

              <div className="pppList__row2">
                {it.kind === "note" ? (
                  <div className="pppList__meta" style={{whiteSpace:"pre-wrap"}}>
                    {it.description || "—"}
                  </div>
                ) : it.kind === "file" ? (
                  <div className="pppList__meta">
                    <span className="pppList__metaLabel">Plik:</span> <b>{it.fileName || "—"}</b>
                    <span className="pppList__sep">·</span>
                    <span className="pppList__metaLabel">Typ:</span> <span>{it.fileType || "—"}</span>
                    <span className="pppList__sep">·</span>
                    <span className="pppList__metaLabel">Rozmiar:</span> <span>{prettyBytes(it.fileSize)}</span>
                  </div>
                ) : it.kind === "url" ? (
                  <div className="pppList__meta">
                    <span className="pppList__metaLabel">URL:</span> <code>{it.url}</code>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

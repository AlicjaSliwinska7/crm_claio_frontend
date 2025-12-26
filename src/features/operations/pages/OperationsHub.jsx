import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../documentation/styles/documentation-orders.css";

// prościutki mock – w realu zsumujesz z API
async function mockSummary() {
  return {
    "/operacje/zlecenia-do-zarejestrowania": 2,
    "/operacje/oczekiwanie-na-dostawe": 3,
    "/operacje/probki-do-przyjecia": 1,
    "/operacje/pb-do-przygotowania": 2,
    "/operacje/badania-do-wykonania": 4,
    "/operacje/logi-do-przygotowania": 1,
    "/operacje/kb-do-przygotowania": 2,
    "/operacje/sprawozdania-do-przygotowania": 3,
    "/operacje/dokumentacja-do-archiwizacji": 2,
  };
}

export default function OperationsHub({ loadSummary = mockSummary }) {
  const nav = useNavigate();
  const [counts, setCounts] = useState({});
  useEffect(() => { (async () => setCounts(await loadSummary()))(); }, [loadSummary]);

  const tiles = [
    { path: "/operacje/zlecenia-do-zarejestrowania", label: "Zlecenia do zarejestrowania" },
    { path: "/operacje/oczekiwanie-na-dostawe", label: "Oczekiwanie na dostawę" },
    { path: "/operacje/probki-do-przyjecia", label: "Próbki do przyjęcia" },
    { path: "/operacje/pb-do-przygotowania", label: "PB do przygotowania" },
    { path: "/operacje/badania-do-wykonania", label: "Badania do wykonania" },
    { path: "/operacje/logi-do-przygotowania", label: "Logi do przygotowania" },
    { path: "/operacje/kb-do-przygotowania", label: "KB do przygotowania" },
    { path: "/operacje/sprawozdania-do-przygotowania", label: "Sprawozdania do przygotowania" },
    { path: "/operacje/dokumentacja-do-archiwizacji", label: "Dokumentacja do archiwizacji" },
  ];

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2">Operacje — pulpit</h2>
        <div className="kb__spacer" />
      </div>

      <div className="pppList__grid">
        {tiles.map((t) => (
          <article key={t.path} className="pppList__item card" style={{ cursor: "pointer" }} onClick={() => nav(t.path)}>
            <div className="pppList__row1">
              <div className="pppList__title">
                <span className="docLink pppList__linkLike">{t.label}</span>
              </div>
              <div className="pppList__metaRight">
                <span className="pppList__metaLabel">W kolejce:</span>{" "}
                <b>{counts[t.path] ?? 0}</b>
              </div>
            </div>
            <div className="hint">Kliknij, aby przejść do listy.</div>
          </article>
        ))}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import "../styles/calc-cards.css";

const PLN = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);

function sumRows(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0);
}

export default function CalcCard({ cards = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const stateCard = useLocation().state?.card;

  // znajdź kartę: najpierw state, potem kolekcja z props
  const cardInitial = useMemo(() => {
    if (stateCard) return stateCard;
    return (cards || []).find((c) => String(c.id) === String(id));
  }, [stateCard, cards, id]);

  const [card, setCard] = useState(cardInitial);

  if (!card) {
    return (
      <div className="calc-wrap">
        <div className="panel">
          <h2>Nie znaleziono karty</h2>
          <p>
            Karta <b>{id}</b> nie istnieje lub została usunięta.
          </p>
          <Link to="/dokumentacja/karty-kalkulacyjne" className="docLink">
            ← Wróć do listy
          </Link>
        </div>
      </div>
    );
  }

  // --- NOWE: wyliczenia sum ---
  const rowsSum = sumRows(card.rows);
  const mats = Number(card.materials) || 0;
  const total = rowsSum + mats;

  const setStatus = (status) => setCard({ ...card, status });

  return (
    <div className="calc-wrap">
      <div className="panel">
        {/* Pasek akcji */}
        <div
          className="kb__actions"
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
        >
          <button className="btn outline" onClick={() => navigate(-1)}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Wróć
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn outline" onClick={() => setStatus("review")}>
            <Eye style={{ width: 16, height: 16 }} /> Do przeglądu
          </button>
          <button className="btn" onClick={() => setStatus("approved")}>
            <CheckCircle2 style={{ width: 16, height: 16 }} /> Zatwierdź
          </button>
        </div>

        <h2 style={{ margin: "6px 0 12px" }}>Karta kalkulacyjna {card.id}</h2>

        <div className="grid-3">
          <div className="card">
            <div className="text-zinc-500">Zlecenie</div>
            <div>
              <Link
                to={`/dokumentacja/zlecenia/${encodeURIComponent(card.orderId)}`}
                className="docLink"
              >
                {card.orderNumber}
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="text-zinc-500">Klient</div>
            <div>{card.client}</div>
          </div>
          <div className="card">
            <div className="text-zinc-500">Status</div>
            <div>
              {card.status === "approved" ? (
                <span className="badge approved">zatwierdzona</span>
              ) : card.status === "review" ? (
                <span className="badge review">do przeglądu</span>
              ) : (
                <span className="badge draft">szkic</span>
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="text-zinc-500">Temat</div>
            <div>{card.subject}</div>
          </div>

          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="mb-2" style={{ fontWeight: 600 }}>
              Pozycje kosztorysu
            </div>
            <div className="tableLike">
              <div className="tableLike__head">
                <div>Nazwa</div>
                <div>Ilość</div>
                <div>Cena jedn.</div>
                <div>Suma</div>
              </div>
              {(card.rows || []).map((r, idx) => (
                <div key={idx} className="tableLike__row">
                  <div>{r.name}</div>
                  <div>
                    {r.qty} {r.unit}
                  </div>
                  <div>{PLN(r.unitPrice)}</div>
                  <div>{PLN((Number(r.qty) || 0) * (Number(r.unitPrice) || 0))}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-zinc-500">Utworzono</div>
            <div>{card.createdAt || "—"}</div>
          </div>
          <div className="card">
            <div className="text-zinc-500">Materiały</div>
            <div>{PLN(mats)}</div>
          </div>
          <div className="card">
            <div className="text-zinc-500">Suma (pozycje)</div>
            <div style={{ fontWeight: 600 }}>{PLN(rowsSum)}</div>
          </div>

          {/* NOWE: Suma całkowita */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="text-zinc-500">Suma całkowita (pozycje + materiały)</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{PLN(total)}</div>
          </div>
        </div>

        <p style={{ marginTop: 14, color: "#6b7280", fontSize: 12 }}>
          Po <b>zatwierdzeniu</b> karta może zasilać <b>Rejestr zleceń</b> (np. pola: godziny,
          koszty materiałów, suma).
        </p>
      </div>
    </div>
  );
}

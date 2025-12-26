// src/components/pages/contents/Offer.jsx
import React, { useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, FilePlus2 } from "lucide-react";
import "../styles/offer.css";

// Jeśli renderujesz ten widok bez rodzica, możesz tu tymczasowo zaimportować/mocknąć dane.
// Zakładamy jednak, że rodzic przekazuje { offers=[] } w propsach.

export default function Offer({ offers = [], clients = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Umożliwiamy przekazanie oferty przez state (np. navigate(path, { state: { offer } }))
  const offerFromState = location.state?.offer;

  const offer = useMemo(() => {
    if (offerFromState) return offerFromState;
    return (offers || []).find((o) => String(o.id) === String(id));
  }, [offerFromState, offers, id]);

  // Dla zgodności wstecz: jeśli ktoś ma tablicę klientów, spróbujemy znaleźć link
  const client = useMemo(() => {
    if (!offer) return null;
    return (clients || []).find((c) => c.name === offer.client) || null;
  }, [clients, offer]);

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("pl-PL") : "—";

  const fmtMoney = (v, cur = "PLN") =>
    v == null
      ? "—"
      : new Intl.NumberFormat("pl-PL", {
          style: "currency",
          currency: cur,
        }).format(Number(v) || 0);

  if (!offer) {
    return (
      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Nie znaleziono oferty</h2>
        <p>
          Oferta o numerze <b>{id}</b> nie istnieje lub została usunięta.
        </p>
        <Link to="/dokumentacja/oferty" className="ghost">
          ← Wróć do listy ofert
        </Link>
      </div>
    );
  }

  return (
    <div className="docOrders">
      <div className="docOrders__wrap">
        <div className="docOrders__main panel">
          {/* Pasek akcji */}
          <div className="kb__actions">
            <button className="ghost" onClick={() => navigate(-1)} title="Wróć">
              <ArrowLeft size={16} />
              <span style={{ marginLeft: 6 }}>Wróć</span>
            </button>
            <div className="kb__spacer" />
            <button
              className="ghost"
              title="Utwórz zlecenie z tej oferty"
              onClick={() =>
                navigate(`/dokumentacja/zlecenia/nowe?offer=${encodeURIComponent(offer.id)}`, {
                  state: { fromOffer: offer },
                })
              }
            >
              <FilePlus2 size={16} />
              <span style={{ marginLeft: 6 }}>Utwórz zlecenie</span>
            </button>
            <Link
              to={`/dokumentacja/oferty/${encodeURIComponent(offer.id)}/formularz`}
              className="ghost"
              title="Podgląd (WIP)"
            >
              <FileText size={16} />
              <span style={{ marginLeft: 6 }}>Formularz</span>
            </Link>
          </div>

          <h2 className="docOrders__h2" style={{ marginTop: 0 }}>
            Oferta {offer.id}
          </h2>

          {/* Status / szybkie chipy */}
          <div className="chips" style={{ marginBottom: 8 }}>
            <span className={`chip ${statusTone(offer.status)}`}>
              {labelStatus(offer.status)}
            </span>
          </div>

          {/* Siatka szczegółów */}
          <div className="docOrders__grid">
            <div className="card">
              <h3>Klient</h3>
              <p style={{ margin: 0 }}>
                {client ? (
                  <Link
                    to={`/sprzedaz/klienci/${encodeURIComponent(client.name)}`}
                    className="docLink"
                  >
                    {client.name}
                  </Link>
                ) : (
                  offer.client || "—"
                )}
              </p>
            </div>

            <div className="card">
              <h3>Ważność</h3>
              <p style={{ margin: 0 }}>
                <b>Ważna do:</b> {fmtDate(offer.validUntil)}
              </p>
            </div>

            <div className="card">
              <h3>Kwota</h3>
              <p style={{ margin: 0 }}>
                {fmtMoney(offer.value, offer.currency || "PLN")}
              </p>
            </div>

            <div className="card">
              <h3>Przedmiot badań</h3>
              <p style={{ margin: 0 }}>{offer.subject || "—"}</p>
            </div>

            <div className="card">
              <h3>Forma / Język sprawozdania</h3>
              <p style={{ margin: 0 }}>
                {offer.reportForm || "—"} / {offer.language || "—"}
              </p>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <h3>Zakres badań</h3>
              {Array.isArray(offer.tests) && offer.tests.length > 0 ? (
                <div className="tableLike">
                  <div className="tableLike__head">
                    <div>Dokument / Norma</div>
                    <div>Cecha badana</div>
                    <div>Punkt</div>
                    <div className="text-center">A/NA</div>
                  </div>
                  <div className="tableLike__body">
                    {offer.tests.map((t, idx) => (
                      <div key={idx} className="tableLike__row">
                        <div title={t.doc}>{t.doc}</div>
                        <div>{t.feature}</div>
                        <div>{t.point}</div>
                        <div className="text-center">{t.acc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#6b7280" }}>Brak pozycji.</p>
              )}
            </div>

            {offer.notes ? (
              <div className="card" style={{ gridColumn: "1 / -1" }}>
                <h3>Uwagi</h3>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{offer.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mapa statusu na label UI (spójnie z OffersList.jsx). */
function labelStatus(status = "") {
  const m = {
    draft: "szkic",
    sent: "wysłana",
    accepted: "zaakceptowana",
    rejected: "odrzucona",
  };
  return m[String(status).toLowerCase()] || String(status) || "—";
}

/** Ton kapsuły; dopasuj do klas w Twoim CSS-ie (docOrders). */
function statusTone(status = "") {
  const s = String(status).toLowerCase();
  if (s === "accepted") return "chip--ok"; // zielony
  if (s === "rejected") return "chip--warn"; // np. czerwony/ciemny
  // draft / sent -> neutral
  return "";
}

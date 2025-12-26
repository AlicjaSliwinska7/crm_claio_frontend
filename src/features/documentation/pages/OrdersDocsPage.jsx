import React, { useMemo, useState } from "react";
import "../styles/docs.css";
import TestScopeTable from "./TestScopeTable";

/**
 * /dokumentacja/zlecenia — formularz zlecenia + workflow (frontend-only)
 * Statusy główne: w przygotowaniu → wysłane → podpisane → zarejestrowane
 * „Zarejestrowane” = start procesu głównego.
 */
const ORDER_STATUSES = ["w przygotowaniu", "wysłane", "podpisane", "zarejestrowane"];

export default function OrdersDocsPage() {
  // --- dane zlecenia (skrótowo; rozbudujesz później) ---
  const [order, setOrder] = useState({
    number: "",
    client: "",
    contact: "",
    email: "",
    phone: "",
    subject: "",
    deliveryForm: "papier+elektroniczna",
    language: "pl",
    copies: 1,
    complianceStatement: "NIE",
    deadlineDays: 14,
    status: "w przygotowaniu",
    // zakres badań:
    scope: [
      { id: crypto.randomUUID(), feature: "", testNumber: "", accreditation: "A", methodRef: "", spec: "", units: "" },
    ],
  });

  const set = (patch) => setOrder(o => ({ ...o, ...patch }));

  // derived helpers
  const canRegister = useMemo(() => order.status === "podpisane" && order.scope.length > 0, [order]);

  // scope handlers
  const updateScope = (rows) => set({ scope: rows });
  const addRow = () =>
    set({
      scope: [
        ...order.scope,
        { id: crypto.randomUUID(), feature: "", testNumber: "", accreditation: "A", methodRef: "", spec: "", units: "" },
      ],
    });
  const removeRow = (id) => set({ scope: order.scope.filter(r => r.id !== id) });

  // simple persist (local)
  const saveDraft = () => {
    try {
      localStorage.setItem("docsOrderDraft", JSON.stringify(order));
      alert("Zapisano szkic (localStorage).");
    } catch {}
  };
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem("docsOrderDraft");
      if (raw) set(JSON.parse(raw));
    } catch {}
  };

  const advanceStatus = () => {
    const idx = ORDER_STATUSES.indexOf(order.status);
    if (idx >= 0 && idx < ORDER_STATUSES.length - 1) {
      set({ status: ORDER_STATUSES[idx + 1] });
    }
  };

  return (
    <div className="docs__wrap">
      {/* Pasek statusów (workflow) */}
      <div className="docs__card">
        <div className="docs__statusbar">
          {ORDER_STATUSES.map(s => (
            <span key={s} className={`docs__status ${order.status === s ? "is-active" : ""}`}>{s}</span>
          ))}
          <div style={{marginLeft:"auto", display:"flex", gap:8}}>
            <button type="button" className="docs__btn docs__btn--ghost" onClick={loadDraft}>Wczytaj szkic</button>
            <button type="button" className="docs__btn" onClick={saveDraft}>Zapisz szkic</button>
            <button
              type="button"
              className="docs__btn docs__btn--primary"
              onClick={advanceStatus}
              disabled={order.status === "zarejestrowane"}
              title="Przejdź do kolejnego statusu"
            >
              Następny status
            </button>
          </div>
        </div>
      </div>

      {/* Dane ogólne */}
      <div className="docs__card">
        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">Nr zlecenia / <i>Order №</i></span>
            <input className="docs__input" value={order.number} onChange={e=>set({ number: e.target.value })} placeholder="…/…" />
          </label>
          <label className="docs__field">
            <span className="docs__label">Status</span>
            <select className="docs__select" value={order.status} onChange={e=>set({ status: e.target.value })}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">Zleceniodawca / <i>Client</i></span>
            <input className="docs__input" value={order.client} onChange={e=>set({ client: e.target.value })} placeholder="Firma / osoba" />
          </label>
          <label className="docs__field">
            <span className="docs__label">Osoba kontaktowa / <i>Representative</i></span>
            <input className="docs__input" value={order.contact} onChange={e=>set({ contact: e.target.value })} placeholder="Imię i nazwisko" />
          </label>
        </div>

        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">E-mail</span>
            <input className="docs__input" value={order.email} onChange={e=>set({ email: e.target.value })} placeholder="name@company.com" />
          </label>
          <label className="docs__field">
            <span className="docs__label">Telefon / <i>Phone</i></span>
            <input className="docs__input" value={order.phone} onChange={e=>set({ phone: e.target.value })} placeholder="+48 ..." />
          </label>
        </div>

        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">Przedmiot badań / <i>Tested object</i></span>
            <input className="docs__input" value={order.subject} onChange={e=>set({ subject: e.target.value })} placeholder="np. bateria / przewód / próbka materiału..." />
          </label>
          <label className="docs__field">
            <span className="docs__label">Termin (dni od przyjęcia) / <i>Deadline (days)</i></span>
            <input className="docs__input" type="number" min={1} value={order.deadlineDays} onChange={e=>set({ deadlineDays: +e.target.value })} />
          </label>
        </div>

        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">Forma sprawozdania / <i>Report form</i></span>
            <select className="docs__select" value={order.deliveryForm} onChange={e=>set({ deliveryForm: e.target.value })}>
              <option value="papier+elektroniczna">papierowa i elektroniczna</option>
              <option value="elektroniczna">elektroniczna</option>
              <option value="papierowa">papierowa</option>
            </select>
          </label>
          <div className="docs__row" style={{gridTemplateColumns:"1fr 1fr"}}>
            <label className="docs__field">
              <span className="docs__label">Język / <i>Language</i></span>
              <select className="docs__select" value={order.language} onChange={e=>set({ language: e.target.value })}>
                <option value="pl">polski</option>
                <option value="en">english</option>
                <option value="pl+en">PL + EN</option>
              </select>
            </label>
            <label className="docs__field">
              <span className="docs__label">Egzemplarze / <i>Copies</i></span>
              <input className="docs__input" type="number" min={1} value={order.copies} onChange={e=>set({ copies: +e.target.value })} />
            </label>
          </div>
        </div>

        <div className="docs__row">
          <label className="docs__field">
            <span className="docs__label">Stwierdzenie zgodności / <i>Statement of compliance</i></span>
            <select className="docs__select" value={order.complianceStatement} onChange={e=>set({ complianceStatement: e.target.value })}>
              <option value="NIE">NIE / NO</option>
              <option value="TAK">TAK / YES</option>
            </select>
          </label>
          <div className="docs__field">
            <span className="docs__label">Uwagi / <i>Notes</i></span>
            <textarea className="docs__textarea" placeholder="Dodatkowe ustalenia…" />
          </div>
        </div>

        <div className="docs__actions">
          <button className="docs__btn docs__btn--ghost" type="button" onClick={saveDraft}>Zapisz szkic</button>
          <button className="docs__btn docs__btn--primary" type="button" disabled={!canRegister}>
            Zarejestruj zlecenie
          </button>
        </div>
      </div>

      {/* ZAKRES BADAŃ (A/NA, metoda, numer punktu etc.) */}
      <div className="docs__card">
        <h3 style={{margin:"0 0 8px 0"}}>Zakres badań / <i>Test scope</i></h3>
        <TestScopeTable rows={order.scope} onChange={updateScope} onAdd={addRow} onRemove={removeRow} />
      </div>
    </div>
  );
}

// src/components/pages/contents/OrderDetails.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusStepper from "./StatusStepper";      // zakładam, że masz ten komponent
import OrderIncidents from "./OrderIncidents";    // zakładam, że masz ten komponent
import "../styles/documentation-orders.css";

/* ================== Utils ================== */
const withUnit = (v, unit) => (v || v === 0 ? `${v} ${unit}` : "—");
const isoNow = () => new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

/** Utrzymanie kompatybilności: legacy methods[] -> order.refGroups[] */
function ensureRefGroups(order) {
  const o = { ...(order || {}) };
  const ord = { ...(o.order || {}) };
  if (Array.isArray(ord.refGroups)) return { ...o, order: ord };

  const legacy = Array.isArray(ord.methods) ? ord.methods : [];
  if (!legacy.length) return { ...o, order: { ...ord, refGroups: [] } };

  const byRef = new Map();
  legacy.forEach((m) => {
    const ref = (m && m.ref ? m.ref : "").trim() || "(bez dokumentu)";
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref).push({
      id: m && m.id,
      test: (m && m.test) || "",
      point: (m && m.point) || "",
      acc: (m && m.acc) || "A",
    });
  });
  const refGroups = Array.from(byRef.entries()).map(([ref, methods]) => ({ ref, methods }));
  const rest = { ...ord };
  delete rest.methods;
  return { ...o, order: { ...rest, refGroups } };
}

/* ================== Mini Toast ================== */
function useToast() {
  const [toast, setToast] = useState(null); // {type, msg}
  const show = useCallback((msg, type = "info", ttl = 2800) => {
    setToast({ msg, type });
    const t = setTimeout(() => setToast(null), ttl);
    return () => clearTimeout(t);
  }, []);
  const Toast = useCallback(() => {
    if (!toast) return null;
    return (
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          background: toast.type === "error" ? "#fecaca" : toast.type === "warn" ? "#fde68a" : "#dbeafe",
          border: "1px solid rgba(0,0,0,.1)",
          padding: "10px 12px",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          zIndex: 9999,
          color: "#111827",
          fontWeight: 700,
        }}
      >
        {toast.msg}
      </div>
    );
  }, [toast]);
  return { show, Toast };
}

/* ================== EntitySelect (search + wybór + dodaj) ================== */
function EntitySelect({ value, onChange, searchFn, placeholder, addLabel, onAdd, addUrl }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    if (!open) { setResults([]); return; }
    const run = async () => {
      if (!searchFn) return;
      const q = (query || "").trim();
      if (q.length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        const out = await Promise.resolve(searchFn(q));
        if (alive) setResults(Array.isArray(out) ? out : []);
      } catch {
        if (alive) setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    const t = setTimeout(run, 220);
    return () => { alive = false; clearTimeout(t); };
  }, [open, query, searchFn]);

  const pick = (row) => {
    onChange && onChange(row || null);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleAdd = () => {
    if (onAdd) onAdd();
    else if (addUrl) navigate(addUrl);
  };

  return (
    <div className="client-select" style={{ position: "relative" }}>
      <div className="f f--row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="i i--lg"
          placeholder={placeholder || "Szukaj (min. 2 znaki)"}
          value={open ? query : (value && (value.name || value.company || value.manufacturer || value.title)) || ""}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
        {addLabel ? (
          <button type="button" className="ghost" onClick={handleAdd}>{addLabel}</button>
        ) : null}
        {value ? (
          <button type="button" className="ghost" onClick={() => pick(null)}>Wyczyść</button>
        ) : null}
      </div>

      {open && (
        <div className="card" style={{ position: "absolute", zIndex: 50, left: 0, right: 0, marginTop: 6, maxHeight: 320, overflow: "auto" }}>
          {loading && <div className="kb__empty">Wyszukiwanie…</div>}
          {!loading && results.length === 0 && (
            <div className="kb__empty">Brak wyników.</div>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {results.map((row, i) => (
              <li key={row.id || row._id || i}>
                <button
                  type="button"
                  className="ghost"
                  style={{ width: "100%", textAlign: "left" }}
                  onClick={() => pick(row)}
                >
                  <div className="title" style={{ fontWeight: 800 }}>
                    {(row.title || row.name || row.company || row.manufacturer || "(bez nazwy)")}
                  </div>
                  <div className="meta" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {row.vat || row.nip ? <span>NIP: {row.vat || row.nip}</span> : null}
                    {row.code ? <span>Kod: {row.code}</span> : null}
                    {row.year ? <span>Rok: {row.year}</span> : null}
                    {row.email ? <span>e-mail: {row.email}</span> : null}
                    {row.address || row.billingAddress ? <span>{row.address || row.billingAddress}</span> : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="kb__divider" />
          <button type="button" className="ghost" onClick={() => setOpen(false)}>Zamknij</button>
        </div>
      )}
    </div>
  );
}

/* ================== Dropzone (drag&drop + paste) ================== */
function FileDrop({ label, multiple = false, onFiles, children }) {
  const [hover, setHover] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    onFiles && onFiles(multiple ? Array.from(files) : [files[0]]);
  };
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const it of items) {
      if (it.kind === "file") files.push(it.getAsFile());
    }
    if (files.length) onFiles && onFiles(multiple ? files : [files[0]]);
  };

  return (
    <div
      className="card"
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      style={{
        borderStyle: "dashed",
        borderColor: hover ? "#60a5fa" : "#e5e7eb",
        background: hover ? "#eff6ff" : "#fff",
      }}
    >
      <div className="l" style={{ marginBottom: 6 }}>{label}</div>
      {children}
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
        Przeciągnij plik tutaj lub wklej z schowka. PDF wykryje się automatycznie.
      </div>
    </div>
  );
}

/* ================== Methods editor (dokument → metody) ================== */
function MethodsByDocumentEditor({
  value = [],
  onChange,
  searchRefDocs,                 // async (q) → [{id, title, code, year}]
  searchMethodsForRef,           // async (refTitleOrId) → [{id, test, point, acc}]
  onAddNewRefDoc,                // optional route/handler
}) {
  const groups = Array.isArray(value) ? value : [];

  const setGroup = (i, patch) => {
    const next = groups.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    onChange && onChange(next);
  };
  const addGroup = () =>
    onChange && onChange([...(groups || []), { ref: "", refId: undefined, methods: [{ test: "", point: "", acc: "A" }] }]);
  const addMethod = (i) => {
    const next = groups.map((g, idx) =>
      idx === i ? { ...g, methods: [...(g.methods || []), { test: "", point: "", acc: "A" }] } : g
    );
    onChange && onChange(next);
  };
  const delGroup = (i) => onChange && onChange(groups.filter((_, idx) => idx !== i));
  const delMethod = (gi, mi) => {
    const next = groups.map((g, idx) =>
      idx === gi ? { ...g, methods: (g.methods || []).filter((_, i) => i !== mi) } : g
    );
    onChange && onChange(next);
  };
  const setMethod = (gi, mi, patch) => {
    const next = groups.map((g, idx) =>
      idx !== gi ? g : { ...g, methods: (g.methods || []).map((m, i) => (i === mi ? { ...m, ...patch } : m)) }
    );
    onChange && onChange(next);
  };

  // ładowanie podpowiedzi metod dla aktywnej normy
  const [suggestions, setSuggestions] = useState({}); // {gi -> [methods]}
  const fetchSuggestions = async (gi) => {
    const g = groups[gi];
    if (!g) return;
    const refKey = g.refId || g.ref;
    if (!refKey) return;
    try {
      const arr = await Promise.resolve(searchMethodsForRef ? searchMethodsForRef(refKey) : []);
      setSuggestions((s) => ({ ...s, [gi]: arr || [] }));
    } catch {
      setSuggestions((s) => ({ ...s, [gi]: [] }));
    }
  };
  const mergeAllSuggestions = async (gi) => {
    await fetchSuggestions(gi);
    const sug = suggestions[gi] || [];
    if (!sug.length) return;
    const existing = new Set((groups[gi]?.methods || []).map((m) => (m.test || "") + "|" + (m.point || "")));
    const toAdd = sug.filter((m) => !existing.has((m.test || "") + "|" + (m.point || "")));
    if (!toAdd.length) return;
    const next = groups.map((g, idx) =>
      idx === gi ? { ...g, methods: [...(g.methods || []), ...toAdd.map((m) => ({ ...m, acc: m.acc || "A" }))] } : g
    );
    onChange && onChange(next);
  };

  return (
    <div className="methods-docs-editor">
      {groups.map((g, gi) => (
        <div className="methods-docs__group card" key={`g-${gi}`}>
          <div className="methods-docs__groupHead">
            <label className="f f--full">
              <span className="l">Dokument referencyjny / norma</span>
              <EntitySelect
                value={g.ref ? { title: g.ref } : null}
                onChange={(row) => {
                  if (!row) { setGroup(gi, { ref: "", refId: undefined }); return; }
                  setGroup(gi, { ref: row.title, refId: row.id });
                }}
                searchFn={searchRefDocs}
                placeholder="np. PN-EN 60095-1:2018"
                addLabel="Dodaj nowy dokument"
                onAdd={onAddNewRefDoc}
              />
            </label>
            <div className="methods-docs__groupActions">
              <button type="button" className="ghost" onClick={() => addMethod(gi)}>+ Dodaj metodę / cechę</button>
              <button type="button" className="ghost" onClick={() => fetchSuggestions(gi)}>🔎 Podpowiedzi</button>
              <button type="button" className="ghost" onClick={() => mergeAllSuggestions(gi)}>⤴ Wstaw zestaw z normy</button>
              <button type="button" className="ghost" onClick={() => delGroup(gi)} title="Usuń dokument">🗑</button>
            </div>
          </div>

          {/* Podpowiedzi do kliknięcia */}
          {(suggestions[gi] || []).length ? (
            <div className="chips" style={{ marginBottom: 8 }}>
              <span className="l" style={{ alignSelf: "center" }}>Proponowane metody:</span>
              {(suggestions[gi] || []).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ghost"
                  onClick={() => setMethod(gi, (groups[gi].methods || []).length, s) || addMethod(gi)}
                >
                  {s.test} {s.point ? `(${s.point})` : ""}
                </button>
              ))}
            </div>
          ) : null}

          <div className="methods-docs__headRow">
            <div>Akred.</div>
            <div>Badana cecha (możesz ręcznie edytować)</div>
            <div>Nr punktu / testu</div>
            <div />
          </div>

          {(g.methods || []).map((m, mi) => (
            <div className="methods-docs__row" key={`g-${gi}-m-${mi}`}>
              <div>
                <select className="i i--sm" value={m.acc || "A"} onChange={(e) => setMethod(gi, mi, { acc: e.target.value })}>
                  <option value="A">A</option>
                  <option value="NA">NA</option>
                </select>
              </div>
              <div>
                <input
                  className="i i--lg"
                  placeholder="np. Wytrzymałość elektryczna izolacji"
                  value={m.test || ""}
                  onChange={(e) => setMethod(gi, mi, { test: e.target.value })}
                />
              </div>
              <div>
                <input
                  className="i i--md"
                  placeholder="np. 5.2, A.1"
                  value={m.point || ""}
                  onChange={(e) => setMethod(gi, mi, { point: e.target.value })}
                />
              </div>
              <div>
                <button type="button" className="ghost" onClick={() => delMethod(gi, mi)} title="Usuń metodę">🗑</button>
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="ghost" onClick={addGroup}>+ Dodaj dokument referencyjny</button>
    </div>
  );
}

/* ================== URL list editor ================== */
function UrlsEditor({ value = [], onChange, placeholder = "https://…" }) {
  const list = Array.isArray(value) ? value : [];
  const setOne = (i, v) => {
    const next = list.map((x, idx) => (idx === i ? v : x));
    onChange && onChange(next);
  };
  const addOne = () => onChange && onChange([...(list || []), ""]);
  const delOne = (i) => onChange && onChange(list.filter((_, idx) => idx !== i));

  return (
    <div className="methods" style={{ display: "grid", gap: 6 }}>
      {list.map((u, i) => (
        <div key={i} className="f f--row" style={{ alignItems: "center", gap: 8 }}>
          <input className="i i--lg" value={u || ""} placeholder={placeholder} onChange={(e) => setOne(i, e.target.value)} />
          <a className="docLink" href={u || "#"} target="_blank" rel="noreferrer" style={{ opacity: u ? 1 : 0.5 }}>otwórz</a>
          <button type="button" className="ghost" onClick={() => delOne(i)}>🗑</button>
        </div>
      ))}
      <button type="button" className="ghost" onClick={addOne}>+ dodaj link</button>
    </div>
  );
}

/* ================== Presety metod ================== */
const METHOD_PRESETS = [
  {
    id: "start-en-battery",
    label: "Akumulator rozruchowy (EN)",
    groups: [
      {
        ref: "PN-EN 60095-1:2018",
        methods: [
          { test: "Wymiary i oznaczenia", point: "4.1", acc: "A" },
          { test: "Pojemność znamionowa", point: "6.1", acc: "A" },
          { test: "Prąd rozruchu na zimno", point: "6.2", acc: "A" },
        ],
      },
    ],
  },
  {
    id: "generic-electrical",
    label: "Pomiary elektryczne — ogólne",
    groups: [
      {
        ref: "PN-EN 50395:2000",
        methods: [
          { test: "Rezystancja przewodnika", point: "5.2", acc: "A" },
          { test: "Wytrzymałość elektryczna", point: "7.4", acc: "A" },
        ],
      },
    ],
  },
];

/* ================== Gating / Missing Helpers ================== */
const STATUS_FLOW = [
  "w przygotowaniu",
  "przyjęcie próbek",
  "protokół przyjęcia",
  "program badań",
  "karty badań",
  "w trakcie badań",
  "weryfikacja dokumentacji",
  "raporty",
  "dokumentacja kompletna",
];

function getMissingForStatus(status, data) {
  const m = [];
  const o = data || {};

  const need = (cond, label) => { if (!cond) m.push(label); };

  switch ((status || "").toLowerCase()) {
    case "w przygotowaniu":
      need(o.client?.name, "Klient");
      need(o.order?.subject, "Przedmiot badań");
      need((o.order?.refGroups || []).length > 0, "Co najmniej jedna norma/metoda");
      // NOWE wymagania:
      need(!!o.order?.orderType, "Rodzaj zlecenia (ZEW/WEW/BW)");
      {
        const k = o.order?.sampleCodeKind || {};
        const anyKind = k.AO || k.BP || k.AZ || k.INNE;
        need(anyKind, "Rodzaj kodu próbki (AO/BP/AZ/Inne)");
      }
      break;
    case "przyjęcie próbek":
      need(o.process?.sampleIntake?.received, "Próbki dostarczone");
      need(o.process?.sampleIntake?.receivedAt, "Data/godz. dostarczenia");
      break;
    case "protokół przyjęcia":
      need(o.process?.intakeProtocol?.number, "Nr protokołu");
      need(o.process?.intakeProtocol?.acceptedAt, "Data/godz. przyjęcia");
      need(o.process?.intakeProtocol?.sampleCode, "Kod próbki");
      break;
    case "program badań":
      need(o.process?.testProgram?.number, "Nr programu");
      need(o.process?.testProgram?.preparedAt, "Przygotowano");
      need(o.process?.testProgram?.approvedAt, "Zatwierdzono");
      break;
    case "karty badań":
      need(o.process?.testCards?.prepared, "Karty przygotowane");
      break;
    case "w trakcie badań":
      need(o.process?.testing?.startedAt, "Start badań");
      need(o.process?.testing?.finishedAt, "Koniec badań");
      break;
    case "weryfikacja dokumentacji":
      need(o.process?.docsVerification?.started, "Start weryfikacji");
      need(o.process?.docsVerification?.finished, "Koniec weryfikacji");
      break;
    case "raporty":
      need(o.process?.reports?.generatedAt, "Wygenerowano raporty");
      break;
    case "dokumentacja kompletna":
      need(o.process?.fullDocs?.ready, "Komplet gotowy");
      need(o.process?.fullDocs?.readyAt, "Data kompletności");
      break;
    default:
      break;
  }
  return m;
}

/* ================== MAIN ================== */
export default function OrderDetails(props) {
  const {
    order: orderProp,
    // jeżeli parent przekaże controlled-editing:
    editing: editingProp,
    setEditing: setEditingProp,
    onMovePrev,
    onMoveNext,
    onSaveEdit,
    onCancelEdit,
    onRemove,
    searchClients,
    searchManufacturers,
    addNewClientUrl,
    addNewManufacturerUrl,
    onAddNewClient,
    onAddNewManufacturer,

    // (opcjonalne) podasz własne serwisy:
    searchRefDocs: searchRefDocsProp,
    searchMethodsForRef: searchMethodsForRefProp,
    onAddNewRefDoc, // handler/route do "Dodaj nowy dokument"
    currentUser = "Użytkownik",
  } = props;

  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();
  const { show, Toast } = useToast();

  // ====== fallback mocki (jeśli nie podasz z props) ======
  const defaultSearchRefDocs = useCallback(async (q) => {
    const base = [
      { id: "pn-en-60095-1-2018", title: "PN-EN 60095-1:2018", code: "60095-1", year: 2018 },
      { id: "pn-en-50395-2000", title: "PN-EN 50395:2000", code: "50395", year: 2000 },
      { id: "iec-60896-21", title: "IEC 60896-21:2004", code: "60896-21", year: 2004 },
    ];
    return base.filter((x) => x.title.toLowerCase().includes((q || "").toLowerCase()));
  }, []);
  const defaultSearchMethodsForRef = useCallback(async (refKey) => {
    const k = String(refKey || "").toLowerCase();
    if (k.includes("60095")) {
      return [
        { test: "Wymiary i oznaczenia", point: "4.1", acc: "A" },
        { test: "Pojemność znamionowa", point: "6.1", acc: "A" },
        { test: "Prąd rozruchu na zimno", point: "6.2", acc: "A" },
      ];
    }
    if (k.includes("50395")) {
      return [
        { test: "Rezystancja przewodnika", point: "5.2", acc: "A" },
        { test: "Wytrzymałość elektryczna", point: "7.4", acc: "A" },
      ];
    }
    return [];
  }, []);
  const searchRefDocs = searchRefDocsProp || defaultSearchRefDocs;
  const searchMethodsForRef = searchMethodsForRefProp || defaultSearchMethodsForRef;

  // ====== local order scaffolding ======
  const [orderLocal, setOrderLocal] = useState(orderProp || (location.state && location.state.order) || null);

  // migracja legacy → refGroups
  useEffect(() => {
    if (!orderLocal) return;
    setOrderLocal((cur) => ensureRefGroups(cur));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (orderProp) setOrderLocal(ensureRefGroups(orderProp));
  }, [orderProp]);

  // gdy tworzymy nowe (np. ?new=1) – zapełnij szkieletem
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("new") === "1" && !orderLocal) {
      const today = new Date().toISOString().slice(0, 10);
      setOrderLocal({
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `tmp-${Date.now()}`,
        status: "w przygotowaniu",
        number: "",
        acceptanceDate: today,
        client: { id: undefined, name: "", vat: "", contact: "", email: "", address: "", corrAddress: "" },
        report: { manufacturerId: undefined, manufacturer: "", website: "", address: "", phone: "", email: "", isSameAsClient: false },
        order: {
          subject: "",
          model: "",
          nominalCapacity: "",
          nominalVoltage: "",
          crankingCurrent: "",
          sampleSize: 1,

          // NOWE: rodzaje
          orderType: "zew", // 'zew' | 'wew' | 'bw'
          sampleCodeKind: { AO: false, BP: false, AZ: false, INNE: false, inneText: "" },

          postTest: "zwrot do Zleceniodawcy",
          sampleProvidedByClient: false,
          statementOfCompliance: false,
          decisionAcceptance: false,
          deadlineDaysFromStart: 14,
          deadlineConditions: { sampleAcceptance: true, orderRegistration: true, prepayment: false },
          deliveryForm: "PDF",
          language: "polski",
          copies: 1,
          description: "",
          refGroups: [],
          notes: "",
        },
        payment: { priceNet: "", prepaymentNet: "", terms: "14 dni" },
        process: {
          sampleIntake: { received: false, receivedAt: "" },
          intakeProtocol: { number: "", sampleCode: "", acceptedAt: "", url: "" },
          testProgram: { number: "", preparedAt: "", approvedAt: "", url: "" },
          testCards: { prepared: false, preparedAt: "", urls: [] },
          testing: { startedAt: "", finishedAt: "" },
          docsVerification: { started: "", finished: "" },
          reports: { generatedAt: "", urls: [] },
          fullDocs: { ready: false, readyAt: "", url: "" },
          // notatki:
          notes: {
            intake: "",
            intakeProtocol: "",
            testProgram: "",
            testCards: "",
            testing: "",
            verification: "",
            reports: "",
            fullDocs: "",
          },
          // audit (ostatnie zmiany per etap)
          audit: {},
        },
      });
    }
  }, [location.search, orderLocal]);

  // formularz – edycja
  const [editingState, setEditingState] = useState(null);
  const editing = editingProp ?? editingState;
  const setEditing = setEditingProp ?? setEditingState;

  useEffect(() => {
    if (orderLocal && !editing) setEditing(orderLocal);
  }, [orderLocal, editing, setEditing]);

  // audit helper
  const touchAudit = (stageKey) => {
    setEditing((cur) => {
      if (!cur) return cur;
      const prev = cur.process?.audit || {};
      return {
        ...cur,
        process: {
          ...(cur.process || {}),
          audit: { ...prev, [stageKey]: { at: isoNow(), by: currentUser } },
        },
      };
    });
  };

  // sync producenta z klientem jeśli zaznaczone
  useEffect(() => {
    if (!editing || !editing.report || !editing.report.isSameAsClient) return;
    setEditing((cur) => {
      if (!cur) return cur;
      const client = cur.client || {};
      const rep = cur.report || {};
      const patched = {
        ...rep,
        manufacturer: client.name || rep.manufacturer || "",
        address: client.address || rep.address || "",
        email: client.email || rep.email || "",
      };
      if (
        patched.manufacturer === rep.manufacturer &&
        patched.address === rep.address &&
        patched.email === rep.email
      ) return cur;
      return { ...cur, report: patched };
    });
  }, [
    editing && editing.report && editing.report.isSameAsClient,
    editing && editing.client && editing.client.name,
    editing && editing.client && editing.client.address,
    editing && editing.client && editing.client.email,
    setEditing
  ]);

  /* ====== Link helpers ====== */
  const goToClient = (client) => {
    if (!client) return;
    const id = client.id || client._id;
    if (id) navigate(`/sprzedaz/klienci/${id}`);
    else {
      const q = encodeURIComponent(client.name || client.vat || client.email || "");
      navigate(`/sprzedaz/klienci?q=${q}`);
    }
  };
  const goToManufacturer = (rep) => {
    if (!rep) return;
    const id = rep.manufacturerId || rep.id;
    if (id) navigate(`/slownik/producenci/${id}`);
    else {
      const q = encodeURIComponent(rep.manufacturer || rep.email || "");
      navigate(`/slownik/producenci?q=${q}`);
    }
  };

  const routeFor = (section, id) => {
    switch (section) {
      case "intake":
      case "intakeProtocol":
        return `/dokumentacja/zlecenia/${id}/przyjecie-probek`;
      case "testProgram":
        return `/dokumentacja/zlecenia/${id}/program-badan`;
      case "testCards":
        return `/dokumentacja/zlecenia/${id}/karty-badan`;
      case "testing":
        return `/dokumentacja/zlecenia/${id}#w-trakcie-badan`;
      case "verification":
        return `/dokumentacja/zlecenia/${id}/weryfikacja-dokumentow`;
      case "reports":
        return `/dokumentacja/zlecenia/${id}/raporty`;
      case "fullDocs":
        return `/dokumentacja/zlecenia/${id}/pelna-dokumentacja`;
      default:
        return `/dokumentacja/zlecenia/${id}`;
    }
  };
  const goToSection = (section) => {
    const id = (editing && editing.id) || routeId;
    if (!id) return;
    navigate(routeFor(section, id));
  };
  const openSalesOrder = () => {
    const id = (editing && editing.id) || routeId;
    if (id) navigate(`/dokumentacja/zlecenia/${id}`);
  };

  // ====== setterki ======
  const setOrderRoot = (patch) => setEditing({ ...editing, ...patch });

  const setClient = (patch) => setOrderRoot({ client: { ...(editing.client || {}), ...patch } });
  const setReport = (patch) => setOrderRoot({ report: { ...(editing.report || {}), ...patch } });
  const setOrder = (patch) => setOrderRoot({ order: { ...(editing.order || {}), ...patch } });
  const setPayment = (patch) => setOrderRoot({ payment: { ...(editing.payment || {}), ...patch } });
  const setProcess = (patch) => setOrderRoot({ process: { ...(editing.process || {}), ...patch } });

  const setProcIntake = (patch) => { setProcess({ sampleIntake: { ...(editing.process?.sampleIntake || {}), ...patch } }); touchAudit("intake"); };
  const setProcIntakeProtocol = (patch) => { setProcess({ intakeProtocol: { ...(editing.process?.intakeProtocol || {}), ...patch } }); touchAudit("intakeProtocol"); };
  const setProcTestProgram = (patch) => { setProcess({ testProgram: { ...(editing.process?.testProgram || {}), ...patch } }); touchAudit("testProgram"); };
  const setProcTestCards = (patch) => { setProcess({ testCards: { ...(editing.process?.testCards || {}), ...patch } }); touchAudit("testCards"); };
  const setProcTesting = (patch) => { setProcess({ testing: { ...(editing.process?.testing || {}), ...patch } }); touchAudit("testing"); };
  const setProcVerification = (patch) => { setProcess({ docsVerification: { ...(editing.process?.docsVerification || {}), ...patch } }); touchAudit("verification"); };
  const setProcReports = (patch) => { setProcess({ reports: { ...(editing.process?.reports || {}), ...patch } }); touchAudit("reports"); };
  const setProcFullDocs = (patch) => { setProcess({ fullDocs: { ...(editing.process?.fullDocs || {}), ...patch } }); touchAudit("fullDocs"); };
  const setProcNotes = (stage, text) => {
    setProcess({ notes: { ...(editing.process?.notes || {}), [stage]: text } });
  };

  // ====== Entity pick handlers ======
  const onAddClient = () => {
    if (onAddNewClient) onAddNewClient();
    else if (addNewClientUrl) navigate(addNewClientUrl);
    else navigate("/sprzedaz/klienci/nowy");
  };
  const onAddManufacturer = () => {
    if (onAddNewManufacturer) onAddNewManufacturer();
    else if (addNewManufacturerUrl) navigate(addNewManufacturerUrl);
    else navigate("/slownik/producenci/nowy");
  };
  const onPickClient = (row) => {
    if (!row) {
      setClient({ id: undefined, name: "", vat: "", contact: "", email: "", address: "", corrAddress: "" });
      return;
    }
    const mapped = {
      id: row.id || row._id,
      name: row.name || row.company || "",
      vat: row.vat || row.nip || "",
      contact: row.contact || row.person || "",
      email: row.email || "",
      address: row.address || row.billingAddress || "",
      corrAddress: row.corrAddress || row.addressCorr || row.mailingAddress || "",
    };
    setClient(mapped);
  };
  const onPickManufacturer = (row) => {
    if (!row) {
      setReport({ manufacturerId: undefined, manufacturer: "", website: "", address: "", phone: "", email: "" });
      return;
    }
    setReport({
      isSameAsClient: false,
      manufacturerId: row.id || row._id,
      manufacturer: row.name || row.manufacturer || "",
      website: row.website || "",
      address: row.address || "",
      phone: row.phone || "",
      email: row.email || "",
    });
  };
  const onToggleSameProducer = (checked) => {
    if (checked) {
      setReport({
        isSameAsClient: true,
        manufacturerId: (editing.client && editing.client.id) || undefined,
        manufacturer: (editing.client && editing.client.name) || "",
        address: (editing.client && editing.client.address) || "",
        email: (editing.client && editing.client.email) || "",
        website: editing.report?.website || "",
        phone: editing.report?.phone || "",
      });
    } else {
      setReport({ isSameAsClient: false });
    }
  };

  // ====== Gating handlers (Prev/Next) ======
  const handlePrev = () => {
    onMovePrev && onMovePrev(editing);
  };
  const handleNext = () => {
    const miss = getMissingForStatus(editing?.status, editing);
    if (miss.length) {
      const msg = `Nie można przejść dalej. Braki: ${miss.join(", ")}`;
      show(msg, "error");
      return;
    }
    onMoveNext && onMoveNext(editing);
  };

  // ====== Missing chips for current status ======
  const currentMissing = useMemo(() => getMissingForStatus(editing?.status, editing), [editing]);

  // ====== Preset apply ======
  const applyPreset = (presetId) => {
    const p = METHOD_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    const cur = editing.order?.refGroups || [];
    setOrder({ refGroups: [...cur, ...p.groups.map((g) => ({ ...g, methods: g.methods || [] }))] });
    show(`Dodano preset: ${p.label}`, "info");
  };

  // ====== Drop handlers: generate blob URL (mock) ======
  const makeBlobUrl = async (file) => {
    const url = URL.createObjectURL(file);
    return url;
  };

  const dropToSingleUrl = async (file, setter) => {
    const u = await makeBlobUrl(file);
    setter({ url: u });
    show("Dodano plik (URL tymczasowy).", "info");
  };
  const dropToUrlsList = async (files, setter, prev = []) => {
    const arr = [];
    for (const f of files) arr.push(await makeBlobUrl(f));
    setter({ urls: [...prev, ...arr] });
    show(`Dodano ${arr.length} plik(i).`, "info");
  };

  if (!editing) return null;

  return (
    <form
      className="docForm"
      onSubmit={(e) => { e.preventDefault(); onSaveEdit && onSaveEdit(editing); show("Zapisano zmiany.", "info"); }}
    >
      {/* Top actions + gating chips */}
      <div className="kb__actions">
        <StatusStepper status={editing.status} onPrev={handlePrev} onNext={handleNext} />
        {currentMissing.length ? (
          <div className="chips" title="Braki dla bieżącego etapu">
            {currentMissing.map((m, i) => <span key={i} className="chip chip--warn">{m}</span>)}
          </div>
        ) : (
          <div className="chips"><span className="chip chip--ok">Etap kompletny</span></div>
        )}
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={openSalesOrder}>Widok zlecenia ↗</button>
        {onRemove ? <button className="ghost" type="button" onClick={() => onRemove()}>Usuń</button> : null}
      </div>

      <div className="docForm__grid">
        {/* Nagłówek ogólny */}
        <label className="f">
          <span className="l">Nr zlecenia</span>
          <input className="i i--md" value={editing.number || ""} onChange={(e) => setOrderRoot({ number: e.target.value })} placeholder="np. ZL-2025/010" />
        </label>
        <label className="f">
          <span className="l">Data przyjęcia</span>
          <input type="date" className="i i--sm" value={editing.acceptanceDate || ""} onChange={(e) => setOrderRoot({ acceptanceDate: e.target.value })} />
        </label>

        {/* Presety metod */}
        <div className="f f--span3">
          <span className="l">Zestawy metod (preset)</span>
          <div className="chips">
            {METHOD_PRESETS.map((p) => (
              <button key={p.id} type="button" className="ghost" onClick={() => applyPreset(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Dane do faktury */}
        <div className="docForm__section">Dane do wystawienia faktury</div>
        <div className="f f--span3">
          <span className="l">Wybierz klienta z listy</span>
          <EntitySelect
            value={editing.client}
            onChange={onPickClient}
            searchFn={searchClients}
            addLabel="Dodaj nowego klienta"
            onAdd={onAddClient}
            placeholder="Szukaj klienta (nazwa, NIP, e-mail)"
          />
          {editing.client?.name ? (
            <div className="hint">
              Podgląd karty klienta:{" "}
              <button type="button" className="docLink" onClick={() => goToClient(editing.client)}>{editing.client.name}</button>
            </div>
          ) : null}
        </div>
        <label className="f f--span2">
          <span className="l">Nazwa klienta *</span>
          <input className="i" required value={editing.client?.name || ""} onChange={(e) => setClient({ name: e.target.value })} />
        </label>
        <label className="f"><span className="l">NIP</span><input className="i i--md" value={editing.client?.vat || ""} onChange={(e) => setClient({ vat: e.target.value })} /></label>
        <label className="f"><span className="l">Osoba kontaktowa</span><input className="i i--md" value={editing.client?.contact || ""} onChange={(e) => setClient({ contact: e.target.value })} /></label>
        <label className="f"><span className="l">E-mail</span><input className="i i--lg" value={editing.client?.email || ""} onChange={(e) => setClient({ email: e.target.value })} /></label>
        <label className="f f--span2"><span className="l">Adres do faktury</span><input className="i" value={editing.client?.address || ""} onChange={(e) => setClient({ address: e.target.value })} /></label>
        <label className="f f--span2"><span className="l">Adres korespondencyjny</span><input className="i" value={editing.client?.corrAddress || ""} onChange={(e) => setClient({ corrAddress: e.target.value })} /></label>

        {/* Dane do raportu */}
        <div className="docForm__section">Dane do sprawozdania</div>
        <div className="f f--row">
          <input id="same-prod" type="checkbox" checked={!!editing.report?.isSameAsClient} onChange={(e) => onToggleSameProducer(e.target.checked)} />
          <label htmlFor="same-prod">Producent jest tym samym co Zleceniodawca</label>
        </div>
        <div className="f f--span3">
          <span className="l">Wybierz producenta z listy</span>
          <EntitySelect
            value={editing.report && { id: editing.report.manufacturerId, name: editing.report.manufacturer, email: editing.report.email, address: editing.report.address }}
            onChange={onPickManufacturer}
            searchFn={searchManufacturers}
            addLabel="Dodaj nowego producenta"
            onAdd={onAddManufacturer}
            placeholder="Szukaj producenta (nazwa, e-mail)"
          />
          {editing.report?.manufacturer ? (
            <div className="hint">
              Podgląd karty producenta:{" "}
              <button type="button" className="docLink" onClick={() => goToManufacturer(editing.report)}>{editing.report.manufacturer}</button>
            </div>
          ) : null}
        </div>
        <label className="f">
          <span className="l">Producent</span>
          <input className="i i--md" value={editing.report?.manufacturer || ""} onChange={(e) => setReport({ manufacturer: e.target.value })} disabled={!!editing.report?.isSameAsClient} />
        </label>
        <label className="f"><span className="l">WWW</span><input className="i i--lg" value={editing.report?.website || ""} onChange={(e) => setReport({ website: e.target.value })} disabled={!!editing.report?.isSameAsClient} /></label>
        <label className="f f--span2"><span className="l">Adres</span><input className="i" value={editing.report?.address || ""} onChange={(e) => setReport({ address: e.target.value })} disabled={!!editing.report?.isSameAsClient} /></label>
        <label className="f"><span className="l">Telefon</span><input className="i i--md" value={editing.report?.phone || ""} onChange={(e) => setReport({ phone: e.target.value })} disabled={!!editing.report?.isSameAsClient} /></label>
        <label className="f"><span className="l">E-mail</span><input className="i i--lg" value={editing.report?.email || ""} onChange={(e) => setReport({ email: e.target.value })} disabled={!!editing.report?.isSameAsClient} /></label>

        {/* Informacje dot. usługi */}
        <div className="docForm__section">Informacje dot. usługi</div>

        {/* NOWE: Rodzaj zlecenia */}
        <label className="f f--span3">
          <span className="l">Rodzaj zlecenia</span>
          <div className="f f--row" style={{ flexWrap: "wrap", gap: 8 }}>
            {[
              { key: "zew", label: "ZEW — zewnętrzne" },
              { key: "wew", label: "WEW — wewnętrzne" },
              { key: "bw",  label: "BW — badania własne" },
            ].map(opt => (
              <label key={opt.key} className={`chip ${editing.order?.orderType === opt.key ? "chip--ok" : ""}`} style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="orderType"
                  checked={editing.order?.orderType === opt.key}
                  onChange={() => setOrder({ orderType: opt.key })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </label>

        {/* NOWE: Rodzaj kodu próbki */}
        <label className="f f--span3">
          <span className="l">Rodzaj kodu próbki</span>
          <div className="f f--row" style={{ flexWrap: "wrap", gap: 8 }}>
            {[
              { key: "AO", label: "AO — akumulatory ołowiowe" },
              { key: "BP", label: "BP — baterie pierwotne" },
              { key: "AZ", label: "AZ — akumulatory zasadowe" },
            ].map(opt => (
              <label key={opt.key} className={`chip ${editing.order?.sampleCodeKind?.[opt.key] ? "chip--ok" : ""}`} style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={!!editing.order?.sampleCodeKind?.[opt.key]}
                  onChange={(e) => setOrder({ sampleCodeKind: { ...(editing.order?.sampleCodeKind || {}), [opt.key]: e.target.checked } })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            <label className={`chip ${editing.order?.sampleCodeKind?.INNE ? "chip--ok" : ""}`} style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!editing.order?.sampleCodeKind?.INNE}
                onChange={(e) => setOrder({ sampleCodeKind: { ...(editing.order?.sampleCodeKind || {}), INNE: e.target.checked } })}
              />
              <span>Inne</span>
            </label>
            <input
              className="i i--sm"
              style={{ marginLeft: 8, minWidth: 220 }}
              placeholder="doprecyzuj (jeśli Inne)"
              value={editing.order?.sampleCodeKind?.inneText || ""}
              onChange={(e) => setOrder({ sampleCodeKind: { ...(editing.order?.sampleCodeKind || {}), inneText: e.target.value } })}
            />
          </div>
        </label>

        {/* Istniejące pola */}
        <label className="f f--span2"><span className="l">Przedmiot (wyrób) *</span><input className="i" required value={editing.order?.subject || ""} onChange={(e) => setOrder({ subject: e.target.value })} /></label>
        <label className="f"><span className="l">Model</span><input className="i i--md" value={editing.order?.model || ""} onChange={(e) => setOrder({ model: e.target.value })} /></label>
        <label className="f"><span className="l">Pojemność znamionowa [Ah]</span><input type="number" step="0.1" className="i i--md" placeholder="np. 60" value={editing.order?.nominalCapacity || ""} onChange={(e) => setOrder({ nominalCapacity: e.target.value })} /></label>
        <label className="f"><span className="l">Napięcie znamionowe [V]</span><input type="number" step="0.1" className="i i--md" placeholder="np. 12" value={editing.order?.nominalVoltage || ""} onChange={(e) => setOrder({ nominalVoltage: e.target.value })} /></label>
        <label className="f"><span className="l">Zdolność rozruchowa [EN] [A]</span><input type="number" step="1" className="i i--md" placeholder="np. 540" value={editing.order?.crankingCurrent || ""} onChange={(e) => setOrder({ crankingCurrent: e.target.value })} /></label>
        <label className="f"><span className="l">Liczność próbki [szt.]</span><input type="number" min="1" className="i i--xs" value={editing.order?.sampleSize ?? 1} onChange={(e) => setOrder({ sampleSize: Number(e.target.value) || 1 })} /></label>
        <label className="f"><span className="l">Po zakończeniu badań</span>
          <select className="i i--md" value={editing.order?.postTest || "zwrot do Zleceniodawcy"} onChange={(e) => setOrder({ postTest: e.target.value })}>
            <option>zwrot do Zleceniodawcy</option>
            <option>utylizacja</option>
          </select>
        </label>
        <label className="f f--row"><input type="checkbox" checked={!!editing.order?.sampleProvidedByClient} onChange={(e) => setOrder({ sampleProvidedByClient: e.target.checked })} /><span>Próbkę dostarcza Zleceniodawca</span></label>
        <label className="f f--row"><input type="checkbox" checked={!!editing.order?.statementOfCompliance} onChange={(e) => setOrder({ statementOfCompliance: e.target.checked })} /><span>Stwierdzenie zgodności</span></label>
        <label className="f f--row"><input type="checkbox" checked={!!editing.order?.decisionAcceptance} onChange={(e) => setOrder({ decisionAcceptance: e.target.checked })} /><span>Akceptuję zasadę podejmowania decyzji i ryzyko</span></label>
        <label className="f"><span className="l">Termin realizacji (dni)</span><input type="number" min="1" className="i i--xs" value={editing.order?.deadlineDaysFromStart ?? 14} onChange={(e) => setOrder({ deadlineDaysFromStart: Number(e.target.value) || 14 })} /></label>
        <div className="f f--row gap">
          <label className="f f--row"><input type="checkbox" checked={!!editing.order?.deadlineConditions?.sampleAcceptance} onChange={(e) => setOrder({ deadlineConditions: { ...(editing.order?.deadlineConditions || {}), sampleAcceptance: e.target.checked } })} /><span>od przyjęcia próbek</span></label>
          <label className="f f--row"><input type="checkbox" checked={!!editing.order?.deadlineConditions?.orderRegistration} onChange={(e) => setOrder({ deadlineConditions: { ...(editing.order?.deadlineConditions || {}), orderRegistration: e.target.checked } })} /><span>od rejestracji zlecenia</span></label>
          <label className="f f--row"><input type="checkbox" checked={!!editing.order?.deadlineConditions?.prepayment} onChange={(e) => setOrder({ deadlineConditions: { ...(editing.order?.deadlineConditions || {}), prepayment: e.target.checked } })} /><span>od przedpłaty</span></label>
        </div>
        <label className="f"><span className="l">Wymagane dodatkowe dokumenty</span>
          <select className="i i--xs" value={editing.order?.additionalDocsRequired ? "TAK" : "NIE"} onChange={(e) => setOrder({ additionalDocsRequired: e.target.value === "TAK" })}>
            <option>NIE</option><option>TAK</option>
          </select>
        </label>
        <label className="f"><span className="l">Obserwacja przez Zleceniodawcę</span>
          <select className="i i--xs" value={editing.order?.clientObservation ? "TAK" : "NIE"} onChange={(e) => setOrder({ clientObservation: e.target.value === "TAK" })}>
            <option>NIE</option><option>TAK</option>
          </select>
        </label>
        <label className="f"><span className="l">Forma sprawozdania</span>
          <select className="i i--sm" value={editing.order?.deliveryForm || "PDF"} onChange={(e) => setOrder({ deliveryForm: e.target.value })}>
            <option>PDF</option><option>papier + PDF</option>
          </select>
        </label>
        <label className="f"><span className="l">Język</span>
          <select className="i i--sm" value={editing.order?.language || "polski"} onChange={(e) => setOrder({ language: e.target.value })}>
            <option>polski</option><option>angielski</option>
          </select>
        </label>
        <label className="f"><span className="l">Ilość egzemplarzy [szt.]</span><input type="number" min="1" className="i i--xs" value={editing.order?.copies ?? 1} onChange={(e) => setOrder({ copies: Number(e.target.value) || 1 })} /></label>

        <label className="f f--span3"><span className="l">Opis przedmiotu</span><textarea className="i t" value={editing.order?.description || ""} onChange={(e) => setOrder({ description: e.target.value })} /></label>

        {/* Metody wg dokumentów (z wyszukiwaniem i podpowiedziami) */}
        <div className="f f--span3">
          <MethodsByDocumentEditor
            value={editing.order?.refGroups || []}
            onChange={(refGroups) => setOrder({ refGroups })}
            searchRefDocs={searchRefDocs}
            searchMethodsForRef={searchMethodsForRef}
            onAddNewRefDoc={onAddNewRefDoc}
          />
        </div>

        {/* Dodatkowe ustalenia */}
        <div className="docForm__section">Dodatkowe ustalenia</div>
        <label className="f f--span3"><span className="l">Ustalenia</span><textarea className="i t" value={editing.order?.notes || ""} onChange={(e) => setOrder({ notes: e.target.value })} /></label>

        {/* Płatność */}
        <div className="docForm__section">Płatność</div>
        <label className="f"><span className="l">Cena (netto) [zł]</span><input type="number" step="0.01" className="i i--md" placeholder="np. 3500" value={editing.payment?.priceNet || ""} onChange={(e) => setPayment({ priceNet: e.target.value })} /></label>
        <label className="f"><span className="l">Przedpłata (netto) [zł]</span><input type="number" step="0.01" className="i i--md" placeholder="np. 1000" value={editing.payment?.prepaymentNet || ""} onChange={(e) => setPayment({ prepaymentNet: e.target.value })} /></label>
        <label className="f"><span className="l">Termin płatności</span><input className="i i--md" value={editing.payment?.terms || ""} onChange={(e) => setPayment({ terms: e.target.value })} /></label>

        {/* PROCES GŁÓWNY — FORMULARZ (full width) */}
        <div className="docForm__section f--span3">Proces główny — statusy, daty, pliki</div>
        <div className="card card--wide f--span3">
          {/* 1. Przyjęcie próbek */}
          <div className="grid2">
            <div>
              <h3>Przyjęcie próbek</h3>
              <label className="f f--row"><input type="checkbox" checked={!!editing.process?.sampleIntake?.received} onChange={(e) => setProcIntake({ received: e.target.checked })} /><span>Próbki dostarczone</span></label>
              <label className="f"><span className="l">Dostarczono (data i godz.)</span><input type="datetime-local" className="i i--md" value={editing.process?.sampleIntake?.receivedAt || ""} onChange={(e) => setProcIntake({ receivedAt: e.target.value })} /></label>
              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.intake || ""} onChange={(e) => setProcNotes("intake", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.intake?.at || "—"} przez {editing.process?.audit?.intake?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("intake")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 2. Protokół przyjęcia próbki */}
          <div className="grid2">
            <div>
              <h3>Protokół przyjęcia próbki</h3>
              <label className="f"><span className="l">Nr protokołu</span><input className="i i--md" value={editing.process?.intakeProtocol?.number || ""} onChange={(e) => setProcIntakeProtocol({ number: e.target.value })} /></label>
              <label className="f"><span className="l">Kod(y) próbek</span><input className="i i--lg" value={editing.process?.intakeProtocol?.sampleCode || ""} onChange={(e) => setProcIntakeProtocol({ sampleCode: e.target.value })} /></label>
              <label className="f"><span className="l">Przyjęto (data i godz.)</span><input type="datetime-local" className="i i--md" value={editing.process?.intakeProtocol?.acceptedAt || ""} onChange={(e) => setProcIntakeProtocol({ acceptedAt: e.target.value })} /></label>

              {/* Drop protokołu */}
              <FileDrop
                label="Plik protokołu (PDF) — drag&drop lub wklej"
                onFiles={async (files) => {
                  if (!files?.length) return;
                  await dropToSingleUrl(files[0], setProcIntakeProtocol);
                }}
              >
                <label className="f">
                  <span className="l">URL</span>
                  <input className="i i--lg" value={editing.process?.intakeProtocol?.url || ""} onChange={(e) => setProcIntakeProtocol({ url: e.target.value })} />
                </label>
                {editing.process?.intakeProtocol?.url ? (<a className="docLink" href={editing.process.intakeProtocol.url} target="_blank" rel="noreferrer">otwórz protokół</a>) : null}
              </FileDrop>

              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.intakeProtocol || ""} onChange={(e) => setProcNotes("intakeProtocol", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.intakeProtocol?.at || "—"} przez {editing.process?.audit?.intakeProtocol?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("intakeProtocol")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 3. Program badań */}
          <div className="grid2">
            <div>
              <h3>Program badań</h3>
              <label className="f"><span className="l">Nr programu</span><input className="i i--md" value={editing.process?.testProgram?.number || ""} onChange={(e) => setProcTestProgram({ number: e.target.value })} /></label>
              <label className="f"><span className="l">Przygotowano</span><input type="datetime-local" className="i i--md" value={editing.process?.testProgram?.preparedAt || ""} onChange={(e) => setProcTestProgram({ preparedAt: e.target.value })} /></label>
              <label className="f"><span className="l">Zatwierdzono</span><input type="datetime-local" className="i i--md" value={editing.process?.testProgram?.approvedAt || ""} onChange={(e) => setProcTestProgram({ approvedAt: e.target.value })} /></label>

              {/* Drop programu */}
              <FileDrop
                label="Plik programu (PDF)"
                onFiles={async (files) => {
                  if (!files?.length) return;
                  await dropToSingleUrl(files[0], setProcTestProgram);
                }}
              >
                <label className="f">
                  <span className="l">URL</span>
                  <input className="i i--lg" value={editing.process?.testProgram?.url || ""} onChange={(e) => setProcTestProgram({ url: e.target.value })} />
                </label>
                {editing.process?.testProgram?.url ? (<a className="docLink" href={editing.process.testProgram.url} target="_blank" rel="noreferrer">otwórz program</a>) : null}
              </FileDrop>

              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.testProgram || ""} onChange={(e) => setProcNotes("testProgram", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.testProgram?.at || "—"} przez {editing.process?.audit?.testProgram?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("testProgram")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 4. Karty badań */}
          <div className="grid2">
            <div>
              <h3>Karty badań</h3>
              <label className="f f--row"><input type="checkbox" checked={!!editing.process?.testCards?.prepared} onChange={(e) => setProcTestCards({ prepared: e.target.checked })} /><span>Przygotowane</span></label>
              <label className="f"><span className="l">Przygotowano</span><input type="datetime-local" className="i i--md" value={editing.process?.testCards?.preparedAt || ""} onChange={(e) => setProcTestCards({ preparedAt: e.target.value })} /></label>

              {/* Drop kart (wiele) */}
              <FileDrop
                label="Pliki kart (PDF, wiele)"
                multiple
                onFiles={async (files) => {
                  if (!files?.length) return;
                  await dropToUrlsList(files, setProcTestCards, editing.process?.testCards?.urls || []);
                }}
              >
                <span className="l">URL-e kart</span>
                <UrlsEditor value={editing.process?.testCards?.urls || []} onChange={(urls) => setProcTestCards({ urls })} />
              </FileDrop>

              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.testCards || ""} onChange={(e) => setProcNotes("testCards", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.testCards?.at || "—"} przez {editing.process?.audit?.testCards?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("testCards")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 5. W trakcie badań */}
          <div className="grid2">
            <div>
              <h3>W trakcie badań</h3>
              <label className="f"><span className="l">Start</span><input type="datetime-local" className="i i--md" value={editing.process?.testing?.startedAt || ""} onChange={(e) => setProcTesting({ startedAt: e.target.value })} /></label>
              <label className="f"><span className="l">Koniec</span><input type="datetime-local" className="i i--md" value={editing.process?.testing?.finishedAt || ""} onChange={(e) => setProcTesting({ finishedAt: e.target.value })} /></label>
              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.testing || ""} onChange={(e) => setProcNotes("testing", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.testing?.at || "—"} przez {editing.process?.audit?.testing?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("testing")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 6. Weryfikacja dokumentacji */}
          <div className="grid2">
            <div>
              <h3>Weryfikacja dokumentacji</h3>
              <label className="f"><span className="l">Start</span><input type="datetime-local" className="i i--md" value={editing.process?.docsVerification?.started || ""} onChange={(e) => setProcVerification({ started: e.target.value })} /></label>
              <label className="f"><span className="l">Koniec</span><input type="datetime-local" className="i i--md" value={editing.process?.docsVerification?.finished || ""} onChange={(e) => setProcVerification({ finished: e.target.value })} /></label>
              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.verification || ""} onChange={(e) => setProcNotes("verification", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.verification?.at || "—"} przez {editing.process?.audit?.verification?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("verification")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 7. Raporty */}
          <div className="grid2">
            <div>
              <h3>Raporty</h3>
              <label className="f"><span className="l">Wygenerowano</span><input type="datetime-local" className="i i--md" value={editing.process?.reports?.generatedAt || ""} onChange={(e) => setProcReports({ generatedAt: e.target.value })} /></label>

              {/* Drop raportów (wiele) */}
              <FileDrop
                label="Pliki raportów (PDF, wiele)"
                multiple
                onFiles={async (files) => {
                  if (!files?.length) return;
                  await dropToUrlsList(files, setProcReports, editing.process?.reports?.urls || []);
                }}
              >
                <span className="l">URL-e raportów</span>
                <UrlsEditor value={editing.process?.reports?.urls || []} onChange={(urls) => setProcReports({ urls })} />
              </FileDrop>

              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.reports || ""} onChange={(e) => setProcNotes("reports", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.reports?.at || "—"} przez {editing.process?.audit?.reports?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("reports")}>Otwórz ↗</button>
            </div>
          </div>

          {/* 8. Pełna dokumentacja */}
          <div className="grid2">
            <div>
              <h3>Pełna dokumentacja</h3>
              <label className="f f--row"><input type="checkbox" checked={!!editing.process?.fullDocs?.ready} onChange={(e) => setProcFullDocs({ ready: e.target.checked })} /><span>Komplet gotowy</span></label>
              <label className="f"><span className="l">Gotowe</span><input type="datetime-local" className="i i--md" value={editing.process?.fullDocs?.readyAt || ""} onChange={(e) => setProcFullDocs({ readyAt: e.target.value })} /></label>

              {/* Drop pakietu */}
              <FileDrop
                label="Pakiet (ZIP/PDF)"
                onFiles={async (files) => {
                  if (!files?.length) return;
                  await dropToSingleUrl(files[0], setProcFullDocs);
                }}
              >
                <label className="f">
                  <span className="l">URL</span>
                  <input className="i i--lg" value={editing.process?.fullDocs?.url || ""} onChange={(e) => setProcFullDocs({ url: e.target.value })} />
                </label>
                {editing.process?.fullDocs?.url ? (<a className="docLink" href={editing.process.fullDocs.url} target="_blank" rel="noreferrer">otwórz pakiet</a>) : null}
              </FileDrop>

              <label className="f f--full"><span className="l">Uwagi do etapu</span><textarea className="i t" value={editing.process?.notes?.fullDocs || ""} onChange={(e) => setProcNotes("fullDocs", e.target.value)} /></label>
              <div className="hint">Ostatnio: {editing.process?.audit?.fullDocs?.at || "—"} przez {editing.process?.audit?.fullDocs?.by || "—"}</div>
            </div>
            <div style={{ justifySelf: "end" }}>
              <button type="button" className="ghost" onClick={() => goToSection("fullDocs")}>Otwórz ↗</button>
            </div>
          </div>
        </div>

        {/* DOKUMENTY WYGNEROWANE — skrót (linki) */}
        <div className="docForm__section f--span3">Dokumenty wygenerowane — skrót</div>
        <div className="card f--span3">
          <ul className="methods" style={{ marginTop: 6 }}>
            {editing.process?.intakeProtocol?.url ? (
              <li><b>Protokół przyjęcia próbki</b> — <a className="docLink" href={editing.process.intakeProtocol.url} target="_blank" rel="noreferrer">plik</a></li>
            ) : null}
            {editing.process?.testProgram?.url ? (
              <li><b>Program badań</b> — <a className="docLink" href={editing.process.testProgram.url} target="_blank" rel="noreferrer">plik</a></li>
            ) : null}
            {(editing.process?.testCards?.urls || []).map((u, i) => (
              <li key={`tc-${i}`}><b>Karta badania {i + 1}</b> — <a className="docLink" href={u} target="_blank" rel="noreferrer">plik</a></li>
            ))}
            {(editing.process?.reports?.urls || []).map((u, i) => (
              <li key={`rp-${i}`}><b>Raport {i + 1}</b> — <a className="docLink" href={u} target="_blank" rel="noreferrer">plik</a></li>
            ))}
            {editing.process?.fullDocs?.url ? (
              <li><b>Pełna dokumentacja</b> — <a className="docLink" href={editing.process.fullDocs.url} target="_blank" rel="noreferrer">pakiet</a></li>
            ) : null}
            {!editing.process?.intakeProtocol?.url &&
             !editing.process?.testProgram?.url &&
             !(editing.process?.testCards?.urls || []).length &&
             !(editing.process?.reports?.urls || []).length &&
             !editing.process?.fullDocs?.url ? (
              <li className="docInc__muted">Brak plików — uzupełnij w sekcji powyżej.</li>
            ) : null}
          </ul>
        </div>

        {/* Incydenty / uwagi operacyjne */}
        <section className="card f--span3">
          <OrderIncidents
            orderId={editing.id}
            currentUser={currentUser}
            defaultStage="W trakcie badań"
          />
        </section>
      </div>

      <div className="kb__actions">
        <div className="kb__spacer" />
        <button type="submit" className="ghost">Zapisz</button>
        {onCancelEdit ? (<button type="button" className="ghost" onClick={() => onCancelEdit()}>Anuluj</button>) : null}
      </div>

      <Toast />
    </form>
  );
}

// src/components/pages/contents/PB.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/documentation-orders.css";
import PBEquipmentRulesPanel from "./PBEquipmentRulesPanel";

/* ============== Mini Toast ============== */
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info", ttl = 2600) => {
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
          background:
            toast.type === "error" ? "#fecaca" : toast.type === "warn" ? "#fde68a" : "#dbeafe",
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

/* ============== Mocki (podmień przez props) ============== */
async function mockGetPBById(id) {
  if (!id || id === "pb-blank") {
    return {
      id: id || "pb-blank",
      programNumber: "",
      contractNumber: "",
      orderType: "",
      subject: "",
      startDate: "",
      endDate: "",
      preparedBy: "",
      checkedBy: "",
      verifiedBy: "",
      rows: [],
      notes: "",
    };
  }
  return {
    id,
    programNumber: "PB-2025/003",
    contractNumber: "ZL-2025/010",
    orderType: "zew",
    subject: "Akumulator rozruchowy 12V (VOLT-60)",
    startDate: "2025-09-18",
    endDate: "",
    preparedBy: "A. Nowak",
    checkedBy: "",
    verifiedBy: "",
    rows: [
      {
        sampleNo: "ZL-2025/010/1",
        feature: "Pojemność znamionowa",
        method: "PN-EN 60095-1:2018 p.6.1",
        equipment: "",
        sign: "",
      },
      {
        sampleNo: "ZL-2025/010/1",
        feature: "Prąd rozruchu na zimno",
        method: "PN-EN 60095-1:2018 p.6.2",
        equipment: "",
        sign: "",
      },
    ],
    notes: "",
  };
}

async function mockGetOrderById(orderId) {
  return {
    id: orderId,
    number: "ZL-2025/010",
    order: {
      subject: "Akumulator rozruchowy 12V",
      refGroups: [
        {
          ref: "PN-EN 60095-1:2018",
          methods: [
            { test: "Wymiary i oznaczenia", point: "4.1", acc: "A" },
            { test: "Pojemność znamionowa", point: "6.1", acc: "A" },
            { test: "Prąd rozruchu na zimno", point: "6.2", acc: "A" },
          ],
        },
        {
          ref: "PN-EN 50395:2000",
          methods: [
            { test: "Rezystancja przewodnika", point: "5.2", acc: "A" },
            { test: "Wytrzymałość elektryczna", point: "7.4", acc: "A" },
          ],
        },
      ],
    },
  };
}

/* ============== Reguły domyślne (fallback) ============== */
const defaultEquipmentRules = [
  { regex: "60095[-\\s]?1.*p\\.?\\s*6\\.1", equipment: "Stanowisko A1 (test pojemności, obciążenie kontrolowane)" },
  { regex: "60095[-\\s]?1.*p\\.?\\s*6\\.2", equipment: "Stanowisko A2 (test prądu rozruchu, klima -18°C)" },
  { regex: "60095[-\\s]?1.*p\\.?\\s*4\\.1", equipment: "Suwmiarka/taśma + wzorce (wymiary/oznaczenia)" },

  { regex: "50395.*p\\.?\\s*5\\.2", equipment: "Mostek pomiarowy R (4-przewodowy) + źródło prądu" },
  { regex: "50395.*p\\.?\\s*7\\.4", equipment: "Stanowisko HV (wytrzymałość elektryczna)" },

  { regex: "rezystancj", equipment: "Mostek pomiarowy R / miernik mikroohmów" },
  { regex: "wytrzymało.*elektr|hipot|dielectr|wysokie napięcie", equipment: "Stanowisko HV / hipot tester" },
  { regex: "pojemnoś", equipment: "Ładowarka/rozładowarka programowalna + akwizycja" },
  { regex: "prąd.*rozruch|cold cranking|cca", equipment: "Stanowisko rozruchowe + komora klimatyczna" },
  { regex: "wymiar|gabaryt|oznacze", equipment: "Suwmiarka/taśma + wzorce" },
];

/* ============== LocalStorage (per-lab) ============== */
const makeStorageKey = (labId) => `pb.equipmentRules.${labId || "default"}`;
function loadRules(labId) {
  const key = makeStorageKey(labId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((r) => r && typeof r.regex === "string" && typeof r.equipment === "string")
      .map((r) => ({ regex: r.regex, equipment: r.equipment }));
  } catch {
    return null;
  }
}

/* ============== Helpery metody→wiersze ============== */
const mapRefGroupsToRows = (orderObj, defaultSampleNo = "") => {
  const rows = [];
  const groups = orderObj?.order?.refGroups || [];
  groups.forEach((g) => {
    const ref = g?.ref || "";
    (g?.methods || []).forEach((m) => {
      const feature = m?.test || "";
      const point = m?.point ? ` p.${m.point}` : "";
      const method = `${ref}${point}`.trim();
      rows.push({
        sampleNo: defaultSampleNo,
        feature,
        method,
        equipment: "",
        sign: "",
      });
    });
  });
  return rows;
};

/* ============== Komponent główny PB ============== */
export default function PB({
  getPBById = mockGetPBById,
  onSavePB,
  order: orderProp,
  getOrderById = mockGetOrderById,
  prefillOrderId,
  labId = "default", // <<< profil laboratorium
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, Toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pb, setPB] = useState(null);
  const [orderForPrefill, setOrderForPrefill] = useState(orderProp || null);

  // reguły: spróbuj per-lab z localStorage, inaczej domyślne
  const [userRules, setUserRules] = useState(() => loadRules(labId) ?? defaultEquipmentRules.slice());
  const [showRules, setShowRules] = useState(false);

  // autopodpowiedzi
  const [autoEquip, setAutoEquip] = useState(true);

  // gdy zmieni się labId, przeładuj reguły (bez resetu istniejących wierszy)
  useEffect(() => {
    setUserRules(loadRules(labId) ?? defaultEquipmentRules.slice());
  }, [labId]);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [id]);

  // Ładowanie PB
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getPBById(id);
        const empty = {
          id: id || "pb-blank",
          programNumber: "",
          contractNumber: "",
          orderType: "",
          subject: "",
          startDate: "",
          endDate: "",
          preparedBy: "",
          checkedBy: "",
          verifiedBy: "",
          rows: [],
          notes: "",
        };
        if (alive) setPB(data || empty);
      } catch {
        if (alive) setPB(null);
        show("Nie udało się pobrać PB.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getPBById]);

  // Opcjonalne dogranie order do prefillu
  useEffect(() => {
    let alive = true;
    (async () => {
      if (orderProp) {
        setOrderForPrefill(orderProp);
        return;
      }
      if (!prefillOrderId) return;
      try {
        const o = await getOrderById(prefillOrderId);
        if (alive) setOrderForPrefill(o || null);
      } catch {
        if (alive) setOrderForPrefill(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [orderProp, prefillOrderId, getOrderById]);

  const setField = (patch) => setPB((cur) => ({ ...cur, ...patch }));
  const setRow = (i, patch) =>
    setPB((cur) => ({
      ...cur,
      rows: (cur?.rows || []).map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    }));
  const addRow = () =>
    setPB((cur) => ({
      ...cur,
      rows: [...(cur?.rows || []), { sampleNo: "", feature: "", method: "", equipment: "", sign: "" }],
    }));
  const delRow = (i) =>
    setPB((cur) => ({ ...cur, rows: (cur?.rows || []).filter((_, idx) => idx !== i) }));

  const canSave = useMemo(() => {
    if (!pb) return false;
    const nonEmpty = (v) => String(v || "").trim().length > 0;
    return (
      nonEmpty(pb.programNumber) &&
      nonEmpty(pb.contractNumber) &&
      nonEmpty(pb.subject) &&
      nonEmpty(pb.orderType) &&
      nonEmpty(pb.startDate)
    );
  }, [pb]);

  const handleSave = () => {
    if (!canSave) {
      show(
        "Uzupełnij wymagane pola: Przedmiot, Rodzaj zlecenia, Nr umowy, Data rozpoczęcia, Nr PB.",
        "error"
      );
      return;
    }
    if (onSavePB) onSavePB(pb);
    console.log("PB save()", pb);
    show("PB zapisany (mock).", "info");
  };

  // dopasowanie wyposażenia
  const guessEquipment = (method) => {
    const source = userRules && userRules.length ? userRules : defaultEquipmentRules;
    const m = String(method || "").trim();
    for (const r of source) {
      try {
        const re = new RegExp(r.regex, "i");
        if (re.test(m)) return r.equipment;
      } catch {
        // pomiń błędny regex
      }
    }
    return "";
  };

  // Prefill z metod zlecenia → dodaj (nie nadpisuj)
  const insertFromOrder = () => {
    if (!orderForPrefill) {
      show(
        "Brak danych zlecenia do wstawienia (podaj props: order lub prefillOrderId).",
        "warn"
      );
      return;
    }
    const current = Array.isArray(pb?.rows) ? pb.rows : [];
    const sampleDefault =
      current.find((r) => r?.sampleNo)?.sampleNo || orderForPrefill?.number || "";
    const mapped = mapRefGroupsToRows(orderForPrefill, sampleDefault);
    if (!mapped.length) {
      show("Zlecenie nie zawiera metod (refGroups) do wstawienia.", "warn");
      return;
    }
    setPB((cur) => ({ ...cur, rows: [...current, ...mapped] }));
    show(`Dodano ${mapped.length} pozycji z metod zlecenia.`, "info");
  };

  const bulkSuggestEquipment = () => {
    if (!pb?.rows?.length) return;
    let changed = 0;
    setPB((cur) => {
      const rows = (cur?.rows || []).map((r) => {
        if (String(r.equipment || "").trim()) return r;
        const s = guessEquipment(r.method);
        if (s) {
          changed += 1;
          return { ...r, equipment: s };
        }
        return r;
      });
      return { ...cur, rows };
    });
    show(changed ? `Uzupełniono wyposażenie w ${changed} pozycjach.` : "Brak pozycji do uzupełnienia.", changed ? "info" : "warn");
  };

  if (loading) return <div className="kb__empty">Wczytywanie…</div>;
  if (!pb) return <div className="kb__empty">Nie znaleziono PB.</div>;

  return (
    <form
      className="docForm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="kb__actions">
        <div className="chips">
          <span className="chip">Program badań</span>
          {pb.programNumber ? (
            <span className="chip chip--ok">{pb.programNumber}</span>
          ) : (
            <span className="chip chip--warn">bez numeru</span>
          )}
        </div>
        <div className="kb__spacer" />
        <label
          className="f f--row"
          title="Gdy włączone, wyposażenie będzie uzupełniane automatycznie na podstawie metody (jeśli puste)."
        >
          <input
            type="checkbox"
            checked={autoEquip}
            onChange={(e) => setAutoEquip(e.target.checked)}
          />
          <span>Autopodpowiedzi wyposażenia (beta)</span>
        </label>
        <button className="ghost" type="button" onClick={bulkSuggestEquipment} aria-label="Uzupełnij wyposażenie dla pustych pozycji">
          💡 Uzupełnij wyposażenie (puste)
        </button>
        <button className="ghost" type="button" onClick={() => setShowRules((s) => !s)}>
          ⚙️ Reguły
        </button>
        <button className="ghost" type="button" onClick={insertFromOrder}>
          ⤴ Wstaw z metod zlecenia
        </button>
        <button className="ghost" type="button" onClick={() => navigate(-1)}>
          Wstecz
        </button>
        <button className="ghost" type="submit" disabled={!canSave}>
          Zapisz
        </button>
      </div>

      {showRules && (
        <div className="f f--span3" style={{ marginBottom: 16 }}>
          <PBEquipmentRulesPanel
            rules={userRules}
            setRules={setUserRules}
            onClose={() => setShowRules(false)}
            defaultRules={defaultEquipmentRules}
            storageKey={makeStorageKey(labId)}
          />
        </div>
      )}

      <div className="docForm__grid">
        {/* Nagłówek PB */}
        <label className="f f--span3">
          <span className="l">Przedmiot badań / wyrób *</span>
          <input
            className="i"
            value={pb.subject || ""}
            onChange={(e) => setField({ subject: e.target.value })}
            required
          />
        </label>

        <div className="f f--span3">
          <span className="l">Na zlecenie *</span>
          <div className="f f--row" style={{ gap: 8, flexWrap: "wrap" }}>
            {[
              { k: "zew", label: "ZEW — zewnętrzne" },
              { k: "wew", label: "WEW — wewnętrzne" },
              { k: "bw", label: "BW — badania własne" },
            ].map((opt) => (
              <label
                key={opt.k}
                className={`chip ${pb.orderType === opt.k ? "chip--ok" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="radio"
                  name="pbOrderType"
                  checked={pb.orderType === opt.k}
                  onChange={() => setField({ orderType: opt.k })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="f">
          <span className="l">Nr zlecenia / umowy *</span>
          <input
            className="i i--md"
            value={pb.contractNumber || ""}
            onChange={(e) => setField({ contractNumber: e.target.value })}
            required
          />
        </label>

        <label className="f">
          <span className="l">Data rozpoczęcia badań *</span>
          <input
            type="date"
            className="i i--md"
            value={pb.startDate || ""}
            onChange={(e) => setField({ startDate: e.target.value })}
            required
          />
        </label>

        <label className="f">
          <span className="l">Data zakończenia badań</span>
          <input
            type="date"
            className="i i--md"
            value={pb.endDate || ""}
            onChange={(e) => setField({ endDate: e.target.value })}
          />
        </label>

        <label className="f">
          <span className="l">Nr PB *</span>
          <input
            className="i i--md"
            value={pb.programNumber || ""}
            onChange={(e) => setField({ programNumber: e.target.value })}
            required
          />
        </label>

        <label className="f">
          <span className="l">Kartę opracował</span>
          <input
            className="i i--md"
            value={pb.preparedBy || ""}
            onChange={(e) => setField({ preparedBy: e.target.value })}
          />
        </label>

        <label className="f">
          <span className="l">Sprawdził</span>
          <input
            className="i i--md"
            value={pb.checkedBy || ""}
            onChange={(e) => setField({ checkedBy: e.target.value })}
          />
        </label>

        <label className="f">
          <span className="l">Zweryfikował</span>
          <input
            className="i i--md"
            value={pb.verifiedBy || ""}
            onChange={(e) => setField({ verifiedBy: e.target.value })}
          />
        </label>

        {/* Tabela pozycji */}
        <div className="docForm__section f--span3">Plan badań (pozycje)</div>
        <div className="card f--span3">
          <div
            className="methods-docs__headRow"
            style={{ gridTemplateColumns: "1.2fr 2fr 2fr 1.6fr 1fr 40px" }}
          >
            <div>Nr próbki</div>
            <div>Badana cecha</div>
            <div>Metoda badań</div>
            <div>Wyposażenie</div>
            <div>Potwierdzenie</div>
            <div />
          </div>

          {(pb.rows || []).map((r, i) => {
            const suggestion = guessEquipment(r.method);
            const canApplySuggestion =
              suggestion && !String(r.equipment || "").trim();

            return (
              <div
                key={i}
                className="methods-docs__row"
                style={{ gridTemplateColumns: "1.2fr 2fr 2fr 1.6fr 1fr 40px" }}
              >
                <input
                  className="i i--md"
                  value={r.sampleNo || ""}
                  onChange={(e) => setRow(i, { sampleNo: e.target.value })}
                />
                <input
                  className="i i--lg"
                  value={r.feature || ""}
                  onChange={(e) => setRow(i, { feature: e.target.value })}
                />
                <input
                  className="i i--lg"
                  value={r.method || ""}
                  onChange={(e) => {
                    const nextMethod = e.target.value;
                    setRow(i, { method: nextMethod });
                    if (autoEquip) {
                      const auto = guessEquipment(nextMethod);
                      setPB((cur) => {
                        const rows = [...(cur?.rows || [])];
                        const row = { ...(rows[i] || {}) };
                        if (!String(row.equipment || "").trim() && auto) {
                          row.equipment = auto;
                          rows[i] = row;
                          return { ...cur, rows };
                        }
                        return cur;
                      });
                    }
                  }}
                  onBlur={(e) => {
                    if (!autoEquip) return;
                    const auto = guessEquipment(e.target.value);
                    if (!auto) return;
                    setPB((cur) => {
                      const rows = [...(cur?.rows || [])];
                      const row = { ...(rows[i] || {}) };
                      if (!String(row.equipment || "").trim()) {
                        row.equipment = auto;
                        rows[i] = row;
                        return { ...cur, rows };
                      }
                      return cur;
                    });
                  }}
                  placeholder="np. PN-EN 60095-1:2018 p.6.2"
                  aria-label="Metoda badań"
                />
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="i i--md"
                    value={r.equipment || ""}
                    onChange={(e) => setRow(i, { equipment: e.target.value })}
                    placeholder={suggestion ? `np. ${suggestion}` : "—"}
                    aria-label="Wyposażenie"
                  />
                  <button
                    type="button"
                    className="ghost"
                    title={suggestion ? `Wstaw sugestię: ${suggestion}` : "Brak sugestii"}
                    disabled={!canApplySuggestion}
                    onClick={() => {
                      if (canApplySuggestion) setRow(i, { equipment: suggestion });
                    }}
                    aria-label="Wstaw sugerowane wyposażenie"
                  >
                    💡
                  </button>
                </div>
                <input
                  className="i i--sm"
                  value={r.sign || ""}
                  onChange={(e) => setRow(i, { sign: e.target.value })}
                  aria-label="Potwierdzenie"
                />
                <button
                  type="button"
                  className="ghost"
                  title="Usuń wiersz"
                  onClick={() => delRow(i)}
                  aria-label="Usuń wiersz"
                >
                  🗑
                </button>
              </div>
            );
          })}

          <button type="button" className="ghost" onClick={addRow}>
            + dodaj pozycję
          </button>
          <div className="hint" style={{ marginTop: 8 }}>
            Wskazówka: „Metoda badań” to numer normy i ewentualny punkt (np. „PN-EN 60095-1:2018 p.6.1”).
          </div>
        </div>

        {/* Uwagi */}
        <label className="f f--span3">
          <span className="l">Uwagi</span>
          <textarea
            className="i t"
            value={pb.notes || ""}
            onChange={(e) => setField({ notes: e.target.value })}
          />
        </label>
      </div>

      <div className="kb__actions">
        <div className="kb__spacer" />
        <button className="ghost" type="button" onClick={() => navigate(-1)}>
          Wstecz
        </button>
        <button className="ghost" type="submit" disabled={!canSave}>
          Zapisz
        </button>
      </div>

      <Toast />
    </form>
  );
}

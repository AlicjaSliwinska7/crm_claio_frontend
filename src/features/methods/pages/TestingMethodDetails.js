import React, { useMemo } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import "../styles/methods-details.css";
import { CheckCircle2, XCircle } from "lucide-react";

/** 🔎 Fallback: podstawowe szczegóły po numerze metody (demo) */
const METHOD_DETAILS = {
  "M-PL-001": {
    methodName: "Rozciąganie próbek typu 1A",
    accredited: true,
    description: "Oznaczanie właściwości mechanicznych przy rozciąganiu dla tworzyw sztucznych – próbki 1A.",
    sampleTypes: ["tworzywa sztuczne", "kompozyty"],
    requirements: ["Kondycjonowanie próbek min. 24h w 23°C / 50%RH", "Brak widocznych wad i uszkodzeń krawędzi"],
    parameters: [
      { name: "Prędkość głowicy", nominal: "5", unit: "mm/min", range: "4.5 – 5.5" },
      { name: "Długość pomiarowa", nominal: "50", unit: "mm", range: "50 ± 1" },
    ],
    measuredValues: [
      { name: "Wytrzymałość na rozciąganie Rm", unit: "MPa" },
      { name: "Moduł sprężystości E", unit: "MPa" },
      { name: "Wydłużenie przy zerwaniu A", unit: "%" },
    ],
    environment: [
      { name: "Temperatura", required: "23 ± 2 °C" },
      { name: "Wilgotność", required: "50 ± 10 %RH" },
    ],
    procedure: ["Montaż próbki i wyzerowanie czujników.", "Ustawienie prędkości głowicy.", "Rejestracja przebiegu do zerwania."],
  },
  "M-PL-002": {
    methodName: "Rozciąganie próbek typu 1B",
    accredited: false,
    description: "Wariant metody dla próbek 1B. Parametry jak dla 1A, z korektą długości pomiarowej.",
    sampleTypes: ["tworzywa sztuczne"],
    requirements: ["Kondycjonowanie 24h w 23°C/50%RH"],
    parameters: [{ name: "Prędkość głowicy", nominal: "5", unit: "mm/min", range: "4.5 – 5.5" }],
    measuredValues: [{ name: "Rm", unit: "MPa" }, { name: "A", unit: "%" }],
    environment: [{ name: "Temperatura", required: "23 ± 2 °C" }, { name: "Wilgotność", required: "50 ± 10 %RH" }],
    procedure: ["Montaż", "Ustawienia", "Pomiar"],
  },
  "M-PL-003": {
    methodName: "Wyznaczanie modułu sprężystości",
    accredited: true,
    description: "Wyznaczanie modułu w zakresie liniowo-sprężystym.",
    sampleTypes: ["tworzywa", "kompozyty"],
    requirements: ["Kontakt próbek gładki, brak luzów w uchwytach."],
    parameters: [{ name: "Zakres siły", nominal: "—", unit: "N", range: "dobrany do materiału" }],
    measuredValues: [{ name: "E", unit: "MPa" }],
    environment: [{ name: "Temperatura", required: "23 ± 2 °C" }],
    procedure: ["Kalibracja", "Sekwencja obciążenia", "Wyznaczenie E"],
  },
  "M-PL-010": {
    methodName: "Twardość Shore A",
    accredited: true,
    description: "Oznaczanie twardości Shore A wyrobów z elastomerów.",
    sampleTypes: ["elastomery", "guma"],
    requirements: ["Grubość próbki ≥ 6 mm (lub pakiet)"],
    parameters: [{ name: "Czas odczytu", nominal: "3", unit: "s", range: "3 ± 1" }],
    measuredValues: [{ name: "Twardość Shore A", unit: "A" }],
    environment: [{ name: "Temperatura", required: "23 ± 2 °C" }],
    procedure: ["Kondycjonowanie", "Przyłożenie wgłębnika", "Odczyt po czasie"],
  },
  "M-PL-011": {
    methodName: "Twardość Shore D",
    accredited: true,
    description: "Oznaczanie twardości Shore D materiałów twardszych.",
    sampleTypes: ["tworzywa twarde"],
    requirements: ["Powierzchnia gładka, bez porów"],
    parameters: [{ name: "Czas odczytu", nominal: "3", unit: "s", range: "3 ± 1" }],
    measuredValues: [{ name: "Twardość Shore D", unit: "D" }],
    environment: [{ name: "Temperatura", required: "23 ± 2 °C" }, { name: "Wilgotność", required: "50 ± 10 %RH" }],
    procedure: ["Kondycjonowanie", "Pomiar w 5 punktach", "Średnia"],
  },
  "M-PL-020": {
    methodName: "Zginanie trójpunktowe",
    accredited: false,
    description: "Wyznaczanie właściwości zginania w układzie 3-punktowym.",
    sampleTypes: ["kompozyty", "tworzywa"],
    requirements: ["Wymiary zgodne z normą, brak uszkodzeń krawędzi."],
    parameters: [{ name: "Rozstaw podpór", nominal: "16×t", unit: "mm", range: "wg normy" }],
    measuredValues: [{ name: "Moduł zginania", unit: "MPa" }, { name: "Naprężenie przy zginaniu", unit: "MPa" }],
    environment: [{ name: "Temperatura", required: "23 ± 2 °C" }, { name: "Wilgotność", required: "50 ± 10 %RH" }],
    procedure: ["Ustawienie podpór", "Obciążanie do zniszczenia/odkształcenia", "Opracowanie wyników"],
  },
};

const Badge = ({ ok }) =>
  ok ? (
    <span className="status-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <CheckCircle2 size={16} /> akredytowana
    </span>
  ) : (
    <span className="status-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <XCircle size={16} /> nieakredytowana
    </span>
  );

export default function TestingMethodDetails({ catalog }) {
  const { methodNo } = useParams();
  const { state } = useLocation();

  // dane bazowe z state (przekazane z listy), z opcjonalnym dopełnieniem szczegółów:
  const base = state?.method || { methodNo, methodName: "", accredited: false, title: "", standardNo: "" };

  // znajdź w zewn. katalogu (jeśli podano), w przeciwnym razie w fallbacku
  const extra = useMemo(() => {
    if (catalog && Array.isArray(catalog)) {
      for (const std of catalog) {
        const hit = (std.methods || []).find((m) => m.methodNo === methodNo);
        if (hit) return { methodName: hit.methodName, accredited: !!hit.accredited };
      }
    }
    return METHOD_DETAILS[methodNo] || {};
  }, [catalog, methodNo]);

  const merged = { ...extra, ...base, methodNo };

  return (
    <div className="clients-list" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>
          {merged.methodNo} — {merged.methodName || "Metoda badawcza"}
        </h1>
        <Badge ok={!!merged.accredited} />
      </div>

      {(merged.standardNo || merged.title) && (
        <p className="muted" style={{ marginTop: 6 }}>
          Norma/dokument: <strong>{merged.standardNo}</strong> {merged.title ? `— ${merged.title}` : ""}
        </p>
      )}

      {merged.description && (
        <section style={{ marginTop: 16 }}>
          <h3>Opis</h3>
          <p>{merged.description}</p>
        </section>
      )}

      {Array.isArray(merged.sampleTypes) && merged.sampleTypes.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Rodzaje próbek</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {merged.sampleTypes.map((s) => (
              <span key={s} className="status-badge" title="Rodzaj próbki">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(merged.requirements) && merged.requirements.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Wymagania</h3>
          <ul style={{ margin: "6px 0 0 16px" }}>
            {merged.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>
      )}

      {Array.isArray(merged.parameters) && merged.parameters.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Parametry nastaw / warunki pomiaru</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Parametr</th>
                  <th>Nominalna</th>
                  <th>Jedn.</th>
                  <th>Zakres / tolerancja</th>
                </tr>
              </thead>
              <tbody>
                {merged.parameters.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td style={{ textAlign: "center" }}>{p.nominal ?? "—"}</td>
                    <td style={{ textAlign: "center" }}>{p.unit ?? "—"}</td>
                    <td>{p.range ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {Array.isArray(merged.measuredValues) && merged.measuredValues.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Mierzone wielkości</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Wielkość</th>
                  <th>Jedn.</th>
                </tr>
              </thead>
              <tbody>
                {merged.measuredValues.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.name}</td>
                    <td style={{ textAlign: "center" }}>{m.unit || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {Array.isArray(merged.environment) && merged.environment.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Warunki środowiskowe</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Wielkość</th>
                  <th>Wymagany zakres</th>
                </tr>
              </thead>
              <tbody>
                {merged.environment.map((e, idx) => (
                  <tr key={idx}>
                    <td>{e.name}</td>
                    <td>{e.required}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {Array.isArray(merged.procedure) && merged.procedure.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>Procedura</h3>
          <ol style={{ margin: "6px 0 0 16px" }}>
            {merged.procedure.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <div style={{ marginTop: 20 }}>
        {/* Względny powrót: działa i z /metody-badawcze/spis/:id i z /dokumentacja/metody/:id */}
        <Link to=".." relative="path" className="link-like">
          &larr; Wróć do listy metod
        </Link>
      </div>
    </div>
  );
}

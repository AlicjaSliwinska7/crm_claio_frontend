import React, { useMemo, useState } from "react";

/** Słowniki */
const DOMAINS = [
  { key: "process",  label: "Proces" },
  { key: "facility", label: "Utrzymanie ruchu" },
  { key: "safety",   label: "BHP" },
  { key: "supplier", label: "Dostawca" },
  { key: "hr",       label: "HR" },
  { key: "other",    label: "Inne" },
];

const SEVERITY = [
  { key: "low",  label: "Niska",   weight: 1 },
  { key: "med",  label: "Średnia", weight: 2 },
  { key: "high", label: "Wysoka",  weight: 3 },
];

const LIKELIHOOD = [
  { key: "unlikely", label: "Mało prawdopodobne", weight: 1 },
  { key: "possible", label: "Możliwe",            weight: 2 },
  { key: "likely",   label: "Prawdopodobne",      weight: 3 },
];

const calcRisk = (sev, lik) => {
  const s = SEVERITY.find(x => x.key === sev)?.weight ?? 0;
  const l = LIKELIHOOD.find(x => x.key === lik)?.weight ?? 0;
  return s * l; // 1..9
};

const validate = (v) => {
  const e = {};
  if (!v.title?.trim()) e.title = "Podaj tytuł.";
  if (!v.domain) e.domain = "Wybierz domenę.";
  if (!v.severity) e.severity = "Wybierz istotność.";
  if (!v.likelihood) e.likelihood = "Wybierz prawdopodobieństwo.";
  if (!v.description?.trim()) e.description = "Opisz problem.";
  if (!v.anonymous && !v.contact?.trim()) e.contact = "Podaj kontakt (lub zaznacz anonimowo).";
  return e;
};

/**
 * Props:
 * - onCreate(payload)
 * - onCancel()
 * - initialLocation?: string
 */
export default function NewGeneralProblemForm({ onCreate, onCancel, initialLocation = "" }) {
  const [values, setValues] = useState({
    title: "",
    domain: "",
    location: initialLocation,
    severity: "med",
    likelihood: "possible",
    description: "",
    tags: "",
    anonymous: false,
    contact: "",
    attachments: [],
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (patch) => setValues(v => ({ ...v, ...patch }));

  const riskScore = useMemo(
    () => calcRisk(values.severity, values.likelihood),
    [values.severity, values.likelihood]
  );

  const errors = useMemo(() => validate(values), [values]);

  const err = (k) =>
    touched[k] && errors[k] ? <div className="gpf__err">{errors[k]}</div> : null;

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    set({ attachments: files });
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, domain: true, severity: true, likelihood: true, description: true, contact: true });
    const ees = validate(values);
    if (Object.keys(ees).length) return;

    setSubmitting(true);
    try {
      const payload = {
        id: `gen-${Math.random().toString(36).slice(2, 7)}`,
        title: values.title.trim(),
        domain: values.domain || "other",
        location: values.location?.trim() || "",
        risk: { severity: values.severity, likelihood: values.likelihood, score: riskScore },
        status: "new",
        createdAt: new Date().toISOString(),
        description: values.description.trim(),
        tags: values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        reporter: values.anonymous ? "anonymous" : (values.contact?.trim() || "anon"),
        attachments: values.attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
      };
      onCreate?.(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel gpf gpf--card" onSubmit={submit}>
      <div className="gpf__grid">
        {/* Tytuł */}
        <label className="gpf__field">
          <span className="gpf__label">Tytuł <em>*</em></span>
          <input
            className="gpf__input"
            value={values.title}
            onChange={(e) => set({ title: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, title: true }))}
            placeholder="Krótki opis, np. Rozlany olej przy M12"
          />
          {err("title")}
        </label>

        {/* Domena */}
        <label className="gpf__field">
          <span className="gpf__label">Domena <em>*</em></span>
          <select
            className="gpf__select"
            value={values.domain}
            onChange={(e) => set({ domain: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, domain: true }))}
          >
            <option value="">— wybierz —</option>
            {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
          {err("domain")}
        </label>

        {/* Lokalizacja */}
        <label className="gpf__field">
          <span className="gpf__label">Lokalizacja</span>
          <input
            className="gpf__input"
            value={values.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="np. Hala A, Magazyn, Biuro 2p…"
          />
        </label>

        {/* (Puste, by lokalizacja poszła sama w rządzie) */}
        <div className="gpf__field gpf__field--placeholder" aria-hidden />

        {/* Ryzyko */}
        <div className="gpf__risk">
          <div className="gpf__riskRow">
            <label className="gpf__field">
              <span className="gpf__label">Istotność (severity) <em>*</em></span>
              <select
                className="gpf__select"
                value={values.severity}
                onChange={(e) => set({ severity: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, severity: true }))}
              >
                {SEVERITY.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              {err("severity")}
            </label>

            <label className="gpf__field">
              <span className="gpf__label">Prawdopodobieństwo (likelihood) <em>*</em></span>
              <select
                className="gpf__select"
                value={values.likelihood}
                onChange={(e) => set({ likelihood: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, likelihood: true }))}
              >
                {LIKELIHOOD.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
              {err("likelihood")}
            </label>

            <div className="gpf__riskBadge" title="severity × likelihood">
              Ryzyko: <b>{riskScore}</b>/9
            </div>
          </div>
        </div>

        {/* Divider nad opisem */}
        <div className="gpf__divider" />

        {/* Opis */}
        <label className="gpf__field gpf__field--full">
          <span className="gpf__label">Opis <em>*</em></span>
          <textarea
            className="gpf__textarea"
            rows={6}
            value={values.description}
            onChange={(e) => set({ description: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, description: true }))}
            placeholder="Co się stało? Kiedy? Kto był obecny? Jakie skutki? Jakie szybkie działania?"
          />
          {err("description")}
        </label>

        {/* Tagi */}
        <label className="gpf__field">
          <span className="gpf__label">Tagi (opcjonalnie)</span>
          <input
            className="gpf__input"
            value={values.tags}
            onChange={(e) => set({ tags: e.target.value })}
            placeholder="np. 5S, ergonomia, dostawy (oddziel przecinkami)"
          />
        </label>

        {/* Anonimowość */}
        <div className="gpf__field">
          <label className="gpf__switch">
            <input
              type="checkbox"
              checked={values.anonymous}
              onChange={(e) => set({ anonymous: e.target.checked })}
            />
            Zgłoś anonimowo
          </label>
        </div>

        {/* Kontakt */}
        <label className="gpf__field">
          <span className="gpf__label">
            Kontakt {values.anonymous ? "(opcjonalnie)" : <em>*</em>}
          </span>
          <input
            className="gpf__input"
            value={values.contact}
            onChange={(e) => set({ contact: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, contact: true }))}
            placeholder="Imię i nazwisko / email / telefon"
            disabled={values.anonymous}
          />
          {!values.anonymous && err("contact")}
        </label>

        {/* Załączniki */}
        <div className="gpf__field gpf__field--full">
          <span className="gpf__label">Załączniki (opcjonalnie)</span>
          <input className="gpf__file" type="file" multiple onChange={onPickFiles} />
          {!!values.attachments.length && (
            <ul className="gpf__files">
              {values.attachments.map((f, i) => (
                <li key={i}>
                  <span className="gpf__fileName">{f.name}</span>
                  <span className="gpf__fileMeta">{Math.round(f.size / 1024)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="gpf__actions">
        <button type="button" className="ghost" onClick={onCancel}>Anuluj</button>
        <button type="submit" className="primary" disabled={submitting}>Zapisz zgłoszenie</button>
      </div>
    </form>
  );
}

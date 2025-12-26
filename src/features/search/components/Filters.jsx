const TYPES = [
  { id: "client", label: "Klienci" },
  { id: "offer", label: "Oferty" },
  { id: "order", label: "Zlecenia" },
  { id: "sample", label: "Próbki" },
  { id: "document", label: "Dokumenty" },
  { id: "equipment", label: "Wyposażenie" },
  { id: "training", label: "Szkolenia" },
  { id: "post", label: "Posty" },
  { id: "message", label: "Wiadomości" },
];

export default function Filters({ filters, onChange, sort, onSortChange }) {
  function toggleType(id) {
    const next = new Set(filters.types);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange({ ...filters, types: next });
  }
  function handleSort(e) {
    const [by, dir] = e.target.value.split(":");
    onSortChange({ by, dir });
  }

  return (
    <div className="filters">
      <section>
        <h3>Typ</h3>
        <ul className="checklist">
          {TYPES.map(t => (
            <li key={t.id}>
              <label>
                <input type="checkbox" checked={filters.types.has(t.id)} onChange={() => toggleType(t.id)} />
                <span>{t.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Sortowanie</h3>
        <select value={`${sort.by}:${sort.dir}`} onChange={handleSort}>
          <option value="relevance:desc">Trafność ⬇︎</option>
          <option value="relevance:asc">Trafność ⬆︎</option>
          <option value="date:desc">Data ⬇︎</option>
          <option value="date:asc">Data ⬆︎</option>
          <option value="title:asc">Tytuł A→Z</option>
          <option value="title:desc">Tytuł Z→A</option>
        </select>
      </section>
    </div>
  );
}

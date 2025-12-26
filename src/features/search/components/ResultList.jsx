export default function ResultList({ items, loading, page, pageSize, onPageChange, onPageSizeChange }) {
  if (loading) return <div className="results-skel">Wczytywanie…</div>;
  if (!items.length) return <div className="results-empty">Brak wyników.</div>;

  return (
    <div className="results-wrap">
      <ul className="results-list">
        {items.map(item => (
          <li key={`${item.type}-${item.id}`} className="result-item">
            <a href={item.url} className="result-title">{item.title}</a>
            <div className="result-sub">
              <span className={`pill pill--${item.type}`}>{mapType(item.type)}</span>
              {item.subtitle ? <span className="muted"> • {item.subtitle}</span> : null}
              {item.date ? <span className="muted"> • {formatDate(item.date)}</span> : null}
              {item.status ? <span className="muted"> • {item.status}</span> : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>←</button>
        <span>Strona {page}</span>
        <button onClick={() => onPageChange(page + 1)}>→</button>

        <select aria-label="Wyników na stronę" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/stronę</option>)}
        </select>
      </div>
    </div>
  );
}

function mapType(t) {
  switch (t) {
    case "client": return "Klient";
    case "offer": return "Oferta";
    case "order": return "Zlecenie";
    case "sample": return "Próbka";
    case "document": return "Dokument";
    case "equipment": return "Wyposażenie";
    case "training": return "Szkolenie";
    case "post": return "Post";
    case "message": return "Wiadomość";
    default: return t;
  }
}
function formatDate(d) { try { return new Date(d).toLocaleDateString("pl-PL"); } catch { return d; } }

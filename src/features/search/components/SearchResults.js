import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const MIN_QUERY_LEN = 2;

// Prosty mock na potrzeby DEV fallbacku (gdy backend jeszcze nie zwraca JSON)
const DEV_MOCK = [
  { id: 'c-1', type: 'client',    title: 'ACME Sp. z o.o.',  subtitle: 'Klient • Kraków',  url: '/sprzedaz/klienci/ACME', date: '2025-06-01' },
  { id: 'o-42', type: 'offer',    title: 'Oferta #42',       subtitle: 'ACME • HPLC',      url: '/sprzedaz/oferty/42',    date: '2025-07-12' },
  { id: 's-7',  type: 'sample',   title: 'Próbka #S-7',      subtitle: 'PP/2025/0007',     url: '/probki/rejestr/7',      date: '2025-07-20' },
  { id: 'd-3',  type: 'document', title: 'Instrukcja PPP v2',subtitle: 'Dokument',         url: '/dokumenty/3',           date: '2025-04-10' },
];

export default function SearchResults() {
  const { search } = useLocation();
  const q = useMemo(() => (new URLSearchParams(search).get('q') || '').trim(), [search]);

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [items, setItems]   = useState([]);

  useEffect(() => {
    const ctrl = new AbortController();
    setError('');
    setItems([]);

    if (q.length < MIN_QUERY_LEN) return;

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          throw new Error(`Endpoint /api/search nie zwrócił JSON (Content-Type: ${ct})`);
        }
        return r.json();
      })
      .then((data) => {
        // akceptujemy dwie formy: { results: [] } albo { groups: { all: [] } }
        let list = [];
        if (Array.isArray(data?.results)) list = data.results;
        else if (data?.groups && Array.isArray(data.groups.all)) list = data.groups.all;
        else if (Array.isArray(data)) list = data;
        else list = [];

        setItems(list);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Czytelny komunikat + fallback w trybie dev
        const msg = err?.message || 'Błąd wyszukiwania';
        setError(msg);

        if (process.env.NODE_ENV === 'development') {
          // lekki fallback, by UI nie był pusty w dev
          setItems(
            DEV_MOCK.filter(
              (r) =>
                r.title?.toLowerCase().includes(q.toLowerCase()) ||
                r.subtitle?.toLowerCase().includes(q.toLowerCase())
            )
          );
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q]);

  return (
    <div className="search-page" style={{ padding: 16 }}>
      <header className="search-header" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Wyniki wyszukiwania</h3>
        <div style={{ color: '#6b7280', marginTop: 4 }}>
          {q ? <>Zapytanie: <strong>„{q}”</strong></> : 'Brak zapytania'}
        </div>
      </header>

      {q.length < MIN_QUERY_LEN ? (
        <p>Wpisz co najmniej {MIN_QUERY_LEN} znaki, aby wyszukać.</p>
      ) : loading ? (
        <p>Wczytywanie…</p>
      ) : error && items.length === 0 ? (
        <div style={{ color: '#b91c1c' }}>
          Błąd: {error}
          {process.env.NODE_ENV === 'development' ? (
            <div style={{ marginTop: 8, color: '#374151' }}>
              (Tryb developerski: pokazano wyniki z mocka, jeśli są trafienia)
            </div>
          ) : null}
        </div>
      ) : items.length === 0 ? (
        <p>Brak wyników.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map((it, idx) => (
            <li key={`${it.type || 'item'}-${it.id || idx}`} style={{
              padding: 12, border: '1px solid rgba(0,0,0,.08)', borderRadius: 12, background: '#fff'
            }}>
              {it.url ? (
                <Link to={it.url} className="result-title" style={{ fontWeight: 600, textDecoration: 'none' }}>
                  {it.title || '(bez tytułu)'}
                </Link>
              ) : (
                <span style={{ fontWeight: 600 }}>{it.title || '(bez tytułu)'}</span>
              )}
              <div className="result-sub" style={{ marginTop: 4, fontSize: 13, color: '#6b7280', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {it.type ? <span className="pill" style={{ padding: '2px 8px', borderRadius: 999, background: '#f3f4f6', fontSize: 12 }}>{mapType(it.type)}</span> : null}
                {it.subtitle ? <span>{it.subtitle}</span> : null}
                {it.date ? <span>{formatDate(it.date)}</span> : null}
                {it.status ? <span>{it.status}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mapType(t) {
  switch (t) {
    case 'client': return 'Klient';
    case 'offer': return 'Oferta';
    case 'order': return 'Zlecenie';
    case 'sample': return 'Próbka';
    case 'document': return 'Dokument';
    case 'equipment': return 'Wyposażenie';
    case 'training': return 'Szkolenie';
    case 'post': return 'Post';
    case 'message': return 'Wiadomość';
    default: return t || 'element';
  }
}

function formatDate(d) {
  try { return new Date(d).toLocaleDateString('pl-PL'); } catch { return d; }
}

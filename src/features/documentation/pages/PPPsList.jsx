// src/components/pages/contents/PPPsList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/documentation-orders.css';
import '../styles/ppps-list.css';

/** ====== Mock loader (podmień przez props: loadPPPs=async()=>[]) ====== */
async function mockLoadPPPs() {
  const now = new Date();
  const iso = d => d.toISOString().slice(0, 16);
  const day = 86400000;

  return [
    {
      id: 'o-1001',
      orderId: 'o-1001',
      number: 'PPP-2025/001',
      contractNumber: 'ZL-2025/001',
      clientName: 'AutoTech Sp. z o.o.',
      manufacturer: 'Voltmax GmbH',
      acceptedAt: iso(new Date(now - 3 * day)),
      updatedAt: iso(new Date(now - 1 * day)),
      fitness: 'ok',
      accepted: true,
      orderType: 'ZEW', // ZEW / WEW / BW
      sampleCodeKind: { AO: true }, // AO / BP / AZ / INNE
      sampleCodes: ['ZL-2025/001/1-2025-09-16', 'ZL-2025/001/2-2025-09-16'],
      url: '',
    },
    {
      id: 'o-1002',
      orderId: 'o-1002',
      number: '',
      contractNumber: 'ZL-2025/007',
      clientName: 'Akku Polska SA',
      manufacturer: 'Akku Polska SA',
      acceptedAt: '',
      updatedAt: iso(new Date(now - 2 * day)),
      fitness: 'ok',
      accepted: false,
      orderType: 'WEW',
      sampleCodeKind: { BP: true },
      sampleCodes: [],
      url: '',
    },
    {
      id: 'o-1003',
      orderId: 'o-1003',
      number: 'PPP-2025/003',
      contractNumber: 'ZL-2025/010',
      clientName: 'StartBattery s.r.o.',
      manufacturer: 'StartBattery s.r.o.',
      acceptedAt: iso(new Date(now - 10 * day)),
      updatedAt: iso(new Date(now - 5 * day)),
      fitness: 'nok',
      accepted: false,
      orderType: 'BW',
      sampleCodeKind: { INNE: true, inneText: 'Zestaw mieszany' },
      sampleCodes: ['ZL-2025/010/1-2025-09-05'],
      url: 'https://example.com/ppp-2025-003.pdf',
    },
  ];
}

/** ====== Pomocnicze ====== */
function Chip({ tone = 'neutral', title, children }) {
  const cls = tone === 'ok' ? 'chip chip--ok' : tone === 'warn' ? 'chip chip--warn' : 'chip';
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  );
}

function computeMissing(ppp) {
  const lacks = [];
  if (!ppp.number) lacks.push('brak numeru protokołu');
  const hasAnyCode = Array.isArray(ppp.sampleCodes) ? ppp.sampleCodes.filter(Boolean).length > 0 : false;
  if (!hasAnyCode) lacks.push('brak kodu próbki');
  if (!ppp.acceptedAt) lacks.push('brak daty przyjęcia');
  return lacks;
}

function fmtDate(dt) {
  if (!dt) return '—';
  // akceptujemy ISO „YYYY-MM-DDTHH:mm”
  return dt.replace('T', ' ');
}

function includesCI(hay, needle) {
  return (hay || '').toLowerCase().includes((needle || '').toLowerCase());
}

/** ====== Główny komponent listy PPP ====== */
export default function PPPsList({
  loadPPPs = mockLoadPPPs,
  onCreateNewPPP, // opcjonalnie: () => void
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Stan / filtry =====
  const [ppps, setPpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [accepted, setAccepted] = useState('all'); // all | yes | no
  const [fitness, setFitness] = useState('all'); // all | ok | nok
  const [orderType, setOrderType] = useState('all'); // all | ZEW | WEW | BW
  const [sampleKind, setSampleKind] = useState('all'); // all | AO | BP | AZ | INNE
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyWithFile, setOnlyWithFile] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // ładowanie
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await loadPPPs();
        if (alive) setPpps(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadPPPs, location.key]);

  // obliczenia
  const list = useMemo(() => {
    let arr = ppps.slice();

    // wyszukiwanie
    if (q.trim()) {
      arr = arr.filter(
        x =>
          includesCI(x.number, q) ||
          includesCI(x.contractNumber, q) ||
          includesCI(x.clientName, q) ||
          includesCI(x.manufacturer, q) ||
          (x.sampleCodes || []).some(c => includesCI(c, q))
      );
    }

    // filtry: przyjęcie & fitness
    if (accepted !== 'all') {
      arr = arr.filter(x => (accepted === 'yes' ? x.accepted === true : x.accepted !== true));
    }
    if (fitness !== 'all') {
      arr = arr.filter(x => (fitness === 'ok' ? x.fitness === 'ok' || x.fitness === true : x.fitness === 'nok'));
    }

    // filtry: rodzaj zlecenia & rodzaj kodu próbki
    if (orderType !== 'all') {
      arr = arr.filter(x => (x.orderType || '').toUpperCase() === orderType);
    }
    if (sampleKind !== 'all') {
      arr = arr.filter(x => {
        const k = x.sampleCodeKind || {};
        if (sampleKind === 'INNE') return !!k.INNE;
        return !!k[sampleKind];
      });
    }

    // filtry: plik / braki
    if (onlyWithFile) arr = arr.filter(x => !!x.url);
    if (onlyMissing) arr = arr.filter(x => computeMissing(x).length > 0);

    // filtry: zakres dat (jeśli ustawione — wymagaj acceptedAt)
    if (from) arr = arr.filter(x => x.acceptedAt && x.acceptedAt >= from);
    if (to) arr = arr.filter(x => x.acceptedAt && x.acceptedAt <= to);

    // sort: najnowsze na górze po acceptedAt, potem updatedAt
    arr.sort(
      (a, b) =>
        String(b.acceptedAt || '').localeCompare(String(a.acceptedAt || '')) ||
        String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
    );
    return arr;
  }, [ppps, q, accepted, fitness, orderType, sampleKind, onlyMissing, onlyWithFile, from, to]);

  // statystyki / podsumowanie
  const stats = useMemo(() => {
    const total = ppps.length;
    let ready = 0,
      issues = 0,
      waiting = 0;
    ppps.forEach(x => {
      const miss = computeMissing(x).length;
      const okFitness = x.fitness === 'ok' || x.fitness === true;
      if (miss === 0 && okFitness && x.accepted === true) ready += 1;
      if (miss > 0 || x.fitness === 'nok') issues += 1;
      if (x.accepted !== true) waiting += 1;
    });
    return { total, ready, issues, waiting };
  }, [ppps]);

  // nawigacja
  const openPPP = row => {
    const id = row.orderId || row.id;
    if (!id) return;
    navigate(`/dokumentacja/ppp/${id}`);
  };
  const openOrder = row => {
    const id = row.orderId || row.id;
    if (!id) return;
    navigate(`/dokumentacja/zlecenia/${id}`);
  };

  const clearFilters = () => {
    setQ('');
    setAccepted('all');
    setFitness('all');
    setOrderType('all');
    setSampleKind('all');
    setOnlyMissing(false);
    setOnlyWithFile(false);
    setFrom('');
    setTo('');
  };

  return (
    <div className="pppList">
      <div className="kb__actions">
        <h2 className="docOrders__h2" style={{ marginRight: 8 }}>
          Protokoły Przyjęcia Próbki
        </h2>
        <div className="kb__spacer" />
        {onCreateNewPPP ? (
          <button className="ghost" type="button" onClick={onCreateNewPPP}>
            + Utwórz PPP
          </button>
        ) : (
          <button
            className="ghost"
            type="button"
            onClick={() => navigate('/dokumentacja/zlecenia')}
            aria-label="Przejdź do listy zleceń aby utworzyć PPP"
          >
            + Utwórz PPP
          </button>
        )}
      </div>

      {/* podsumowanie (używa klas z DocumentationOrders.css) */}
      <div className="docOrders__summary">
        <div className="summary-pill tone-blue">
          <span>Wszystkie</span>
          <b>{stats.total}</b>
        </div>
        <div className="summary-pill tone-green" title="Brak braków, fitness OK, przyjęty">
          <span>Gotowe</span>
          <b>{stats.ready}</b>
        </div>
        <div className="summary-pill tone-amber" title="Braki i/lub fitness NOK">
          <span>Wymagają akcji</span>
          <b>{stats.issues}</b>
        </div>
        <div className="summary-pill tone-indigo" title="Jeszcze nie przyjęte">
          <span>Oczekujące</span>
          <b>{stats.waiting}</b>
        </div>
        <div className="summary-pill tone-slate">
          <span>Widoczne</span>
          <b>{list.length}</b>
        </div>
      </div>

      {/* filtry */}
      <div className="pppList__filters card">
        <input
          className="i"
          placeholder="Szukaj (nr PPP, nr zlecenia, klient, kod próbki)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Szukaj protokołów"
        />

        <select className="i" value={accepted} onChange={e => setAccepted(e.target.value)}>
          <option value="all">Przyjęcie: wszystkie</option>
          <option value="yes">Przyjęte</option>
          <option value="no">Nieprzyjęte</option>
        </select>

        <select className="i" value={fitness} onChange={e => setFitness(e.target.value)}>
          <option value="all">Przydatność: wszystkie</option>
          <option value="ok">Stan prawidłowy</option>
          <option value="nok">Stan nieprawidłowy</option>
        </select>

        {/* Rodzaj zlecenia */}
        <select className="i" value={orderType} onChange={e => setOrderType(e.target.value)}>
          <option value="all">Rodzaj zlecenia: wszystkie</option>
          <option value="ZEW">ZEW – zewnętrzne</option>
          <option value="WEW">WEW – wewnętrzne</option>
          <option value="BW">BW – badania własne</option>
        </select>

        {/* Rodzaj kodu próbki */}
        <select className="i" value={sampleKind} onChange={e => setSampleKind(e.target.value)}>
          <option value="all">Rodzaj kodu próbki: wszystkie</option>
          <option value="AO">AO – akumulatory ołowiowe</option>
          <option value="BP">BP – baterie pierwotne</option>
          <option value="AZ">AZ – akumulatory zasadowe</option>
          <option value="INNE">Inne</option>
        </select>

        <label className="f">
          <span className="l">Od (data przyjęcia)</span>
          <input type="datetime-local" className="i" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label className="f">
          <span className="l">Do (data przyjęcia)</span>
          <input type="datetime-local" className="i" value={to} onChange={e => setTo(e.target.value)} />
        </label>

        <div className="pppList__filters__toggles">
          <label className="f f--row">
            <input type="checkbox" checked={onlyMissing} onChange={e => setOnlyMissing(e.target.checked)} />
            <span>tylko z brakami</span>
          </label>
          <label className="f f--row">
            <input type="checkbox" checked={onlyWithFile} onChange={e => setOnlyWithFile(e.target.checked)} />
            <span>z plikiem</span>
          </label>
          <button className="ghost" type="button" onClick={clearFilters}>
            Wyczyść filtry
          </button>
        </div>
      </div>

      {/* lista */}
      {loading ? <div className="kb__empty">Ładowanie…</div> : null}
      {!loading && list.length === 0 ? (
        <div className="kb__empty">Nic nie znaleziono dla podanych filtrów.</div>
      ) : null}

      <div className="pppList__grid">
        {list.map(row => {
          const missing = computeMissing(row);
          const okFitness = row.fitness === 'ok' || row.fitness === true;

          return (
            <article key={row.orderId || row.id} className="pppList__item card">
              <div className="pppList__row1">
                <div className="pppList__title">
                  <button
                    type="button"
                    className="docLink pppList__linkLike"
                    onClick={() => openPPP(row)}
                    aria-label={`Otwórz PPP ${row.number || row.contractNumber || ''}`}
                  >
                    {row.number || '— brak numeru —'}
                  </button>
                  <div className="chips">
                    {okFitness ? (
                      <Chip tone="ok" title="Przydatność OK">
                        fitness OK
                      </Chip>
                    ) : (
                      <Chip tone="warn" title="Przydatność nieprawidłowa">
                        fitness NOK
                      </Chip>
                    )}
                    {row.accepted ? <Chip tone="ok">przyjęty</Chip> : <Chip>nieprzyjęty</Chip>}

                    {/* Rodzaj zlecenia */}
                    {row.orderType ? <Chip title="Rodzaj zlecenia">{(row.orderType || '').toUpperCase()}</Chip> : null}

                    {/* Rodzaj kodu próbki */}
                    {row.sampleCodeKind?.AO ? <Chip>AO</Chip> : null}
                    {row.sampleCodeKind?.BP ? <Chip>BP</Chip> : null}
                    {row.sampleCodeKind?.AZ ? <Chip>AZ</Chip> : null}
                    {row.sampleCodeKind?.INNE ? <Chip title={row.sampleCodeKind?.inneText || 'Inne'}>Inne</Chip> : null}

                    {/* Braki */}
                    {missing.map((m, i) => (
                      <Chip key={i} tone="warn">
                        {m}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="pppList__metaRight">
                  <span className="pppList__metaLabel">Przyjęto:</span> <b>{fmtDate(row.acceptedAt)}</b>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Zmiana:</span> <span>{fmtDate(row.updatedAt)}</span>
                </div>
              </div>

              <div className="pppList__row2">
                <div className="pppList__meta">
                  <span className="pppList__metaLabel">Zlecenie:</span> <b>{row.contractNumber || '—'}</b>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Klient:</span> <span>{row.clientName || '—'}</span>
                  <span className="pppList__sep">·</span>
                  <span className="pppList__metaLabel">Producent:</span> <span>{row.manufacturer || '—'}</span>
                </div>
                <div className="pppList__codes">
                  {(row.sampleCodes || []).slice(0, 3).map((c, i) => (
                    <code key={i} className="pppList__code">
                      {c}
                    </code>
                  ))}
                  {row.sampleCodes && row.sampleCodes.length > 3 ? (
                    <span className="pppList__more">+{row.sampleCodes.length - 3}</span>
                  ) : null}
                </div>
              </div>

              <div className="pppList__row3">
                <div className="pppList__actions">
                  <button type="button" className="ghost" onClick={() => openPPP(row)}>
                    Otwórz PPP ↗
                  </button>
                  <button type="button" className="ghost" onClick={() => openOrder(row)}>
                    Zlecenie ↗
                  </button>
                  {row.url ? (
                    <a className="ghost" href={row.url} target="_blank" rel="noreferrer">
                      Plik PDF ↗
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

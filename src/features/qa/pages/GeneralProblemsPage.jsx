// src/components/pages/contents/GeneralProblemsPage.jsx
import React, { useMemo, useState } from 'react'
import NewGeneralProblemForm from './NewGeneralProblemForm'
import '../styles/general-problems.css' // opcjonalnie – jeśli masz osobny arkusz; inaczej usuń ten import

/* ======================= Stałe / meta ======================= */
const DOMAINS = [
  { key:'process',  label:'Proces' },
  { key:'facility', label:'Utrzymanie ruchu' },
  { key:'safety',   label:'BHP' },
  { key:'supplier', label:'Dostawca' },
  { key:'hr',       label:'HR' },
  { key:'other',    label:'Inne' },
]

const STATUS_META = {
  new:         { label: 'Nowe',          cls: 'st-new' },
  acknowledged:{ label: 'Przyjęte',      cls: 'st-ack' },
  in_progress: { label: 'W trakcie',     cls: 'st-prog' },
  closed:      { label: 'Zamknięte',     cls: 'st-done' },
}

/* Ryzyko: severity × likelihood (1..9) */
const SEV_W = { low:1, med:2, high:3 }
const LIK_W = { unlikely:1, possible:2, likely:3 }
const riskScore = (r) => (SEV_W[r?.severity] ?? 0) * (LIK_W[r?.likelihood] ?? 0)

/* ======================= Dane demo (ogólne, nie-IT) ======================= */
const DEMO = [
  {
    id: 'gen-101',
    title: 'Śliska plama oleju przy M12',
    domain: 'safety',
    location: 'Hala A – linia M12',
    risk: { severity: 'high', likelihood: 'possible', score: 6 },
    status: 'new',
    createdAt: '2025-09-25T08:10:00Z',
    description: 'Zauważono plamę oleju obok maszyny M12. Potencjalne ryzyko poślizgnięcia.',
    tags: ['BHP','5S'],
    reporter: 'anonymous',
    attachments: [],
  },
  {
    id: 'gen-102',
    title: 'Opóźnienia dostaw elementów X',
    domain: 'supplier',
    location: 'Magazyn surowców',
    risk: { severity: 'med', likelihood: 'likely', score: 6 },
    status: 'acknowledged',
    createdAt: '2025-09-24T10:30:00Z',
    description: 'Dostawca spóźnia się seryjnie 2–3 dni. Możliwe przestoje.',
    tags: ['logistyka', 'dostawca-x'],
    reporter: 'magazyn@firma.pl',
    attachments: [],
  },
  {
    id: 'gen-103',
    title: 'Braki oznaczeń ewakuacji na 2 piętrze',
    domain: 'safety',
    location: 'Biuro – 2 piętro',
    risk: { severity: 'med', likelihood: 'possible', score: 4 },
    status: 'in_progress',
    createdAt: '2025-09-20T07:00:00Z',
    description: 'Niepełne oznaczanie dróg ewakuacyjnych w skrzydle B.',
    tags: ['BHP','oznaczenia'],
    reporter: 'HR',
    attachments: [],
  },
  {
    id: 'gen-104',
    title: 'Niewłaściwa ergonomia stanowiska pakowania',
    domain: 'process',
    location: 'Hala B – pakowanie',
    risk: { severity: 'low', likelihood: 'likely', score: 3 },
    status: 'closed',
    createdAt: '2025-09-12T12:00:00Z',
    description: 'Zalecane podnóżki i regulowane blaty.',
    tags: ['ergonomia','5S'],
    reporter: 'Anna Nowak',
    attachments: [],
  },
]

/* ======================= Komponent strony ======================= */
export default function GeneralProblemsPage() {
  /* Lokalne dane (pozwala dodać nowe zgłoszenia z formularza) */
  const [itemsLocal, setItemsLocal] = useState([])
  const [showForm, setShowForm] = useState(false)

  /* Filtry i sortowanie */
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('all')
  const [status, setStatus] = useState('all')
  const [minRisk, setMinRisk] = useState('all') // 'all' | '1'|'3'|'5'|'7'
  const [sortKey, setSortKey] = useState('created_desc') // 'risk_desc'|'title_asc'|'status_asc'

  /* Paginacja */
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const base = useMemo(() => {
    // scal lokalne + demo; lokalne na początku
    const both = [...itemsLocal, ...DEMO]
    return both.map(it => ({
      ...it,
      risk: { ...it.risk, score: it.risk?.score ?? riskScore(it.risk) },
    }))
  }, [itemsLocal])

  const filtered = useMemo(() => {
    let list = base.slice()

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(x =>
        x.title.toLowerCase().includes(q) ||
        (x.description || '').toLowerCase().includes(q) ||
        (x.location || '').toLowerCase().includes(q) ||
        (x.tags || []).join(' ').toLowerCase().includes(q) ||
        (x.reporter || '').toLowerCase().includes(q)
      )
    }
    if (domain !== 'all') list = list.filter(x => x.domain === domain)
    if (status !== 'all') list = list.filter(x => x.status === status)
    if (minRisk !== 'all') {
      const thr = Number(minRisk)
      list = list.filter(x => (x.risk?.score ?? 0) >= thr)
    }

    // sort
    list.sort((a,b) => {
      switch (sortKey) {
        case 'risk_desc': return (b.risk?.score ?? 0) - (a.risk?.score ?? 0)
        case 'title_asc': return a.title.localeCompare(b.title)
        case 'status_asc': return (STATUS_META[a.status]?.label || '').localeCompare(STATUS_META[b.status]?.label || '')
        case 'created_desc':
        default: return (b.createdAt || '').localeCompare(a.createdAt || '')
      }
    })

    return list
  }, [base, query, domain, status, minRisk, sortKey])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, pageSafe, perPage])

  // resetuj stronę na zmianę filtrów / perPage
  React.useEffect(() => { setPage(1) }, [query, domain, status, minRisk, perPage])
  React.useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages]) // obetnij, gdy trzeba

  /* ===== Akcje statusowe (bez confirm z window – eslint-safe) ===== */
  const patchStatus = (id, nextStatus) => {
    setItemsLocal(prev => {
      const inLocal = prev.some(x => x.id === id)
      if (inLocal) {
        return prev.map(x => x.id === id ? { ...x, status: nextStatus } : x)
      }
      // jeśli to rekord z DEMO – „przejmij” do lokalnych i zpatchuj status
      const src = DEMO.find(x => x.id === id)
      return src ? [{ ...src, status: nextStatus }, ...prev] : prev
    })
  }

  const onAcknowledge = (id) => patchStatus(id, 'acknowledged')
  const onStart = (id)       => patchStatus(id, 'in_progress')
  const onClose = (id)       => patchStatus(id, 'closed')

  /* ===== Render ===== */
  return (
    <div className='unassigned--vertical'>{/* używamy istniejących klas panel / select / button itd. */}
      {/* NAGŁÓWEK / FILTRY */}
      <section className='panel'>
        <div className='filters-grid v4'>
          <div className='row-1'>
            <input
              className='search'
              placeholder='Szukaj: tytuł, opis, lokalizacja, tagi, zgłaszający…'
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
            <select className='select' value={domain} onChange={(e)=>setDomain(e.target.value)}>
              <option value='all'>Domena: wszystkie</option>
              {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            <select className='select' value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value='all'>Status: wszystkie</option>
              {Object.entries(STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className='select' value={minRisk} onChange={(e)=>setMinRisk(e.target.value)}>
              <option value='all'>Ryzyko: 1+</option>
              <option value='3'>Ryzyko: 3+</option>
              <option value='5'>Ryzyko: 5+</option>
              <option value='7'>Ryzyko: 7+</option>
            </select>
          </div>

          <div className='row-2'>
            <div className='row-2-left'>
              <span style={{color:'#6b7280', fontSize:12}}>
                Wyniki: <b>{filtered.length}</b>
              </span>
            </div>
            <div className='row-2-right'>
              <select className='select' value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
                <option value='created_desc'>Sortuj: utworzone ⬇</option>
                <option value='risk_desc'>Sortuj: ryzyko ⬇</option>
                <option value='status_asc'>Sortuj: status ⬆</option>
                <option value='title_asc'>Sortuj: tytuł ⬆</option>
              </select>

              <button className='btn-plus ghost add-btn' onClick={()=>setShowForm(true)}>
                <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
                  <path d='M12 5v14M5 12h14' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                </svg>
                Nowe zgłoszenie
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className='panel'>
        <ul className='tasks'>
          {paged.map(item => (
            <li key={item.id} className='task-card' title='Zgłoszenie ogólne'>
              {/* „checkbox slot” – zostawiamy pusty dla równej siatki */}
              <div style={{width:18, height:18}} />

              <div className='task-main'>
                <div className='title-row simple' style={{gap:8}}>
                  <div className='title'>{item.title}</div>
                  <span className='chip type'>
                    {DOMAINS.find(d => d.key === item.domain)?.label || '—'}
                  </span>
                  <span className='chip' title='Ryzyko (1–9)'>
                    Ryzyko: <b style={{marginLeft:4}}>{item.risk?.score ?? '-'}</b>
                  </span>
                  <span className='chip' title='Status'>
                    {STATUS_META[item.status]?.label || item.status}
                  </span>
                </div>

                <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:4, alignItems:'center'}}>
                  {item.location && <span className='chip' title='Lokalizacja'>{item.location}</span>}
                  {item.reporter && <span className='chip' title='Zgłaszający'>Zgł.: {item.reporter}</span>}
                  <span className='chip' title='Utworzone'>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  {(item.tags||[]).map(t => <span key={t} className='chip tag'>#{t}</span>)}
                </div>
              </div>

              <div className='task-actions compact'>
                {item.status === 'new' && (
                  <button className='ghost small' onClick={()=>onAcknowledge(item.id)}>Przyjmij</button>
                )}
                {(item.status === 'new' || item.status === 'acknowledged') && (
                  <button className='primary small' onClick={()=>onStart(item.id)}>Rozpocznij</button>
                )}
                {item.status !== 'closed' && (
                  <button className='ghost small' onClick={()=>onClose(item.id)}>Zamknij</button>
                )}
              </div>
            </li>
          ))}
          {!paged.length && <li className='empty'>Brak zgłoszeń dla bieżących filtrów.</li>}
        </ul>

        {/* PAGINACJA (lekka, spójna z resztą) */}
        {filtered.length > 0 && (
          <div className='ua__pagination' style={{marginTop:10}}>
            <div className='ua__pager-left'>
              <span className='ua__label'>Na stronę:</span>
              <select className='ua__select' value={perPage} onChange={(e)=>setPerPage(Number(e.target.value))}>
                {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className='ua__pager-center'>
              <button
                className='ua__btn'
                onClick={()=>setPage(1)}
                disabled={pageSafe === 1}
                title='Pierwsza'
              >«</button>
              <button
                className='ua__btn'
                onClick={()=>setPage(p => Math.max(1, p-1))}
                disabled={pageSafe === 1}
                title='Poprzednia'
              >‹</button>

              <span className='ua__info'>
                {((pageSafe - 1) * perPage) + 1}
                –
                {Math.min(pageSafe * perPage, filtered.length)}
                {' '}z{' '}
                {filtered.length}
              </span>

              <button
                className='ua__btn'
                onClick={()=>setPage(p => Math.min(totalPages, p+1))}
                disabled={pageSafe === totalPages}
                title='Następna'
              >›</button>
              <button
                className='ua__btn'
                onClick={()=>setPage(totalPages)}
                disabled={pageSafe === totalPages}
                title='Ostatnia'
              >»</button>
            </div>

            <div className='ua__pager-right'>
              <span className='ua__page'>Strona {pageSafe}/{totalPages}</span>
            </div>
          </div>
        )}
      </section>

      {/* MODAL: Nowe zgłoszenie */}
      {showForm && (
        <div className='modal-overlay' onClick={()=>setShowForm(false)}>
          <div className='modal' onClick={(e)=>e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Nowe zgłoszenie (ogólne)</h3>
              <button className='icon-btn' onClick={()=>setShowForm(false)} title='Zamknij'>✕</button>
            </div>
            <div className='modal-body' style={{padding:0}}>
              <NewGeneralProblemForm
                onCreate={(payload)=>{
                  setItemsLocal(prev => [payload, ...prev])
                  setShowForm(false)
                }}
                onCancel={()=>setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

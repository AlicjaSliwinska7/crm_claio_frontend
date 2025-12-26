// web/src/routes/qa/ProblemsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import '../styles/qa-issues.css'

/** Skonfiguruj w jednym miejscu bazę API (nieużywana, gdy useDemo=true) */
const API = import.meta?.env?.VITE_QA_API_BASE || '/api/qa/issues'

const severityLabel = s => ({ blocker: 'blokujący', major: 'poważny', minor: 'drobny' }[s] || s)
const statusLabel   = s => ({ new: 'NOWE', wip: 'W TRAKCIE', removed_cause: 'USUNIĘTA PRZYCZYNA', closed: 'ZAMKNIĘTE' }[s] || s)
const impactLabel   = s => ({ stop: 'ANDON-STOP', degrade: 'degradacja', info: 'info' }[s] || s)

/* ======= DEMO DATA (na czas braku backendu) ======= */
const DEMO_ITEMS = [
  {
    id: 'demo-1',
    title: 'Blokujący błąd logowania SSO',
    description: 'Po kliknięciu „Zaloguj SSO” wraca 500 z IdP. Dotyczy tylko kont B2B.',
    module: 'Auth',
    severity: 'blocker',
    impact: 'stop',
    status: 'new',
    createdBy: 'anna.nowak',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    stoppedFlow: true,
    evidenceUrl: 'https://example.com/logi/ssologin'
  },
  {
    id: 'demo-2',
    title: 'Spowolnienie listy faktur > 1000 pozycji',
    description: 'Powyżej 1000 rekordów TTFB ~6s. Brakuje indeksu po (customerId, createdAt).',
    module: 'Billing',
    severity: 'major',
    impact: 'degrade',
    status: 'wip',
    owner: 'jan.kowalski',
    createdBy: 'piotr',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    stoppedFlow: false
  },
  {
    id: 'demo-3',
    title: 'Niewłaściwy kolor przycisku „Zapisz” w dark mode',
    description: 'Kontrast 2.4:1 – poza WCAG AA. Dotyczy motywu ciemnego w ustawieniach.',
    module: 'Frontend',
    severity: 'minor',
    impact: 'info',
    status: 'new',
    createdBy: 'karolina',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    stoppedFlow: false
  },
  {
    id: 'demo-4',
    title: 'Błąd 409 przy imporcie CSV (kolizja ID)',
    description: 'Brak obsługi nadpisywania – pojawia się 409 dla zduplikowanych rekordów.',
    module: 'Import',
    severity: 'major',
    impact: 'degrade',
    status: 'removed_cause',
    createdBy: 'alicja',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    stoppedFlow: false
  },
  {
    id: 'demo-5',
    title: 'Crash joba nocnego agregacji',
    description: 'Null pointer dla batchu bez danych; brak guardów.',
    module: 'ETL',
    severity: 'major',
    impact: 'stop',
    status: 'closed',
    owner: 'devops',
    createdBy: 'anna.nowak',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    stoppedFlow: true
  }
]

/* ======= Prosty modal akcji (zamiast prompt/confirm/alert) ======= */
function ActionModal({ open, title, children, onClose, onOk, okText = 'OK', disableOk = false }) {
  if (!open) return null
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={(e)=>e.stopPropagation()}>
        <div className='modal-header'>
          <h3>{title}</h3>
          <button className='icon-btn' onClick={onClose} title='Zamknij'>
            <svg width='18' height='18' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/></svg>
          </button>
        </div>
        <div className='modal-body'>{children}</div>
        <div className='modal-actions' style={{padding:'0 12px 12px', display:'flex', gap:8}}>
          <button className='ghost' onClick={onClose}>Anuluj</button>
          <button className='primary' disabled={disableOk} onClick={onOk}>{okText}</button>
        </div>
      </div>
    </div>
  )
}

export default function ProblemsPage({ useDemo = true }){
  // filtry
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [impact, setImpact] = useState('all')
  const [moduleName, setModuleName] = useState('')
  // paginacja
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // dane
  const [data, setData] = useState({ items: [], total: 0, page: 1, perPage: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /* ====== DEMO: filtr + paginacja in-memory ====== */
  const demoFiltered = useMemo(() => {
    let items = DEMO_ITEMS.slice()
    if (q.trim()) {
      const qq = q.toLowerCase()
      items = items.filter(it =>
        it.title.toLowerCase().includes(qq) ||
        (it.description || '').toLowerCase().includes(qq) ||
        (it.module || '').toLowerCase().includes(qq)
      )
    }
    if (status !== 'all') items = items.filter(it => it.status === status)
    if (impact !== 'all') items = items.filter(it => it.impact === impact)
    if (moduleName.trim()) items = items.filter(it => (it.module || '').toLowerCase().includes(moduleName.toLowerCase()))
    return items
  }, [q, status, impact, moduleName])

  const loadDemo = () => {
    const total = demoFiltered.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const pageSafe = Math.min(page, totalPages)
    const start = (pageSafe - 1) * perPage
    const items = demoFiltered.slice(start, start + perPage)
    setData({ items, total, page: pageSafe, perPage, totalPages })
  }

  /* ====== API: real fetch (gdy useDemo=false) ====== */
  async function fetchList(){
    setLoading(true); setError(null)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (status !== 'all') params.set('status', status)
    if (impact !== 'all') params.set('impact', impact)
    if (moduleName.trim()) params.set('module', moduleName.trim())
    params.set('page', String(page))
    params.set('perPage', String(perPage))
    try {
      const res = await fetch(`${API}?${params.toString()}`)
      const j = await res.json()
      setData(j)
    } catch (e) {
      setError('Nie udało się pobrać listy.')
    } finally {
      setLoading(false)
    }
  }

  // przeładuj na zmianę filtrów/paginacji
  useEffect(() => {
    if (useDemo) loadDemo()
    else fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, impact, moduleName, page, perPage, useDemo])

  // formularz utworzenia (Andon)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', module: '',
    severity: 'major', impact: 'degrade', stoppedFlow: false,
    evidenceUrl: '', createdBy: ''
  })
  const canSubmit =
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 1 &&
    form.createdBy.trim().length >= 1

  const submitCreate = async () => {
    if (!canSubmit) return
    if (useDemo) {
      // dopnij do listy demo (na żywo)
      const newItem = {
        id: `demo-${Math.random().toString(36).slice(2,8)}`,
        ...form,
        status: 'new',
        createdAt: new Date().toISOString()
      }
      DEMO_ITEMS.unshift(newItem)
      setForm({ title: '', description: '', module: '', severity: 'major', impact: 'degrade', stoppedFlow: false, evidenceUrl: '', createdBy: '' })
      setCreating(false)
      setPage(1)
      loadDemo()
      return
    }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      setForm({ title: '', description: '', module: '', severity: 'major', impact: 'degrade', stoppedFlow: false, evidenceUrl: '', createdBy: '' })
      setCreating(false)
      setPage(1)
      fetchList()
    } catch {
      // zamiast alertu – modal
      setAction({ type:'info', open:true, title:'Błąd', message:'Nie udało się utworzyć zgłoszenia.' })
    }
  }

  /* ====== Akcje (modale zamiast prompt/confirm) ====== */
  const [action, setAction] = useState({
    open: false, type: null, id: null, title: '', message: '',
    owner: '', rootCause:'', correctiveAction:'', preventiveAction:'', standardUpdated: false,
  })

  const openStart = (id) => setAction({ open:true, type:'start', id, title:'Start + właściciel', message:'Podaj właściciela (display/email):', owner:'' })
  const openClose = (id) => setAction({
    open:true, type:'close', id, title:'Zamknięcie zgłoszenia',
    rootCause:'', correctiveAction:'', preventiveAction:'', standardUpdated:false
  })
  const openRemoved = (id) => setAction({ open:true, type:'removed', id, title:'Usunięta przyczyna', message:'Potwierdź oznaczenie „usunięta przyczyna”.' })
  const closeModal = () => setAction({ open:false, type:null, id:null, title:'', message:'' })

  const doStart = async () => {
    if (useDemo) {
      const it = DEMO_ITEMS.find(x => x.id === action.id)
      if (it) { it.status = 'wip'; it.owner = action.owner }
      closeModal(); loadDemo(); return
    }
    await fetch(`${API}/${action.id}/start`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ owner: action.owner }) })
    closeModal(); fetchList()
  }
  const doRemoved = async () => {
    if (useDemo) {
      const it = DEMO_ITEMS.find(x => x.id === action.id)
      if (it) it.status = 'removed_cause'
      closeModal(); loadDemo(); return
    }
    await fetch(`${API}/${action.id}/removed-cause`, { method: 'POST' })
    closeModal(); fetchList()
  }
  const doClose = async () => {
    const payload = {
      rootCause: action.rootCause,
      correctiveAction: action.correctiveAction,
      preventiveAction: action.preventiveAction,
      standardUpdated: !!action.standardUpdated
    }
    if (useDemo) {
      const it = DEMO_ITEMS.find(x => x.id === action.id)
      if (it) it.status = 'closed'
      closeModal(); loadDemo(); return
    }
    await fetch(`${API}/${action.id}/close`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    closeModal(); fetchList()
  }

  const total = data.total || 0
  const pageSafe = Math.min(page, Math.max(1, data.totalPages || 1))
  const rangeStart = total ? ((pageSafe - 1) * perPage + 1) : 0
  const rangeEnd = total ? Math.min(pageSafe * perPage, total) : 0

  return (
    <div className='qa-wrap'>
      {/* FILTRY + FORMULARZ */}
      <section className='panel'>
        <div className='qa-filters'>
          <div className='row'>
            <input className='search' placeholder='Szukaj (tytuł/opis/moduł)…' value={q} onChange={e=>{ setPage(1); setQ(e.target.value) }} />
            <select className='select' value={status} onChange={e=>{ setPage(1); setStatus(e.target.value) }}>
              <option value='all'>Status: wszystkie</option>
              <option value='new'>NOWE</option>
              <option value='wip'>W TRAKCIE</option>
              <option value='removed_cause'>USUNIĘTA PRZYCZYNA</option>
              <option value='closed'>ZAMKNIĘTE</option>
            </select>
            <select className='select' value={impact} onChange={e=>{ setPage(1); setImpact(e.target.value) }}>
              <option value='all'>Wpływ: wszystkie</option>
              <option value='stop'>ANDON-STOP</option>
              <option value='degrade'>degradacja</option>
              <option value='info'>info</option>
            </select>
            <input className='search' placeholder='Moduł…' value={moduleName} onChange={e=>{ setPage(1); setModuleName(e.target.value) }} />
            <span className='spacer' />
            <button className='btn-plus ghost' onClick={()=>setCreating(v=>!v)}>{creating ? 'Ukryj' : 'Zgłoś (Andon)'}</button>
          </div>

          {creating && (
            <div className='form-grid'>
              <input className='search' placeholder='Tytuł (min 3 znaki)' value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} />
              <textarea placeholder='Opis problemu' value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
              <div className='row'>
                <input className='search' placeholder='Moduł (np. Billing)' value={form.module} onChange={e=>setForm(f=>({...f, module:e.target.value}))} />
                <select className='select' value={form.severity} onChange={e=>setForm(f=>({...f, severity:e.target.value}))}>
                  <option value='blocker'>blokujący</option><option value='major'>poważny</option><option value='minor'>drobny</option>
                </select>
                <select className='select' value={form.impact} onChange={e=>setForm(f=>({...f, impact:e.target.value}))}>
                  <option value='stop'>ANDON-STOP</option><option value='degrade'>degradacja</option><option value='info'>info</option>
                </select>
                <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <input type='checkbox' checked={form.stoppedFlow} onChange={e=>setForm(f=>({...f, stoppedFlow:e.target.checked}))} />
                  zatrzymaj przepływ
                </label>
              </div>
              <div className='row'>
                <input className='search' placeholder='URL dowodów (screen/log)' value={form.evidenceUrl} onChange={e=>setForm(f=>({...f, evidenceUrl:e.target.value}))} />
                <input className='search' placeholder='Zgłaszający (display/email)' value={form.createdBy} onChange={e=>setForm(f=>({...f, createdBy:e.target.value}))} />
                <span className='spacer' />
                <button className='primary' disabled={!canSubmit} onClick={submitCreate}>Zgłoś</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LISTA */}
      <section className='panel'>
        {loading && <div>Ładowanie…</div>}
        {error && <div style={{color:'#b91c1c'}}>{error}</div>}

        <ul className='qa-list'>
          {data.items?.map(it => (
            <li className='qa-item' key={it.id}>
              <div>
                <div className='title'>{it.title}</div>
                <div className='meta'>
                  <span className={`badge ${it.impact==='stop'?'stop':''}`}>{impactLabel(it.impact)}</span>
                  <span className={`badge ${it.severity}`}>Severity: {severityLabel(it.severity)}</span>
                  <span className={`badge ${it.status}`}>{statusLabel(it.status)}</span>
                  {it.module && <span className='badge'>Moduł: {it.module}</span>}
                  {it.owner && <span className='badge'>Owner: {it.owner}</span>}
                  <span className='badge'>Zgł.: {it.createdBy}</span>
                  <span className='badge'>Utw.: {new Date(it.createdAt).toLocaleString()}</span>
                  {it.stoppedFlow && <span className='badge stop'>⛔ FLOW STOP</span>}
                </div>
                {it.description && <div style={{marginTop:6, color:'#374151', fontSize:13, whiteSpace:'pre-wrap'}}>{it.description}</div>}
                {it.evidenceUrl && (
                  <div style={{marginTop:6}}>
                    <a href={it.evidenceUrl} target='_blank' rel='noreferrer'>Dowód / log</a>
                  </div>
                )}
              </div>
              <div className='qa-actions'>
                {it.status === 'new' && (
                  <button className='ghost' onClick={()=>openStart(it.id)}>Start + owner</button>
                )}
                {it.status !== 'closed' && (
                  <button className='ghost' onClick={()=>openRemoved(it.id)}>Usunięta przyczyna</button>
                )}
                {it.status !== 'closed' && (
                  <button className='primary' onClick={()=>openClose(it.id)}>Zamknij</button>
                )}
              </div>
            </li>
          ))}
          {(!data.items || data.items.length === 0) && !loading && <li>Brak zgłoszeń.</li>}
        </ul>

        {/* PAGINACJA */}
        {data.total > 0 && (
          <div className='ua__pagination' style={{marginTop:8}}>
            <div className='ua__pager-left'>
              <span className='ua__label'>Na stronę:</span>
              <select className='ua__select' value={perPage} onChange={e=>{ setPage(1); setPerPage(Number(e.target.value)) }}>
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className='ua__pager-center'>
              <button className='ua__btn' onClick={()=>setPage(1)} disabled={pageSafe===1}>⟪</button>
              <button className='ua__btn' onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pageSafe===1}>‹</button>
              <span className='ua__info'>
                {rangeStart}–{rangeEnd} z {total}
              </span>
              <button className='ua__btn' onClick={()=>setPage(p=>Math.min(data.totalPages,p+1))} disabled={pageSafe===data.totalPages}>›</button>
              <button className='ua__btn' onClick={()=>setPage(data.totalPages)} disabled={pageSafe===data.totalPages}>⟫</button>
            </div>
            <div className='ua__pager-right'>
              <span className='ua__page'>Strona {pageSafe}/{data.totalPages || 1}</span>
            </div>
          </div>
        )}
      </section>

      {/* ===== Modale akcji ===== */}
      <ActionModal
        open={action.open && action.type==='start'}
        title={action.title}
        onClose={closeModal}
        onOk={doStart}
        okText='Rozpocznij'
        disableOk={!action.owner.trim()}
      >
        <div className='form-grid'>
          <div>Podaj właściciela (display/email):</div>
          <input className='search' value={action.owner} onChange={e=>setAction(a=>({ ...a, owner: e.target.value }))} placeholder='np. jan.kowalski' />
        </div>
      </ActionModal>

      <ActionModal
        open={action.open && action.type==='removed'}
        title={action.title}
        onClose={closeModal}
        onOk={doRemoved}
        okText='Potwierdź'
      >
        <div>{action.message}</div>
      </ActionModal>

      <ActionModal
        open={action.open && action.type==='close'}
        title={action.title}
        onClose={closeModal}
        onOk={doClose}
        okText='Zamknij zgłoszenie'
        disableOk={!action.rootCause.trim() || !action.correctiveAction.trim()}
      >
        <div className='form-grid'>
          <input className='search' placeholder='Przyczyna źródłowa (RC)' value={action.rootCause} onChange={e=>setAction(a=>({ ...a, rootCause: e.target.value }))} />
          <input className='search' placeholder='Działanie korygujące (CA)' value={action.correctiveAction} onChange={e=>setAction(a=>({ ...a, correctiveAction: e.target.value }))} />
          <input className='search' placeholder='Działanie zapobiegawcze (PA – opcjonalne)' value={action.preventiveAction} onChange={e=>setAction(a=>({ ...a, preventiveAction: e.target.value }))} />
          <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
            <input type='checkbox' checked={!!action.standardUpdated} onChange={e=>setAction(a=>({ ...a, standardUpdated: e.target.checked }))} />
            Standard/chec­klista/test zaktualizowane
          </label>
        </div>
      </ActionModal>

      <ActionModal
        open={action.open && action.type==='info'}
        title={action.title || 'Info'}
        onClose={closeModal}
        onOk={closeModal}
        okText='OK'
      >
        <div>{action.message}</div>
      </ActionModal>
    </div>
  )
}

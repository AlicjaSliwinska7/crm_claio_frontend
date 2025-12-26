import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/tasks-schedule.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LEFT_W = 280;
const ICON_SIZE = 16;
const GAP = 10; // odstęp tooltipa od paska

/* =============== helpers datowe =============== */
const toMid = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const dFromStr = (s) => { if(!s) return null; const [y,m,dd]=s.split('-').map(Number); return new Date(y,(m||1)-1,(dd||1),0,0,0,0); };
const fmt = (d) => { if(!d) return ''; const x=new Date(d); const y=x.getFullYear(), m=String(x.getMonth()+1).padStart(2,'0'), da=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; };
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const diffDays = (a,b) => Math.round((toMid(b)-toMid(a))/86400000);
const isWeekend = d => [0,6].includes(new Date(d).getDay());
const startOfWeekMon = d => { const x=toMid(d); const delta=(x.getDay()+6)%7; return addDays(x,-delta); };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uniq = arr => Array.from(new Set((arr||[]).filter(Boolean)));
const monthName = d => d.toLocaleDateString('pl-PL',{month:'long',year:'numeric'});

/* =============== kolory Etap/Rodzaj =============== */
function hueFromId(id=''){ let h=0; for(let i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))>>>0; return h%360; }
function typeColors(id=''){
  const h=hueFromId(id);
  return {
    dot:       `hsl(${h} 72% 40%)`,
    chipBg:    `hsl(${h} 90% 92%)`,
    chipBgOn:  `hsl(${h} 88% 86%)`,
    chipBr:    `hsl(${h} 55% 60%)`
  };
}

/* =============== statusy =============== */
const STATUS_CLASS = {
  nieprzydzielone:'status--unassigned',
  przydzielone:'status--assigned',
  'w toku':'status--inprogress', w_trakcie:'status--inprogress',
  w_weryfikacji:'status--review',
  'do poprawy':'status--changes', do_poprawy:'status--changes',
  zatwierdzone:'status--approved',
  odrzucone:'status--rejected'
};
const STATUS_ORDER = ['przydzielone','w toku','w_weryfikacji','do poprawy','zatwierdzone','odrzucone'];

/* =============== lane’y =============== */
function assignLanes(items){
  const lanesEnd=[];
  return items.map(it=>{
    let lane=0;
    for(; lane<lanesEnd.length; lane++){
      if(it.start > lanesEnd[lane]) break;
    }
    lanesEnd[lane]=it.end;
    return {...it,lane};
  });
}

/* =============== inferencje =============== */
function inferTests(title=''){
  const t=title.toLowerCase(), o=[];
  if(t.includes('iso'))o.push('ISO');
  if(t.includes('pn-en'))o.push('PN-EN');
  if(t.includes('kalibr'))o.push('Kalibracja');
  if(t.includes('raport'))o.push('Raport');
  return o.length?o:['Ogólne'];
}
function inferType(title=''){
  const s=title.toLowerCase();
  if(s.includes('ppp'))return 'PPP: do przygotowania';
  if(s.includes('pb'))return 'PB: do przygotowania';
  if(s.includes('badani'))return 'Badania: do wykonania';
  if(s.includes('raport'))return 'Raport: do przygotowania';
  return 'Inne';
}
function inferKind(t){
  if (t.kind) return t.kind;
  if (t.category) return t.category;
  const s = `${t.type||''} ${t.title||''}`.toLowerCase();
  if (s.includes('szkolen')) return 'szkolenie';
  if (s.includes('spotkan')) return 'spotkanie';
  return 'zadanie';
}
function inferPriority(t){
  const raw = t.priority ?? t.prio ?? t.importance ?? t.istotnosc ?? 2;
  if (typeof raw === 'string'){
    const r = raw.toLowerCase();
    if (['low','niska','1'].includes(r)) return 1;
    if (['high','wysoka','3'].includes(r)) return 3;
    return 2;
  }
  return clamp(Number(raw)||2,1,3);
}
function toTriDiff(v){ const n=Number(v)||0; if(n<=1) return 1; if(n<=3) return 2; return 3; }

/* =============== normalizacja =============== */
function normalizeTasks(original=[]){
  return original.map((t,i)=>{
    const endRaw=t.endDate||t.dueDate||t.date||t.targetDate;
    const end=endRaw?dFromStr(endRaw):null;
    let start=t.startDate?dFromStr(t.startDate):null;
    if(!start){ if(end) start=addDays(end,-clamp(Number(t.difficulty||3),1,5)); }
    if(!start) start=toMid(new Date());
    const E=end||start;
    const length=diffDays(start,E)+1;
    const autoDiff=Math.max(1, Math.min(3, Math.round(length/4)+1));
    return {
      id:t.id||`t-${i}`,
      title:t.title||'(bez tytułu)',
      assignees:Array.isArray(t.assignees)?t.assignees:[],
      status:t.status||'przydzielone',
      type:t.type||inferType(t.title||''),
      kind: inferKind(t),
      priority: inferPriority(t),
      start, end:E,
      difficulty: toTriDiff(t.difficulty ?? autoDiff),
      tests:Array.isArray(t.tests)?t.tests:inferTests(t.title),
      link:`/zadania/moje/${t.id||`t-${i}`}`
    };
  });
}

function isHighlighted(it, hl){
  if (!hl) return false;
  const match = (k,v) => (
    (k==='type'   && it.type===v) ||
    (k==='status' && it.status===v) ||
    (k==='diff'   && it.difficulty===v) ||
    (k==='prio'   && it.priority===v) ||
    (k==='kind'   && it.kind===v)
  );
  return Object.entries(hl).some(([k,v]) => v!=null && match(k,v));
}

/* =============== komponent =============== */
export default function TasksSchedule({
  tasks = [],
  employees = [],
  holidays = [],
  isHoliday,
  leaves = [],
  compact = true,
  flat = false
}){
  const navigate=useNavigate();
  const today=toMid(new Date());
  const base=useMemo(()=>normalizeTasks(tasks),[tasks]);

  /* święta */
  const holidaySet=useMemo(()=>new Set((holidays||[]).map(d=>typeof d==='string'?d:fmt(d))),[holidays]);
  const isHolidayFn=useMemo(()=> typeof isHoliday==='function' ? (d=>!!isHoliday(d)) : (d=>holidaySet.has(fmt(d))), [isHoliday,holidaySet]);

  /* toolbar */
  const [q,setQ]=useState('');
  const [empF,setEmpF]=useState('wszyscy');

  const [rangeMode,setRangeMode]=useState('ten_tydzien');
  const [gotoDate,setGotoDate]=useState(fmt(today));
  const [from,setFrom]=useState(fmt(startOfWeekMon(today)));
  const [visibleDays,setVisibleDays]=useState(7);

  const viewStart=dFromStr(from);
  const viewEnd=useMemo(()=>addDays(viewStart,visibleDays-1),[viewStart,visibleDays]);

  useEffect(()=>{
    if(rangeMode==='custom') return;
    if(rangeMode==='ten_tydzien'){ setFrom(fmt(startOfWeekMon(today))); setVisibleDays(7); }
    else if(rangeMode==='nastepny_tydzien'){ setFrom(fmt(addDays(startOfWeekMon(today),7))); setVisibleDays(7); }
    else if(rangeMode==='goto'){ const b=dFromStr(gotoDate)||today; setFrom(fmt(startOfWeekMon(b))); setVisibleDays(7); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[rangeMode,gotoDate]);

  const shiftWindowBy = (deltaDays) => {
    setFrom(prev => {
      const base = dFromStr(prev) || today;
      return fmt(addDays(base, deltaDays));
    });
    setRangeMode('custom');
  };
  const zoomBy = (delta) => { setVisibleDays(v=>clamp(v+delta,3,30)); setRangeMode('custom'); };
  const gotoTodayWeek = () => setRangeMode('ten_tydzień');

  /* skróty + wheel */
  useEffect(()=>{
    const isTyping = (el)=>{ if(!el) return false; const t=el.tagName?.toLowerCase(); return t==='input'||t==='textarea'||t==='select'||el.isContentEditable; };
    const onKey = e => {
      if(isTyping(document.activeElement)) return;
      if(e.key==='ArrowLeft') shiftWindowBy(e.shiftKey?-7:-1);
      if(e.key==='ArrowRight') shiftWindowBy(e.shiftKey?+7:+1);
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[]);

  const wrapRef=useRef(null);
  const [containerW,setContainerW]=useState(0);
  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const ro=new ResizeObserver(es=>{ for(const e of es) setContainerW(Math.max(0,Math.floor(e.contentRect?.width??0))); });
    ro.observe(el);

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 : -1;
        setVisibleDays(v => clamp(v + delta, 3, 30));
        setRangeMode('custom');
        return;
      }
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return ()=>{
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
    };
  },[]);
  const viewportW=Math.max(1,containerW);
  const availW=Math.max(1,viewportW-LEFT_W);
  const dayW=Math.max(12, Math.floor((availW)/visibleDays));
  const contentW=visibleDays*dayW;
  const days=useMemo(()=>Array.from({length:visibleDays},(_,i)=>addDays(viewStart,i)),[viewStart,visibleDays]);

  /* listy */
  const employeesList=useMemo(()=>{
    const set=new Set(employees); base.forEach(t=>(t.assignees||[]).forEach(p=>p&&set.add(p)));
    return Array.from(set).sort((a,b)=>a.localeCompare(b,'pl'));
  },[base,employees]);

  /* filtry legendy */
  const [typeQuick,setTypeQuick]=useState('wszystkie');
  const [statusQuick,setStatusQuick]=useState(new Set(STATUS_ORDER));
  const [diffSet,setDiffSet]=useState(new Set([1,2,3]));
  const [prioSet,setPrioSet]=useState(new Set([1,2,3]));
  const kindsInBase = useMemo(()=>uniq(base.map(t=>t.kind||'zadanie')), [base]);
  const [kindSet,setKindSet]=useState(new Set(kindsInBase));

  const clearAllFilters = () => {
    setQ(''); setEmpF('wszyscy'); setTypeQuick('wszystkie');
    setStatusQuick(new Set(STATUS_ORDER)); setDiffSet(new Set([1,2,3]));
    setPrioSet(new Set([1,2,3])); setKindSet(new Set(kindsInBase));
    setHl(null);
  };

  /* filtrowanie */
  const prelim=useMemo(()=>{
    const norm=s=>(s||'').toLowerCase();
    const hit=t=>norm([t.title,t.type,t.status,t.kind,...(t.tests||[]),...(t.assignees||[])].join('|')).includes(norm(q));
    return base.filter(t=>{
      if(empF!=='wszyscy' && !(t.assignees||[]).includes(empF)) return false;
      if(!hit(t)) return false;
      if(!diffSet.has(t.difficulty)) return false;
      if(!prioSet.has(t.priority)) return false;
      if(kindSet.size && !kindSet.has(t.kind||'zadanie')) return false;
      return t.end>=viewStart && t.start<=viewEnd;
    });
  },[base,empF,q,viewStart,viewEnd,diffSet,prioSet,kindSet]);

  const legendFiltered=useMemo(()=>{
    return prelim.filter(t=>{
      if(typeQuick!=='wszystkie' && (t.type||'Inne')!==typeQuick) return false;
      if(statusQuick.size && !statusQuick.has(t.status)) return false;
      return true;
    });
  },[prelim,typeQuick,statusQuick]);

  /* heat */
  const dayLoad=useMemo(()=>{
    const counts=days.map(d=>{ let c=0; legendFiltered.forEach(t=>{ if(t.start<=d && t.end>=d) c++; }); return c; });
    const max=Math.max(1,...counts);
    return {counts,max};
  },[days,legendFiltered]);

  /* wiersze */
  const rows=useMemo(()=>{
    const map=new Map();
    legendFiltered.forEach(t=>{
      const persons=t.assignees?.length?t.assignees:['(nieprzypisane)'];
      persons.forEach(p=>{ if(!map.has(p)) map.set(p,[]); map.get(p).push({...t}); });
    });
    const out=[];
    for(const [emp,items] of map.entries()){
      const sorted=items.sort((a,b)=>a.start-b.start || a.end-b.end);
      const withLanes=assignLanes(sorted).map(it=>{
        const L=it.start<viewStart?viewStart:it.start;
        const R=it.end>viewEnd?viewEnd:it.end;
        const left=Math.max(0, diffDays(viewStart,L)*dayW);
        const width=Math.max((diffDays(L,R)+1)*dayW-6, dayW-6);
        return {...it,left,width};
      });
      const lanesCount=withLanes.reduce((m,it)=>Math.max(m,it.lane+1),1);
      out.push({emp,items:withLanes,lanesCount});
    }
    return out.sort((a,b)=>b.items.length-a.items.length || a.emp.localeCompare(b.emp,'pl'));
  },[legendFiltered,dayW,viewStart,viewEnd]);

  /* obciążenie + podsumowania */
  const loadByEmp=useMemo(()=>{
    const map=new Map();
    const workdays=days.filter(d=>!(isWeekend(d)||isHolidayFn(d))).length||1;
    rows.forEach(r=>{
      const set=new Set();
      r.items.forEach(it=>{
        const L=it.start<viewStart?viewStart:it.start;
        const R=it.end>viewEnd?viewEnd:it.end;
        for(let dd=L; dd<=R; dd=addDays(dd,1)){
          if(!(isWeekend(dd)||isHolidayFn(dd))) set.add(fmt(dd));
        }
      });
      map.set(r.emp,{busy:set.size,workdays});
    });
    return map;
  },[rows,days,viewStart,viewEnd,isHolidayFn]);

  const summaryByEmp = useMemo(()=>{
    const map=new Map();
    rows.forEach(r=>{
      const byStatus = Object.fromEntries(STATUS_ORDER.map(s=>[s,0]));
      r.items.forEach(it=>{
        const s=it.status; if(byStatus[s]==null) byStatus[s]=0; byStatus[s]++;
      });
      map.set(r.emp, {
        total: r.items.length,
        byStatus
      });
    });
    return map;
  },[rows]);

  const occDotStyle = (ratio)=>{
    let bg='var(--ok)';
    if(ratio>=0.67) bg='var(--error)';
    else if(ratio>=0.34) bg='var(--warn)';
    return { display:'inline-block', width:8, height:8, borderRadius:999, background:bg, marginRight:6 };
  };

  const gotoTask=id=>navigate(`/zadania/moje/${id}`);

  const typesInScope=useMemo(()=>{
    const m=new Map(); prelim.forEach(t=>{ const tp=t.type||'Inne'; m.set(tp,(m.get(tp)||0)+1); });
    return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
  },[prelim]);
  const kindsInScope=useMemo(()=>{
    const m=new Map(); prelim.forEach(t=>{ const kd=t.kind||'zadanie'; m.set(kd,(m.get(kd)||0)+1); });
    return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
  },[prelim]);

  /* ===== Tooltip + highlight legendy ===== */
  const [tip,setTip] = useState(null); // {x,y,side,it, barRect}
  const [hl,setHl] = useState(null);   // np. {type:'Raport...'} lub {status:'w toku'}

  const showTip = (e, it, emp) => {
    const rect = e.currentTarget.getBoundingClientRect(); // viewport coords
    const midX = rect.left + rect.width / 2;
    const x = clamp(midX, 12, window.innerWidth - 12);
    // tymczasowo mniej-więcej nad paskiem; dokładne Y po zmierzeniu wysokości dymka:
    setTip({
      x,
      y: rect.top - GAP,
      side: 'top',
      it: { ...it, emp },
      barRect: { top: rect.top, bottom: rect.bottom }
    });
    setHl({ type: it.type, status: it.status, diff: it.difficulty, prio: it.priority, kind: it.kind });
  };
  const hideTip = () => { setTip(null); setHl(null); };

  useLayoutEffect(()=>{
    if(!tip) return;
    const el = document.querySelector('.ts-tooltip');
    if(!el) return;
    const h = el.offsetHeight;
    // przelicz X (na wypadek zmiany szerokości okna)
    const x = clamp(tip.x, 12, window.innerWidth - 12);
    // docelowy Y dokładnie nad paskiem
    let side = 'top';
    let yTop = tip.barRect.top - h - GAP;
    let y = yTop;
    if (yTop < 6) { // brak miejsca nad – flip pod
      y = tip.barRect.bottom + GAP;
      side = 'bottom';
    }
    if (x !== tip.x || y !== tip.y || side !== tip.side) {
      setTip(prev => prev ? { ...prev, x, y, side } : prev);
    }
  },[tip]);

  const rootClass =
    `tasksschedule${compact ? ' theme-compact' : ''}${flat ? ' theme-flat' : ''}${hl ? ' hl-mode' : ''}`;

  /* =============== render =============== */
  return (
    <div className={rootClass} style={{ ['--ts-left-w']: `${LEFT_W}px` }}>
      {/* TOP BAR */}
      <div className='ts-toolbar ts-toolbar-grid'>
        <div className='group search-group'>
          <label className='lbl'>Szukaj</label>
          <input className='form-control ts-search' placeholder='Szukaj tytułu, badania, osoby…' value={q} onChange={e=>setQ(e.target.value)} />
        </div>

        <div className='group term-group'>
          <label className='lbl'>Termin</label>
          <div className='inline'>
            <select className='form-control' value={rangeMode} onChange={e=>setRangeMode(e.target.value)}>
              <option value='ten_tydzien'>Ten tydzień</option>
              <option value='nastepny_tydzien'>Następny tydzień</option>
              <option value='goto'>Idź do daty…</option>
            </select>
            {rangeMode==='goto' && (
              <input className='form-control ts-date' type='date' value={gotoDate} onChange={e=>setGotoDate(e.target.value)} />
            )}
          </div>
        </div>

        <div className='group emp-group'>
          <label className='lbl'>Pracownik</label>
          <select className='form-control' value={empF} onChange={e=>setEmpF(e.target.value)}>
            <option value='wszyscy'>Wszyscy</option>
            {employeesList.map(p=>(<option key={p} value={p}>{p}</option>))}
          </select>
        </div>

        <div className='group range-group'>
          <label className='lbl'>Zakres</label>
          <div className='range-ctrl'>
            <button type='button' className='rc-btn' onClick={()=>zoomBy(-1)} aria-label='Mniej dni'>−</button>
            <span className='rc-value'>{visibleDays} dni</span>
            <button type='button' className='rc-btn' onClick={()=>zoomBy(1)} aria-label='Więcej dni'>+</button>
          </div>
        </div>

        <div className='group clear-group'>
          <button type='button' className='btn-icon' onClick={clearAllFilters} aria-label='Wyczyść filtry' title='Wyczyść filtry'>×</button>
        </div>
      </div>

      {/* LEGENDA */}
      <div className='ts-legend'>
        <div className='lg-grid'>

          <section className='lg-card compact'>
            <h4>Oś czasu</h4>
            <div className='lg-list'>
              <span className='lg-item'><i className='swatch sw-weekend'/>Weekend</span>
              <span className='lg-item'><i className='swatch sw-holiday'/>Święto</span>
            </div>
          </section>

          <section className='lg-card compact'>
            <h4>Etapy</h4>
            <div className='lg-list'>
              {typesInScope.slice(0,12).map(([tp,cnt])=>{
                const col = typeColors(tp);
                const on = typeQuick===tp;
                const hlOn = !!hl && hl.type===tp;
                return (
                  <button
                    key={tp}
                    type='button'
                    className={`btn-type ${on?'is-on':''} ${hlOn?'is-hl':''}`}
                    onClick={()=>setTypeQuick(p=>p===tp?'wszystkie':tp)}
                    onMouseEnter={()=>setHl({type:tp})}
                    onMouseLeave={()=>setHl(null)}
                    title={tp}
                    style={{
                      '--chip-bg': col.chipBg,
                      '--chip-bg-on': col.chipBgOn,
                      '--chip-br': col.chipBr,
                      '--chip-dot': col.dot
                    }}
                    data-type={tp}
                  >
                    <span className='t'>{tp}</span>
                    <span className='c'>{cnt}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className='lg-card compact'>
            <h4>Statusy</h4>
            <div className='lg-list'>
              {STATUS_ORDER.map(key=>{
                const sClass = STATUS_CLASS[key] || '';
                const hlOn = !!hl && hl.status===key;
                return (
                  <button
                    key={key}
                    type='button'
                    className={`btn-status ${sClass} ${statusQuick.has(key)?'is-on':''} ${hlOn?'is-hl':''}`}
                    onClick={()=>setStatusQuick(prev=>{ const ns=new Set(prev); ns.has(key)?ns.delete(key):ns.add(key); return ns; })}
                    onMouseEnter={()=>setHl({status:key})}
                    onMouseLeave={()=>setHl(null)}
                    data-status={key}
                  >
                    <i className='badge' />
                    <span className='t'>{key}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className='lg-card'>
            <h4>Trudność</h4>
            <div className='lg-list'>
              {[1,2,3].map(n=>{
                const hlOn = !!hl && hl.diff===n;
                return (
                  <button
                    key={n}
                    type='button'
                    className={`chip diff-chip l${n} ${diffSet.has(n)?'is-on':''} ${hlOn?'is-hl':''}`}
                    onClick={()=>{
                      setDiffSet(prev=>{
                        const s=new Set(prev);
                        if(s.size===1 && s.has(n)) return s;
                        s.has(n)?s.delete(n):s.add(n);
                        return s;
                      });
                    }}
                    onMouseEnter={()=>setHl({diff:n})}
                    onMouseLeave={()=>setHl(null)}
                    data-diff={n}
                  >
                    {n===1?'Niska':n===2?'Średnia':'Wysoka'}
                  </button>
                );
              })}
            </div>
          </section>

          <section className='lg-card'>
            <h4>Priorytet</h4>
            <div className='lg-list'>
              {[1,2,3].map(n=>{
                const hlOn = !!hl && hl.prio===n;
                return (
                  <button
                    key={n}
                    type='button'
                    className={`chip prio-chip p${n} ${prioSet.has(n)?'is-on':''} ${hlOn?'is-hl':''}`}
                    onClick={()=>{
                      setPrioSet(prev=>{
                        const s=new Set(prev);
                        if(s.size===1 && s.has(n)) return s;
                        s.has(n)?s.delete(n):s.add(n);
                        return s;
                      });
                    }}
                    onMouseEnter={()=>setHl({prio:n})}
                    onMouseLeave={()=>setHl(null)}
                    data-prio={n}
                  >
                    {n===1?'Niski':n===2?'Średni':'Wysoki'}
                  </button>
                );
              })}
            </div>
          </section>

          <section className='lg-card'>
            <h4>Rodzaj</h4>
            <div className='lg-list'>
              {kindsInScope.map(([k,c])=>{
                const col = typeColors(`kind:${k}`);
                const on = kindSet.has(k);
                const hlOn = !!hl && hl.kind===k;
                return (
                  <button
                    key={k}
                    type='button'
                    className={`btn-type ${on?'is-on':''} ${hlOn?'is-hl':''}`}
                    onClick={()=>{
                      setKindSet(prev=>{
                        const s=new Set(prev);
                        if(s.size===1 && s.has(k)) return s;
                        s.has(k)?s.delete(k):s.add(k);
                        return s;
                      });
                    }}
                    onMouseEnter={()=>setHl({kind:k})}
                    onMouseLeave={()=>setHl(null)}
                    style={{
                      '--chip-bg': col.chipBg,
                      '--chip-bg-on': col.chipBgOn,
                      '--chip-br': col.chipBr,
                      '--chip-dot': col.dot
                    }}
                    data-kind={k}
                  >
                    <span className='t'>{k}</span>
                    <span className='c'>{c}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* WYKRES */}
      <div className='ts-wrap' ref={wrapRef}>
        <div className='ts-headrow'>
          <div className='ts-corner' style={{ width: LEFT_W }}>
            <div className='c-month'>
              {days[0] && monthName(days[0])}
              {days[0] && monthName(days[0])!==monthName(days[visibleDays-1]) ? ` / ${monthName(days[visibleDays-1])}` : ''}
            </div>
            <div className='c-range'>{fmt(viewStart)} – {fmt(viewEnd)}</div>
          </div>

          <div className='ts-headcells' style={{ width: contentW }}>
            <div className='ts-heat'>
              {days.map((day, idx) => {
                const val=dayLoad.counts[idx]; const pct=Math.round((val/dayLoad.max)*100);
                const isW=isWeekend(day), isH=isHolidayFn(day);
                return (
                  <div key={`h-${fmt(day)}`} className={`heat-cell ${isW?'is-weekend':''} ${isH?'is-holiday':''}`} style={{ width: dayW }} title={`Zadań: ${val}`}>
                    <span className='heat-count'>{val}</span>
                    <div className='heat-bar wide' style={{ height: `${pct}%` }} />
                  </div>
                );
              })}
            </div>
            <div className='ts-headerline'>
              {days.map(day=>(
                <div key={fmt(day)} className={`ts-col ${isWeekend(day)?'is-weekend':''} ${isHolidayFn(day)?'is-holiday':''}`} style={{ width: dayW }}>
                  <div className='ts-col-day'>{String(day.getDate()).padStart(2,'0')}</div>
                  <div className='ts-col-dow'>{day.toLocaleDateString('pl-PL',{weekday:'short'})}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='ts-rows'>
          {rows.map(row=>{
            const load=loadByEmp.get(row.emp)||{busy:0,workdays:1};
            const ratio=(load.workdays? (load.busy/load.workdays):0);
            const loadPct=Math.round(ratio*100);
            const sum=summaryByEmp.get(row.emp) || {total:0,byStatus:{}};

            return (
              <div className='ts-row' key={row.emp}>
                <div className='ts-name'>
                  <span style={occDotStyle(ratio)} />
                  <div className='name'>{row.emp}</div>

                  {/* PODSUMOWANIE PER PRACOWNIK */}
                  <div className='emp-summary' title={`${sum.total} zadań`}>
                    <span className='pill total'>∑ {sum.total}</span>
                    {STATUS_ORDER.filter(s=>sum.byStatus?.[s]>0).map(s=>(
                      <span key={s} className={`pill status-pill ${STATUS_CLASS[s]||''}`}>{sum.byStatus[s]}</span>
                    ))}
                  </div>

                  <div className='flex-spacer' />
                  <div className='load' title={`Obciążenie: ${load.busy}/${load.workdays} (${loadPct}%)`}>
                    <div className='loadbar' style={{ width: `${loadPct}%` }} />
                  </div>
                </div>

                <div className='ts-lane' style={{ width: contentW, height: Math.max(48, row.lanesCount*48) }}>
                  {days.map(day=>(
                    <div key={`g-${row.emp}-${fmt(day)}`} className={`ts-gridcell ${isWeekend(day)?'is-weekend':''} ${isHolidayFn(day)?'is-holiday':''}`} style={{ width: dayW }} />
                  ))}

                  {(leaves||[]).filter(l=>{
                    const person=l.person||l.employee||l.assignee;
                    return person===row.emp;
                  }).map((l,i)=>{
                    const s=dFromStr(l.from), e=dFromStr(l.to); if(!s||!e) return null;
                    if(e<viewStart || s>viewEnd) return null;
                    const L=s<viewStart?viewStart:s, R=e>viewEnd?viewEnd:e;
                    const left=diffDays(viewStart,L)*dayW;
                    const width=(diffDays(L,R)+1)*dayW-6;
                    return (
                      <div key={`${row.emp}-leave-${i}`} className='ts-leave' style={{ left, width: Math.max(8, width) }}>
                        <span className='ts-leave-label'>{l.type||'Urlop'}</span>
                      </div>
                    );
                  })}

                  {row.items.map(it=>{
                    const sClass=STATUS_CLASS[it.status]||'status--assigned';
                    const col = typeColors(it.type || it.kind || '');
                    const hlOn = isHighlighted(it, hl);
                    return (
                      <button
                        key={`${row.emp}-${it.id}-${it.lane}`}
                        className={`ts-bar ${sClass} diff-${it.difficulty} prio-${it.priority} ${hlOn?'is-hl':''}`}
                        style={{ left: it.left, width: it.width, top: 6 + it.lane*48, '--chip-dot': col.dot }}
                        onClick={()=>gotoTask(it.id)}
                        onMouseEnter={(e)=>showTip(e, it, row.emp)}
                        onMouseLeave={hideTip}
                        type='button'
                        aria-label={`${it.title}`}
                        title={`${it.title} (${fmt(it.start)}–${fmt(it.end)})`}
                      >
                        <div className='bar-label'>
                          <span className='title'>{it.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* dzisiejsza linia */}
        {today>=viewStart && today<=viewEnd && (
          <div
            style={{ position:'absolute', top:0, bottom:0, left: LEFT_W + diffDays(viewStart,today)*dayW, width:1, background:'var(--error)', opacity:.7, pointerEvents:'none' }}
            aria-hidden='true'
          />
        )}

        {/* TOOLTIP — precyzyjnie nad/pod paskiem (fixed, koordy okna) */}
        {tip && (
          <div className={`ts-tooltip ${tip.side==='bottom' ? 'dir-below' : ''}`} style={{ left: tip.x, top: tip.y }}>
            <div className='ttitle'>{tip.it.title}</div>
            <div className='tmeta'>
              <span>📅 {fmt(tip.it.start)} – {fmt(tip.it.end)}</span>
              <span>•</span>
              <span>👤 {tip.it.emp}</span>
              <span>•</span>
              <span>🛈 {tip.it.status}</span>
            </div>
            <div className='tmeta'>
              <span>Etap: {tip.it.type}</span>
              <span>•</span>
              <span>Rodzaj: {tip.it.kind}</span>
              <span>•</span>
              <span>Trudność: {tip.it.difficulty}</span>
              <span>•</span>
              <span>Priorytet: {tip.it.priority}</span>
            </div>
          </div>
        )}
      </div>

      {/* NAV pod wykresem */}
      <div className='ts-nav'>
        <div className='controls'>
          <button type='button' className='nav-btn pill' onClick={()=>shiftWindowBy(-7)} title='Wstecz o tydzień'>« 7</button>
          <button type='button' className='nav-btn round icon' onClick={()=>shiftWindowBy(-1)} aria-label='Poprzedni dzień'><ChevronLeft size={ICON_SIZE} /></button>
          <button type='button' className='nav-btn primary' onClick={()=>gotoTodayWeek}>Dziś (tydz.)</button>
          <button type='button' className='nav-btn round icon' onClick={()=>shiftWindowBy(1)} aria-label='Następny dzień'><ChevronRight size={ICON_SIZE} /></button>
          <button type='button' className='nav-btn pill' onClick={()=>shiftWindowBy(7)} title='Naprzód o tydzień'>7 »</button>
        </div>
      </div>
    </div>
  );
}

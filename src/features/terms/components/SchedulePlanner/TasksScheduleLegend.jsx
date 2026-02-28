import React from 'react'
import { typeColors } from '../../utils/infer'
import { STATUS_ORDER, STATUS_CLASS } from '../../utils/constants'

export default function TasksScheduleLegend({
  hl,
  setHl,

  typesInScope = [],
  kindsInScope = [],

  typeQuick,
  setTypeQuick,

  statusQuick,
  setStatusQuick,

  diffSet,
  setDiffSet,

  prioSet,
  setPrioSet,

  kindSet,
  setKindSet,
}) {
  return (
    <div className="ts-legend">
      <div className="lg-grid">
        <section className="lg-card compact">
          <h4>Oś czasu</h4>
          <div className="lg-list">
            <span className="lg-item">
              <i className="swatch sw-weekend" />
              Weekend
            </span>
            <span className="lg-item">
              <i className="swatch sw-holiday" />
              Święto
            </span>
          </div>
        </section>

        <section className="lg-card compact">
          <h4>Etapy</h4>
          <div className="lg-list">
            {typesInScope.slice(0, 12).map(([tp, cnt]) => {
              const col = typeColors(tp)
              const on = typeQuick === tp
              const hlOn = !!hl && hl.type === tp

              return (
                <button
                  key={tp}
                  type="button"
                  className={`btn-type ${on ? 'is-on' : ''} ${hlOn ? 'is-hl' : ''}`}
                  onClick={() => setTypeQuick((p) => (p === tp ? 'wszystkie' : tp))}
                  onMouseEnter={() => setHl({ type: tp })}
                  onMouseLeave={() => setHl(null)}
                  title={tp}
                  style={{
                    '--chip-bg': col.chipBg,
                    '--chip-bg-on': col.chipBgOn,
                    '--chip-br': col.chipBr,
                    '--chip-dot': col.dot,
                  }}
                  data-type={tp}
                >
                  <span className="t">{tp}</span>
                  <span className="c">{cnt}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="lg-card compact">
          <h4>Statusy</h4>
          <div className="lg-list">
            {STATUS_ORDER.map((key) => {
              const sClass = STATUS_CLASS[key] || ''
              const hlOn = !!hl && hl.status === key

              return (
                <button
                  key={key}
                  type="button"
                  className={`btn-status ${sClass} ${statusQuick?.has?.(key) ? 'is-on' : ''} ${hlOn ? 'is-hl' : ''}`}
                  onClick={() =>
                    setStatusQuick((prev) => {
                      const ns = new Set(prev)
                      ns.has(key) ? ns.delete(key) : ns.add(key)
                      return ns
                    })
                  }
                  onMouseEnter={() => setHl({ status: key })}
                  onMouseLeave={() => setHl(null)}
                  data-status={key}
                >
                  <i className="badge" />
                  <span className="t">{key}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="lg-card">
          <h4>Trudność</h4>
          <div className="lg-list">
            {[1, 2, 3].map((n) => {
              const hlOn = !!hl && hl.diff === n
              const isOn = diffSet?.has?.(n)

              return (
                <button
                  key={n}
                  type="button"
                  className={`ts-chip diff-chip l${n} ${isOn ? 'is-on' : ''} ${hlOn ? 'is-hl' : ''}`}
                  onClick={() => {
                    setDiffSet((prev) => {
                      const s = new Set(prev)
                      if (s.size === 1 && s.has(n)) return s
                      s.has(n) ? s.delete(n) : s.add(n)
                      return s
                    })
                  }}
                  onMouseEnter={() => setHl({ diff: n })}
                  onMouseLeave={() => setHl(null)}
                  data-diff={n}
                >
                  {n === 1 ? 'Niska' : n === 2 ? 'Średnia' : 'Wysoka'}
                </button>
              )
            })}
          </div>
        </section>

        <section className="lg-card">
          <h4>Priorytet</h4>
          <div className="lg-list">
            {[1, 2, 3].map((n) => {
              const hlOn = !!hl && hl.prio === n
              const isOn = prioSet?.has?.(n)

              return (
                <button
                  key={n}
                  type="button"
                  className={`ts-chip prio-chip p${n} ${isOn ? 'is-on' : ''} ${hlOn ? 'is-hl' : ''}`}
                  onClick={() => {
                    setPrioSet((prev) => {
                      const s = new Set(prev)
                      if (s.size === 1 && s.has(n)) return s
                      s.has(n) ? s.delete(n) : s.add(n)
                      return s
                    })
                  }}
                  onMouseEnter={() => setHl({ prio: n })}
                  onMouseLeave={() => setHl(null)}
                  data-prio={n}
                >
                  {n === 1 ? 'Niski' : n === 2 ? 'Średni' : 'Wysoki'}
                </button>
              )
            })}
          </div>
        </section>

        <section className="lg-card">
          <h4>Rodzaj</h4>
          <div className="lg-list">
            {kindsInScope.map(([k, c]) => {
              const col = typeColors(`kind:${k}`)
              const on = kindSet?.has?.(k)
              const hlOn = !!hl && hl.kind === k

              return (
                <button
                  key={k}
                  type="button"
                  className={`btn-type ${on ? 'is-on' : ''} ${hlOn ? 'is-hl' : ''}`}
                  onClick={() => {
                    setKindSet((prev) => {
                      const s = new Set(prev)
                      if (s.size === 1 && s.has(k)) return s
                      s.has(k) ? s.delete(k) : s.add(k)
                      return s
                    })
                  }}
                  onMouseEnter={() => setHl({ kind: k })}
                  onMouseLeave={() => setHl(null)}
                  style={{
                    '--chip-bg': col.chipBg,
                    '--chip-bg-on': col.chipBgOn,
                    '--chip-br': col.chipBr,
                    '--chip-dot': col.dot,
                  }}
                  data-kind={k}
                >
                  <span className="t">{k}</span>
                  <span className="c">{c}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
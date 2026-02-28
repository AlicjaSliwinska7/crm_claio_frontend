// src/features/terms/components/planner/BacklogPanel.jsx
import React from 'react'
import { LayoutGrid, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  TYPE_LABELS,
  STATUS_LABELS,
  DIFF_LABELS,
  PRIO_LABELS,
  fmt,
  setDataId,
} from '../../hooks/useSchedulePlanner'

export default function BacklogPanel({
  dragKey,
  allow,
  dropTo,
  onDropBacklog,

  query,
  setQuery,
  filters,
  setFilters,

  filteredBacklog,
  pagedBacklog,

  perPage,
  setPerPage,
  pageSafe,
  totalPages,
  setPage,

  onTaskOpenRoute,
}) {
  return (
    <aside
      className={`plan-zone zone--backlog ${dragKey === 'BACKLOG' ? 'is-over' : ''}`}
      onDragEnter={(e) => allow(e, 'BACKLOG')}
      onDragOver={(e) => allow(e, 'BACKLOG')}
      onDrop={dropTo(onDropBacklog)}
    >
      <div className="zone__head">
        <LayoutGrid size={16} /> Do zaplanowania
      </div>

      <div className="zone__filters">
        {/* Szukaj */}
        <div className="input-with-icon">
          <Search size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj zadań po tytule/ID" />
        </div>

        {/* Legendy/Filtry (rozwijane) */}
        <div className="legend-filters">
          <details className="legend-group" open>
            <summary>
              Rodzaj zadania <span className="chev">▾</span>
            </summary>
            <div className="legend-group__chips">
              {['admin', 'client', 'tech', 'other'].map((t) => (
                <span
                  key={t}
                  className={`legend-chip ${filters.type[t] ? 'is-on' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, type: { ...f.type, [t]: !f.type[t] } }))}
                >
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        t === 'admin'
                          ? 'var(--c-type-admin)'
                          : t === 'client'
                            ? 'var(--c-type-client)'
                            : t === 'tech'
                              ? 'var(--c-type-tech)'
                              : 'var(--c-type-other)',
                    }}
                  />
                  {t}
                </span>
              ))}
            </div>
          </details>

          <details className="legend-group">
            <summary>
              Status zadania <span className="chev">▾</span>
            </summary>
            <div className="legend-group__chips">
              {['assigned', 'progress', 'blocked', 'done'].map((s) => (
                <span
                  key={s}
                  className={`legend-chip ${filters.status[s] ? 'is-on' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, status: { ...f.status, [s]: !f.status[s] } }))}
                >
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        s === 'assigned'
                          ? 'var(--c-status-assigned)'
                          : s === 'progress'
                            ? 'var(--c-status-progress)'
                            : s === 'blocked'
                              ? 'var(--c-status-blocked)'
                              : 'var(--c-status-done)',
                    }}
                  />
                  {s}
                </span>
              ))}
            </div>
          </details>

          <details className="legend-group">
            <summary>
              Trudność zadania <span className="chev">▾</span>
            </summary>
            <div className="legend-group__chips">
              {['easy', 'medium', 'hard'].map((dif) => (
                <span
                  key={dif}
                  className={`legend-chip ${filters.difficulty[dif] ? 'is-on' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, difficulty: { ...f.difficulty, [dif]: !f.difficulty[dif] } }))}
                >
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        dif === 'easy'
                          ? 'var(--c-diff-easy)'
                          : dif === 'medium'
                            ? 'var(--c-diff-medium)'
                            : 'var(--c-diff-hard)',
                    }}
                  />
                  {dif}
                </span>
              ))}
            </div>
          </details>

          <details className="legend-group">
            <summary>
              Priorytet zadania <span className="chev">▾</span>
            </summary>
            <div className="legend-group__chips">
              {['high', 'normal', 'low'].map((p) => (
                <span
                  key={p}
                  className={`legend-chip ${filters.priority[p] ? 'is-on' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, priority: { ...f.priority, [p]: !f.priority[p] } }))}
                >
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        p === 'high'
                          ? 'var(--c-prio-high)'
                          : p === 'normal'
                            ? 'var(--c-prio-normal)'
                            : 'var(--c-prio-low)',
                    }}
                  />
                  {p}
                </span>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Lista backlogu */}
      <div className="zone__list">
        {filteredBacklog.length === 0 && <div className="empty">Brak zadań do zaplanowania</div>}

        {pagedBacklog.map((t) => (
          <button
            key={t.id}
            className={`chip chip--${t.priority || 'normal'}`}
            draggable
            onDragStart={(e) => setDataId(e, t.id)}
            onClick={() => onTaskOpenRoute(t)}
            title={`Otwórz szczegóły • ${t.title}`}
          >
            <span className="chip__dots" onClickCapture={(e) => e.stopPropagation()}>
              <span className={`dot dot--type-${t.type || 'other'} has-card`} title={`Rodzaj: ${TYPE_LABELS[t.type || 'other']}`}>
                <span className="tipcard tipcard--mini" style={{ top: 'calc(100% + 8px)', bottom: 'auto' }}>
                  <div className="tipcard__head">
                    <b>Rodzaj</b>
                  </div>
                  <div className="tipcard__body">{TYPE_LABELS[t.type || 'other']}</div>
                </span>
              </span>

              <span className={`dot dot--status-${t.status || 'assigned'} has-card`} title={`Status: ${STATUS_LABELS[t.status || 'assigned']}`}>
                <span className="tipcard tipcard--mini" style={{ top: 'calc(100% + 8px)', bottom: 'auto' }}>
                  <div className="tipcard__head">
                    <b>Status</b>
                  </div>
                  <div className="tipcard__body">{STATUS_LABELS[t.status || 'assigned']}</div>
                </span>
              </span>

              <span className={`dot dot--diff-${t.difficulty || 'medium'} has-card`} title={`Trudność: ${DIFF_LABELS[t.difficulty || 'medium']}`}>
                <span className="tipcard tipcard--mini" style={{ top: 'calc(100% + 8px)', bottom: 'auto' }}>
                  <div className="tipcard__head">
                    <b>Trudność</b>
                  </div>
                  <div className="tipcard__body">{DIFF_LABELS[t.difficulty || 'medium']}</div>
                </span>
              </span>

              <span className={`dot dot--prio-${t.priority || 'normal'} has-card`} title={`Priorytet: ${PRIO_LABELS[t.priority || 'normal']}`}>
                <span className="tipcard tipcard--mini" style={{ top: 'calc(100% + 8px)', bottom: 'auto' }}>
                  <div className="tipcard__head">
                    <b>Priorytet</b>
                  </div>
                  <div className="tipcard__body">{PRIO_LABELS[t.priority || 'normal']}</div>
                </span>
              </span>
            </span>

            <span className="chip__deadline">{t.deadline ? fmt(new Date(t.deadline), 'dd LLL') : '—'}</span>
            <span className="chip__title">{t.title}</span>
          </button>
        ))}
      </div>

      {/* PAGINACJA */}
      {filteredBacklog.length > 0 && (
        <div className="zone__pagination">
          <div className="pager__left">
            <span className="pager__label">Na stronę:</span>
            <select className="pager__select" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="pager__center">
            <button className="pager__btn" onClick={() => setPage(1)} disabled={pageSafe === 1} title="Pierwsza">
              <ChevronsLeft size={14} />
            </button>
            <button className="pager__btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1} title="Poprzednia">
              <ChevronLeft size={14} />
            </button>

            <span className="pager__info">
              {(pageSafe - 1) * perPage + 1}–{Math.min(pageSafe * perPage, filteredBacklog.length)} z {filteredBacklog.length}
            </span>

            <button className="pager__btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} title="Następna">
              <ChevronRight size={14} />
            </button>
            <button className="pager__btn" onClick={() => setPage(totalPages)} disabled={pageSafe === totalPages} title="Ostatnia">
              <ChevronsRight size={14} />
            </button>
          </div>

          <div className="pager__right">
            <span className="pager__page">
              Strona {pageSafe}/{totalPages}
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
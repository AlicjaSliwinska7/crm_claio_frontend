import React, { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isBefore, isSameDay, parseISO, startOfDay, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import DashboardWidget from '../../shared/widgets/DashboardWidget'
import '../styles/home-page.css'

// --- helpers (spójne z DayOverviewModal) ---
function toDate(d) {
  if (!d) return null
  if (d instanceof Date) return d
  try {
    return parseISO(d)
  } catch {
    return null
  }
}

function sameDayByAny(item, fields, selected) {
  return fields.some(f => item[f] && isSameDay(toDate(item[f]), selected))
}

export default function Home({
  currentUser = 'Alicja Śliwińska',
  tasks = [],
  posts = [],
  trainings = [],
  samples = [],
  orders = [],
  meetings = [],
}) {
  const navigate = useNavigate()

  const todayRef = useRef(startOfDay(new Date()))
  const today = todayRef.current

  const {
    myTasksToday,
    allTasksToday,
    postsToday,
    trainingsToday,
    inProgressToday,
    latestMeetings,
  } = useMemo(() => {
    const myTasks = tasks.filter(
      t =>
        sameDayByAny(t, ['dueDate', 'date', 'targetDate'], today) &&
        Array.isArray(t.assignees) &&
        t.assignees.includes(currentUser)
    )

    const allTasks = tasks.filter(t => sameDayByAny(t, ['dueDate', 'date', 'targetDate'], today))
    const postsT = posts.filter(p => sameDayByAny(p, ['date', 'targetDate'], today))
    const trainingsT = trainings.filter(tr => sameDayByAny(tr, ['date'], today))

    const s = (samples || []).filter(
      smp =>
        (smp.status || '').toLowerCase() === 'w trakcie badań' &&
        (!smp.receivedDate || !isBefore(today, toDate(smp.receivedDate)))
    )
    const o = (orders || []).filter(ord => (ord.stage || '').toLowerCase() === 'w trakcie badań')
    const inProg = [
      ...s.map(x => ({ kind: 'sample', ...x })),
      ...o.map(x => ({ kind: 'order', ...x })),
    ]

    const cutoff = subDays(today, 14)
    const latest = (meetings || [])
      .filter(m => {
        const d = toDate(m.date)
        return d && !isBefore(d, cutoff)
      })
      .sort((a, b) => toDate(b.date) - toDate(a.date))
      .slice(0, 6)

    return {
      myTasksToday: myTasks,
      allTasksToday: allTasks,
      postsToday: postsT,
      trainingsToday: trainingsT,
      inProgressToday: inProg,
      latestMeetings: latest,
    }
  }, [tasks, posts, trainings, samples, orders, meetings, currentUser])

  const widgets = [
    {
      icon: 'fa-flask',
      title: 'Badania w toku',
      value: String(inProgressToday.length),
      onClick: () => navigate('/badania/w-trakcie'),
    },
    {
      icon: 'fa-file-invoice-dollar',
      title: 'Oferty wygasające',
      value: '5',
      onClick: () => navigate('/sprzedaz/oferty?wygasajace=1'),
    },
    {
      icon: 'fa-clock',
      title: 'Zbliżające się terminy',
      value: '2',
      onClick: () => navigate('/administracja/nadgodziny'),
    },
  ]

  return (
    <div className="home-page">
      <div className="home-grid">
        {/* KAFELKI */}
        <div className="home-widgets">
          {widgets.map((w, i) => (
            <DashboardWidget
              key={i}
              icon={w.icon}
              title={w.title}
              value={w.value}
              onClick={w.onClick}
            />
          ))}
        </div>

        {/* separator */}
        <hr className="home-hr home-hr--soft home-hr--xl" />

        {/* DZIŚ – SEKCJE */}
        <div className="home-sections">
          <header className="home-header">
            <h2>Dzisiejszy przegląd</h2>
            <div className="home-date">{format(today, 'EEEE, d MMMM yyyy', { locale: pl })}</div>
          </header>

          <div className="home-columns">
            {/* Moje zadania */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Moje zadania
                  <span className="home-card-count">{myTasksToday.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/zadania/nowe?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {myTasksToday.length === 0 ? (
                <p className="home-empty">Brak zadań przypisanych na dziś.</p>
              ) : (
                <ul className="home-list">
                  {myTasksToday.map(t => (
                    <li key={t.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className={`home-status home-status--${(t.status || 'default').toLowerCase()}`} />
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/zadania/${t.id}`)}
                        >
                          {t.title || t.name || `Zadanie ${t.id}`}
                        </button>
                      </div>
                      {t.status && <div className="home-list__meta">Status: {t.status}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Wszystkie zadania */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Wszystkie zadania
                  <span className="home-card-count">{allTasksToday.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/zadania/nowe?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {allTasksToday.length === 0 ? (
                <p className="home-empty">Brak zadań na dziś.</p>
              ) : (
                <ul className="home-list">
                  {allTasksToday.map(t => (
                    <li key={t.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className={`home-status home-status--${(t.status || 'default').toLowerCase()}`} />
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/zadania/${t.id}`)}
                        >
                          {t.title || t.name || `Zadanie ${t.id}`}
                        </button>
                      </div>
                      {t.status && <div className="home-list__meta">Status: {t.status}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Posty */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Posty
                  <span className="home-card-count">{postsToday.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/tablica/dodaj?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {postsToday.length === 0 ? (
                <p className="home-empty">Brak postów na dziś.</p>
              ) : (
                <ul className="home-list">
                  {postsToday.map(p => (
                    <li key={p.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className="home-dot" />
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/tablica/post/${p.id}`)}
                        >
                          {p.title || `Post ${p.id}`}
                        </button>
                      </div>
                      {Array.isArray(p.tags) && p.tags.length > 0 && (
                        <div className="home-list__meta">Tag: {p.tags[0]}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Spotkania */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Spotkania
                  <span className="home-card-count">{latestMeetings.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/spotkania/nowe?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {latestMeetings.length === 0 ? (
                <p className="home-empty">Brak spotkań na dziś.</p>
              ) : (
                <ul className="home-list">
                  {latestMeetings.map(m => (
                    <li key={m.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className="home-badge">SP</span>
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/spotkania/${m.id}`)}
                        >
                          {m.title || `Spotkanie ${m.id}`}
                        </button>
                      </div>
                      <div className="home-list__meta">
                        {m.date ? format(toDate(m.date), 'd MMM yyyy', { locale: pl }) : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Szkolenia */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Szkolenia
                  <span className="home-card-count">{trainingsToday.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/szkolenia/dodaj?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {trainingsToday.length === 0 ? (
                <p className="home-empty">Brak szkoleń na dziś.</p>
              ) : (
                <ul className="home-list">
                  {trainingsToday.map(tr => (
                    <li key={tr.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className="home-badge home-badge--soft">SZK</span>
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/szkolenia/${tr.id}`)}
                        >
                          {tr.title || `Szkolenie ${tr.id}`}
                        </button>
                      </div>
                      {Array.isArray(tr.participants) && tr.participants.length > 0 && (
                        <div className="home-list__meta">
                          Uczestnicy: {tr.participants.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Przyrządy */}
            <section className="home-card">
              <div className="home-card-head">
                <h3>
                  Wyłączone z użycia
                  <span className="home-card-count">{trainingsToday.length}</span>
                </h3>
                <button
                  className="home-btn home-btn--ghost"
                  onClick={() => navigate(`/szkolenia/dodaj?date=${today.toISOString()}`)}
                >
                  +
                </button>
              </div>
              {trainingsToday.length === 0 ? (
                <p className="home-empty">Brak przyrządów wyłączonych z użycia.</p>
              ) : (
                <ul className="home-list">
                  {trainingsToday.map(tr => (
                    <li key={tr.id} className="home-list__item">
                      <div className="home-list__main">
                        <span className="home-badge home-badge--soft">SZK</span>
                        <button
                          className="home-linklike"
                          onClick={() => navigate(`/szkolenia/${tr.id}`)}
                        >
                          {tr.title || `Szkolenie ${tr.id}`}
                        </button>
                      </div>
                      {Array.isArray(tr.participants) && tr.participants.length > 0 && (
                        <div className="home-list__meta">
                          Uczestnicy: {tr.participants.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* sekcja wide */}
            <div className="home-section-rule" aria-hidden="true" style={{ gridColumn: '1 / -1' }} />

            <section className="home-card home-card--wide">
              <div className="home-card-head">
                <h3>
                  Aktualnie prowadzone badania
                  <span className="home-card-count">{inProgressToday.length}</span>
                </h3>
                <button className="home-btn" onClick={() => navigate('/badania/w-trakcie')}>
                  Wszystkie
                </button>
              </div>
              {inProgressToday.length === 0 ? (
                <p className="home-empty">Brak aktywnych badań.</p>
              ) : (
                <ul className="home-list">
                  {inProgressToday.map((x, idx) => (
                    <li key={x.id || idx} className="home-list__item">
                      <div className="home-list__main">
                        <span className="home-badge">
                          {x.kind === 'order' ? 'Zlecenie' : 'Próbka'}
                        </span>
                        <span className="home-list__text">
                          {(x.subject || x.orderNumber || x.id || '').toString()}
                          {x.client || x.zleceniodawca || x.clientName ? (
                            <span className="home-muted">
                              {' '}
                              — {x.client || x.zleceniodawca || x.clientName}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="home-section-rule" aria-hidden="true" style={{ gridColumn: '1 / -1' }} />
          </div>

          {/* Ustalenia z ostatnich spotkań */}
          <section className="home-card">
            <div className="home-card-head">
              <h3>
                Ustalenia z ostatnich spotkań
                <span className="home-card-count">{latestMeetings.length}</span>
              </h3>
              <button className="home-btn" onClick={() => navigate('/spotkania')}>
                Wszystkie
              </button>
            </div>
            {latestMeetings.length === 0 ? (
              <p className="home-empty">Brak spotkań w ostatnich 14 dniach.</p>
            ) : (
              <ul className="home-meetings">
                {latestMeetings.map(m => (
                  <li key={m.id} className="home-meeting-item">
                    <div className="home-meeting-row">
                      <div
                        className="home-meeting-title"
                        onClick={() => navigate(`/spotkania/${m.id}`)}
                      >
                        {m.title || `Spotkanie ${m.id}`}
                      </div>
                      <div className="home-meeting-date">
                        {m.date ? format(toDate(m.date), 'd MMM yyyy', { locale: pl }) : ''}
                      </div>
                    </div>
                    {Array.isArray(m.decisions) && m.decisions.length > 0 ? (
                      <ul className="home-decisions">
                        {m.decisions.slice(0, 3).map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="home-muted">Brak zapisanych ustaleń.</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

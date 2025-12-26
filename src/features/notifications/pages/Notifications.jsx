// src/features/notifications/pages/Notifications.js
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useNotifications } from '../../../app/providers/NotificationsProvider.jsx'
import '../styles/notifications.css'
import { CheckCheck, Plus, Check } from 'lucide-react'
import AddNotificationModal from '../components/AddNotificationModal'

const TYPE_FILTERS = [
  { id: 'all', label: 'Wszystkie typy' },
  { id: 'reminder', label: 'Przypomnienia' },
  { id: 'task', label: 'Zadania' },
  { id: 'post', label: 'Posty' },
  { id: 'training', label: 'Szkolenia' },
  { id: 'meeting', label: 'Spotkania' },
]

function EmptyState({ label }) {
  return <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>{label}</div>
}

function NotificationRow({ n, onClick, onMarkRead, onMarkUnread }) {
  const date = new Date(n.date)
  const dateStr = date.toLocaleString()
  return (
    <div
      className={`notif-row ${n.type} ${n.read ? 'read' : 'unread'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="notif-main">
        <div className="notif-title">
          <strong>{n.title}</strong>
          {!n.read && <span className="notif-dot" aria-label="nieprzeczytane" />}
        </div>
        <div className="notif-message">{n.message}</div>
        <div className="notif-meta">
          <span className="notif-actor">{n.actor}</span>
          <span className="notif-date">{dateStr}</span>
        </div>
      </div>
      {!n.read ? (
        <button
          type="button"
          className="btn-chip"
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead?.()
          }}
          title="Oznacz jako przeczytane"
        >
          <Check size={16} /> Odhacz
        </button>
      ) : (
        <button
          type="button"
          className="btn-chip btn-chip--ghost"
          onClick={(e) => {
            e.stopPropagation()
            onMarkUnread?.()
          }}
          title="Oznacz jako nieprzeczytane"
        >
          <CheckCheck size={16} /> Przeczytane
        </button>
      )}
    </div>
  )
}

// yyyy-mm-dd + hh:mm -> ISO
function toISODateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = (timeStr || '09:00').split(':').map(Number)
  const local = new Date(y, (m || 1) - 1, d || 1, hh || 9, mm || 0, 0)
  return local.toISOString()
}

export default function Notifications() {
  const { items, markRead, markUnread, markAllRead, addNotification } = useNotifications()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [showAddModal, setShowAddModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')

  const routeTab = location.pathname.endsWith('/nieprzeczytane')
    ? 'unread'
    : location.pathname.endsWith('/wszystkie')
    ? 'all'
    : null
  const tabParam = searchParams.get('tab')
  const tab = routeTab || tabParam || 'all'

  const setTab = (t) => {
    navigate(`/powiadomienia/${t === 'unread' ? 'nieprzeczytane' : 'wszystkie'}`)
  }

  const list = useMemo(() => {
    const base = tab === 'unread' ? items.filter((n) => !n.read) : items
    if (typeFilter === 'all') return base
    return base.filter((n) => (n.type || 'reminder') === typeFilter)
  }, [items, tab, typeFilter])

  const handleAddSubmit = ({ title, message, date, time, type }) => {
    const iso = toISODateTime(date, time)
    addNotification({
      type: type || 'reminder',
      title,
      message,
      actor: 'Ty',
      date: iso,
      link: '',
    })
    setShowAddModal(false)
    setTab('all')
    setTypeFilter('all')
  }

  return (
    <div className="notifications-page">
      <div className="notifications-toolbar">
        <div className="notifications-left">
          <div className="tabs">
            <button
              type="button"
              className={`tab ${tab === 'all' ? 'active' : ''}`}
              onClick={() => setTab('all')}
              aria-pressed={tab === 'all'}
            >
              Wszystkie
            </button>
            <button
              type="button"
              className={`tab ${tab === 'unread' ? 'active' : ''}`}
              onClick={() => setTab('unread')}
              aria-pressed={tab === 'unread'}
            >
              Nieprzeczytane
            </button>
          </div>

          <div className="notif-type-select-wrap">
            <select
              id="notif-type-select"
              className="notif-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {TYPE_FILTERS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions" style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={markAllRead}
            title="Oznacz wszystkie jako przeczytane"
          >
            <CheckCheck size={16} /> Odznacz wszystkie
          </button>

          <button
            type="button"
            className="add-client-btn"
            onClick={() => setShowAddModal(true)}
            title="Dodaj powiadomienie na wybrany dzień"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="card list-card">
        {list.length === 0 ? (
          <EmptyState
            label={
              tab === 'unread'
                ? 'Brak nieprzeczytanych powiadomień dla wybranego typu.'
                : 'Brak powiadomień dla wybranego typu.'
            }
          />
        ) : (
          list.map((n) => (
            <NotificationRow
              key={n.id}
              n={n}
              onClick={() => {
                markRead(n.id)
                if (n.link) navigate(n.link)
              }}
              onMarkRead={() => markRead(n.id)}
              onMarkUnread={() => markUnread(n.id)}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <AddNotificationModal
          open
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}
    </div>
  )
}

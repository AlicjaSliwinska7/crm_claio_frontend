// src/features/equipment/components/CalibrationSchedule/DayDetails.jsx
import React from 'react'

// (opcjonalnie) normalizacja kluczy statusów do formy z utils
function normalizeStatusKey(key) {
  if (!key) return ''
  const k = String(key)
  if (k === 'due_soon' || k === 'overdue' || k === 'in_progress') return k
  switch (k) {
    case 'dueSoon':
    case 'due-soon':
    case 'DUE_SOON':
      return 'due_soon'
    case 'inProgress':
    case 'in-progress':
    case 'progress':
    case 'IN_PROGRESS':
      return 'in_progress'
    default:
      return k
  }
}

export default function DayDetails({
  dateKey,
  byNext,
  byPlannedSend,
  byPlannedReturn,
  STATUS_COLOR,
  STATUS_LABEL,
  COLOR_PLANNED_SEND,
  COLOR_PLANNED_RETURN,
  // ⬇️ NOWE, opcjonalne handlery (pokażą „×” tylko gdy przekazane)
  onUnassignNext,   // (itemId: string, dateKey: string) => void
  onUnplanSend,     // (itemId: string, dateKey: string) => void
  onUnplanReturn,   // (itemId: string, dateKey: string) => void
}) {
  const send = byPlannedSend.get(dateKey) || []
  const ret  = byPlannedReturn.get(dateKey) || []
  const nxt  = (byNext.get(dateKey) || []).filter(e => e._status)

  const Row = ({ dot, ring, text, canRemove = false, onRemove }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: 8,
      alignItems: 'center',
      fontSize: 14,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {dot  && <span style={{ width: 10, height: 10, borderRadius: 999, background: dot }} />}
        {ring && <span style={{ width: 10, height: 10, borderRadius: 999, border: `2px solid ${ring}` }} />}
      </div>
      <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>
      {canRemove && (
        <button
          type='button'
          onClick={onRemove}
          aria-label='Usuń z tego dnia'
          title='Usuń z tego dnia'
          style={{
            appearance: 'none',
            border: '1px solid #e6eef6',
            background: '#fff',
            color: '#b91c1c',
            width: 26,
            height: 26,
            borderRadius: 8,
            fontWeight: 800,
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <section>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Plany wysyłki</div>
        {send.length === 0 ? (
          <div style={{ color: '#6a7f96' }}>Brak planów wysyłki.</div>
        ) : (
          send.map(e => (
            <Row
              key={e.id}
              ring={COLOR_PLANNED_SEND}
              text={`${e.name} (${e.code || e.id})${e.shippingPlace ? ` — ${e.shippingPlace}` : ''}`}
              canRemove={!!onUnplanSend}
              onRemove={() => onUnplanSend?.(e.id, dateKey)}
            />
          ))
        )}
      </section>

      <section>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Plany zwrotu</div>
        {ret.length === 0 ? (
          <div style={{ color: '#6a7f96' }}>Brak planów zwrotu.</div>
        ) : (
          ret.map(e => (
            <Row
              key={e.id}
              ring={COLOR_PLANNED_RETURN}
              text={`${e.name} (${e.code || e.id})${e.shippingPlace ? ` — ${e.shippingPlace}` : ''}`}
              canRemove={!!onUnplanReturn}
              onRemove={() => onUnplanReturn?.(e.id, dateKey)}
            />
          ))
        )}
      </section>

      <section>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Terminy kalibracji</div>
        {nxt.length === 0 ? (
          <div style={{ color: '#6a7f96' }}>Brak terminów kalibracji.</div>
        ) : (
          nxt.map(e => {
            const norm = normalizeStatusKey(e._status)
            const color = (norm && STATUS_COLOR?.[norm]) || '#6a7f96'
            const label = STATUS_LABEL?.[norm] || '—'
            return (
              <Row
                key={e.id}
                dot={color}
                text={`${e.name} (${e.code || e.id})${e.shippingPlace ? ` — ${e.shippingPlace}` : ''} — ${label}`}
                canRemove={!!onUnassignNext}
                onRemove={() => onUnassignNext?.(e.id, dateKey)}
              />
            )
          })
        )}
      </section>
    </div>
  )
}

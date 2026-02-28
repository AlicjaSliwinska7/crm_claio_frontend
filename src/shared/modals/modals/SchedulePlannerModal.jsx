// src/shared/modals/modals/SchedulePlannerModal.jsx
import React, { useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import Modal from './Modal'
import '../../../shared/modals/styles/schedule-planner-modal.css'

import SchedulePlanner from '../../../features/terms/pages/SchedulePlanner'

const parseISODate = (s) => {
  if (!s) return null
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isFinite(d.getTime()) ? d : null
}

export default function SchedulePlannerModal() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sp] = useSearchParams()

  const initialDate = useMemo(() => {
    const q = sp.get('date')
    const fromQuery = parseISODate(q)
    return fromQuery || new Date()
  }, [sp])

  const onClose = useCallback(() => {
    const bg = location.state?.background
    if (bg?.pathname) {
      navigate(bg.pathname + (bg.search || ''), { replace: true })
      return
    }
    navigate(-1)
  }, [navigate, location.state])

  return (
    <Modal
      title={null}
      onClose={onClose}
      size="lg"
      className="spm-modal"
      closeOnBackdrop
      closeOnEsc
      hideHeader
    >
      <div className="spm">
        {/* ✅ zostaje tylko ten “dolny” header */}
        <div className="spm__header">
          <div className="spm__title">Zaplanuj grafik</div>
          <button className="spm__close" onClick={onClose} aria-label="Zamknij" type="button">
            ×
          </button>
        </div>

        <div className="spm__body">
          <SchedulePlanner initialDate={initialDate} />
        </div>
      </div>
    </Modal>
  )
}
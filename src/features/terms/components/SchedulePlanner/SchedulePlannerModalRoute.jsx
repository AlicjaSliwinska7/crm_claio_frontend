import React, { useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import SchedulePlannerModal from '../../../shared/modals/modals/SchedulePlannerModal.jsx'
import SchedulePlanner from './SchedulePlanner'

const parseISODate = (s) => {
  if (!s) return null
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isFinite(d.getTime()) ? d : null
}

export default function SchedulePlannerModalRoute() {
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
    <SchedulePlannerModal title="Zaplanuj grafik" onClose={onClose}>
      <SchedulePlanner initialDate={initialDate} />
    </SchedulePlannerModal>
  )
}
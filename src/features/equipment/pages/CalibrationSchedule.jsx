import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addDays, format, isAfter } from 'date-fns'
import { pl } from 'date-fns/locale'

import '../styles/calibration-schedule-top.css'
import '../styles/calibration-kpis.css'
import '../styles/calibration-calendar.css'

import Modal from '../../../shared/modals/modals/Modal'

import FiltersBar from '../components/CalibrationSchedule/FiltersBar'
import ItemsTable from '../components/CalibrationSchedule/ItemsTable'
import PaginationBar from '../components/CalibrationSchedule/PaginationBar'
import CalendarSection from '../components/CalibrationSchedule/CalendarSection'
import DayDetails from '../components/CalibrationSchedule/DayDetails'
import InfoModal from '../components/CalibrationSchedule/InfoModal'
import KPICards from '../components/CalibrationSchedule/KPICards'

import {
  COLOR_PLANNED_SEND,
  COLOR_PLANNED_RETURN,
  MSG,
} from '../config/calibration.config'

import useKnownPlaces from '../hooks/useKnownPlaces'
import usePlanValidation from '../hooks/usePlanValidation'
import useCalendarDnD from '../hooks/useCalendarDnD'
import exportCsv from '../utils/exportCsv'

import { MOCK, toDate, fmt, toStr, computeStatus, buildDays } from '../utils/utils'

/* =========================================================
   Statusy harmonogramu (TO NIE SĄ statusy laboratoriów)
   - używane do filtrów, KPI, kolorów w tabeli i w kalendarzu
   ========================================================= */
const STATUS = Object.freeze({
  OK: 'ok',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  IN_PROGRESS: 'inProgress',
})

const STATUS_LABEL = Object.freeze({
  [STATUS.OK]: 'OK',
  [STATUS.DUE_SOON]: 'Wkrótce',
  [STATUS.OVERDUE]: 'Po terminie',
  [STATUS.IN_PROGRESS]: 'W trakcie',
})

const STATUS_COLOR = Object.freeze({
  [STATUS.OK]: '#16a34a',
  [STATUS.DUE_SOON]: '#f59e0b',
  [STATUS.OVERDUE]: '#ef4444',
  [STATUS.IN_PROGRESS]: '#3b82f6',
})

export default function CalibrationSchedule({ items = MOCK, holidays = [] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const preset = searchParams.get('preset') || 'month'

  const [data, setData] = useState(items)

  // Filtry
  const [statusFilter, setStatusFilter] = useState('all')
  const [soonPreset, setSoonPreset] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Lewy panel
  const [leftPreset, setLeftPreset] = useState('30')
  const [leftIncludeOverdue, setLeftIncludeOverdue] = useState(true)

  // Sort
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  // Kalendarz
  const [cursor, setCursor] = useState(new Date())

  // Modal planowania
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planDate, setPlanDate] = useState('')
  const [planReturn, setPlanReturn] = useState('')
  const [planPlace, setPlanPlace] = useState('')
  const [planItemId, setPlanItemId] = useState('')
  const [placeQuery, setPlaceQuery] = useState('')

  // Modal dnia (lupa)
  const [inspectOpen, setInspectOpen] = useState(false)
  const [inspectKey, setInspectKey] = useState('')

  // Info modal
  const [info, setInfo] = useState({ open: false, title: 'Informacja', message: '' })
  const openInfo = (message, title = 'Informacja') => setInfo({ open: true, title, message })
  const closeInfo = () => setInfo((prev) => ({ ...prev, open: false }))

  // Święta: zawsze Set (bo niżej używasz .has())
  const holidaySet = useMemo(() => {
    return new Set(Array.isArray(holidays) ? holidays : [])
  }, [holidays])

  // Hooki pomocnicze
  const knownPlaces = useKnownPlaces(data)
  const placeSuggestions = useMemo(() => {
    const q = placeQuery.trim().toLowerCase()
    if (!q) return knownPlaces.slice(0, 8)
    return knownPlaces.filter((n) => n.toLowerCase().includes(q)).slice(0, 8)
  }, [knownPlaces, placeQuery])

  const soonDays = useMemo(
    () => (soonPreset === '7' ? 7 : soonPreset === '90' ? 90 : 30),
    [soonPreset]
  )

  const { isInvalidPlanDay, guardOrInfo } = usePlanValidation({ holidaySet, openInfo, MSG })
  const { handleDropOnDay, handleDropToLeftList, allowDrop } = useCalendarDnD({
    data,
    setData,
    guardOrInfo,
    isInvalidPlanDay,
    MSG,
  })

  // Filtrowanie
  const filtered = useMemo(() => {
    const today = new Date()
    const base = (data || []).map((x) => ({ ...x, _status: computeStatus(x, today, soonDays) }))
    const a = base.filter((x) => (statusFilter === 'all' ? true : x._status === statusFilter))

    if (soonPreset === 'all') return a

    let from = today
    let to = addDays(today, soonPreset === '7' ? 7 : soonPreset === '30' ? 30 : soonPreset === '90' ? 90 : 0)

    if (soonPreset === 'custom') {
      from = customFrom ? toDate(customFrom) : null
      to = customTo ? toDate(customTo) : null
    }

    return a.filter((x) => {
      const next = toDate(x.nextCalibration)
      if (!next) return false
      if (from && next < from) return false
      if (to && isAfter(next, to)) return false
      return true
    })
  }, [data, statusFilter, soonPreset, customFrom, customTo, soonDays])

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered]
    const val = (r, k) => {
      if (['nextCalibration', 'lastCalibration', 'plannedSend', 'plannedReturn'].includes(k)) {
        const d = toDate(r[k])
        return d ? d.getTime() : 0
      }
      if (k === '_status') return STATUS_LABEL[r._status] || ''
      return toStr(r[k]).toLowerCase()
    }
    arr.sort((a, b) =>
      val(a, sortKey) < val(b, sortKey)
        ? sortDir === 'asc'
          ? -1
          : 1
        : val(a, sortKey) > val(b, sortKey)
          ? sortDir === 'asc'
            ? 1
            : -1
          : 0
    )
    return arr
  }, [filtered, sortKey, sortDir])

  const onSort = (key) =>
    setSortDir((d) => (sortKey === key ? (d === 'asc' ? 'desc' : 'asc') : 'asc')) || setSortKey(key)

  // Paginacja
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const pageSizeOptions = [10, 20, 30, 50, 100]
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])
  const start = (page - 1) * pageSize
  const end = Math.min(total, start + pageSize)
  const visibleRows = sorted.slice(start, end)

  // Eksport (tylko widoczna strona)
  const exportVisibleCSV = () =>
    exportCsv({ rows: visibleRows, filename: 'harmonogram-wzorcowania_strona.csv', STATUS_LABEL })

  // Kalendarz: dni + mapy
  const days = buildDays(cursor)

  const byNext = useMemo(() => {
    const m = new Map()
    ;(data || []).forEach((x) => {
      const d = toDate(x.nextCalibration)
      if (!d) return
      const key = format(d, 'yyyy-MM-dd')
      if (!m.has(key)) m.set(key, [])
      m.get(key).push({ ...x, _status: computeStatus(x, new Date(), 30) })
    })
    return m
  }, [data])

  const byPlannedSend = useMemo(() => {
    const m = new Map()
    ;(data || []).forEach((x) => {
      const d = toDate(x.plannedSend)
      if (!d) return
      const key = format(d, 'yyyy-MM-dd')
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(x)
    })
    return m
  }, [data])

  const byPlannedReturn = useMemo(() => {
    const m = new Map()
    ;(data || []).forEach((x) => {
      const d = toDate(x.plannedReturn)
      if (!d) return
      const key = format(d, 'yyyy-MM-dd')
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(x)
    })
    return m
  }, [data])

  // Klik na dzień → modal planowania
  const openPlanModal = (date) => {
    if (guardOrInfo(isInvalidPlanDay(date), 'PLAN_PAST_WEEKEND_HOLIDAY')) return
    const iso = fmt(date)
    setPlanDate(iso)
    setPlanReturn('')
    setPlanPlace('')
    setPlanItemId('')
    setPlaceQuery('')
    setPlanModalOpen(true)
  }

  const submitPlan = (e) => {
    e.preventDefault()
    if (!planItemId || !planDate) return

    const sendD = toDate(planDate)
    const returnD = planReturn ? toDate(planReturn) : null

    if (guardOrInfo(isInvalidPlanDay(sendD), 'SEND_PAST_WEEKEND_HOLIDAY')) return

    if (returnD) {
      if (returnD < sendD) return openInfo(MSG.RETURN_BEFORE_SEND || 'Zwrot nie może być wcześniej niż wysyłka.')
      if (guardOrInfo(isInvalidPlanDay(returnD), 'RETURN_PAST_WEEKEND_HOLIDAY')) return
    }

    setData((prev) =>
      prev.map((it) =>
        it.id === planItemId
          ? {
              ...it,
              plannedSend: planDate,
              plannedReturn: planReturn || it.plannedReturn || '',
              shippingPlace: planPlace || it.shippingPlace || '',
            }
          : it
      )
    )
    setPlanModalOpen(false)
  }

  // Lista „Do wzorcowania”
  const toCalibrate = useMemo(() => {
    const today = new Date()
    const horizonDays = leftPreset === '7' ? 7 : leftPreset === '90' ? 90 : 30
    const horizon = addDays(today, horizonDays)
    return (data || [])
      .filter((x) => !x.plannedSend && x.nextCalibration)
      .filter((x) => {
        const next = toDate(x.nextCalibration)
        if (!next) return false
        const overdue = next < today
        if (overdue) return leftIncludeOverdue
        return !isAfter(next, horizon)
      })
      .map((x) => ({ ...x, _status: computeStatus(x, today, horizonDays) }))
      .sort(
        (a, b) =>
          (toDate(a.nextCalibration)?.getTime() ?? Infinity) - (toDate(b.nextCalibration)?.getTime() ?? Infinity)
      )
  }, [data, leftPreset, leftIncludeOverdue])

  // Lupa
  const openInspect = (date) => {
    setInspectKey(fmt(date))
    setInspectOpen(true)
  }

  // KPI
  const kpis = useMemo(() => {
    const arr = filtered
    const total = arr.length
    let dueSoon = 0,
      overdue = 0,
      inProgress = 0,
      plannedSend = 0,
      plannedReturn = 0,
      noPlace = 0
    const placeSet = new Set()
    let minNext = null,
      maxNext = null

    for (const r of arr) {
      if (r._status === STATUS.DUE_SOON) dueSoon++
      if (r._status === STATUS.OVERDUE) overdue++
      if (r._status === STATUS.IN_PROGRESS) inProgress++
      if (r.plannedSend) plannedSend++
      if (r.plannedReturn) plannedReturn++
      if (!r.shippingPlace) noPlace++
      if (r.shippingPlace) placeSet.add(r.shippingPlace)

      const n = toDate(r.nextCalibration)
      if (n) {
        if (!minNext || n < minNext) minNext = n
        if (!maxNext || n > maxNext) maxNext = n
      }
    }

    return {
      total,
      dueSoon,
      overdue,
      inProgress,
      plannedSend,
      plannedReturn,
      places: placeSet.size,
      noPlace,
      rangeFrom: minNext,
      rangeTo: maxNext,
    }
  }, [filtered])

  return (
    <div className="csx-list">
      <style>{`.csx-table thead th:nth-child(9){ text-align:center; }`}</style>

      <FiltersBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        soonPreset={soonPreset}
        setSoonPreset={setSoonPreset}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        STATUS={STATUS}
        STATUS_LABEL={STATUS_LABEL}
        pageSize={pageSize}
        setPageSize={(n) => {
          setPageSize(n)
          setPage(1)
        }}
        pageSizeOptions={pageSizeOptions}
        exportCSV={exportVisibleCSV}
        onExportCSV={exportVisibleCSV}
      />

      <div className="csx-table">
        <div className="csx-table-scroll">
          <ItemsTable
            rows={visibleRows}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={(key) => onSort(key)}
            fmt={fmt}
            toDate={toDate}
            STATUS_COLOR={STATUS_COLOR}
            STATUS_LABEL={STATUS_LABEL}
          />
        </div>
      </div>

      <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />

      <CalendarSection
        cursor={cursor}
        setCursor={setCursor}
        preset={preset}
        setSearchParams={setSearchParams}
        days={days}
        byNext={byNext}
        byPlannedSend={byPlannedSend}
        byPlannedReturn={byPlannedReturn}
        onDayClick={openPlanModal}
        onDayDrop={(e, d) => {
          const res = handleDropOnDay(e, d)
          if (res && res.fallbackFromLeftListId) {
            setPlanItemId(res.fallbackFromLeftListId)
            setPlanDate(res.targetIso)
            setPlanReturn('')
            setPlanPlace('')
            setPlaceQuery('')
            setPlanModalOpen(true)
          }
        }}
        onDayAllowDrop={allowDrop}
        isHolidayDate={(d) => holidaySet.has(fmt(d))}
        leftPreset={leftPreset}
        setLeftPreset={setLeftPreset}
        leftIncludeOverdue={leftIncludeOverdue}
        setLeftIncludeOverdue={setLeftIncludeOverdue}
        toCalibrate={toCalibrate}
        onOpenInspect={openInspect}
        STATUS_COLOR={STATUS_COLOR}
        COLOR_PLANNED_SEND={COLOR_PLANNED_SEND}
        COLOR_PLANNED_RETURN={COLOR_PLANNED_RETURN}
        onDropToLeftList={handleDropToLeftList}
      />

      <KPICards kpis={kpis} />

      {planModalOpen && (
        <Modal
          title="Zaplanuj wzorcowanie"
          onClose={() => setPlanModalOpen(false)}
          className="ui-modal ui-modal--narrow"
        >
          <form onSubmit={submitPlan} className="m-form">
            <div className="m-field">
              <label className="m-label">Data wysyłki</label>
              <input
                type="date"
                className="m-input"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                required
              />
            </div>

            <div className="m-field">
              <label className="m-label">Planowana data zwrotu</label>
              <input
                type="date"
                className="m-input"
                value={planReturn}
                onChange={(e) => setPlanReturn(e.target.value)}
              />
            </div>

            <div className="m-field" style={{ position: 'relative' }}>
              <label className="m-label">Miejsce wzorcowania</label>
              <input
                type="text"
                className="m-input"
                value={planPlace || placeQuery}
                onChange={(e) => {
                  setPlanPlace('')
                  setPlaceQuery(e.target.value)
                }}
                placeholder="np. LabTech, RADWAG Service…"
              />
              {(placeQuery || (!planPlace && knownPlaces.length > 0)) && (
                <div className="cc-suggest">
                  {placeSuggestions.length === 0 ? (
                    <div className="cc-suggest__empty">Brak podpowiedzi</div>
                  ) : (
                    placeSuggestions.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        className="cc-suggest__item"
                        onClick={() => {
                          setPlanPlace(p)
                          setPlaceQuery('')
                        }}
                      >
                        {p}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="m-field">
              <label className="m-label">Wyposażenie</label>
              <select className="m-select" value={planItemId} onChange={(e) => setPlanItemId(e.target.value)} required>
                <option value="" disabled>
                  — wybierz —
                </option>
                {data
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.code || it.id} — {it.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="m-actions m-actions--footer">
              <button type="submit" className="m-btn m-btn--primary">
                Zapisz
              </button>
              <button type="button" className="m-btn m-btn--secondary" onClick={() => setPlanModalOpen(false)}>
                Anuluj
              </button>
            </div>
          </form>

          <div className="m-section" style={{ marginTop: 6 }}>
            <small className="m-help">
              Nie można planować wysyłki w przeszłość, na weekendy i święta. Zwrot nie może być wcześniej niż wysyłka ani
              wypadać w weekend/święto.
            </small>
          </div>
        </Modal>
      )}

      {inspectOpen && (
        <Modal
          title={format(toDate(inspectKey), 'd LLLL yyyy', { locale: pl })}
          onClose={() => setInspectOpen(false)}
          className="ui-modal ui-modal--narrow"
        >
          <div className="m-section">
            <DayDetails
              dateKey={inspectKey}
              byNext={byNext}
              byPlannedSend={byPlannedSend}
              byPlannedReturn={byPlannedReturn}
              STATUS_COLOR={STATUS_COLOR}
              STATUS_LABEL={STATUS_LABEL}
              COLOR_PLANNED_SEND={COLOR_PLANNED_SEND}
              COLOR_PLANNED_RETURN={COLOR_PLANNED_RETURN}
              onUnplanSend={(id) => setData((prev) => prev.map((it) => (it.id === id ? { ...it, plannedSend: '' } : it)))}
              onUnplanReturn={(id) =>
                setData((prev) => prev.map((it) => (it.id === id ? { ...it, plannedReturn: '' } : it)))
              }
            />
          </div>

          <div className="m-actions m-actions--footer">
            <button type="button" className="m-btn m-btn--primary" onClick={() => setInspectOpen(false)}>
              Zamknij
            </button>
          </div>
        </Modal>
      )}

      <InfoModal open={info.open} title={info.title} message={info.message} onClose={closeInfo} />
    </div>
  )
}

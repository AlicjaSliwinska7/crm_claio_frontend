import React, { useEffect } from 'react'
import LeftList from './LeftList'
import CalendarGrid from './CalendarGrid'
import '../../styles/calibration-calendar.css'

export default function CalendarSection({
  cursor,
  setCursor,
  preset,
  setSearchParams,

  days,
  byNext,
  byPlannedSend,
  byPlannedReturn,

  onDayClick,
  onDayDrop,
  onDayAllowDrop,
  isHolidayDate,

  leftPreset,
  setLeftPreset,
  leftIncludeOverdue,
  setLeftIncludeOverdue,
  toCalibrate,
  onDropToLeftList,

  onOpenInspect,
  STATUS_COLOR,
  COLOR_PLANNED_SEND,
  COLOR_PLANNED_RETURN,
}) {
  useEffect(() => {
    if (preset !== 'month') {
      setSearchParams(prev => { prev.set('preset', 'month'); return prev }, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='cc-wrap'>
      <LeftList
        leftPreset={leftPreset}
        setLeftPreset={setLeftPreset}
        leftIncludeOverdue={leftIncludeOverdue}
        setLeftIncludeOverdue={setLeftIncludeOverdue}
        toCalibrate={toCalibrate}
        STATUS_COLOR={STATUS_COLOR}
        onDropToLeftList={onDropToLeftList}
      />

      <CalendarGrid
        cursor={cursor}
        setCursor={setCursor}
        days={days}
        byNext={byNext}
        byPlannedSend={byPlannedSend}
        byPlannedReturn={byPlannedReturn}
        onDayClick={onDayClick}
        onDayDrop={onDayDrop}
        onDayAllowDrop={onDayAllowDrop}
        isHolidayDate={isHolidayDate}
        onOpenInspect={onOpenInspect}
        STATUS_COLOR={STATUS_COLOR}
        COLOR_PLANNED_SEND={COLOR_PLANNED_SEND}
        COLOR_PLANNED_RETURN={COLOR_PLANNED_RETURN}
      />
    </div>
  )
}

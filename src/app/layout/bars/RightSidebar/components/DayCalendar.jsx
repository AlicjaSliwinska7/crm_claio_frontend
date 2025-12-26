// src/app/layout/bars/RightSideBar/DayCalendar.jsx
import React, { useCallback, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import { isWeekend, format, startOfDay } from 'date-fns'
import { STATIC_PL_HOLIDAYS, formatShortWeekdayPL } from '../config'

export default function DayCalendar({ customHolidays = [], onSelectDay }) {
	const [date, setDate] = useState(() => new Date())
	const customSet = useMemo(() => new Set(customHolidays), [customHolidays])

	const tileClassName = useCallback(
		({ date: tileDate }) => {
			const ymd = format(tileDate, 'yyyy-MM-dd')
			const isDayOff = isWeekend(tileDate) || STATIC_PL_HOLIDAYS.has(ymd) || customSet.has(ymd)
			return isDayOff ? 'react-calendar-day-off' : null
		},
		[customSet]
	)

	const handleDayClick = useCallback(value => onSelectDay?.(startOfDay(value)), [onSelectDay])

	return (
		<Calendar
			onClickDay={handleDayClick}
			locale='pl-PL'
			value={date}
			onChange={setDate}
			tileClassName={tileClassName}
			prev2Label={null}
			next2Label={null}
			minDetail='month'
			maxDetail='month'
			formatShortWeekday={formatShortWeekdayPL}
		/>
	)
}

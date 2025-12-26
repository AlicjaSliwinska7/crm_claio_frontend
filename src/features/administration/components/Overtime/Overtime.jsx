// src/components/Overtime.js
import React, { useCallback, useMemo, useState } from 'react'
import { format, parseISO, isWeekend, isValid, startOfMonth, endOfMonth, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import DocxMerger from 'docx-merger'
import '../styles/overtime.css' // zostaw – jeżeli masz własne rzeczy

const SHIFT_HOURS = {
	1: '6:00–14:00',
	2: '14:00–22:00',
	3: '22:00–6:00',
}
const SHIFT_TO_ROMAN = s => (s === '1' ? 'I' : s === '2' ? 'II' : s === '3' ? 'III' : '')

// --- Święta PL (stałe + ruchome) dla danego roku/zakresu ---
function easterSunday(year) {
	const a = year % 19,
		b = Math.floor(year / 100),
		c = year % 100
	const d = Math.floor(b / 4),
		e = b % 4,
		f = Math.floor((b + 8) / 25)
	const g = Math.floor((b - f + 1) / 3)
	const h = (19 * a + b - d - g + 15) % 30
	const i = Math.floor(c / 4),
		k = c % 4
	const l = (32 + 2 * e + 2 * i - h - k) % 7
	const m = Math.floor((a + 11 * h + 22 * l) / 451)
	const month = Math.floor((h + l - 7 * m + 114) / 31)
	const day = ((h + l - 7 * m + 114) % 31) + 1
	return new Date(year, month - 1, day)
}
function polishHolidaysForYear(year) {
	const fixed = [
		[1, 1],
		[1, 6],
		[5, 1],
		[5, 3],
		[8, 15],
		[11, 1],
		[11, 11],
		[12, 25],
		[12, 26],
	]
	const easter = easterSunday(year)
	const easterMon = addDays(easter, 1)
	const corpusChristi = addDays(easter, 60)
	return [...fixed.map(([m, d]) => new Date(year, m - 1, d)), easter, easterMon, corpusChristi].map(d =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()
	)
}
function allYearsBetween(from, to) {
	const y0 = from.getFullYear()
	const y1 = to.getFullYear()
	const years = []
	for (let y = y0; y <= y1; y++) years.push(y)
	return years
}

// --- I/O szablonów ---
async function fetchTemplateArrayBuffer(path) {
	const res = await fetch(path)
	if (!res.ok) throw new Error(`Nie mogę pobrać szablonu: ${path}`)
	const blob = await res.blob()
	return await blob.arrayBuffer()
}

/**
 * Props:
 * - schedule: { [employeeName]: { 'YYYY-MM-DD': '1'|'2'|'3'|'u'|'l' } }
 * - employees?: string[]
 */
function Overtime({ schedule = {}, employees: employeesProp }) {
	const [fromDate, setFromDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'))
	const [toDate, setToDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'))

	const employees = useMemo(() => {
		if (Array.isArray(employeesProp) && employeesProp.length) return employeesProp
		return Object.keys(schedule || {}).sort()
	}, [employeesProp, schedule])

	const from = useMemo(() => (fromDate ? parseISO(fromDate) : null), [fromDate])
	const to = useMemo(() => (toDate ? parseISO(toDate) : null), [toDate])

	const isRangeValid = useMemo(() => from && to && isValid(from) && isValid(to) && from <= to, [from, to])

	const isHoliday = useMemo(() => {
		if (!isRangeValid) return () => false
		const set = new Set()
		for (const y of allYearsBetween(from, to)) {
			for (const s of polishHolidaysForYear(y)) set.add(s)
		}
		return date => {
			const dstr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString()
			return isWeekend(date) || set.has(dstr)
		}
	}, [from, to, isRangeValid])

	const generateDOCX = useCallback(async () => {
		if (!isRangeValid) {
			alert('Nieprawidłowy zakres dat.')
			return
		}

		const parts = []
		for (const name of employees) {
			const grafik = schedule?.[name] || {}
			for (const [dateStr, shift] of Object.entries(grafik)) {
				const date = parseISO(String(dateStr))
				if (!isValid(date)) continue
				if (date < from || date > to) continue
				if (!isHoliday(date)) continue
				if (!/^[123]$/.test(String(shift))) continue

				const hours = SHIFT_HOURS[shift] || '––'
				const formattedDate = format(date, 'dd.MM.yyyy', { locale: pl })
				const contractHalfDate = date.getMonth() < 6 ? `01.01.${date.getFullYear()}` : `01.07.${date.getFullYear()}`

				let arrayBuffer
				try {
					arrayBuffer = await fetchTemplateArrayBuffer('/templates/karta_nadgodzin.docx')
				} catch (err) {
					console.error('❌ Błąd pobierania szablonu:', err)
					alert('Nie udało się pobrać szablonu karty nadgodzin.')
					return
				}

				try {
					const zip = new PizZip(arrayBuffer)
					const doc = new Docxtemplater(zip, {
						paragraphLoop: true,
						linebreaks: true,
						delimiters: { start: '[[', end: ']]' },
					})
					doc.setData({ name, date: formattedDate, hours, date2: contractHalfDate, company: 'EXIDE' })
					doc.render()
					const out = doc.getZip().generate({ type: 'uint8array' })
					parts.push(out)
				} catch (err) {
					console.error('❌ Błąd renderowania dokumentu:', err)
					alert('Błąd podczas generowania dokumentu (karta). Szczegóły w konsoli.')
					return
				}
			}
		}

		if (!parts.length) {
			alert('Brak kart do wygenerowania w podanym zakresie (dni wolne + zmiana 1/2/3).')
			return
		}

		const merger = new DocxMerger({}, parts)
		const mergedBlob = await new Promise(resolve => merger.save('blob', resolve))
		saveAs(mergedBlob, `Karty_nadgodzin_${fromDate}_–_${toDate}.docx`)
	}, [employees, schedule, from, to, isHoliday, isRangeValid, fromDate, toDate])

	const generateSummaryDOCX = useCallback(async () => {
		if (!isRangeValid) {
			alert('Nieprawidłowy zakres dat.')
			return
		}

		let arrayBuffer
		try {
			arrayBuffer = await fetchTemplateArrayBuffer('/templates/zestawienie_nadgodzin.docx')
		} catch (err) {
			console.error('❌ Błąd pobierania szablonu zestawienia:', err)
			alert('Nie udało się pobrać szablonu zestawienia.')
			return
		}

		const parts = []

		for (const name of employees) {
			const grafik = schedule?.[name] || {}
			const data = {
				name,
				month: format(from, 'LLLL', { locale: pl }),
				year: format(from, 'yyyy'),
			}

			let sum1 = 0,
				sum2 = 0,
				sum3 = 0

			const monthStart = startOfMonth(from)
			const monthEnd = endOfMonth(from)
			let dIdx = 1
			for (let cur = new Date(monthStart); cur <= monthEnd; cur = addDays(cur, 1), dIdx++) {
				const dayStr = format(cur, 'yyyy-MM-dd')
				const prefix = `day${dIdx}`
				const shift = grafik[dayStr]

				if (!isHoliday(cur) || !shift) {
					data[`${prefix}_firma`] = ''
					data[`${prefix}_8h1`] = ''
					data[`${prefix}_50`] = ''
					data[`${prefix}_8h2`] = ''
					data[`${prefix}_shift`] = ''
					data[`${prefix}_8h3`] = ''
					data[`${prefix}_x`] = ''
					continue
				}

				data[`${prefix}_firma`] = '123 - EXIDE'
				data[`${prefix}_8h1`] = '8'
				data[`${prefix}_50`] = 'X'
				data[`${prefix}_8h2`] = '8'
				data[`${prefix}_shift`] = SHIFT_TO_ROMAN(String(shift))
				data[`${prefix}_8h3`] = String(shift) === '2' ? '8' : 'X'
				data[`${prefix}_x`] = 'X'

				sum1 += 8
				sum2 += 8
				if (String(shift) === '2') sum3 += 8
			}

			data.sum1 = sum1 ? String(sum1) : ''
			data.sum2 = sum2 ? String(sum2) : ''
			data.sum3 = sum3 ? String(sum3) : ''

			try {
				const zip = new PizZip(arrayBuffer)
				const doc = new Docxtemplater(zip, {
					paragraphLoop: true,
					linebreaks: true,
					delimiters: { start: '[[', end: ']]' },
				})
				doc.setData(data)
				doc.render()

				const out = doc.getZip().generate({ type: 'uint8array' })
				parts.push(out)
			} catch (err) {
				console.error('❌ Błąd renderowania dla', name, err)
				alert(`Błąd przy generowaniu zestawienia dla: ${name}`)
				return
			}
		}

		if (!parts.length) {
			alert('Nie znaleziono żadnych zestawień do wygenerowania.')
			return
		}

		const merger = new DocxMerger({}, parts)
		const mergedBlob = await new Promise(resolve => merger.save('blob', resolve))
		saveAs(mergedBlob, `Zestawienie_nadgodzin_${fromDate}_–_${toDate}.docx`)
	}, [employees, schedule, from, isHoliday, isRangeValid, fromDate, toDate])

	const canGenerate = isRangeValid

	return (
		<div className='overtime-page-wrapper'>
			<div className='overtime-cards-wrapper'>
				<h3 className='overtime-title'>Rozliczenie nadgodzin</h3>

				{/* PRZEDZIAŁ DAT – klasy z „registers” */}
				<div className='overtime-controls registers-range'>
					<label className='reg-field'>
						<span className='reg-label'>Od</span>
						<input
							className='reg-input reg-input--date'
							type='date'
							value={fromDate}
							onChange={e => setFromDate(e.target.value)}
						/>
					</label>

					<label className='reg-field'>
						<span className='reg-label'>Do</span>
						<input
							className='reg-input reg-input--date'
							type='date'
							value={toDate}
							onChange={e => setToDate(e.target.value)}
						/>
					</label>

					{/* DROPDOWN z ikoną pobierania (jak w documents) */}
					<div className={`overtime-dropdown ${!canGenerate ? 'is-disabled' : ''}`}>
						<button
							className='dropdown-toggle dropdown-toggle--icon'
							aria-haspopup='menu'
							aria-expanded='false'
							aria-label='Generuj dokumenty'
							title='Generuj…'
							disabled={!canGenerate}>
							<i className='fa-solid fa-download' aria-hidden='true'></i>
						</button>
						<ul className='dropdown-menu' role='menu'>
							<li role='menuitem' onClick={generateDOCX}>
								Karty nadgodzin
							</li>
							<li role='menuitem' onClick={generateSummaryDOCX}>
								Zestawienia nadgodzin
							</li>
						</ul>
					</div>
				</div>

				{!isRangeValid && <p className='overtime-hint'>Ustaw poprawny zakres dat, aby włączyć generowanie.</p>}
			</div>
		</div>
	)
}

export default Overtime

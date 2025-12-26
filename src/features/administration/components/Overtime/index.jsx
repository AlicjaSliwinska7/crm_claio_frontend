import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO, isWeekend, isValid, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { pl } from 'date-fns/locale'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import DocxMerger from 'docx-merger'
import '../../styles/overtime.css'

// ---- helpers: święta PL (stałe + ruchome) ----
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
function addDaysJS(date, d) {
	const r = new Date(date)
	r.setDate(r.getDate() + d)
	return r
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
	const easterMon = addDaysJS(easter, 1)
	const corpusChristi = addDaysJS(easter, 60)
	return [...fixed.map(([m, d]) => new Date(year, m - 1, d)), easter, easterMon, corpusChristi].map(d =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()
	)
}
function makeHolidayChecker(fromDate, toDate) {
	// wspiera zakres obejmujący różne lata
	const years = new Set([fromDate.getFullYear(), toDate.getFullYear()])
	const holidaySet = new Set()
	years.forEach(y => polishHolidaysForYear(y).forEach(s => holidaySet.add(s)))
	return date => {
		const dstr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString()
		return isWeekend(date) || holidaySet.has(dstr)
	}
}

// ---- stałe / mapowania ----
const SHIFT_HOURS = { 1: '6:00–14:00', 2: '14:00–22:00', 3: '22:00–6:00' }
const SHIFT_TO_ROMAN = s => (s === '1' ? 'I' : s === '2' ? 'II' : s === '3' ? 'III' : '')

// ---- I/O szablonów ----
async function fetchTemplateArrayBuffer(path) {
	const res = await fetch(path)
	if (!res.ok) throw new Error(`Nie mogę pobrać szablonu: ${path}`)
	const blob = await res.blob()
	return await blob.arrayBuffer()
}

export default function Overtime({ schedule = {}, employees: employeesProp }) {
	// schedule: { [employeeName]: { 'YYYY-MM-DD': '1'|'2'|'3'|'u'|'l' } }
	const [fromDate, setFromDate] = useState('')
	const [toDate, setToDate] = useState('')
	const [open, setOpen] = useState(false)
	const ddRef = useRef(null)

	const employees = useMemo(() => {
		if (Array.isArray(employeesProp) && employeesProp.length) return employeesProp
		return Object.keys(schedule || {}).sort()
	}, [employeesProp, schedule])

	// domyślnie: bieżący miesiąc
	useEffect(() => {
		const now = new Date()
		const from = startOfMonth(now)
		const to = endOfMonth(now)
		setFromDate(format(from, 'yyyy-MM-dd'))
		setToDate(format(to, 'yyyy-MM-dd'))
	}, [])

	// zamykanie dropdownu po kliknięciu poza
	useEffect(() => {
		const onDoc = e => {
			if (!ddRef.current) return
			if (!ddRef.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener('mousedown', onDoc)
		return () => document.removeEventListener('mousedown', onDoc)
	}, [])

	const generateDOCX = async () => {
		if (!fromDate || !toDate) {
			alert('Uzupełnij wszystkie pola.')
			return
		}
		const from = parseISO(fromDate)
		const to = parseISO(toDate)
		if (!isValid(from) || !isValid(to) || from > to) {
			alert('Nieprawidłowy zakres dat.')
			return
		}

		const isHoliday = makeHolidayChecker(from, to)
		const parts = []

		for (const name of employees) {
			const grafik = schedule?.[name] || {}
			// iterujemy tylko po wpisach pracownika (szybciej niż po całym zakresie)
			for (const [dateStr, shift] of Object.entries(grafik)) {
				const date = parseISO(String(dateStr))
				if (!isValid(date)) continue
				if (date < from || date > to) continue
				if (!isHoliday(date)) continue
				if (!/^[123]$/.test(String(shift))) continue // karty tylko dla zmian 1/2/3 w dni wolne

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

				let doc
				try {
					const zip = new PizZip(arrayBuffer)
					doc = new Docxtemplater(zip, {
						paragraphLoop: true,
						linebreaks: true,
						delimiters: { start: '[[', end: ']]' },
					})
					doc.setData({
						name,
						date: formattedDate,
						hours,
						date2: contractHalfDate,
						company: 'EXIDE',
					})
					doc.render()
				} catch (err) {
					console.error('❌ Błąd renderowania dokumentu:', err)
					alert('Błąd podczas generowania dokumentu (karta). Szczegóły w konsoli.')
					return
				}

				const out = doc.getZip().generate({ type: 'uint8array' })
				parts.push(out)
			}
		}

		if (!parts.length) {
			alert('Brak kart do wygenerowania w podanym zakresie (dni wolne + zmiana 1/2/3).')
			return
		}

		// scal wszystkie karty
		const merger = new DocxMerger({}, parts)
		const mergedBlob = await new Promise(resolve => merger.save('blob', resolve))
		saveAs(mergedBlob, `Karty_nadgodzin_${fromDate}_–_${toDate}.docx`)
	}

	const generateSummaryDOCX = async () => {
		if (!fromDate || !toDate) {
			alert('Uzupełnij wszystkie pola.')
			return
		}
		const from = parseISO(fromDate)
		const to = parseISO(toDate)
		if (!isValid(from) || !isValid(to) || from > to) {
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

		const isHoliday = makeHolidayChecker(from, to)
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

			// Ten szablon ma pola day1..day31 – iterujemy po dniach miesiąca `from`
			const monthStart = startOfMonth(from)
			const monthEnd = endOfMonth(from)
			let idx = 1
			for (let cur = new Date(monthStart); cur <= monthEnd; cur = addDays(cur, 1), idx++) {
				const dayStr = format(cur, 'yyyy-MM-dd')
				const prefix = `day${idx}`
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

				// sumy – dostosuj do logiki szablonu
				sum1 += 8
				sum2 += 8
				if (String(shift) === '2') sum3 += 8
			}

			data.sum1 = sum1 ? String(sum1) : ''
			data.sum2 = sum2 ? String(sum2) : ''
			data.sum3 = sum3 ? String(sum3) : ''

			let doc
			try {
				const zip = new PizZip(arrayBuffer)
				doc = new Docxtemplater(zip, {
					paragraphLoop: true,
					linebreaks: true,
					delimiters: { start: '[[', end: ']]' },
				})
				doc.setData(data)
				doc.render()
			} catch (err) {
				console.error('❌ Błąd renderowania zestawienia dla', name, err)
				alert(`Błąd przy generowaniu zestawienia dla: ${name}`)
				return
			}

			const out = doc.getZip().generate({ type: 'uint8array' })
			parts.push(out)
		}

		if (!parts.length) {
			alert('Nie znaleziono żadnych zestawień do wygenerowania.')
			return
		}

		const merger = new DocxMerger({}, parts)
		const mergedBlob = await new Promise(resolve => merger.save('blob', resolve))
		saveAs(mergedBlob, `Zestawienie_nadgodzin_${fromDate}_–_${toDate}.docx`)
	}

	return (
		<div className='overtime-page-wrapper'>
			<div className='overtime-cards-wrapper'>
				<h3 className='overtime-title'>Rozliczenie nadgodzin</h3>

				<div className='overtime-controls'>
					<label>
						Od: <input type='date' value={fromDate} onChange={e => setFromDate(e.target.value)} />
					</label>
					<label>
						Do: <input type='date' value={toDate} onChange={e => setToDate(e.target.value)} />
					</label>

					<div
						className='overtime-dropdown'
						ref={ddRef}
						onKeyDown={e => {
							if (e.key === 'Escape') setOpen(false)
						}}>
						<button
							className='dropdown-toggle'
							aria-haspopup='menu'
							aria-expanded={open}
							onClick={() => setOpen(v => !v)}>
							Generuj
							<div className='chev' aria-hidden='true'>
								▼
							</div>
						</button>
						{open && (
							<ul className='dropdown-menu' role='menu'>
								<li
									role='menuitem'
									tabIndex={0}
									onClick={() => {
										setOpen(false)
										generateDOCX()
									}}>
									Karty nadgodzin
								</li>
								<li
									role='menuitem'
									tabIndex={0}
									onClick={() => {
										setOpen(false)
										generateSummaryDOCX()
									}}>
									Zestawienia nadgodzin
								</li>
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

import React, { useMemo, useRef, useState } from 'react'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
	Label,
} from 'recharts'
import '../styles/charts-lab.css'

/* ===== Paleta ===== */
const palette = [
	'#1f77b4',
	'#ff7f0e',
	'#2ca02c',
	'#d62728',
	'#9467bd',
	'#8c564b',
	'#e377c2',
	'#7f7f7f',
	'#bcbd22',
	'#17becf',
]

/* ===== Stałe odsunięć tytułów osi ===== */
const Y_TITLE_GAP = 14
const X_TITLE_OFFSET = 16

/* ===== Utils ===== */
const num = v => Number(String(v ?? '').replace(',', '.'))
const safeFile = s => (s || 'wykres').replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 60)
const dashToArray = s => (s === 'dashed' ? '6 6' : s === 'dotted' ? '2 6' : undefined)

const toNumOrNull = s => {
	if (s === undefined || s === null) return null
	const t = String(s).trim()
	if (t === '') return null
	const n = Number(t.replace(',', '.'))
	return Number.isFinite(n) ? n : null
}
const toIntOrNull = s => {
	if (s === undefined || s === null) return null
	const t = String(s).trim()
	if (t === '') return null
	const n = Number.parseInt(t, 10)
	return Number.isInteger(n) && n >= 0 ? n : null
}
const fmtNum = (v, dec) => {
	const n = Number(v)
	if (!Number.isFinite(n)) return ''
	return dec != null ? n.toFixed(Math.min(dec, 12)) : String(n)
}

function detectDelimiter(text) {
	const first = text.split(/\r?\n/).find(l => l.trim().length) || ''
	const cnt = ch => (first.match(new RegExp(`\\${ch}`, 'g')) || []).length
	const pairs = [
		['\t', cnt('\t')],
		[';', cnt(';')],
		[',', cnt(',')],
	]
	pairs.sort((a, b) => b[1] - a[1])
	return pairs[0][1] > 0 ? pairs[0][0] : '\t'
}
function parseTable(text) {
	if (!text?.trim()) return { columns: [], rows: [] }
	const delim = detectDelimiter(text)
	const lines = text.split(/\r?\n/).filter(l => l.trim().length)
	if (!lines.length) return { columns: [], rows: [] }
	const header = lines[0].split(delim).map(s => s.trim())
	const rows = lines.slice(1).map(line => {
		const cells = line.split(delim)
		const obj = {}
		header.forEach((h, i) => {
			const raw = (cells[i] ?? '').trim()
			const asNum = Number(raw.replace(',', '.'))
			obj[h] = Number.isFinite(asNum) && raw !== '' ? asNum : raw
		})
		return obj
	})
	return { columns: header, rows }
}
function makeTicks(min, max, step) {
	if (![min, max, step].every(Number.isFinite) || step <= 0) return undefined
	const out = []
	for (let v = min; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(10)))
	return out
}
function parseYList(text) {
	if (!text?.trim()) return []
	return text
		.split(/[\r\n\t;]+/)
		.map(t => t.trim())
		.filter(Boolean)
		.map(t => Number(String(t).replace(',', '.')))
		.filter(Number.isFinite)
}

/* ===== Nice numbers (1–2–5) ===== */
function niceNum(x, round) {
	const exp = Math.floor(Math.log10(Math.max(Math.abs(x), 1e-12)))
	const f = x / Math.pow(10, exp)
	let nf
	if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10
	else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
	return nf * Math.pow(10, exp)
}

/* ===== Skale ===== */
function computeTightXScale(values, { targetTicks = 7 } = {}) {
	if (!values?.length) return null
	let minV = Math.min(...values),
		maxV = Math.max(...values)
	if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null
	if (minV === maxV) {
		const pad = Math.abs(minV || 1) * 0.05
		minV -= pad
		maxV += pad
	}
	const range = maxV - minV
	const rawStep = range / Math.max(2, targetTicks - 1)
	const step = niceNum(rawStep, true)
	const ticks = []
	for (let t = minV; t <= maxV + 1e-9; t += step) ticks.push(Number(t.toFixed(10)))
	if (Math.abs(ticks[0] - minV) > 1e-9) ticks.unshift(Number(minV.toFixed(10)))
	if (Math.abs(ticks[ticks.length - 1] - maxV) > 1e-9) ticks.push(Number(maxV.toFixed(10)))
	return { min: minV, max: maxV, step, ticks }
}
function computeCenteredScale(values, { targetTicks = 6, fillRatio = 0.6 } = {}) {
	if (!values?.length) return null
	let minV = Math.min(...values),
		maxV = Math.max(...values)
	if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null
	if (minV === maxV) {
		const pad = Math.abs(minV || 1) * 0.05
		minV -= pad
		maxV += pad
	}
	const mid = (minV + maxV) / 2
	const amp = maxV - minV
	const desiredSpan = amp / Math.max(Math.min(fillRatio, 0.95), 0.05)
	const rawStep = desiredSpan / Math.max(2, targetTicks - 1)
	const step = niceNum(rawStep, true)
	const halfSpan = (step * Math.max(2, targetTicks - 1)) / 2
	const niceMin = Math.floor((mid - halfSpan) / step) * step
	const niceMax = Math.ceil((mid + halfSpan) / step) * step
	const ticks = []
	for (let t = niceMin; t <= niceMax + 1e-9; t += step) ticks.push(Number(t.toFixed(10)))
	return { min: niceMin, max: niceMax, step, ticks }
}

/* ===== Tytuły osi ===== */
const XTitle = ({ viewBox, value, fill }) => {
	const { x, y, width, height } = viewBox || {}
	const cx = (x ?? 0) + (width ?? 0) / 2
	const cy = (y ?? 0) + (height ?? 0) + X_TITLE_OFFSET
	return (
		<text x={cx} y={cy} fill={fill} textAnchor='middle' dominantBaseline='hanging'>
			{value}
		</text>
	)
}
const YTitle = ({ viewBox, value, fill, side }) => {
	const { x, y, width, height } = viewBox || {}
	const cx = side === 'L' ? (x ?? 0) - Y_TITLE_GAP : (x ?? 0) + (width ?? 0) + Y_TITLE_GAP
	const cy = (y ?? 0) + (height ?? 0) / 2
	const angle = side === 'L' ? -90 : 90
	return (
		<text
			x={cx}
			y={cy}
			fill={fill}
			textAnchor='middle'
			dominantBaseline='middle'
			transform={`rotate(${angle} ${cx} ${cy})`}>
			{value}
		</text>
	)
}

/* ===== Własna legenda – kolejność = kolejność w sekcjach ===== */
function CustomLegend({ items }) {
	return (
		<div
			className='recharts-default-legend'
			style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
			{items.map(it => (
				<span key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
					<span
						aria-hidden
						style={{
							width: 10,
							height: 10,
							borderRadius: '50%',
							border: `2px solid ${it.color}`,
							display: 'inline-block',
						}}
					/>
					<span>{it.value}</span>
				</span>
			))}
		</div>
	)
}

/* ===== Kolory: wybór kolejnego nieużytego ===== */
const hslToHex = (h, s, l) => {
	s /= 100
	l /= 100
	const k = n => (n + h / 30) % 12
	const a = s * Math.min(l, 1 - l)
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
	const toHex = x =>
		Math.round(255 * x)
			.toString(16)
			.padStart(2, '0')
	return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}
function nextDistinctColor(usedSet, offset = 0) {
	for (let i = 0; i < palette.length; i++) {
		const c = palette[(i + offset) % palette.length]
		if (!usedSet.has(c)) {
			usedSet.add(c)
			return c
		}
	}
	let i = usedSet.size
	for (let guard = 0; guard < 360; guard++) {
		const c = hslToHex((i * 47) % 360, 70, 48)
		if (!usedSet.has(c)) {
			usedSet.add(c)
			return c
		}
		i++
	}
	return '#888888'
}

/* ===== Komponent ===== */
export default function ChartsLab() {
	const chartWrapRef = useRef(null)

	/* Tytuł + kolory */
	const [title, setTitle] = useState('Wykres')
	const [titleColor, setTitleColor] = useState('#26435e')
	const [axisTitleColor, setAxisTitleColor] = useState('#26435e')

	/* ✅ PNG: możliwość przezroczystego tła */
	const [transparentBg, setTransparentBg] = useState(true)

	/* Dane wejściowe */
	const [rawText, setRawText] = useState('')
	const [fileName, setFileName] = useState('')
	const { columns, rows } = useMemo(() => parseTable(rawText), [rawText])
	const numericCols = useMemo(() => columns.filter(c => rows.some(r => Number.isFinite(num(r[c])))), [columns, rows])

	/* Mapowanie kolumn */
	const [colRoles, setColRoles] = useState({})
	useMemo(() => {
		if (!columns.length) return
		setColRoles(prev => {
			const next = { ...prev }
			if (!Object.values(next).includes('x')) next[numericCols[0] || columns[0]] = 'x'
			for (const c of columns) if (!next[c]) next[c] = 'yl'
			return next
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columns.join('|')])

	const setRole = (col, role) => {
		setColRoles(prev => {
			const next = { ...prev }
			if (role === 'x') for (const k of Object.keys(next)) if (next[k] === 'x') next[k] = 'ignore'
			next[col] = role
			return next
		})
	}

	/* Oś X */
	const [xTitle, setXTitle] = useState('Oś X')
	const [xUnit, setXUnit] = useState('')
	const [xMin, setXMin] = useState('')
	const [xMax, setXMax] = useState('')
	const [xStep, setXStep] = useState('')
	const [xLog, setXLog] = useState(false)
	const [xDecimals, setXDecimals] = useState('')

	/* Serie Y */
	const [leftSeries, setLeftSeries] = useState([])
	const [rightSeries, setRightSeries] = useState([])

	const applyMapping = () => {
		const yLCols = columns.filter(c => colRoles[c] === 'yl')
		const yRCols = columns.filter(c => colRoles[c] === 'yr')

		const used = new Set()
		const mk = (side, cols) =>
			cols.map((c, i) => ({
				id: `${side}-col-${c}-${Date.now()}-${i}`,
				side,
				mode: 'column',
				col: c,
				name: c,
				color: nextDistinctColor(used),
				width: 2,
				dash: 'solid',
			}))

		const left = mk('L', yLCols)
		const right = mk('R', yRCols)

		setLeftSeries(left)
		setRightSeries(right)

		const xCol = Object.keys(colRoles).find(k => colRoles[k] === 'x')
		if (xTitle === 'Oś X' && xCol) setXTitle(xCol)
	}

	const addManualY = side => {
		const used = new Set([...leftSeries, ...rightSeries].map(s => s.color).filter(Boolean))
		;(side === 'L' ? setLeftSeries : setRightSeries)(prev => [
			...prev,
			{
				id: `${side}-manualY-${Date.now()}`,
				side,
				mode: 'manualY',
				name: 'Ręczna Y',
				color: nextDistinctColor(used),
				width: 2,
				dash: 'solid',
				valuesYText: '',
			},
		])
	}
	const addManualPairs = side => {
		const used = new Set([...leftSeries, ...rightSeries].map(s => s.color).filter(Boolean))
		;(side === 'L' ? setLeftSeries : setRightSeries)(prev => [
			...prev,
			{
				id: `${side}-manualPairs-${Date.now()}`,
				side,
				mode: 'manualPairs',
				name: 'Ręczna (x;y)',
				color: nextDistinctColor(used),
				width: 2,
				dash: 'solid',
				valuesText: '',
			},
		])
	}

	/* Dane do wykresu */
	const xColSelected = useMemo(() => Object.keys(colRoles).find(k => colRoles[k] === 'x') || '', [colRoles])

	const dataFromTable = useMemo(() => {
		if (!xColSelected) return []
		const out = []
		for (const r of rows) {
			const x = num(r[xColSelected])
			if (!Number.isFinite(x)) continue
			out.push({ __x: x, __row: r })
		}
		out.sort((a, b) => a.__x - b.__x)
		return out
	}, [rows, xColSelected])

	const xSet = useMemo(() => dataFromTable.map(d => d.__x), [dataFromTable])
	const rowByX = useMemo(() => {
		const m = new Map()
		dataFromTable.forEach(d => m.set(d.__x, d.__row))
		return m
	}, [dataFromTable])

	const seriesAll = useMemo(() => {
		const fix = s => (s.mode === 'manual' ? { ...s, mode: 'manualPairs' } : s)
		return [...leftSeries.map(fix), ...rightSeries.map(fix)]
	}, [leftSeries, rightSeries])

	const manualPairsMaps = useMemo(() => {
		const detect = text => {
			if (!text?.trim()) return []
			const delim = detectDelimiter(text)
			const lines = text
				.split(/\r?\n/)
				.map(l => l.trim())
				.filter(Boolean)
			const pts = []
			for (const line of lines) {
				const [xs, ys] = line.split(delim)
				const xv = num(xs),
					yv = num(ys)
				if (Number.isFinite(xv) && Number.isFinite(yv)) pts.push({ x: xv, y: yv })
			}
			pts.sort((a, b) => a.x - b.x)
			return pts
		}
		const m = new Map()
		seriesAll.forEach(s => {
			if (s.mode === 'manualPairs') {
				const arr = detect(s.valuesText || '')
				const mm = new Map()
				arr.forEach(p => mm.set(p.x, p.y))
				m.set(s.id, mm)
			}
		})
		return m
	}, [seriesAll])

	const manualYArrays = useMemo(() => {
		const m = new Map()
		seriesAll.forEach(s => {
			if (s.mode === 'manualY') m.set(s.id, parseYList(s.valuesYText || ''))
		})
		return m
	}, [seriesAll])

	const chartKeys = useMemo(() => {
		const keys = []
		for (const s of seriesAll) keys.push(s.mode === 'column' ? s.col : s.id)
		return keys
	}, [seriesAll])

	const chartData = useMemo(() => {
		if (!xSet.length) return []
		return xSet.map((x, idx) => {
			const obj = { __x: x }
			for (const s of seriesAll) {
				if (s.mode === 'column' && s.col) {
					const row = rowByX.get(x)
					const v = row ? row[s.col] : null
					const n = typeof v === 'number' ? v : num(v)
					obj[s.col] = Number.isFinite(n) ? n : null
				} else if (s.mode === 'manualPairs') {
					const map = manualPairsMaps.get(s.id)
					obj[s.id] = map?.get(x) ?? null
				} else if (s.mode === 'manualY') {
					const arr = manualYArrays.get(s.id) || []
					const y = arr[idx]
					obj[s.id] = Number.isFinite(y) ? y : null
				}
			}
			return obj
		})
	}, [xSet, seriesAll, rowByX, manualPairsMaps, manualYArrays])

	/* Utrzymaj ogon */
	const [extendTail, setExtendTail] = useState(false)
	const renderData = useMemo(() => {
		if (!extendTail || chartData.length === 0) return chartData
		const keys = seriesAll.map(s => (s.mode === 'column' ? s.col : s.id))
		const out = chartData.map(r => ({ ...r }))
		const n = out.length
		keys.forEach(key => {
			let lastIdx = -1,
				lastVal = null
			for (let i = 0; i < n; i++) {
				const v = out[i][key]
				if (Number.isFinite(v)) {
					lastIdx = i
					lastVal = v
				}
			}
			if (lastIdx >= 0 && lastIdx < n - 1) for (let i = lastIdx + 1; i < n; i++) out[i][key] = lastVal
		})
		return out
	}, [extendTail, chartData, seriesAll])

	/* Osie Y + miejsca po przecinku */
	const [yLTitle, setYLTitle] = useState('Lewa')
	const [yLUnit, setYLUnit] = useState('')
	const [yLMin, setYLMin] = useState('')
	const [yLMax, setYLMax] = useState('')
	const [yLStep, setYLStep] = useState('')
	const [yLLog, setYLLog] = useState(false)
	const [yLDecimals, setYLDecimals] = useState('')

	const [yRTitle, setYRTitle] = useState('Prawa')
	const [yRUnit, setYRUnit] = useState('')
	const [yRMin, setYRMin] = useState('')
	const [yRMax, setYRMax] = useState('')
	const [yRStep, setYRStep] = useState('')
	const [yRLog, setYRLog] = useState(false)
	const [yRDecimals, setYRDecimals] = useState('')

	/* ===== Auto skale/ticki ===== */
	const collectValues = keys => {
		const vals = []
		chartData.forEach(r =>
			keys.forEach(k => {
				const v = r[k]
				if (Number.isFinite(v)) vals.push(v)
			})
		)
		return vals
	}

	const xAuto = useMemo(() => {
		if (xLog) return null
		if (!xSet.length) return null
		return computeTightXScale(xSet, { targetTicks: 7 })
	}, [xSet, xLog])

	const yLAuto = useMemo(() => {
		if (yLLog) return null
		const keys = leftSeries.map(s => (s.mode === 'column' ? s.col : s.id))
		const vals = collectValues(keys)
		if (!vals.length) return null
		return computeCenteredScale(vals, { targetTicks: 6, fillRatio: 0.6 })
	}, [chartData, leftSeries, yLLog])

	const yRAuto = useMemo(() => {
		if (yRLog) return null
		const keys = rightSeries.map(s => (s.mode === 'column' ? s.col : s.id))
		const vals = collectValues(keys)
		if (!vals.length) return null
		return computeCenteredScale(vals, { targetTicks: 6, fillRatio: 0.6 })
	}, [chartData, rightSeries, yRLog])

	const pickAxis = (autoObj, minStr, maxStr, stepStr, isLog) => {
		if (isLog) return { domain: ['auto', 'auto'], ticks: undefined }
		const minManual = toNumOrNull(minStr)
		const maxManual = toNumOrNull(maxStr)
		const stepManual = toNumOrNull(stepStr)
		const minV = minManual ?? autoObj?.min
		const maxV = maxManual ?? autoObj?.max
		const domain = [Number.isFinite(minV) ? minV : 'auto', Number.isFinite(maxV) ? maxV : 'auto']
		let ticks
		if (Number.isFinite(stepManual) && Number.isFinite(minV) && Number.isFinite(maxV)) {
			ticks = makeTicks(minV, maxV, stepManual)
		} else {
			ticks = autoObj?.ticks
		}
		return { domain, ticks }
	}

	const xAxisCfg = useMemo(() => pickAxis(xAuto, xMin, xMax, xStep, xLog), [xAuto, xMin, xMax, xStep, xLog])
	const yLAxisCfg = useMemo(() => pickAxis(yLAuto, yLMin, yLMax, yLStep, yLLog), [yLAuto, yLMin, yLMax, yLStep, yLLog])
	const yRAxisCfg = useMemo(() => pickAxis(yRAuto, yRMin, yRMax, yRStep, yRLog), [yRAuto, yRMin, yRMax, yRStep, yRLog])

	/* ===== Walidacja zakresu Y względem danych ===== */
	const yLDataRange = useMemo(() => {
		const vals = collectValues(leftSeries.map(s => (s.mode === 'column' ? s.col : s.id)))
		if (!vals.length) return { has: false, min: null, max: null }
		return { has: true, min: Math.min(...vals), max: Math.max(...vals) }
	}, [chartData, leftSeries])

	const yRDataRange = useMemo(() => {
		const vals = collectValues(rightSeries.map(s => (s.mode === 'column' ? s.col : s.id)))
		if (!vals.length) return { has: false, min: null, max: null }
		return { has: true, min: Math.min(...vals), max: Math.max(...vals) }
	}, [chartData, rightSeries])

	const lMinVal = toNumOrNull(yLMin)
	const lMaxVal = toNumOrNull(yLMax)
	const rMinVal = toNumOrNull(yRMin)
	const rMaxVal = toNumOrNull(yRMax)

	const lMinTooHigh = yLDataRange.has && Number.isFinite(lMinVal) && lMinVal > yLDataRange.min
	const lMaxTooLow = yLDataRange.has && Number.isFinite(lMaxVal) && lMaxVal < yLDataRange.max
	const lRangeInvalid = Number.isFinite(lMinVal) && Number.isFinite(lMaxVal) && lMinVal >= lMaxVal

	const rMinTooHigh = yRDataRange.has && Number.isFinite(rMinVal) && rMinVal > yRDataRange.min
	const rMaxTooLow = yRDataRange.has && Number.isFinite(rMaxVal) && rMaxVal < yRDataRange.max
	const rRangeInvalid = Number.isFinite(rMinVal) && Number.isFinite(rMaxVal) && rMinVal >= rMaxVal

	const invalidStyle = cond =>
		cond ? { borderColor: '#d64545', boxShadow: '0 0 0 3px rgba(214,69,69,.12)' } : undefined

	/* Auto-fit → wpisuje zakresy do pól */
	const handleAutoFit = () => {
		const leftVals = collectValues(leftSeries.map(s => (s.mode === 'column' ? s.col : s.id)))
		const rightVals = collectValues(rightSeries.map(s => (s.mode === 'column' ? s.col : s.id)))
		const l = leftVals.length ? computeCenteredScale(leftVals, { targetTicks: 6, fillRatio: 0.6 }) : null
		const r = rightVals.length ? computeCenteredScale(rightVals, { targetTicks: 6, fillRatio: 0.6 }) : null
		setYLMin(l ? String(l.min) : '')
		setYLMax(l ? String(l.max) : '')
		setYLStep('')
		setYRMin(r ? String(r.min) : '')
		setYRMax(r ? String(r.max) : '')
		setYRStep('')

		if (xSet.length) {
			const ax = computeTightXScale(xSet, { targetTicks: 7 })
			if (ax) {
				setXMin(String(ax.min))
				setXMax(String(ax.max))
				setXStep('')
			}
		}
	}

	/* Decimals parsed */
	const xDec = toIntOrNull(xDecimals)
	const yLDec = toIntOrNull(yLDecimals)
	const yRDec = toIntOrNull(yRDecimals)

	/* Linie pomocnicze (X=pionowa, Y=pozioma) */
	const [guides, setGuides] = useState([])
	const [newGuide, setNewGuide] = useState({ type: 'x', value: '', label: '', color: '#6b7280', dash: 'dashed' })
	const addGuide = () => {
		const v = num(newGuide.value)
		if (!Number.isFinite(v)) return
		if ((newGuide.type === 'x' && xLog && v <= 0) || (newGuide.type === 'y' && (yLLog || yRLog) && v <= 0)) return
		setGuides(g => [...g, { id: `g-${Date.now()}`, ...newGuide }])
		setNewGuide(prev => ({ ...prev, value: '', label: '' }))
	}
	const removeGuide = id => setGuides(gs => gs.filter(g => g.id !== id))

	/* ===== LEGEND payload ===== */
	const legendPayload = useMemo(() => {
		const mkItem = (s, idxOffset = 0, i) => ({
			id: s.mode === 'column' ? s.col : s.id,
			value: s.name || s.col || s.id,
			color: s.color || palette[(idxOffset + i) % palette.length],
			type: 'line',
		})
		const leftItems = leftSeries.map((s, i) => mkItem(s, 0, i))
		const rightItems = rightSeries.map((s, i) => mkItem(s, leftSeries.length, i))
		return [...leftItems, ...rightItems]
	}, [leftSeries, rightSeries])

	/* ===== Zero line (subtelna) ===== */
	const zeroVisibleOnLeft = useMemo(() => {
		const d = yLAxisCfg?.domain || []
		const a = d[0]
		const b = d[1]
		if (Number.isFinite(a) && Number.isFinite(b)) return a <= 0 && 0 <= b
		return true
	}, [yLAxisCfg])

	/* ===== Eksporty ===== */
	const exportPNG = () => {
		const wrap = chartWrapRef.current
		if (!wrap) return
		const svg = wrap.querySelector('svg')
		if (!svg) return

		const { width, height } = wrap.getBoundingClientRect()

		const cloned = svg.cloneNode(true)
		cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
		cloned.setAttribute('width', `${Math.round(width)}`)
		cloned.setAttribute('height', `${Math.round(height)}`)

		const blob = new Blob([new XMLSerializer().serializeToString(cloned)], { type: 'image/svg+xml;charset=utf-8' })
		const url = URL.createObjectURL(blob)

		const img = new Image()
		img.onload = () => {
			const topPad = 36

			// Legend layout measurement (drawn on canvas)
			const measCtx = document.createElement('canvas').getContext('2d')
			measCtx.font = '14px Segoe UI, Arial'
			const items = legendPayload || []
			const gapOuter = 14
			const gapInner = 6
			const symW = 10
			const itemStartPad = symW + gapInner

			const rows = []
			let row = []
			let rowW = 0
			const maxW = Math.round(width) - 16
			items.forEach(it => {
				const textW = measCtx.measureText(it.value).width
				const iw = itemStartPad + textW
				const sep = row.length ? gapOuter : 0
				if (row.length && rowW + sep + iw > maxW) {
					rows.push(row)
					row = [{ ...it, _w: iw }]
					rowW = iw
				} else {
					row.push({ ...it, _w: iw })
					rowW += sep + iw
				}
			})
			if (row.length) rows.push(row)

			const rowH = 20
			const legendTopPad = items.length ? 8 : 0
			const legendBottomPad = items.length ? 12 : 0
			const legendHeight = items.length ? legendTopPad + rows.length * rowH + legendBottomPad : 0

			const canvas = document.createElement('canvas')
			canvas.width = Math.round(width)
			canvas.height = Math.round(height + topPad + legendHeight)
			const ctx = canvas.getContext('2d')

			if (transparentBg) {
				ctx.clearRect(0, 0, canvas.width, canvas.height)
			} else {
				ctx.fillStyle = '#ffffff'
				ctx.fillRect(0, 0, canvas.width, canvas.height)
			}

			// title
			ctx.fillStyle = titleColor
			ctx.font = '600 16px Segoe UI, Arial'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'alphabetic'
			ctx.fillText(title, canvas.width / 2, 22)

			// chart
			ctx.drawImage(img, 0, topPad)

			// legend (canvas)
			if (items.length) {
				ctx.save()
				ctx.font = '14px Segoe UI, Arial'
				ctx.textAlign = 'left'
				ctx.textBaseline = 'alphabetic'
				const baseY0 = topPad + height + legendTopPad + 14

				rows.forEach((r, i) => {
					const totalW = r.reduce((acc, it, idx) => acc + it._w + (idx ? gapOuter : 0), 0)
					let x = (canvas.width - totalW) / 2
					const y = baseY0 + i * rowH

					r.forEach((it, idx) => {
						if (idx) x += gapOuter
						// symbol (stroke circle)
						ctx.beginPath()
						ctx.strokeStyle = it.color
						ctx.lineWidth = 2
						ctx.arc(x + symW / 2, y - 4, symW / 2, 0, Math.PI * 2)
						ctx.stroke()
						// text
						x += itemStartPad
						ctx.fillStyle = '#26435e'
						ctx.fillText(it.value, x, y)
						x += measCtx.measureText(it.value).width
					})
				})
				ctx.restore()
			}

			URL.revokeObjectURL(url)

			const a = document.createElement('a')
			a.download = `${safeFile(title)}.png`
			a.href = canvas.toDataURL('image/png')
			a.click()
		}
		img.src = url
	}

	const exportCSV = () => {
		if (!xSet.length || (!leftSeries.length && !rightSeries.length) || chartData.length === 0) return
		const delim = ';'
		const colsDesc = [
			...leftSeries.map(s => ({ key: s.mode === 'column' ? s.col : s.id, label: s.name || s.col || s.id })),
			...rightSeries.map(s => ({ key: s.mode === 'column' ? s.col : s.id, label: s.name || s.col || s.id })),
		]
		const meta = [
			`# Title: ${title}`,
			`# X: ${xTitle}${xUnit ? ` [${xUnit}]` : ''}; min=${xMin || 'auto'}; max=${xMax || 'auto'}; step=${
				xStep || 'auto'
			}; dec=${xDecimals || 'auto'}; scale=${xLog ? 'log' : 'linear'}`,
			`# YL: ${yLTitle}${yLUnit ? ` [${yLUnit}]` : ''}; min=${yLMin || 'auto'}; max=${yLMax || 'auto'}; step=${
				yLStep || 'auto'
			}; dec=${yLDecimals || 'auto'}; scale=${yLLog ? 'log' : 'linear'}`,
			rightSeries.length
				? `# YR: ${yRTitle}${yRUnit ? ` [${yRUnit}]` : ''}; min=${yRMin || 'auto'}; max=${yRMax || 'auto'}; step=${
						yRStep || 'auto'
				  }; dec=${yRDecimals || 'auto'}; scale=${yRLog ? 'log' : 'linear'}`
				: `# YR: (brak)`,
			`# Delimiter: "${delim}"`,
		]
		const header = ['x', ...colsDesc.map(c => c.label)].join(delim)
		const lines = chartData.map(r =>
			[r.__x, ...colsDesc.map(c => (Number.isFinite(r[c.key]) ? String(r[c.key]) : ''))].join(delim)
		)
		const csv = [...meta, header, ...lines].join('\r\n')
		const a = document.createElement('a')
		a.download = `${safeFile(title)}.csv`
		a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
		a.click()
		setTimeout(() => URL.revokeObjectURL(a.href), 1000)
	}

	const loadExample = () => {
		const example = `czas;temp;cisnienie
0;22.4;1012.2
10;22.9;1011.7
20;23.1;1011.3
30;23.4;1010.8
40;23.6;1010.5`
		setRawText(example)
		setFileName('przyklad.csv')
		setColRoles({ czas: 'x', temp: 'yl', cisnienie: 'yr' })
		setXTitle('Czas')
		setXUnit('s')
		setXMin('')
		setXMax('')
		setXStep('')
		setXLog(false)
		setXDecimals('')
		setYLTitle('Temperatura')
		setYLUnit('°C')
		setYLMin('')
		setYLMax('')
		setYLStep('')
		setYLDecimals('')
		setYRTitle('Ciśnienie')
		setYRUnit('hPa')
		setYRMin('')
		setYRMax('')
		setYRStep('')
		setYRDecimals('')
		setTimeout(applyMapping, 0)
	}

	// wyśrodkowanie komórek tabeli
	const cellStyle = { textAlign: 'center' }

	return (
		<div className='charts-page'>
			<div className='layout-2col'>
				{/* ===== lewa wąska ===== */}
				<aside className='left-narrow'>
					<div className='cl-card'>
						<div className='cl-header'>
							<h3>Dane wejściowe</h3>
							<div className='cl-actions'>
								<button className='btn-secondary' onClick={loadExample}>
									Wczytaj przykład
								</button>
							</div>
						</div>

						<label className='cl-field'>
							<span>Plik CSV/TSV</span>
							<input
								type='file'
								accept='.csv,.tsv,.txt,.dat'
								onChange={e => {
									const f = e.target.files?.[0]
									if (!f) return
									setFileName(f.name)
									const r = new FileReader()
									r.onload = ev => setRawText(String(ev.target?.result || ''))
									r.readAsText(f, 'utf-8')
								}}
							/>
							{fileName && <small className='cl-file'>{fileName}</small>}
						</label>

						<label className='cl-field'>
							<span>Wklej dane (nagłówek w 1. wierszu; kolumny = TAB)</span>
							<textarea
								rows={6}
								value={rawText}
								onChange={e => setRawText(e.target.value)}
								placeholder={'czas\ttemp\tcisnienie\n0\t22.4\t1012.2'}
							/>
						</label>
					</div>

					{columns.length > 0 && (
						<div className='cl-card'>
							<h3>Mapowanie kolumn</h3>
							<div className='cl-mapper'>
								<div className='cl-mapper-head'>
									<span>Kolumna</span>
									<span>Rola</span>
								</div>
								<div className='cl-mapper-body'>
									{columns.map(c => (
										<div key={c} className='cl-mapper-row'>
											<div className='cl-col-name'>{c}</div>
											<div className='cl-col-role'>
												<select value={colRoles[c] || 'ignore'} onChange={e => setRole(c, e.target.value)}>
													<option value='x'>X (oś pozioma)</option>
													<option value='yl'>Y (lewa)</option>
													<option value='yr'>Y (prawa)</option>
													<option value='ignore'>Ignoruj</option>
												</select>
												{colRoles[c] === 'x' && (
													<small className='cl-muted'>Uwaga: wartości X muszą być liczbami</small>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
							<div className='cl-add-row'>
								<button className='btn-primary' onClick={applyMapping}>
									Zastosuj mapowanie
								</button>
							</div>
						</div>
					)}

					{/* Meta i tytuły */}
					<div className='cl-card cl-meta-vertical'>
						<h3>Meta i tytuły</h3>

						<div className='cl-grid-3 cl-mt'>
							<label className='cl-field'>
								<span>Tytuł wykresu</span>
								<input value={title} onChange={e => setTitle(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Kolor tytułu</span>
								<input type='color' value={titleColor} onChange={e => setTitleColor(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Kolor tytułów osi</span>
								<input type='color' value={axisTitleColor} onChange={e => setAxisTitleColor(e.target.value)} />
							</label>
						</div>

						<div className='cl-grid-3 cl-mt'>
							<label className='cl-field'>
								<span>Tytuł osi X</span>
								<input value={xTitle} onChange={e => setXTitle(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Tytuł osi Y (lewa)</span>
								<input value={yLTitle} onChange={e => setYLTitle(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Tytuł osi Y (prawa)</span>
								<input value={yRTitle} onChange={e => setYRTitle(e.target.value)} />
							</label>
						</div>

						<div className='cl-grid-3 cl-mt'>
							<label className='cl-field'>
								<span>Jednostka X</span>
								<input value={xUnit} onChange={e => setXUnit(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Jednostka Y (lewa)</span>
								<input value={yLUnit} onChange={e => setYLUnit(e.target.value)} />
							</label>
							<label className='cl-field'>
								<span>Jednostka Y (prawa)</span>
								<input value={yRUnit} onChange={e => setYRUnit(e.target.value)} />
							</label>
						</div>
					</div>

					{/* Granice / linie pomocnicze */}
					<div className='cl-card'>
						<h3>Granice / linie pomocnicze</h3>
						<div className='cl-guides-new'>
							<div className='cl-grid-3'>
								<label className='cl-field'>
									<span>Rodzaj</span>
									<select value={newGuide.type} onChange={e => setNewGuide(g => ({ ...g, type: e.target.value }))}>
										<option value='x'>Pionowa (X)</option>
										<option value='y'>Pozioma (Y)</option>
									</select>
								</label>
								<label className='cl-field'>
									<span>Wartość</span>
									<input
										value={newGuide.value}
										onChange={e => setNewGuide(g => ({ ...g, value: e.target.value }))}
										placeholder='np. 10'
									/>
								</label>
								<label className='cl-field'>
									<span>Etykieta</span>
									<input
										value={newGuide.label}
										onChange={e => setNewGuide(g => ({ ...g, label: e.target.value }))}
										placeholder='opis (opcjonalnie)'
									/>
								</label>
							</div>
							<div className='cl-guides-new-actions'>
								<input
									type='color'
									className='cl-color'
									value={newGuide.color}
									onChange={e => setNewGuide(g => ({ ...g, color: e.target.value }))}
								/>
								<select
									className='cl-dash'
									value={newGuide.dash}
									onChange={e => setNewGuide(g => ({ ...g, dash: e.target.value }))}>
									<option value='dashed'>przerywana</option>
									<option value='dotted'>kropkowana</option>
									<option value='solid'>ciągła</option>
								</select>
								<button className='btn-secondary' onClick={addGuide}>
									Dodaj
								</button>
								<div className='cl-note sm'>Dla skal logarytmicznych dozwolone są tylko wartości dodatnie.</div>
							</div>
						</div>

						{guides.length > 0 && (
							<div className='cl-chips'>
								{guides.map(g => (
									<span key={g.id} className='cl-chip'>
										<span className='cl-chip-color' style={{ background: g.color }} />
										{g.type === 'x' ? 'X' : 'Y'} = {g.value}
										{g.label ? ` — ${g.label}` : ''}
										<button className='cl-chip-x' onClick={() => removeGuide(g.id)} aria-label='Usuń'>
											✕
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* Eksport & narzędzia */}
					<div className='cl-card'>
						<h3>Eksport & narzędzia</h3>
						<div className='cl-chart-actions' style={{ paddingTop: 4 }}>
							<label className='cl-check-inline' title='Wypełnij ogon ostatnią znaną wartością w renderze'>
								<input type='checkbox' checked={extendTail} onChange={e => setExtendTail(e.target.checked)} />
								<span>Utrzymaj ostatnią wartość do końca</span>
							</label>
							<label className='cl-check-inline'>
								<input type='checkbox' checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} />
								<span>Przezroczyste tło PNG</span>
							</label>
							<div style={{ flex: 1 }} />
							<button className='btn-secondary' onClick={handleAutoFit}>
								Auto zakresy → pola
							</button>
							<button className='btn-secondary' onClick={exportCSV}>
								Eksport CSV
							</button>
							<button className='btn-primary' onClick={exportPNG}>
								Eksport PNG
							</button>
						</div>
					</div>
				</aside>

				{/* ===== prawa szeroka ===== */}
				<section className='right-wide'>
					<div className='cl-chart-card'>
						<div className='cl-chart-toolbar'>
							<div className='cl-chart-title'>
								<input
									className='cl-title-input'
									value={title}
									onChange={e => setTitle(e.target.value)}
									style={{ color: titleColor }}
								/>
							</div>
						</div>

						{!xColSelected || (!leftSeries.length && !rightSeries.length) || chartData.length === 0 ? (
							<div className='cl-empty'>
								<p>
									Wklej dane, przypisz kolumny (X / Y-lewa / Y-prawa) i kliknij <b>Zastosuj mapowanie</b>.
								</p>
								<p className='cl-muted'>W trybie „Ręcznie (tylko Y)” wartości Y są dopasowywane po indeksie do X.</p>
							</div>
						) : (
							<div className='cl-chart-wrap' ref={chartWrapRef}>
								<ResponsiveContainer width='100%' height='100%'>
									<LineChart data={renderData} margin={{ top: 12, right: 56, bottom: 48, left: 56 }}>
										<CartesianGrid strokeDasharray='3 3' />

										<XAxis
											dataKey='__x'
											type='number'
											domain={xAxisCfg.domain}
											scale={xLog ? 'log' : 'auto'}
											allowDataOverflow={xLog}
											ticks={xAxisCfg.ticks}
											tickFormatter={v => fmtNum(v, xDec)}
											tickMargin={8}
											label={
												<Label
													content={<XTitle value={`${xTitle}${xUnit ? ` [${xUnit}]` : ''}`} fill={axisTitleColor} />}
												/>
											}
										/>

										<YAxis
											yAxisId='L'
											orientation='left'
											domain={yLAxisCfg.domain}
											scale={yLLog ? 'log' : 'auto'}
											allowDataOverflow={yLLog}
											ticks={yLAxisCfg.ticks}
											tickFormatter={v => fmtNum(v, yLDec)}
											tickMargin={4}
											label={
												<Label
													content={
														<YTitle
															side='L'
															value={`${yLTitle}${yLUnit ? ` [${yLUnit}]` : ''}`}
															fill={axisTitleColor}
														/>
													}
												/>
											}
										/>

										{rightSeries.length > 0 && (
											<YAxis
												yAxisId='R'
												orientation='right'
												domain={yRAxisCfg.domain}
												scale={yRLog ? 'log' : 'auto'}
												allowDataOverflow={yRLog}
												ticks={yRAxisCfg.ticks}
												tickFormatter={v => fmtNum(v, yRDec)}
												tickMargin={4}
												label={
													<Label
														content={
															<YTitle
																side='R'
																value={`${yRTitle}${yRUnit ? ` [${yRUnit}]` : ''}`}
																fill={axisTitleColor}
															/>
														}
													/>
												}
											/>
										)}

										<Tooltip
											formatter={(value, name, props) => {
												const key = props.dataKey
												const s = seriesAll.find(s => (s.mode === 'column' ? s.col === key : s.id === key))
												const unit = s ? (s.side === 'L' ? yLUnit : yRUnit) : ''
												const dec = s ? (s.side === 'L' ? yLDec : yRDec) : null
												const display = s?.name || name
												return [fmtNum(value, dec), unit ? `${display} [${unit}]` : display]
											}}
											labelFormatter={x => `${fmtNum(x, xDec)}${xUnit ? ` ${xUnit}` : ''}`}
										/>

										{/* Legenda HTML (widok) – kolejność jak w sekcjach */}
										<Legend verticalAlign='bottom' align='center' content={<CustomLegend items={legendPayload} />} />

										{/* Subtelna wspólna linia Y=0 (jeśli jest w zakresie) */}
										{zeroVisibleOnLeft && (
											<ReferenceLine yAxisId='L' y={0} stroke='#9aa5b1' strokeOpacity={0.55} strokeDasharray='3 6' />
										)}

										{/* Linie pomocnicze użytkownika */}
										{guides.map(g => {
											const value = num(g.value)
											if (!Number.isFinite(value)) return null
											if (g.type === 'x' && xLog && value <= 0) return null
											if (g.type === 'y' && (yLLog || yRLog) && value <= 0) return null
											const dash = dashToArray(g.dash)
											return g.type === 'x' ? (
												<ReferenceLine
													key={g.id}
													x={value}
													stroke={g.color}
													strokeDasharray={dash}
													label={{ value: g.label || '', position: 'top', fill: g.color }}
												/>
											) : (
												<ReferenceLine
													key={g.id}
													yAxisId='L'
													y={value}
													stroke={g.color}
													strokeDasharray={dash}
													label={{ value: g.label || '', position: 'left', fill: g.color }}
												/>
											)
										})}

										{/* Serie */}
										{leftSeries.map((s, i) => (
											<Line
												key={s.id}
												yAxisId='L'
												type='monotone'
												dataKey={s.mode === 'column' ? s.col : s.id}
												name={s.name || s.col || s.id}
												stroke={s.color || palette[i % palette.length]}
												strokeWidth={Number(s.width) || 2}
												strokeDasharray={dashToArray(s.dash)}
												dot={false}
												connectNulls
											/>
										))}
										{rightSeries.map((s, i) => (
											<Line
												key={s.id}
												yAxisId='R'
												type='monotone'
												dataKey={s.mode === 'column' ? s.col : s.id}
												name={s.name || s.col || s.id}
												stroke={s.color || palette[(i + leftSeries.length) % palette.length]}
												strokeWidth={Number(s.width) || 2}
												strokeDasharray={dashToArray(s.dash)}
												dot={false}
												connectNulls
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>

					{/* Podgląd danych */}
					{chartData.length > 0 && (
						<div className='cl-table'>
							<div className='cl-table-title'>Podgląd danych ({chartData.length} punktów)</div>
							<div className='cl-table-scroll'>
								<table style={{ width: '100%' }}>
									<thead>
										<tr>
											<th style={cellStyle}>x{xUnit ? ` [${xUnit}]` : ''}</th>
											{chartKeys.map(k => (
												<th key={k} style={cellStyle}>
													{k}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{chartData.slice(0, 50).map((r, idx) => (
											<tr key={idx}>
												<td style={cellStyle}>{r.__x}</td>
												{chartKeys.map(k => (
													<td key={k} style={cellStyle}>
														{Number.isFinite(r[k]) ? r[k] : ''}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
								{chartData.length > 50 && <div className='cl-more'>… pokazano 50 pierwszych wierszy</div>}
							</div>
						</div>
					)}

					{/* Serie — Y (lewa) */}
					<div className='cl-card'>
						<h3>Serie — oś Y (lewa)</h3>
						<div
							className='cl-series-list'
							onDragOver={e => {
								e.preventDefault()
								e.dataTransfer.dropEffect = 'move'
							}}>
							{leftSeries.map((s, i) => {
								const mode = s.mode === 'manual' ? 'manualPairs' : s.mode
								return (
									<div
										key={s.id}
										className={`cl-series-row ${mode.startsWith('manual') ? 'is-manual' : ''}`}
										draggable
										onDragStart={e => {
											e.dataTransfer.setData('text/plain', JSON.stringify({ side: 'L', index: i }))
											e.dataTransfer.effectAllowed = 'move'
										}}
										onDrop={e => {
											e.preventDefault()
											try {
												const { index: fromIndex } = JSON.parse(e.dataTransfer.getData('text/plain') || '{}')
												if (fromIndex === undefined) return
												setLeftSeries(prev => {
													const a = [...prev]
													const [it] = a.splice(fromIndex, 1)
													a.splice(i, 0, it)
													return a
												})
											} catch {}
										}}>
										<span className='cl-drag-handle' title='Przeciągnij'>
											⋮⋮
										</span>

										<select
											className='cl-series-mode'
											value={mode}
											onChange={e =>
												setLeftSeries(prev => prev.map(p => (p.id === s.id ? { ...p, mode: e.target.value } : p)))
											}>
											<option value='column'>Kolumna</option>
											<option value='manualY'>Ręcznie (tylko Y)</option>
											<option value='manualPairs'>Ręcznie (pary x;y)</option>
										</select>

										{mode === 'column' ? (
											<div className='cl-manual-tag'>{s.col}</div>
										) : (
											<div className='cl-manual-tag'>{mode === 'manualY' ? 'Ręczna Y' : 'Ręczna (x;y)'}</div>
										)}

										<input
											className='cl-series-name'
											placeholder='Etykieta'
											value={s.name}
											onChange={e =>
												setLeftSeries(prev => prev.map(p => (p.id === s.id ? { ...p, name: e.target.value } : p)))
											}
										/>

										<input
											className='cl-color'
											type='color'
											value={s.color}
											onChange={e =>
												setLeftSeries(prev => prev.map(p => (p.id === s.id ? { ...p, color: e.target.value } : p)))
											}
										/>
										<select
											className='cl-width'
											value={s.width}
											onChange={e =>
												setLeftSeries(prev =>
													prev.map(p => (p.id === s.id ? { ...p, width: Number(e.target.value) || 2 } : p))
												)
											}>
											{[1, 2, 3, 4, 5].map(n => (
												<option key={n} value={n}>
													{n}px
												</option>
											))}
										</select>
										<select
											className='cl-dash'
											value={s.dash}
											onChange={e =>
												setLeftSeries(prev => prev.map(p => (p.id === s.id ? { ...p, dash: e.target.value } : p)))
											}>
											<option value='solid'>ciągła</option>
											<option value='dashed'>przerywana</option>
											<option value='dotted'>kropkowana</option>
										</select>

										<button
											className='cl-series-remove'
											onClick={() => setLeftSeries(prev => prev.filter(p => p.id !== s.id))}
											aria-label='Usuń serię'>
											✕
										</button>

										{mode === 'manualY' && (
											<div className='cl-manual-block'>
												<label className='cl-field'>
													<span>Wklej wartości Y (po jednej w linii lub rozdzielone TAB/;)</span>
													<textarea
														rows={4}
														placeholder={'22.4\n22.9\n23.1'}
														value={s.valuesYText || ''}
														onChange={e =>
															setLeftSeries(prev =>
																prev.map(p => (p.id === s.id ? { ...p, valuesYText: e.target.value } : p))
															)
														}
													/>
												</label>
											</div>
										)}

										{mode === 'manualPairs' && (
											<div className='cl-manual-block'>
												<label className='cl-field'>
													<span>
														Pary <code>x;y</code> (1 linia = 1 punkt)
													</span>
													<textarea
														rows={4}
														placeholder={'0;23.0\n10;23.4'}
														value={s.valuesText || ''}
														onChange={e =>
															setLeftSeries(prev =>
																prev.map(p => (p.id === s.id ? { ...p, valuesText: e.target.value } : p))
															)
														}
													/>
												</label>
											</div>
										)}
									</div>
								)
							})}
						</div>

						<div className='cl-add-row'>
							<button className='btn-secondary' onClick={() => addManualY('L')}>
								+ Dodaj serię (tylko Y)
							</button>
							<button className='btn-secondary' onClick={() => addManualPairs('L')}>
								+ Dodaj serię (x;y)
							</button>
						</div>
					</div>

					{/* Serie — Y (prawa) */}
					<div className='cl-card'>
						<h3>Serie — oś Y (prawa)</h3>
						<div
							className='cl-series-list'
							onDragOver={e => {
								e.preventDefault()
								e.dataTransfer.dropEffect = 'move'
							}}>
							{rightSeries.map((s, i) => {
								const mode = s.mode === 'manual' ? 'manualPairs' : s.mode
								return (
									<div
										key={s.id}
										className={`cl-series-row ${mode.startsWith('manual') ? 'is-manual' : ''}`}
										draggable
										onDragStart={e => {
											e.dataTransfer.setData('text/plain', JSON.stringify({ side: 'R', index: i }))
											e.dataTransfer.effectAllowed = 'move'
										}}
										onDrop={e => {
											e.preventDefault()
											try {
												const { index: fromIndex } = JSON.parse(e.dataTransfer.getData('text/plain') || '{}')
												if (fromIndex === undefined) return
												setRightSeries(prev => {
													const a = [...prev]
													const [it] = a.splice(fromIndex, 1)
													a.splice(i, 0, it)
													return a
												})
											} catch {}
										}}>
										<span className='cl-drag-handle' title='Przeciągnij'>
											⋮⋮
										</span>

										<select
											className='cl-series-mode'
											value={mode}
											onChange={e =>
												setRightSeries(prev => prev.map(p => (p.id === s.id ? { ...p, mode: e.target.value } : p)))
											}>
											<option value='column'>Kolumna</option>
											<option value='manualY'>Ręcznie (tylko Y)</option>
											<option value='manualPairs'>Ręcznie (pary x;y)</option>
										</select>

										{mode === 'column' ? (
											<div className='cl-manual-tag'>{s.col}</div>
										) : (
											<div className='cl-manual-tag'>{mode === 'manualY' ? 'Ręczna Y' : 'Ręczna (x;y)'}</div>
										)}

										<input
											className='cl-series-name'
											placeholder='Etykieta'
											value={s.name}
											onChange={e =>
												setRightSeries(prev => prev.map(p => (p.id === s.id ? { ...p, name: e.target.value } : p)))
											}
										/>

										<input
											className='cl-color'
											type='color'
											value={s.color}
											onChange={e =>
												setRightSeries(prev => prev.map(p => (p.id === s.id ? { ...p, color: e.target.value } : p)))
											}
										/>
										<select
											className='cl-width'
											value={s.width}
											onChange={e =>
												setRightSeries(prev =>
													prev.map(p => (p.id === s.id ? { ...p, width: Number(e.target.value) || 2 } : p))
												)
											}>
											{[1, 2, 3, 4, 5].map(n => (
												<option key={n} value={n}>
													{n}px
												</option>
											))}
										</select>
										<select
											className='cl-dash'
											value={s.dash}
											onChange={e =>
												setRightSeries(prev => prev.map(p => (p.id === s.id ? { ...p, dash: e.target.value } : p)))
											}>
											<option value='solid'>ciągła</option>
											<option value='dashed'>przerywana</option>
											<option value='dotted'>kropkowana</option>
										</select>

										<button
											className='cl-series-remove'
											onClick={() => setRightSeries(prev => prev.filter(p => p.id !== s.id))}
											aria-label='Usuń serię'>
											✕
										</button>

										{mode === 'manualY' && (
											<div className='cl-manual-block'>
												<label className='cl-field'>
													<span>Wklej wartości Y (po jednej w linii lub rozdzielone TAB/;)</span>
													<textarea
														rows={4}
														placeholder={'1012.2\n1011.7\n1011.3'}
														value={s.valuesYText || ''}
														onChange={e =>
															setRightSeries(prev =>
																prev.map(p => (p.id === s.id ? { ...p, valuesYText: e.target.value } : p))
															)
														}
													/>
												</label>
											</div>
										)}

										{mode === 'manualPairs' && (
											<div className='cl-manual-block'>
												<label className='cl-field'>
													<span>
														Pary <code>x;y</code> (1 linia = 1 punkt)
													</span>
													<textarea
														rows={4}
														placeholder={'0;1012.2\n10;1011.7'}
														value={s.valuesText || ''}
														onChange={e =>
															setRightSeries(prev =>
																prev.map(p => (p.id === s.id ? { ...p, valuesText: e.target.value } : p))
															)
														}
													/>
												</label>
											</div>
										)}
									</div>
								)
							})}
						</div>

						<div className='cl-add-row'>
							<button className='btn-secondary' onClick={() => addManualY('R')}>
								+ Dodaj serię (tylko Y)
							</button>
							<button className='btn-secondary' onClick={() => addManualPairs('R')}>
								+ Dodaj serię (x;y)
							</button>
						</div>
					</div>

					{/* Oś X (numeryczna) */}
					<div className='cl-card'>
						<h3>Oś X (numeryczna)</h3>
						<div className='cl-grid-4 cl-mt'>
							<label className='cl-field'>
								<span>Min</span>
								<input value={xMin} onChange={e => setXMin(e.target.value)} placeholder='auto' />
							</label>
							<label className='cl-field'>
								<span>Maks</span>
								<input value={xMax} onChange={e => setXMax(e.target.value)} placeholder='auto' />
							</label>
							<label className='cl-field'>
								<span>Krok</span>
								<input value={xStep} onChange={e => setXStep(e.target.value)} placeholder='auto' />
							</label>
							<label className='cl-field'>
								<span>Miejsca po przecinku</span>
								<input
									type='number'
									min='0'
									max='12'
									value={xDecimals}
									onChange={e => setXDecimals(e.target.value)}
									placeholder='auto'
								/>
							</label>
						</div>
						<label className='cl-check-inline'>
							<input type='checkbox' checked={xLog} onChange={e => setXLog(e.target.checked)} />
							<span>Skala logarytmiczna</span>
						</label>
					</div>

					{/* Oś Y (lewa) – z walidacją */}
					<div className='cl-card'>
						<h3>Oś Y (lewa)</h3>
						<div className='cl-grid-4 cl-mt'>
							<label className='cl-field'>
								<span>Min</span>
								<input
									value={yLMin}
									onChange={e => setYLMin(e.target.value)}
									placeholder='auto'
									style={invalidStyle(lRangeInvalid || lMinTooHigh)}
									title={lMinTooHigh ? `Minimalna wartość danych: ${fmtNum(yLDataRange.min, yLDec)}` : undefined}
								/>
							</label>
							<label className='cl-field'>
								<span>Maks</span>
								<input
									value={yLMax}
									onChange={e => setYLMax(e.target.value)}
									placeholder='auto'
									style={invalidStyle(lRangeInvalid || lMaxTooLow)}
									title={lMaxTooLow ? `Maksymalna wartość danych: ${fmtNum(yLDataRange.max, yLDec)}` : undefined}
								/>
							</label>
							<label className='cl-field'>
								<span>Krok</span>
								<input value={yLStep} onChange={e => setYLStep(e.target.value)} placeholder='auto' />
							</label>
							<label className='cl-field'>
								<span>Miejsca po przecinku</span>
								<input
									type='number'
									min='0'
									max='12'
									value={yLDecimals}
									onChange={e => setYLDecimals(e.target.value)}
									placeholder='auto'
								/>
							</label>
						</div>
						{yLDataRange.has && (
							<div className='cl-note sm' style={{ marginTop: 4 }}>
								Zakres danych: {fmtNum(yLDataRange.min, yLDec)} — {fmtNum(yLDataRange.max, yLDec)}
							</div>
						)}
						{lRangeInvalid && (
							<div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 4 }}>
								Nieprawidłowy zakres: <b>Min</b> musi być mniejszy od <b>Maks</b>.
							</div>
						)}
						{(lMinTooHigh || lMaxTooLow) && !lRangeInvalid && (
							<div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 2 }}>
								Uwaga: zakres osi nie obejmuje wszystkich punktów danych (wykres może być ucięty).
							</div>
						)}
						<label className='cl-check-inline' style={{ marginTop: 6 }}>
							<input type='checkbox' checked={yLLog} onChange={e => setYLLog(e.target.checked)} />
							<span>Skala logarytmiczna</span>
						</label>
					</div>

					{/* Oś Y (prawa) – z walidacją */}
					<div className='cl-card'>
						<h3>Oś Y (prawa)</h3>
						<div className='cl-grid-4 cl-mt'>
							<label className='cl-field'>
								<span>Min</span>
								<input
									value={yRMin}
									onChange={e => setYRMin(e.target.value)}
									placeholder='auto'
									style={invalidStyle(rRangeInvalid || rMinTooHigh)}
									title={rMinTooHigh ? `Minimalna wartość danych: ${fmtNum(yRDataRange.min, yRDec)}` : undefined}
								/>
							</label>
							<label className='cl-field'>
								<span>Maks</span>
								<input
									value={yRMax}
									onChange={e => setYRMax(e.target.value)}
									placeholder='auto'
									style={invalidStyle(rRangeInvalid || rMaxTooLow)}
									title={rMaxTooLow ? `Maksymalna wartość danych: ${fmtNum(yRDataRange.max, yRDec)}` : undefined}
								/>
							</label>
							<label className='cl-field'>
								<span>Krok</span>
								<input value={yRStep} onChange={e => setYRStep(e.target.value)} placeholder='auto' />
							</label>
							<label className='cl-field'>
								<span>Miejsca po przecinku</span>
								<input
									type='number'
									min='0'
									max='12'
									value={yRDecimals}
									onChange={e => setYRDecimals(e.target.value)}
									placeholder='auto'
								/>
							</label>
						</div>
						{yRDataRange.has && (
							<div className='cl-note sm' style={{ marginTop: 4 }}>
								Zakres danych: {fmtNum(yRDataRange.min, yRDec)} — {fmtNum(yRDataRange.max, yRDec)}
							</div>
						)}
						{rRangeInvalid && (
							<div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 4 }}>
								Nieprawidłowy zakres: <b>Min</b> musi być mniejszy od <b>Maks</b>.
							</div>
						)}
						{(rMinTooHigh || rMaxTooLow) && !rRangeInvalid && (
							<div className='cl-note sm' style={{ color: '#a12e2e', marginTop: 2 }}>
								Uwaga: zakres osi nie obejmuje wszystkich punktów danych (wykres może być ucięty).
							</div>
						)}
						<label className='cl-check-inline' style={{ marginTop: 6 }}>
							<input type='checkbox' checked={yRLog} onChange={e => setYRLog(e.target.checked)} />
							<span>Skala logarytmiczna</span>
						</label>
					</div>
				</section>
			</div>
		</div>
	)
}

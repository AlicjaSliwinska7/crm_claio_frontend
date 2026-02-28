// src/shared/diagrams/engines/recharts/summaryChartRegistry.js
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'

import {
  CHART,
  gridProps,
  legendProps,
  AxisTitleX,
  AxisTitleY,
  AxisTitleYLeft,
  AxisTitleYRight,
  yTickNumber,
  monthLabelFromAny,
  fmtInt,
  dateTickYmd,
} from './theme'

import { basePalette } from './colors'

// promień narożników dla danego „piętrka” w stacku
const stackRadiusTopOnly = (idx, total) => (idx === total - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0])

/**
 * data:
 *  {
 *    rows: [{ label:'2025-02', 'LAB A':123, ... }, ...],
 *    meta: [{ key:'LAB A', label:'LAB A', color:'#...' }, ...],
 *    keys: ['LAB A','LAB B',...]
 *  }
 */
function CostsStackedByMonthRecharts({ data, view }) {
  const rows = Array.isArray(data?.rows) ? data.rows : []
  const meta = Array.isArray(data?.meta) ? data.meta : []
  const keys = Array.isArray(data?.keys) && data.keys.length ? data.keys : meta.map(m => m.key)

  const h = view?.props?.height ?? CHART.height

  return (
    <ResponsiveContainer width='100%' height={h}>
      <BarChart
        data={rows}
        margin={view?.props?.margin || CHART.margin}
        barCategoryGap={view?.props?.barCategoryGap ?? CHART.bar.categoryGap}
        barGap={view?.props?.barGap ?? CHART.bar.gap}
      >
        <CartesianGrid {...(view?.props?.gridProps || gridProps)} />

        <XAxis
          type='category'
          dataKey={view?.props?.xDataKey || 'label'}
          tickFormatter={view?.props?.xTickFormatter || monthLabelFromAny}
          tickMargin={view?.props?.tickMargin ?? 12}
          interval={view?.props?.interval || 'preserveStartEnd'}
          minTickGap={view?.props?.minTickGap ?? 22}
          axisLine
          tickLine={false}
          height={view?.props?.xHeight ?? 36}
          label={<Label content={<AxisTitleX value={view?.props?.xTitle || 'Miesiąc'} />} />}
        />

        <YAxis
          type='number'
          axisLine
          tickLine={false}
          tickFormatter={view?.props?.yTickFormatter || yTickNumber}
          label={<Label content={<AxisTitleY value={view?.props?.yTitle || 'Koszt [PLN]'} />} />}
        />

        <Tooltip
          formatter={(value, name) => [fmtInt(value), name]}
          labelFormatter={lab => `Miesiąc: ${monthLabelFromAny(lab)}`}
        />

        <Legend {...(view?.props?.legendProps || legendProps)} />

        {(meta.length ? meta : keys.map(k => ({ key: k, label: k, color: basePalette.AZ }))).map((m, i) => (
          <Bar
            key={m.key}
            dataKey={m.key}
            name={m.label ?? m.key}
            stackId={view?.props?.stackId || 'cost'}
            fill={m.color || basePalette.AZ}
            radius={(view?.props?.stackRadiusTop ?? true) ? stackRadiusTopOnly(i, meta.length || keys.length) : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * data: [{ lab, cost, color }, ...]
 */
function CostsRankingVerticalRecharts({ data, view }) {
  const rows = Array.isArray(data) ? data : []
  const h = view?.props?.height ?? CHART.height

  const margin = view?.props?.margin || { ...CHART.margin, left: Math.max(CHART.margin.left, 190), bottom: 44 }
  const yWidth = view?.props?.yWidth ?? 210

  return (
    <ResponsiveContainer width='100%' height={h}>
      <BarChart
        layout='vertical'
        data={rows}
        margin={margin}
        barCategoryGap={view?.props?.barCategoryGap ?? CHART.bar.categoryGap}
        barGap={view?.props?.barGap ?? CHART.bar.gap}
      >
        <CartesianGrid {...(view?.props?.gridProps || gridProps)} />

        <XAxis
          type='number'
          tickFormatter={view?.props?.xTickFormatter || yTickNumber}
          axisLine
          tickLine={false}
          label={<Label content={<AxisTitleX value={view?.props?.xAxisLabel || 'Koszt [PLN]'} />} />}
        />

        <YAxis
          type='category'
          dataKey={view?.props?.categoryKey || 'lab'}
          width={yWidth}
          tickLine={false}
          axisLine
          interval={0}
        />

        <Tooltip formatter={v => [fmtInt(v), view?.props?.tooltipLabel || 'Koszt']} />
        <Legend {...(view?.props?.legendProps || legendProps)} />

        <Bar dataKey={view?.props?.valueKey || 'cost'} name={view?.props?.tooltipLabel || 'Koszt'} radius={view?.props?.barRadius || [8, 8, 8, 8]}>
          {rows.map((row, idx) => (
            <Cell key={`cell-${idx}`} fill={row?.[view?.props?.colorKey || 'color'] || row?.color || basePalette.AO} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * data: rows = [{ monthKey:'YYYY-MM', downtimeMonthly:number, repairMonthly:number }, ...]
 */
function FailuresComposedByMonthRecharts({ data, view }) {
  const rows = Array.isArray(data) ? data : []
  const h = view?.props?.height ?? CHART.height

  const xKey = view?.props?.xKey || 'monthKey'
  const barKey = view?.props?.barKey || 'downtimeMonthly'
  const lineKey = view?.props?.lineKey || 'repairMonthly'

  const xTitle = view?.props?.xTitle || 'Miesiąc'
  const yLeftTitle = view?.props?.yLeftTitle || 'Czas przestoju [h] (mies.)'
  const yRightTitle = view?.props?.yRightTitle || 'Koszt naprawy [PLN] (mies.)'

  const barLabel = view?.props?.barLabel || 'Przestój (mies.)'
  const lineLabel = view?.props?.lineLabel || 'Koszt naprawy (mies.)'

  const barFill = view?.props?.barFill || basePalette.AZ
  const lineStroke = view?.props?.lineStroke || basePalette.BP

  return (
    <ResponsiveContainer width='100%' height={h}>
      <ComposedChart
        data={rows}
        margin={view?.props?.margin || { ...CHART.margin, right: Math.max(CHART.margin.right, 80) }}
        barCategoryGap={view?.props?.barCategoryGap ?? CHART.bar.categoryGap}
        barGap={view?.props?.barGap ?? CHART.bar.gap}
      >
        <CartesianGrid {...(view?.props?.gridProps || gridProps)} />

        <XAxis
          type='category'
          dataKey={xKey}
          tickFormatter={v => monthLabelFromAny(v)}
          interval={view?.props?.interval || 'preserveStartEnd'}
          minTickGap={view?.props?.minTickGap ?? 22}
          tickMargin={view?.props?.tickMargin ?? 10}
          axisLine
          tickLine={false}
          height={view?.props?.xHeight ?? 36}
          label={<Label content={<AxisTitleX value={xTitle} />} />}
        />

        <YAxis
          yAxisId='L'
          orientation='left'
          axisLine
          tickLine={false}
          tickFormatter={view?.props?.yTickFormatter || yTickNumber}
          label={<Label content={<AxisTitleYLeft value={yLeftTitle} />} />}
        />

        <YAxis
          yAxisId='R'
          orientation='right'
          axisLine
          tickLine={false}
          tickFormatter={view?.props?.yTickFormatter || yTickNumber}
          label={<Label content={<AxisTitleYRight value={yRightTitle} />} />}
        />

        <Tooltip
          labelFormatter={v => monthLabelFromAny(v)}
          formatter={(val, name) => {
            if (name === barKey) return [fmtInt(val), barLabel]
            if (name === lineKey) return [fmtInt(val), lineLabel]
            return [val, name]
          }}
        />
        <Legend {...(view?.props?.legendProps || legendProps)} />

        <ReferenceLine yAxisId='L' y={0} stroke={basePalette.AXIS} strokeDasharray='3 6' />

        <Bar yAxisId='L' dataKey={barKey} name={barLabel} fill={barFill} radius={view?.props?.barRadius || [4, 4, 0, 0]} isAnimationActive={false} />

        <Line
          yAxisId='R'
          type='monotone'
          dataKey={lineKey}
          name={lineLabel}
          stroke={lineStroke}
          strokeWidth={view?.props?.lineWidth ?? 2}
          dot={view?.props?.dot || { r: 3 }}
          activeDot={view?.props?.activeDot || { r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/**
 * data:
 *  {
 *    rows: [{ code, offset, duration, startTs, endTs }, ...],
 *    domainMin:number, span:number, pad:number
 *  }
 */
function GanttCalibrationsRecharts({ data, view }) {
  const model = data && typeof data === 'object' ? data : { rows: [] }
  const rows = Array.isArray(model?.rows) ? model.rows : []
  const h = view?.props?.height ?? CHART.height

  const DAY_MS = 24 * 60 * 60 * 1000

  const xTitle = view?.props?.xTitle || 'Data'
  const yTitle = view?.props?.yTitle || 'Urządzenie'
  const barLabel = view?.props?.barLabel || 'Czas trwania'

  const leftMargin = view?.props?.leftMargin ?? 56
  const yWidth = view?.props?.yWidth ?? 104

  return (
    <ResponsiveContainer width='100%' height={h}>
      <BarChart
        layout='vertical'
        data={rows}
        margin={view?.props?.margin || { ...CHART.margin, left: leftMargin, bottom: CHART.margin.bottom }}
      >
        <CartesianGrid {...(view?.props?.gridProps || gridProps)} />

        <XAxis
          type='number'
          domain={[-(model?.pad || 0), (model?.span || 0) + (model?.pad || 0)]}
          tickFormatter={(view?.props?.xTickFormatter || dateTickYmd)(model?.domainMin || 0)}
          interval={view?.props?.interval || 'preserveStartEnd'}
          minTickGap={view?.props?.minTickGap ?? 24}
          tickMargin={view?.props?.tickMargin ?? 8}
          allowDataOverflow
          scale='time'
          axisLine
          tickLine
          height={view?.props?.xHeight ?? 36}
          label={<Label content={<AxisTitleX value={xTitle} dy={view?.props?.xTitleDy ?? 50} />} />}
        />

        <YAxis
          type='category'
          dataKey={view?.props?.yKey || 'code'}
          width={yWidth}
          tickLine={false}
          axisLine
          interval={0}
          label={<Label content={<AxisTitleY value={yTitle} />} />}
        />

        <Tooltip
          formatter={(value, _name, entry) => {
            const key = entry?.dataKey
            if (key === 'duration') {
              const days = Math.round(Number(value) / DAY_MS)
              return [`${days} dni`, barLabel]
            }
            if (key === 'offset') return [null, null]
            return [value, key]
          }}
          filterNull
          labelFormatter={(_, payload) => {
            const p = payload?.[0]?.payload
            if (!p) return ''
            const start = new Date(p.startTs).toLocaleDateString('pl-PL')
            const end = new Date(p.endTs).toLocaleDateString('pl-PL')
            return `${p.code}   (${start} → ${end})`
          }}
        />

        <Legend {...(view?.props?.legendProps || legendProps)} />

        <Bar dataKey='offset' stackId='g' fill='transparent' isAnimationActive={false} name='' legendType='none' />
        <Bar
          dataKey='duration'
          stackId='g'
          fill={view?.props?.fill || basePalette.AO}
          name={barLabel}
          radius={view?.props?.barRadius || [4, 4, 4, 4]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

const REGISTRY = {
  costsStackedByMonth: CostsStackedByMonthRecharts,
  costsRankingVertical: CostsRankingVerticalRecharts,

  // ✅ awaryjność (zamiast feature/FailuresChart.jsx)
  failuresComposedByMonth: FailuresComposedByMonthRecharts,

  // ✅ gantt (zamiast feature/GanttCalibrations.jsx)
  ganttCalibrations: GanttCalibrationsRecharts,
}

export function getSummaryChartRenderer(name) {
  return (name && REGISTRY[name]) || null
}

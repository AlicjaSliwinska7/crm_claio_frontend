// src/features/tools/pages/ChartsLab.jsx
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

import { palette, dashToArray, fmtNum, num } from '../../../shared/diagrams/utils/lab'

import { XTitle, YTitle, CustomLegend } from '../utils/chartsLab.utils'

import useParsedTable from '../hooks/useParsedTable'
import useColumnRoles from '../hooks/useColumnRoles'
import useChartSeries from '../hooks/useChartSeries'
import useChartData from '../hooks/useChartData'
import useAutoAxes from '../hooks/useAutoAxes'
import useGuides from '../hooks/useGuides'
import useChartExport from '../hooks/useChartExport'

import InputDataCard from '../components/chartsLab/InputDataCard'
import ColumnMappingCard from '../components/chartsLab/ColumnMappingCard'
import MetaTitlesCard from '../components/chartsLab/MetaTitlesCard'
import GuidesCard from '../components/chartsLab/GuidesCard'
import ExportToolsCard from '../components/chartsLab/ExportToolsCard'
import ChartCard from '../components/chartsLab/ChartCard'
import DataPreviewTable from '../components/chartsLab/DataPreviewTable'
import SeriesCard from '../components/chartsLab/SeriesCard'
import AxisXCard from '../components/chartsLab/AxisXCard'
import AxisYCard from '../components/chartsLab/AxisYCard'

export default function ChartsLab() {
  const chartWrapRef = useRef(null)

  /* Tytuł + kolory */
  const [title, setTitle] = useState('Wykres')
  const [titleColor, setTitleColor] = useState('#26435e')
  const [axisTitleColor, setAxisTitleColor] = useState('#26435e')

  /* PNG: możliwość przezroczystego tła */
  const [transparentBg, setTransparentBg] = useState(true)

  /* Dane wejściowe */
  const [rawText, setRawText] = useState('')
  const [fileName, setFileName] = useState('')

  const { columns, rows, numericCols } = useParsedTable(rawText)

  /* Mapowanie kolumn */
  const { colRoles, setColRoles, setRole } = useColumnRoles({ columns, numericCols })

  /* Oś X */
  const [xTitle, setXTitle] = useState('Oś X')
  const [xUnit, setXUnit] = useState('')
  const [xMin, setXMin] = useState('')
  const [xMax, setXMax] = useState('')
  const [xStep, setXStep] = useState('')
  const [xLog, setXLog] = useState(false)
  const [xDecimals, setXDecimals] = useState('')

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

  /* Serie Y */
  const { leftSeries, setLeftSeries, rightSeries, setRightSeries, applyMapping, addManualY, addManualPairs } =
    useChartSeries({
      columns,
      colRoles,
      xTitle,
      setXTitle,
    })

  /* Dane do wykresu */
  const { xColSelected, chartData, renderData, chartKeys, xSet, seriesAll, extendTail, setExtendTail } = useChartData({
    rows,
    colRoles,
    leftSeries,
    rightSeries,
  })

  /* Auto osie, walidacje + zakresy danych */
  const {
    xAxisCfg,
    yLAxisCfg,
    yRAxisCfg,
    xDec,
    yLDec,
    yRDec,
    yLDataRange,
    yRDataRange,
    invalidStyle,
    lRangeInvalid,
    rRangeInvalid,
    lMinTooHigh,
    lMaxTooLow,
    rMinTooHigh,
    rMaxTooLow,
    handleAutoFit,
    zeroVisibleOnLeft,
  } = useAutoAxes({
    xSet,
    xLog,
    xMin,
    xMax,
    xStep,
    xDecimals,
    leftSeries,
    rightSeries,
    chartData,
    yLLog,
    yLMin,
    yLMax,
    yLStep,
    yLDecimals,
    yRLog,
    yRMin,
    yRMax,
    yRStep,
    yRDecimals,
    setXMin,
    setXMax,
    setXStep,
    setYLMin,
    setYLMax,
    setYLStep,
    setYRMin,
    setYRMax,
    setYRStep,
  })

  /* Linie pomocnicze */
  const { guides, newGuide, setNewGuide, addGuide, removeGuide } = useGuides({ xLog, yLLog, yRLog })

  /* Legend payload (kolejność jak sekcje) */
  const legendPayload = useMemo(() => {
    const mkItem = (s, idxOffset = 0, i) => ({
      id: s.mode === 'column' ? s.col : s.id,
      type: 'line',
      value: s.name || s.col || `Seria ${i + 1}`,
      color: s.color || palette[(idxOffset + i) % palette.length],
    })

    const leftItems = (leftSeries || []).map((s, i) => mkItem(s, 0, i))
    const rightItems = (rightSeries || []).map((s, i) => mkItem(s, leftItems.length, i))

    return [...leftItems, ...rightItems]
  }, [leftSeries, rightSeries])

  /* Eksport PNG/CSV */
  const { exportPng, exportCsv } = useChartExport({
    chartWrapRef,
    title,
    fileName,
    chartData,
    xColSelected,
    seriesAll,
    transparentBg,
  })

  const tooltipFmt = useMemo(() => {
    return (val) => fmtNum(num(val), xDec)
  }, [xDec])

  return (
    <div className='charts-lab'>
      <div className='charts-lab__grid'>
        <InputDataCard rawText={rawText} setRawText={setRawText} fileName={fileName} setFileName={setFileName} />

        <ColumnMappingCard
          columns={columns}
          colRoles={colRoles}
          setRole={setRole}
          onApply={applyMapping}
          numericCols={numericCols}
        />

        <MetaTitlesCard
          title={title}
          setTitle={setTitle}
          titleColor={titleColor}
          setTitleColor={setTitleColor}
          axisTitleColor={axisTitleColor}
          setAxisTitleColor={setAxisTitleColor}
        />

        <SeriesCard
          leftSeries={leftSeries}
          setLeftSeries={setLeftSeries}
          rightSeries={rightSeries}
          setRightSeries={setRightSeries}
          addManualY={addManualY}
          addManualPairs={addManualPairs}
        />

        <AxisXCard
          xTitle={xTitle}
          setXTitle={setXTitle}
          xUnit={xUnit}
          setXUnit={setXUnit}
          xMin={xMin}
          setXMin={setXMin}
          xMax={xMax}
          setXMax={setXMax}
          xStep={xStep}
          setXStep={setXStep}
          xLog={xLog}
          setXLog={setXLog}
          xDecimals={xDecimals}
          setXDecimals={setXDecimals}
          invalidStyle={invalidStyle}
        />

        <AxisYCard
          side='L'
          yTitle={yLTitle}
          setYTitle={setYLTitle}
          yUnit={yLUnit}
          setYUnit={setYLUnit}
          yMin={yLMin}
          setYMin={setYLMin}
          yMax={yLMax}
          setYMax={setYLMax}
          yStep={yLStep}
          setYStep={setYLStep}
          yLog={yLLog}
          setYLog={setYLLog}
          yDecimals={yLDecimals}
          setYDecimals={setYLDecimals}
          dataRange={yLDataRange}
          rangeInvalid={lRangeInvalid}
          minTooHigh={lMinTooHigh}
          maxTooLow={lMaxTooLow}
          invalidStyle={invalidStyle}
          zeroVisible={zeroVisibleOnLeft}
        />

        <AxisYCard
          side='R'
          yTitle={yRTitle}
          setYTitle={setYRTitle}
          yUnit={yRUnit}
          setYUnit={setYRUnit}
          yMin={yRMin}
          setYMin={setYRMin}
          yMax={yRMax}
          setYMax={setYRMax}
          yStep={yRStep}
          setYStep={setYRStep}
          yLog={yRLog}
          setYLog={setYRLog}
          yDecimals={yRDecimals}
          setYDecimals={setYRDecimals}
          dataRange={yRDataRange}
          rangeInvalid={rRangeInvalid}
          minTooHigh={rMinTooHigh}
          maxTooLow={rMaxTooLow}
          invalidStyle={invalidStyle}
        />

        <GuidesCard guides={guides} newGuide={newGuide} setNewGuide={setNewGuide} onAdd={addGuide} onRemove={removeGuide} />

        <ExportToolsCard
          fileName={fileName}
          setFileName={setFileName}
          transparentBg={transparentBg}
          setTransparentBg={setTransparentBg}
          extendTail={extendTail}
          setExtendTail={setExtendTail}
          onAutoFit={handleAutoFit}
          onExportPng={exportPng}
          onExportCsv={exportCsv}
        />

        <ChartCard>
          <div ref={chartWrapRef} className='charts-lab__chartwrap'>
            <div className='charts-lab__title' style={{ color: titleColor }}>
              {title}
            </div>

            <ResponsiveContainer width='100%' height={420}>
              <LineChart data={renderData} margin={{ top: 14, right: 28, bottom: 28, left: 28 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='__x'
                  type='number'
                  domain={xAxisCfg.domain}
                  scale={xAxisCfg.scale}
                  ticks={xAxisCfg.ticks}
                  tickFormatter={(v) => fmtNum(num(v), xDec)}
                >
                  <Label value={`${xTitle}${xUnit ? ` [${xUnit}]` : ''}`} position='insideBottom' content={<XTitle fill={axisTitleColor} />} />
                </XAxis>

                <YAxis
                  yAxisId='L'
                  domain={yLAxisCfg.domain}
                  scale={yLAxisCfg.scale}
                  ticks={yLAxisCfg.ticks}
                  tickFormatter={(v) => fmtNum(num(v), yLDec)}
                >
                  <Label value={`${yLTitle}${yLUnit ? ` [${yLUnit}]` : ''}`} position='insideLeft' content={<YTitle side='L' fill={axisTitleColor} />} />
                </YAxis>

                <YAxis
                  yAxisId='R'
                  orientation='right'
                  domain={yRAxisCfg.domain}
                  scale={yRAxisCfg.scale}
                  ticks={yRAxisCfg.ticks}
                  tickFormatter={(v) => fmtNum(num(v), yRDec)}
                >
                  <Label value={`${yRTitle}${yRUnit ? ` [${yRUnit}]` : ''}`} position='insideRight' content={<YTitle side='R' fill={axisTitleColor} />} />
                </YAxis>

                <Tooltip formatter={tooltipFmt} />

                <Legend
                  verticalAlign='bottom'
                  content={() => <CustomLegend items={legendPayload} />}
                />

                {/* Guides */}
                {(guides || []).map((g) => (
                  <ReferenceLine
                    key={g.id}
                    x={g.axis === 'x' ? g.value : undefined}
                    y={g.axis !== 'x' ? g.value : undefined}
                    yAxisId={g.axis === 'yr' ? 'R' : 'L'}
                    stroke={g.color || '#7f7f7f'}
                    strokeWidth={g.width || 1}
                    strokeDasharray={dashToArray(g.dash || 'dash')}
                    ifOverflow='extendDomain'
                  />
                ))}

                {/* Left series */}
                {(leftSeries || []).map((s, i) => (
                  <Line
                    key={s.id}
                    yAxisId='L'
                    type='monotone'
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color || palette[i % palette.length]}
                    strokeWidth={s.width || 2}
                    strokeDasharray={dashToArray(s.dash || 'solid')}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}

                {/* Right series */}
                {(rightSeries || []).map((s, i) => (
                  <Line
                    key={s.id}
                    yAxisId='R'
                    type='monotone'
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color || palette[(i + leftSeries.length) % palette.length]}
                    strokeWidth={s.width || 2}
                    strokeDasharray={dashToArray(s.dash || 'solid')}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <DataPreviewTable columns={columns} rows={rows} chartKeys={chartKeys} chartData={chartData} />
      </div>
    </div>
  )
}
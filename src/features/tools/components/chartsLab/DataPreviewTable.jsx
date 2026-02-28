// src/features/charts/components/chartsLab/DataPreviewTable.jsx
import React from 'react'

export default function DataPreviewTable({ chartData, chartKeys, xUnit, cellStyle }) {
  if (!chartData?.length) return null

  return (
    <div className='cl-table'>
      <div className='cl-table-title'>Podgląd danych ({chartData.length} punktów)</div>

      <div className='cl-table-scroll'>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={cellStyle}>x{xUnit ? ` [${xUnit}]` : ''}</th>
              {chartKeys.map((k) => (
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
                {chartKeys.map((k) => (
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
  )
}
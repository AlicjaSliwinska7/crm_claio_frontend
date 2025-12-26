import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts'
import { AXIS, centeredLegend, fmtInt } from './constants'

export default function CostsByLabChart({ data }) {
  return (
    <ResponsiveContainer width='100%' height={380}>
      <BarChart layout='vertical' data={data} margin={{ top: 8, right: 20, bottom: 36, left: 140 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          type='number'
          tickFormatter={v => `${fmtInt(v)} PLN`}
          axisLine
          tickLine
          label={<Label value='Koszt [PLN]' position='insideBottom' dy={AXIS.xDy} />}
        />
        <YAxis type='category' dataKey='lab' width={160} tickLine={false} axisLine interval={0} />
        <Tooltip formatter={v => [`${fmtInt(v)} PLN`, 'Koszt']} />
        <Legend verticalAlign='bottom' align='center' wrapperStyle={centeredLegend} />
        <Bar dataKey='cost' name='Koszt' radius={[4, 4, 4, 4]}>
          {data.map((row, idx) => (<Cell key={`cell-${idx}`} fill={row.color} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

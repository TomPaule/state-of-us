'use client'
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ChartPoint } from '@/lib/types'

interface TrendChartProps {
  data: ChartPoint[]
  label: string
  color: string
  height?: number
  showTarget?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 500, color: '#44403C', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        p.value != null ? (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 2, background: p.color, display: 'inline-block', borderRadius: 1 }} />
            <span style={{ color: p.color }}>{p.name}:</span>
            <span style={{ color: '#1C1917', fontWeight: 500 }}>{Number(p.value).toFixed(1)}</span>
          </div>
        ) : null
      ))}
    </div>
  )
}

export default function TrendChart({
  data,
  label,
  color,
  height = 140,
  showTarget = true,
}: TrendChartProps) {
  const hasTarget = showTarget && data.some(d => d.target > 0)
  const hasPeer = data.some(d => d.peer > 0)

  return (
    <div>
      <div style={{ fontSize: 12, color: '#78716C', marginBottom: 8 }}>{label}</div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* US line — always shown */}
          <Line
            type="monotone"
            dataKey="us"
            name="United States"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            connectNulls
          />

          {/* Peer nations — only if data exists */}
          {hasPeer && (
            <Line
              type="monotone"
              dataKey="peer"
              name="Peer nations avg"
              stroke="#A8A29E"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3, fill: '#A8A29E' }}
              connectNulls
            />
          )}

          {/* North star target — only if data exists */}
          {hasTarget && (
            <Line
              type="monotone"
              dataKey="target"
              name="North star target"
              stroke="#D6D3D1"
              strokeWidth={1}
              strokeDasharray="2 4"
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <LegendItem color={color} label="United States" />
        {hasPeer && <LegendItem color="#A8A29E" label="Peer nations avg" dashed />}
        {hasTarget && <LegendItem color="#D6D3D1" label="North star target" dashed />}
      </div>
    </div>
  )
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#A8A29E' }}>
      <span style={{
        display: 'inline-block',
        width: 16,
        height: 2,
        borderRadius: 1,
        background: dashed
          ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 3px, transparent 3px, transparent 6px)`
          : color,
      }} />
      {label}
    </span>
  )
}
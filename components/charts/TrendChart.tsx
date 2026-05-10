'use client'
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
    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-card text-xs">
      <div className="font-medium text-stone-700 mb-1">{label}</div>
      {payload.map((p: any) =>
        p.value != null && p.value > 0 ? (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-0.5 rounded" style={{ background: p.color }} />
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="text-stone-900 font-medium">{Number(p.value).toFixed(1)}</span>
          </div>
        ) : null
      )}
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

  return (
    <div>
      <div className="text-xs text-stone-500 mb-2">{label}</div>
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
          <Line
            type="monotone"
            dataKey="us"
            name="United States"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
          <Line
            type="monotone"
            dataKey="peer"
            name="Peer nations avg"
            stroke="#A8A29E"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3, fill: '#A8A29E' }}
          />
          {hasTarget && (
            <Line
              type="monotone"
              dataKey="target"
              name="North star target"
              stroke="#D6D3D1"
              strokeWidth={1}
              strokeDasharray="2 4"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: color }} />
          United States
        </span>
        <span className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: '#A8A29E' }} />
          Peer nations avg
        </span>
        {hasTarget && (
          <span className="flex items-center gap-1.5 text-xs text-stone-400">
            <span className="inline-block w-4 h-0.5 rounded" style={{ background: '#D6D3D1' }} />
            North star target
          </span>
        )}
      </div>
    </div>
  )
}
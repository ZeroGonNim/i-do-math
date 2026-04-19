import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendStat } from '../hooks/useDashboardData'

interface Props {
  data: TrendStat[]
  color: string
}

export function AccuracyLineChart({ data, color }: Props) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#23233f" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            hide={true} 
            domain={[0, 100]} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#17172f', border: '1px solid #23233f', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: color }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#1d1d37' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

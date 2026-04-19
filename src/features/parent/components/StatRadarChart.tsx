import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts'
import { UnitStat } from '../hooks/useDashboardData'

interface Props {
  data: UnitStat[]
  color: string
}

export function StatRadarChart({ data, color }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-[#64748b]">
        충분한 학습 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#23233f" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="성취도"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

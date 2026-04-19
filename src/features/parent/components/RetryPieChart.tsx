import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend,
  Tooltip 
} from 'recharts'
import { RetryStat } from '../hooks/useDashboardData'

interface Props {
  data: RetryStat[]
}

export function RetryPieChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-[#64748b]">
        학습 데이터가 부족합니다.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#17172f', border: '1px solid #23233f', borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

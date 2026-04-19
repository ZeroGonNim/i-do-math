import { UnitStat } from '../hooks/useDashboardData'
import { Clock } from 'lucide-react'

interface Props {
  data: UnitStat[]
}

export function UnitAvgTimeList({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="py-4 text-center text-[10px] text-[#64748b]">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div 
          key={item.subject} 
          className="flex items-center justify-between p-3 bg-[#17172f] border border-[#23233f]"
        >
          <div className="flex-1">
            <p className="text-xs font-bold text-[#e5e3ff]">{item.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-[#64748b]" />
            <span className="text-xs font-bold text-[#38bdf8]">
              평균 {item.avgTime}초
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

import { StatRadarChart } from './StatRadarChart'
import { AccuracyLineChart } from './AccuracyLineChart'
import { WeakConceptList } from './WeakConceptList'
import { RetryPieChart } from './RetryPieChart'
import { UnitAvgTimeList } from './UnitAvgTimeList'
import type { UnitStat, RetryStat, TrendStat, WeakConcept } from '@/features/parent/hooks/useDashboardData'

interface Props {
  unitStats: UnitStat[]
  retryStats: RetryStat[]
  trendStats: TrendStat[]
  weakConcepts: WeakConcept[]
  primaryColor: string
  onConceptSelect: (concept: string) => void
}

export function DashboardCharts({ unitStats, retryStats, trendStats, weakConcepts, primaryColor, onConceptSelect }: Props) {
  return (
    <div className="px-5 pt-5 space-y-5">
      <div className="px-6 py-6 border" style={{ backgroundColor: '#1d1d37', borderColor: '#23233f' }}>
        <p className="text-sm font-bold text-[#e5e3ff] mb-6">단원별 성취도 분석</p>
        <StatRadarChart data={unitStats} color={primaryColor} />
        <div className="mt-8">
          <p className="text-[10px] font-bold text-[#64748b] mb-4">단원별 평균 소요 시간</p>
          <UnitAvgTimeList data={unitStats} />
        </div>
      </div>

      <div className="px-6 py-6 border" style={{ backgroundColor: '#1d1d37', borderColor: '#23233f' }}>
        <p className="text-sm font-bold text-[#e5e3ff] mb-6">학습 성취도 분석</p>
        <RetryPieChart data={retryStats} />
        <p className="text-[10px] text-[#64748b] mt-4 leading-relaxed text-center">
          한 번에 맞힌 비율이 높을수록 개념 이해도가 높은 상태입니다.
        </p>
      </div>

      <div className="px-6 py-6 border" style={{ backgroundColor: '#1d1d37', borderColor: '#23233f' }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-[#e5e3ff]">실력 향상 추이</p>
          <p className="text-[10px] font-bold" style={{ color: primaryColor }}>최근 7일</p>
        </div>
        <AccuracyLineChart data={trendStats} color={primaryColor} />
      </div>

      <div className="px-6 py-6 border" style={{ backgroundColor: '#1d1d37', borderColor: '#23233f' }}>
        <p className="text-sm font-bold text-[#e5e3ff] mb-6">집중 보충 필요 영역</p>
        <WeakConceptList
          concepts={weakConcepts}
          onConceptSelect={onConceptSelect}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  )
}

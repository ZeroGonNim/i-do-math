import { WeakConcept } from '../hooks/useDashboardData'
import { formatConceptName } from '@/shared/constants/problemConstants'
import { AlertCircle } from 'lucide-react'

interface Props {
  concepts: WeakConcept[]
  onConceptSelect: (concept: string) => void
  primaryColor: string
}

export function WeakConceptList({ concepts, onConceptSelect, primaryColor }: Props) {
  if (concepts.length === 0) {
    return (
      <div className="p-8 text-center bg-[#17172f] border-2 border-dashed border-[#23233f]">
        <p className="text-sm text-[#64748b]">아직 발견된 취약 단원이 없습니다.<br/>충실히 모험을 진행 중이네요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {concepts.map((item, idx) => (
        <button
          key={item.concept}
          onClick={() => onConceptSelect(item.concept)}
          className="w-full flex items-center gap-4 p-4 bg-[#17172f] border-l-4 transition-all active:scale-[0.98]"
          style={{ borderColor: idx === 0 ? '#ff716c' : idx === 1 ? '#fbbf24' : primaryColor }}
        >
          <div className="flex-1 text-left">
            <p className="text-[10px] font-bold text-[#64748b] mb-1">취약 순위 {idx + 1}</p>
            <h4 className="text-sm font-bold text-[#e5e3ff]">{formatConceptName(item.concept)}</h4>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#ff716c]">{item.count}회 오답</p>
            <p className="text-[10px] text-[#64748b] mt-0.5">자세히 보기 ›</p>
          </div>
        </button>
      ))}
      
      <div className="mt-4 p-3 bg-[#ff716c15] border border-[#ff716c30] flex gap-2">
        <AlertCircle size={14} className="text-[#ff716c] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#ff716c] leading-relaxed">
          <strong>전문가 처방:</strong> 가장 많이 틀린 개념에 대해 오답 노트를 활용한 집중 복습을 권장합니다.
        </p>
      </div>
    </div>
  )
}

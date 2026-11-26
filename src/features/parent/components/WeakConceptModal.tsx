import { formatConceptName } from '@/shared/constants/problemConstants'
import { getMistakeFeedback } from '@/shared/utils/mistakeFeedback'
import { isIntegerAnswer, isFractionAnswer, type Answer } from '@/types/problem'
import type { WrongNote } from '@/types/wrongNote'

function formatAnswer(answer?: Answer): string {
  if (!answer) return '—'
  if (isIntegerAnswer(answer)) return String(answer.value)
  if (isFractionAnswer(answer)) return `${answer.numerator}/${answer.denominator}`
  return '...'
}

interface Props {
  concept: string
  notes: WrongNote[]
  primaryColor: string
  onClose: () => void
}

export function WeakConceptModal({ concept, notes, primaryColor, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#0c0c1f] border-4 border-[#23233f] overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="px-5 py-4 border-b border-[#23233f] flex items-center justify-between bg-[#17172f]">
          <span className="text-lg font-bold" style={{ color: primaryColor }}>{formatConceptName(concept)} 분석</span>
          <button onClick={onClose} className="text-[#64748b] font-bold">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {notes.map(note => {
            const feedback = getMistakeFeedback(note.mistakeType)
            return (
              <div key={note.id} className="p-4 border-2 border-[#23233f] bg-[#17172f] relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: feedback.color, color: '#000' }}>
                  {feedback.label}
                </div>
                <p className="text-sm text-[#e5e3ff] mb-3 pr-14 leading-relaxed">{note.questionText}</p>
                <div className="flex gap-2 text-[11px] mb-3">
                  <div className="flex-1 p-2 bg-[#000] border border-[#ff716c]/30">
                    <p className="text-[#64748b] mb-1">제출한 답</p>
                    <p className="text-[#ff716c] font-bold">{formatAnswer(note.lastWrongAnswer)}</p>
                  </div>
                  <div className="flex-1 p-2 bg-[#000] border border-[#10b981]/30">
                    <p className="text-[#64748b] mb-1">정답</p>
                    <p className="text-[#10b981] font-bold">{formatAnswer(note.correctAnswer)}</p>
                  </div>
                </div>
                <div className="p-2.5 bg-[#1e1e3a] rounded border border-[#2d2d50]">
                  <p className="text-[10px] text-[#aaa8c3] leading-relaxed italic">
                    " {feedback.advice} "
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-5 border-t border-[#23233f]">
          <button onClick={onClose} className="w-full py-3 text-[#64748b] bg-[#17172f]">닫기</button>
        </div>
      </div>
    </div>
  )
}

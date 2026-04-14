import { useState } from 'react'
import type { ReportType } from '@/types/problemReport'

interface Props {
  onSubmit: (type: ReportType) => void
  onClose: () => void
}

const REPORT_OPTIONS: { type: ReportType; label: string; desc: string }[] = [
  {
    type: 'wrong_answer',
    label: '정답이 틀린 것 같아요',
    desc: '내가 쓴 답이 맞는데 오답으로 처리됐어요',
  },
  {
    type: 'wrong_question',
    label: '문제 내용이 이상해요',
    desc: '문제 설명이나 선택지가 잘못된 것 같아요',
  },
]

export function ProblemReportModal({ onSubmit, onClose }: Props) {
  const [selected, setSelected] = useState<ReportType | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    onSubmit(selected)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-4 p-5 border-4 border-[#23233f]"
        style={{ backgroundColor: '#17172f', boxShadow: '0 8px 0 #000' }}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-2xl font-bold text-center" style={{ color: '#10b981' }}>신고 접수 완료!</p>
            <p className="text-sm text-center" style={{ color: '#aaa8c3' }}>
              검토 후 빠르게 수정할게요.<br />알려줘서 고마워요!
            </p>
            <button
              onClick={onClose}
              className="w-full min-h-[48px] font-bold text-base"
              style={{ backgroundColor: '#23233f', color: '#aaa8c3' }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div>
              <p className="text-base font-bold mb-1" style={{ color: '#e5e3ff' }}>문제 오류 신고</p>
              <p className="text-xs" style={{ color: '#64748b' }}>어떤 문제가 있나요?</p>
            </div>

            <div className="flex flex-col gap-2">
              {REPORT_OPTIONS.map(opt => {
                const isSelected = selected === opt.type
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelected(opt.type)}
                    className="flex flex-col gap-0.5 w-full px-4 py-3 text-left border-2 transition-all"
                    style={{
                      backgroundColor: isSelected ? '#0d1f2a' : '#1d1d37',
                      borderColor: isSelected ? '#38bdf8' : '#23233f',
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: isSelected ? '#38bdf8' : '#e5e3ff' }}>
                      {opt.label}
                    </span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{opt.desc}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 min-h-[48px] font-bold text-sm"
                style={{ backgroundColor: '#23233f', color: '#aaa8c3' }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className="flex-1 min-h-[48px] font-bold text-sm transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#ff716c', color: '#fff' }}
              >
                신고하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

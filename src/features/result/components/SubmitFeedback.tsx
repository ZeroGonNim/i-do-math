/**
 * 문제 화면에서 "정답 확인" 탭 직후 0.4초간 표시되는 즉각 피드백
 * 실제 navigate 전에 시각적 선행 반응을 줌
 */
interface Props {
  isCorrect: boolean
}

export function SubmitFeedback({ isCorrect }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${
          isCorrect ? 'bg-green-500' : 'bg-red-400'
        }`}
        style={{ animation: 'submitPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        <span className="text-6xl text-white font-black">
          {isCorrect ? '✓' : '✗'}
        </span>
      </div>
      <style>{`
        @keyframes submitPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

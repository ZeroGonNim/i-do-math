import { useEffect, useRef } from 'react'

interface Props {
  userNumerator: number
  userDenominator?: number
  onDone: () => void
}

const TOTAL_MS = 1800

export function WrongOverlay({ userNumerator, userDenominator, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDone, TOTAL_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
      {/* 붉은 펄스 배경 */}
      <div
        className="absolute inset-0 bg-red-400"
        style={{ animation: 'redPulse 0.6s ease-out forwards' }}
      />

      {/* 중앙 콘텐츠 */}
      <div
        className="relative z-10 flex flex-col items-center gap-4"
        style={{ animation: 'wrongBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
      >
        {/* 이모지 */}
        <div
          className="text-8xl"
          style={{ animation: 'headShake 0.5s ease-in-out 0.4s' }}
        >
          🤔
        </div>

        {/* 오답 분수 — 떨림 */}
        <div
          className="bg-white/90 rounded-2xl px-8 py-4 shadow-lg"
          style={{ animation: 'shake 0.4s ease-in-out 0.3s' }}
        >
          <p className="text-xs text-gray-400 text-center mb-1">내가 쓴 답</p>
          <p className="text-4xl font-black text-red-500 text-center">
            {userDenominator !== undefined ? `${userNumerator}/${userDenominator}` : userNumerator}
          </p>
        </div>

        {/* 격려 메시지 */}
        <p
          className="text-xl font-bold text-white drop-shadow-md"
          style={{ animation: 'fadeInUp 0.4s ease 0.6s both' }}
        >
          괜찮아요, 다시 해봐요! 💪
        </p>
      </div>

      <style>{`
        @keyframes redPulse {
          0%   { opacity: 0; }
          20%  { opacity: 0.35; }
          100% { opacity: 0; }
        }
        @keyframes wrongBounceIn {
          0%   { transform: scale(0.4) translateY(40px); opacity: 0; }
          60%  { transform: scale(1.1) translateY(-8px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-10px) rotate(-2deg); }
          30%  { transform: translateX(10px) rotate(2deg); }
          45%  { transform: translateX(-8px) rotate(-1deg); }
          60%  { transform: translateX(8px) rotate(1deg); }
          75%  { transform: translateX(-4px); }
        }
        @keyframes headShake {
          0%, 100% { transform: rotate(0deg); }
          25%  { transform: rotate(-15deg); }
          75%  { transform: rotate(15deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

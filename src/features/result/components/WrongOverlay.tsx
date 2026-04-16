import { useEffect } from 'react'
import { BrainIcon, MuscleIcon } from '@/shared/components/PixelIcons'

interface Props {
  userNumerator?: number
  userDenominator?: number
  onDone: () => void
}

export function WrongOverlay({ userNumerator, userDenominator, onDone }: Props) {
  const formattedAnswer = userNumerator !== undefined
    ? userDenominator !== undefined
      ? `${userNumerator}/${userDenominator}`
      : String(userNumerator)
    : '?'

  // Auto-close after 1 second
  useEffect(() => {
    const timer = setTimeout(onDone, 1000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(12,12,31,0.85)', backdropFilter: 'blur(8px)' }}
    >
      {/* HUD status bar - Optional: removed or kept based on preference, here kept for RPG feel but absolute */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 opacity-50">
        <span className="text-xs font-bold" style={{ color: '#fff', fontFamily: 'var(--font-game)' }}>
          시스템 오류 // 에러_04
        </span>
        <span className="text-xs font-bold" style={{ color: '#fff', fontFamily: 'var(--font-game)' }}>
          STATUS: FAILED
        </span>
      </div>

      {/* Centered content */}
      <div className="flex items-center justify-center px-6">
        {/* Black card */}
        <div
          className="w-full flex flex-col items-center py-10 px-8 gap-6 border-4 border-[#ff716c]"
          style={{
            backgroundColor: '#0f172a',
            maxWidth: '342px',
            boxShadow: '0 0 40px rgba(255,113,108,0.3)',
            animation: 'wrongPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* Pixel icon */}
          <div
            className="flex items-center justify-center"
            style={{ width: '96px', height: '96px', backgroundColor: '#000' }}
          >
            <BrainIcon color="#ff716c" size={64} />
          </div>

          {/* 오답! */}
          <p
            className="text-4xl font-bold text-center"
            style={{ color: '#ff716c', fontFamily: 'var(--font-sans)', letterSpacing: '-1.8px', lineHeight: '40px' }}
          >
            오답!
          </p>

          {/* User answer */}
          <div className="flex flex-col items-center gap-1">
            <p
              className="text-lg font-bold text-center"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-game)' }}
            >
              내가 쓴 답 {formattedAnswer}.
            </p>
            <p
              className="text-xl font-medium text-center"
              style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
            >
              괜찮아요, 다시 해봐요! <MuscleIcon color="#aaa8c3" size={18} />
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wrongPop {
          0%   { transform: scale(0.8) translateY(20px); opacity: 0; }
          60%  { transform: scale(1.03) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

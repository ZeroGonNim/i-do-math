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

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ backgroundColor: '#ff716c' }}
    >
      {/* HUD status bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-bold" style={{ color: 'rgba(0,0,0,0.5)', fontFamily: 'var(--font-game)' }}>
          시스템 오류 // 에러_04
        </span>
        <span className="text-xs font-bold" style={{ color: 'rgba(0,0,0,0.5)', fontFamily: 'var(--font-game)' }}>
          HP: 00 // XP: 2450
        </span>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        {/* Black card */}
        <div
          className="w-full flex flex-col items-center py-10 px-8 gap-6"
          style={{
            backgroundColor: '#000',
            maxWidth: '342px',
            animation: 'wrongPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* Pixel icon */}
          <div
            className="flex items-center justify-center"
            style={{ width: '96px', height: '96px', backgroundColor: '#000' }}
          >
            <span style={{ fontSize: '52px', lineHeight: 1 }}>🧠</span>
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
              괜찮아요, 다시 해봐요! 💪
            </p>
          </div>

          {/* 다시 도전 button */}
          <button
            onClick={onDone}
            className="flex items-center justify-center font-medium text-xl transition-all active:scale-[0.97]"
            style={{
              width: '278px',
              height: '68px',
              backgroundColor: '#ff716c',
              color: '#490006',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '2px',
            }}
          >
            ↻　다시 도전
          </button>

          {/* 내 답 확인하기 */}
          <button
            onClick={onDone}
            className="text-sm font-medium"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
          >
            내 답 확인하기
          </button>
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

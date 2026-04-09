import { useEffect, useState } from 'react'
import { LEVEL_TITLES } from '@/types/user'

interface Props {
  newLevel: number
  onClose: () => void
  hasBox?: boolean
  onOpenBox?: () => void
}

export function LevelUpModal({ newLevel, onClose, hasBox, onOpenBox }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const title = LEVEL_TITLES[newLevel] ?? `레벨 ${newLevel}`
  // Stars bonus for level up (100 × level)
  const bonusStars = newLevel * 100

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4 transition-all duration-250"
      style={{ backgroundColor: visible ? 'rgba(12,12,31,0.9)' : 'rgba(12,12,31,0)' }}
      onClick={handleClose}
    >
      {/* Gold glow radial decoration */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '320px',
          height: '320px',
          backgroundColor: 'rgba(255,215,9,0.15)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="relative w-full max-w-sm flex flex-col transition-all duration-300"
        style={{
          backgroundColor: '#1d1d37',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)',
          opacity: visible ? 1 : 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Achievement icon area */}
        <div
          className="flex flex-col items-center pt-12 pb-6 px-8"
          style={{ backgroundColor: '#1d1d37' }}
        >
          {/* Gold medal icon */}
          <div
            className="flex items-center justify-center mb-6"
            style={{
              width: '80px',
              height: '100px',
              backgroundColor: '#ffe792',
              border: '2px solid #5b4b00',
              boxShadow: '0 0 32px rgba(255,231,146,0.4)',
            }}
          >
            <span style={{ fontSize: '48px', lineHeight: 1 }}>🎖️</span>
          </div>

          {/* 업적 달성! label */}
          <p
            className="text-xs font-bold mb-2 tracking-widest text-center"
            style={{ color: '#ffe792', fontFamily: 'var(--font-game)', letterSpacing: '2.4px' }}
          >
            업적 달성!
          </p>

          {/* 레벨 업! heading */}
          <h2
            className="text-4xl font-bold text-center mb-5"
            style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.9px' }}
          >
            레벨 업!
          </h2>

          {/* Level badge */}
          <div
            className="w-full flex flex-col items-center justify-center py-5 mb-4"
            style={{ backgroundColor: '#ffd709' }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: '#5b4b00', fontFamily: 'var(--font-game)', letterSpacing: '-0.6px' }}
            >
              Lv.{newLevel} {title}
            </span>
            {/* Pixel progress decoration */}
            <div className="flex gap-2 mt-2">
              {[0,1,2,3,4].map(i => (
                <div
                  key={i}
                  style={{ width: '40px', height: '8px', backgroundColor: 'rgba(91,75,0,0.3)' }}
                />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex w-full gap-3 mb-6">
            <div
              className="flex-1 flex flex-col items-center py-4"
              style={{ backgroundColor: '#17172f', border: '1px solid #46465c' }}
            >
              <span
                className="text-[10px] font-bold mb-2"
                style={{ color: '#74738b', fontFamily: 'var(--font-game)' }}
              >
                새로운 스킬
              </span>
              <span
                className="text-base font-medium text-center"
                style={{ color: '#81ecff', fontFamily: 'var(--font-sans)' }}
              >
                {title}
              </span>
            </div>
            <div
              className="flex-1 flex flex-col items-center py-4"
              style={{ backgroundColor: '#17172f', border: '1px solid #46465c' }}
            >
              <span
                className="text-[10px] font-bold mb-2"
                style={{ color: '#74738b', fontFamily: 'var(--font-game)' }}
              >
                보너스
              </span>
              <span
                className="text-base font-bold"
                style={{ color: '#ffe792', fontFamily: 'var(--font-game)' }}
              >
                +{bonusStars} 별
              </span>
            </div>
          </div>

          {/* Primary button */}
          {hasBox && onOpenBox ? (
            <>
              <button
                onClick={() => { setVisible(false); setTimeout(onOpenBox, 250) }}
                className="w-full flex items-center justify-center gap-2 font-medium text-xl transition-all active:scale-[0.97] mb-3"
                style={{
                  height: '68px',
                  backgroundColor: '#ffe792',
                  color: '#5b4b00',
                  border: '2px solid #5b4b00',
                  boxShadow: '0 4px 0 #5b4b00',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '2px',
                }}
              >
                📦 레벨업 박스 열기
              </button>
              <button
                onClick={handleClose}
                className="text-sm font-medium"
                style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', letterSpacing: '0.7px' }}
              >
                나중에 열기
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center font-medium text-xl transition-all active:scale-[0.97]"
              style={{
                height: '68px',
                backgroundColor: '#ffe792',
                color: '#5b4b00',
                border: '2px solid #5b4b00',
                boxShadow: '0 4px 0 #5b4b00',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '2px',
              }}
            >
              계속하기 →
            </button>
          )}

          {/* Share link */}
          <button
            className="mt-4 mb-2 flex items-center gap-1 text-sm font-medium"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', letterSpacing: '0.7px' }}
          >
            공유하기
          </button>
        </div>
      </div>
    </div>
  )
}

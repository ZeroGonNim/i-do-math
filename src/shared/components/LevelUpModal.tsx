import { useEffect, useState } from 'react'
import { LEVEL_TITLES } from '@/types/user'
import { formatNumber } from '@/shared/utils/format'

interface Props {
  newLevel: number
  onClose: () => void
  /** 5의 배수 레벨 도달 시 박스 열기 버튼 표시 */
  hasBox?: boolean
  onOpenBox?: () => void
}

export function LevelUpModal({ newLevel, onClose, hasBox, onOpenBox }: Props) {
  const [visible, setVisible] = useState(false)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    // Staggered entrance
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => setBurst(true), 300)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-6 transition-all duration-250"
      style={{ backgroundColor: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center transition-all duration-300"
        style={{
          backgroundColor: 'var(--color-bg-raised)',
          border: `2px solid var(--color-yellow)`,
          boxShadow: visible ? `0 0 60px rgba(255,209,102,0.35), 0 20px 60px rgba(0,0,0,0.6)` : 'none',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)',
          opacity: visible ? 1 : 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Emoji with burst scale animation */}
        <div
          className="text-7xl mb-3 transition-transform duration-500"
          style={{ transform: burst ? 'scale(1.15) rotate(-8deg)' : 'scale(0.5) rotate(0deg)', display: 'inline-block' }}
        >
          🎊
        </div>

        <h2
          className="text-2xl font-bold mb-1 transition-all duration-400"
          style={{
            color: 'var(--color-text-primary)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '80ms',
          }}
        >
          레벨 업!
        </h2>

        <p
          className="text-5xl font-black my-4 transition-all duration-400"
          style={{
            color: 'var(--color-yellow)',
            textShadow: `0 0 24px rgba(255,209,102,0.6)`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(8px)',
            transitionDelay: '140ms',
          }}
        >
          Lv.{formatNumber(newLevel)}
        </p>

        <p
          className="text-lg font-bold mb-4 transition-all duration-400"
          style={{
            color: 'var(--color-cyan)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: '200ms',
          }}
        >
          {LEVEL_TITLES[newLevel] ?? `레벨 ${formatNumber(newLevel)}`}
        </p>

        <p
          className="text-sm mb-6 transition-all duration-400"
          style={{
            color: 'var(--color-text-secondary)',
            opacity: visible ? 1 : 0,
            transitionDelay: '260ms',
          }}
        >
          꾸준히 풀어서 레벨이 올랐어요! 계속 도전해봐요 💪
        </p>

        {hasBox && onOpenBox && (
          <button
            onClick={() => { setVisible(false); setTimeout(onOpenBox, 250) }}
            className="btn-glow-green w-full min-h-[52px] rounded-xl text-lg font-bold transition-all active:scale-95 mb-3"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              color: '#071a14',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: '320ms',
            }}
          >
            📦 레벨업 박스 열기
          </button>
        )}

        <button
          onClick={handleClose}
          className="w-full min-h-[48px] rounded-xl text-base font-bold transition-all active:scale-95"
          style={{
            backgroundColor: hasBox ? 'var(--color-bg-surface)' : 'var(--color-yellow)',
            color: hasBox ? 'var(--color-text-secondary)' : '#0c0c1f',
            border: hasBox ? '1px solid var(--color-border)' : 'none',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: hasBox ? '380ms' : '320ms',
            boxShadow: hasBox ? 'none' : '0 0 20px rgba(255,209,102,0.5)',
          }}
        >
          {hasBox ? '나중에 열기' : '계속하기'}
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { LockIcon, SwordIcon } from '@/shared/components/PixelIcons'

interface Props {
  onClose: () => void
}

export function DifficultyUnlockModal({ onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4 transition-all duration-250"
      style={{ backgroundColor: visible ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0)' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm flex flex-col transition-all duration-300"
        style={{
          backgroundColor: '#1d1d37',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)',
          opacity: visible ? 1 : 0,
          maxWidth: '342px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pixel corner accents */}
        <div className="absolute top-2 left-2 w-1 h-1" style={{ backgroundColor: 'rgba(56,189,248,0.3)' }} />
        <div className="absolute top-2 right-2 w-1 h-1" style={{ backgroundColor: 'rgba(56,189,248,0.3)' }} />
        <div className="absolute bottom-2 left-2 w-1 h-1" style={{ backgroundColor: 'rgba(139,92,246,0.3)' }} />
        <div className="absolute bottom-2 right-2 w-1 h-1" style={{ backgroundColor: 'rgba(139,92,246,0.3)' }} />

        {/* Top tag */}
        <div className="flex justify-center -mt-3.5">
          <div
            className="px-8 py-1.5"
            style={{ backgroundColor: '#38bdf8' }}
          >
            <span
              className="text-sm font-bold"
              style={{ color: '#005762', fontFamily: 'var(--font-game)', letterSpacing: '-0.7px' }}
            >
              새로운 도전
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center px-8 pt-6 pb-8 gap-5">
          {/* Purple icon area */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '96px',
              height: '111px',
              backgroundColor: '#23233f',
              border: '2px solid #8b5cf6',
              boxShadow: '0 0 32px rgba(139,92,246,0.4)',
            }}
          >
            <LockIcon color="#8b5cf6" size={56} />
          </div>

          {/* 난이도 해금! */}
          <p
            className="text-4xl font-bold text-center"
            style={{
              color: '#8b5cf6',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-1.8px',
              lineHeight: '40px',
            }}
          >
            난이도 해금!
          </p>

          {/* Description */}
          <p
            className="text-base font-medium text-center leading-7"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
          >
            응용 문제 섹션이<br />활성화되었습니다.
          </p>

          {/* 도전하기 button */}
          <button
            onClick={handleClose}
            className="flex items-center justify-center gap-3 font-medium text-xl transition-all active:scale-[0.97]"
            style={{
              width: '270px',
              height: '68px',
              backgroundColor: '#38bdf8',
              color: '#005762',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.5px',
            }}
          >
            <SwordIcon color="#005762" size={22} />
            도전하기
          </button>

          {/* 나중에 하기 */}
          <button
            onClick={handleClose}
            className="text-xs font-medium"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)', letterSpacing: '1.2px' }}
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  )
}

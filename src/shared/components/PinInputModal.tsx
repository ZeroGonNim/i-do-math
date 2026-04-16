import { useState, useEffect } from 'react'
import { GamepadIcon, PersonIcon } from '@/shared/components/PixelIcons'

interface Props {
  title: string
  headerTitle?: string
  showBack?: boolean
  showCancel?: boolean
  onConfirm: (pin: string) => void
  onCancel: () => void
}

export function PinInputModal({
  title,
  headerTitle,
  showBack = false,
  showCancel = false,
  onConfirm,
  onCancel,
}: Props) {
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length === 4) {
      onConfirm(pin)
    }
  }, [pin, onConfirm])

  function handleKey(key: string) {
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (pin.length >= 4) return
    setPin(p => p + key)
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
  const displayHeader = headerTitle ?? title

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0f172a' }}>

      {/* AppHeader */}
      <div
        className="shrink-0 flex items-center justify-between px-4 h-16"
        style={{ backgroundColor: 'rgba(12,12,31,0.6)', borderBottom: '1px solid #1c1c3a', boxShadow: '0 4px 0 rgba(6,6,20,1)', backdropFilter: 'blur(24px)' }}
      >
        {showBack ? (
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center transition-all active:opacity-60 active:scale-95 text-base font-bold shrink-0"
            style={{ color: '#aaa8c3', backgroundColor: '#17172f', border: '1px solid #23233f' }}
          >‹</button>
        ) : (
          <div className="w-8 h-8 shrink-0" />
        )}
        <div className="flex items-center gap-2">
          <GamepadIcon color="#38bdf8" size={18} />
          <span
            className="text-xl font-medium"
            style={{ color: '#38bdf8', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
          >
            {displayHeader}
          </span>
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: '#1d1d37', border: '1.5px solid #38bdf8' }}
        >
          <PersonIcon color="#38bdf8" size={16} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8 gap-7">

        {/* Parent character */}
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#f5f0e8',
            border: '3px solid #1d1d37',
          }}
        >
          <span style={{ fontSize: '72px', lineHeight: 1 }}>👨‍💼</span>
        </div>

        {/* Title + subtitle */}
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: '#38bdf8', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}
          >
            {displayHeader}
          </h2>
          <p
            className="text-base"
            style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
          >
            {title}
          </p>
        </div>

        {/* PIN boxes */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#000',
                border: `2px solid ${i === pin.length ? '#38bdf8' : '#23233f'}`,
                boxShadow: i === pin.length ? '0 0 8px rgba(56,189,248,0.4)' : 'none',
              }}
            >
              {i < pin.length && (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#38bdf8',
                    transform: 'rotate(45deg)',
                  }}
                />
              )}
              {i >= pin.length && (
                <div
                  style={{
                    width: '8px',
                    height: '2px',
                    backgroundColor: '#64748b',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="w-full grid grid-cols-3 gap-2">
          {digits.map((d, i) => {
            if (d === '') return <div key={i} />
            if (d === 'del') {
              return (
                <button
                  key={i}
                  onClick={() => handleKey('del')}
                  className="flex items-center justify-center text-xl font-bold transition-opacity active:opacity-70"
                  style={{
                    height: '68px',
                    backgroundColor: '#c0392b',
                    color: '#fff',
                    fontFamily: 'var(--font-game)',
                  }}
                >
                  ⌫
                </button>
              )
            }
            return (
              <button
                key={i}
                onClick={() => handleKey(d)}
                className="flex items-center justify-center text-2xl font-bold transition-opacity active:opacity-70"
                style={{
                  height: '68px',
                  backgroundColor: '#1d1d37',
                  color: '#e5e3ff',
                  border: '1px solid #23233f',
                  fontFamily: 'var(--font-game)',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>

        {/* Cancel button */}
        {showCancel && (
          <button
            className="w-full flex items-center justify-center text-sm font-medium"
            style={{
              height: '52px',
              backgroundColor: '#17172f',
              color: '#aaa8c3',
              border: '1px solid #23233f',
              fontFamily: 'var(--font-sans)',
            }}
            onClick={onCancel}
          >
            × 취소
          </button>
        )}
      </div>

      {/* BottomNavBar placeholder spacer */}
      <div className="shrink-0 h-16" />
    </div>
  )
}

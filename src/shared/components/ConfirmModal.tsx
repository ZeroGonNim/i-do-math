import { WarningIcon } from '@/shared/components/PixelIcons'

interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'danger' | 'info'
}

export function ConfirmModal({
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  variant = 'info'
}: Props) {
  const isDanger = variant === 'danger'
  const accentColor = isDanger ? '#ff716c' : '#38bdf8'
  const buttonBg = isDanger ? '#ff716c' : '#38bdf8'
  const buttonText = isDanger ? '#490006' : '#005762'
  const isAlert = !onCancel

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6"
         style={{ backgroundColor: 'rgba(12,12,31,0.85)', backdropFilter: 'blur(8px)' }}>
      <div 
        className="w-full max-w-sm border-4"
        style={{ 
          backgroundColor: '#17172f', 
          borderColor: accentColor,
          boxShadow: `0 8px 0 #000000, 0 0 24px ${accentColor}30`,
          animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Header Strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
        
        <div className="p-6 flex flex-col items-center text-center gap-4">
          {/* Icon Section */}
          <div 
            className="w-16 h-16 flex items-center justify-center border-4"
            style={{ backgroundColor: '#1d1d37', borderColor: accentColor }}
          >
            <WarningIcon color={accentColor} size={32} />
          </div>

          {/* Text Section */}
          <div className="space-y-2">
            <h2 
              className="text-xl font-bold" 
              style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}
            >
              {title}
            </h2>
            <p 
              className="text-sm leading-relaxed whitespace-pre-wrap px-2"
              style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
            >
              {message}
            </p>
          </div>

          {/* Button Section */}
          <div className={`w-full ${isAlert ? 'flex' : 'grid grid-cols-2'} gap-3 mt-2`}>
            {!isAlert && (
              <button
                onClick={onCancel}
                className="h-12 text-sm font-bold border-2 transition-all active:scale-95"
                style={{ 
                  backgroundColor: 'transparent', 
                  borderColor: '#23233f', 
                  color: '#aaa8c3' 
                }}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`h-12 ${isAlert ? 'w-full' : ''} text-sm font-bold transition-all active:scale-95 active:opacity-80`}
              style={{ 
                backgroundColor: buttonBg, 
                color: buttonText,
                boxShadow: `0 3px 0 #000000`
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          0%   { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

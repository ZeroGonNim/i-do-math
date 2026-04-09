import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: ReactNode
  onBack?: () => void   // 생략 시 뒤로가기 버튼 없음
  right?: ReactNode
}

export function AppHeader({ title, onBack, right }: Props) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 h-14"
         style={{
           backgroundColor: '#0c0c1f',
           borderBottom: '1px solid #23233f',
           boxShadow: '0 1px 12px rgba(0,0,0,0.4)',
         }}>
      {onBack !== undefined && (
        <button
          onClick={handleBack}
          className="shrink-0 w-8 h-8 flex items-center justify-center transition-all active:opacity-60 active:scale-95 text-base font-bold"
          style={{ color: '#aaa8c3', backgroundColor: '#17172f', border: '1px solid #23233f' }}
        >
          ‹
        </button>
      )}

      <h1 className="flex-1 text-base font-bold tracking-wide"
          style={{ color: '#e5e3ff', fontFamily: 'var(--font-game)' }}>
        {title}
      </h1>

      {right && (
        <div className="shrink-0">
          {right}
        </div>
      )}
    </div>
  )
}

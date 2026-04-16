import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/shared/hooks/useTheme'

interface Props {
  title: ReactNode
  onBack?: () => void   // 생략 시 뒤로가기 버튼 없음
  right?: ReactNode
}

export function AppHeader({ title, onBack, right }: Props) {
  const navigate = useNavigate()
  const theme = useTheme()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="shrink-0 flex items-center gap-3 px-5 h-16"
         style={{
           backgroundColor: 'rgba(12,12,31,0.6)',
           borderBottom: '1px solid #1c1c3a',
           boxShadow: '0 4px 0 rgba(6,6,20,1)',
           backdropFilter: 'blur(24px)',
         }}>
      {onBack !== undefined && (
        <button
          onClick={handleBack}
          className="shrink-0 w-8 h-8 flex items-center justify-center transition-all active:opacity-60 active:scale-95 text-base font-bold"
          style={{ color: '#aaa8c3', backgroundColor: '#17172f' }}
        >
          ‹
        </button>
      )}

      <h1 className="flex-1 text-base font-bold tracking-wide"
          style={{ color: theme.primary, fontFamily: 'var(--font-game)' }}>
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

import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  onBack?: () => void   // 생략 시 뒤로가기 버튼 없음
  right?: ReactNode
}

export function AppHeader({ title, onBack, right }: Props) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="shrink-0 flex items-center justify-between bg-white border-b border-gray-100 px-4 h-14">
      <div className="flex items-center gap-2 min-w-[56px]">
        {onBack !== undefined && (
          <button
            onClick={handleBack}
            className="text-gray-500 font-medium text-sm p-1 -ml-1"
          >
            ← 나가기
          </button>
        )}
      </div>

      <h1 className="text-base font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>

      <div className="flex items-center gap-2 min-w-[56px] justify-end">
        {right}
      </div>
    </div>
  )
}

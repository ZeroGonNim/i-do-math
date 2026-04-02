import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/home',   icon: '🏠', label: '홈' },
  { path: '/remind', icon: '⚔️', label: '모험' },
  { path: '/diary',  icon: '🏪', label: '상점' },
  { path: '/parent', icon: '🏆', label: '랭킹' },
] as const

export function BottomNavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="shrink-0 flex items-center justify-around bg-[#0c0c1f] border-t border-[#1c1c3a] h-16 px-4">
      {TABS.map(tab => {
        const isActive = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 transition-colors ${
              isActive ? 'text-[#81ecff]' : 'text-[#c180ff]'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium font-sans">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

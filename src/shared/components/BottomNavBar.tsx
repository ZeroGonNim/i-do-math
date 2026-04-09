import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/home',     icon: '⚔️', label: '퀘스트' },
  { path: '/diary',    icon: '📖', label: '일기' },
  { path: '/stats',    icon: '📊', label: '통계' },
  { path: '/settings', icon: '⚙️', label: '설정' },
] as const

export function BottomNavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="shrink-0 flex items-center justify-around h-16 px-2"
         style={{
           backgroundColor: '#17172f',
           borderTop: '1px solid #000',
           boxShadow: '0 -4px 16px rgba(0,0,0,0.5)',
         }}>
      {TABS.map(tab => {
        const isActive = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1 transition-all active:scale-95"
            style={{ color: isActive ? '#81ecff' : '#aaa8c3' }}
          >
            {isActive && (
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5"
                   style={{ backgroundColor: '#81ecff', boxShadow: '0 0 8px rgba(129,236,255,0.6)' }} />
            )}
            <span className="text-xl leading-none" style={{ opacity: isActive ? 1 : 0.6 }}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold"
                  style={{ color: isActive ? '#81ecff' : '#46465c', fontFamily: 'var(--font-game)' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

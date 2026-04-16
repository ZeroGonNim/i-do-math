import { useNavigate, useLocation } from 'react-router-dom'
import { SwordIcon, BookIcon, ChartIcon, PersonIcon } from './PixelIcons'
import { useTheme } from '@/shared/hooks/useTheme'

const TABS = [
  { path: '/home',     Icon: SwordIcon,  label: '퀘스트' },
  { path: '/diary',    Icon: BookIcon,   label: '일기' },
  { path: '/settings', Icon: PersonIcon,   label: '나의 영웅' },
  { path: '/stats',    Icon: ChartIcon,  label: '통계' },
]

export function BottomNavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const theme = useTheme()

  return (
    <div
      className="shrink-0 flex items-center justify-around"
      style={{
        height: '80px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1c1c3a',
        boxShadow: '0 -4px 0 #060614',
      }}
    >
      {TABS.map(({ path, Icon, label }) => {
        const isActive = pathname === path
        const activeColor = theme.primary // #10b981 or #8b5cf6
        
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center justify-center active:scale-95 transition-transform"
            style={{ width: '72px', height: '80px' }}
          >
            <div
              className="flex flex-col items-center justify-center gap-0.5"
              style={{
                width: '64px',
                height: '44px',
                backgroundColor: isActive ? activeColor : 'transparent',
                boxShadow: isActive ? `0 4px 0 rgba(0,0,0,0.4)` : 'none',
              }}
            >
              <Icon
                color={isActive ? '#0f172a' : activeColor}
                size={22}
              />
              <span
                className="text-[12px] font-medium"
                style={{
                  color: isActive ? '#0f172a' : activeColor,
                  fontFamily: 'var(--font-sans)',
                  lineHeight: '16px',
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                {label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

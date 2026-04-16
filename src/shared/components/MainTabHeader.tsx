import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { useTheme } from '@/shared/hooks/useTheme'
import { AVATARS } from '@/types/avatar'
import { GamepadIcon, SwordIcon } from '@/shared/components/PixelIcons'

interface Props {
  title: string
}

/**
 * 퀘스트·일기·통계·설정 4개 메인 탭 공용 헤더
 * h-16 / px-5 / bg rgba(12,12,31,0.6) / border-b #1c1c3a / shadow 0 4px 0 #060614
 * 좌: 🎮 + 타이틀 | 우: 아바타 버튼 → /inventory
 */
export function MainTabHeader({ title }: Props) {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const theme = useTheme()
  const avatar = AVATARS.find(a => a.id === (profile?.avatarId ?? 'warrior')) ?? AVATARS[0]

  return (
    <div
      className="shrink-0 flex items-center justify-between px-5 h-16"
      style={{
        backgroundColor: 'rgba(12,12,31,0.6)',
        borderBottom: '1px solid #1c1c3a',
        boxShadow: '0 4px 0 rgba(6,6,20,1)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-center gap-2">
        <GamepadIcon color={theme.primary} size={18} />
        <span
          className="text-[20px] font-medium"
          style={{ color: theme.primary, fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}
        >
          {title}
        </span>
      </div>

      <button
        onClick={() => navigate('/settings')}
        className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0"
        style={{ backgroundColor: '#1d1d37', border: `1.5px solid ${theme.primary}` }}
      >
        {avatar.imagePath
          ? <img src={avatar.imagePath} alt={avatar.name} className="w-full h-full object-cover" />
          : <SwordIcon color={theme.primary} size={18} />}
      </button>
    </div>
  )
}
